import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { UploadFactory } from '@gitroom/nestjs-libraries/upload/upload.factory';
import { IUploadProvider } from '@gitroom/nestjs-libraries/upload/upload.interface';

// Deleted posts, media, channels, users and closed workspaces are kept (soft
// deleted) for this many days, then erased from the database and storage.
// The privacy policy states this period: change both together.
export const PURGE_AFTER_DAYS = 90;
// ponytail: fixed batch per kind and per run (the workflow runs daily), page
// through with a loop if a backlog ever exceeds it
const BATCH = 200;
const DAY = 24 * 60 * 60 * 1000;

type Tx = Prisma.TransactionClient;
type Kind = 'organizations' | 'integrations' | 'posts' | 'media' | 'users';
export type PurgeResult = Record<Kind | 'failed', number> & { dryRun: boolean };

// Rows that hang off a set of posts and block their deletion
async function deletePostChildren(tx: Tx, post: Prisma.PostWhereInput) {
  await tx.tagsPosts.deleteMany({ where: { post } });
  await tx.comments.deleteMany({ where: { post } });
  await tx.errors.deleteMany({ where: { post } });
}

@Injectable()
export class DataPurgeService {
  // public so the regression test can point it at a temporary directory
  storage: IUploadProvider = UploadFactory.createStorage();
  constructor(private _prisma: PrismaService) {}

  // A dry run only counts what would be erased (up to one batch per kind).
  // One record failing (a relation this code does not know about) is logged
  // and skipped, the rest of the run goes on.
  async purge(dryRun: boolean, now = new Date()): Promise<PurgeResult> {
    const deletedAt = { lt: new Date(now.getTime() - PURGE_AFTER_DAYS * DAY) };
    const result: PurgeResult = {
      dryRun,
      organizations: 0,
      integrations: 0,
      posts: 0,
      media: 0,
      users: 0,
      failed: 0,
    };
    const ids = (rows: { id: string }[]) => rows.map((r) => r.id);

    // Closed workspaces first: erasing one erases its channels, posts and media
    const kinds: [
      Kind,
      () => Promise<string[]>,
      (id: string) => Promise<void>
    ][] = [
      [
        'organizations',
        async () =>
          ids(
            await this._prisma.organization.findMany({
              where: { deletedAt },
              select: { id: true },
              take: BATCH,
            })
          ),
        (id) => this.purgeOrganization(id),
      ],
      [
        'integrations',
        async () =>
          ids(
            await this._prisma.integration.findMany({
              where: { deletedAt },
              select: { id: true },
              take: BATCH,
            })
          ),
        (id) => this.purgeIntegration(id),
      ],
      [
        'posts',
        async () =>
          ids(
            await this._prisma.post.findMany({
              // a live comment or thread reply would lose its parent
              where: { deletedAt, childrenPost: { none: { deletedAt: null } } },
              select: { id: true },
              take: BATCH,
            })
          ),
        (id) => this.purgePost(id),
      ],
      [
        'media',
        () => this.mediaToPurge(deletedAt),
        (id) => this.purgeMedia(id),
      ],
      [
        'users',
        async () =>
          ids(
            await this._prisma.user.findMany({
              where: { deletedAt },
              select: { id: true },
              take: BATCH,
            })
          ),
        (id) => this.purgeUser(id),
      ],
    ];

    for (const [kind, find, erase] of kinds) {
      for (const id of await find()) {
        if (dryRun) {
          result[kind]++;
          continue;
        }
        try {
          await erase(id);
          result[kind]++;
        } catch (err) {
          result.failed++;
          console.error(
            `Data purge: ${kind} ${id} not erased: ${(err as Error).message}`
          );
        }
      }
    }
    return result;
  }

  // Deleted media still shown somewhere (a live post, a profile picture, an
  // agency logo, an app icon) is kept
  private async mediaToPurge(deletedAt: { lt: Date }) {
    const media = await this._prisma.media.findMany({
      where: {
        deletedAt,
        userPicture: { none: {} },
        agencies: { none: {} },
        oauthApps: { none: {} },
      },
      select: { id: true, path: true },
      take: BATCH,
    });
    const free: string[] = [];
    for (const m of media) {
      const used = await this._prisma.post.count({
        where: { deletedAt: null, image: { contains: m.path } },
      });
      if (!used) free.push(m.id);
    }
    return free;
  }

  // Returns false when a file could not be removed (logged). A file that is
  // already gone, or not in our storage (an external URL), counts as removed.
  private async removeFiles(paths: (string | null | undefined)[]) {
    let ok = true;
    for (const path of paths) {
      if (!path) continue;
      try {
        await this.storage.removeFile(path);
      } catch (err: any) {
        if (err?.code !== 'ENOENT' && err?.message !== 'Unsafe file path') {
          ok = false;
          console.error(`Data purge: file not removed: ${err?.message}`);
        }
      }
    }
    return ok;
  }

  async purgeMedia(id: string) {
    const media = await this._prisma.media.findUniqueOrThrow({ where: { id } });
    // files first: if one cannot be removed the row stays and the next run retries
    if (!(await this.removeFiles([media.path, media.thumbnail]))) {
      throw new Error('files not removed');
    }
    await this._prisma.media.delete({ where: { id } });
  }

  async purgePost(id: string) {
    await this._prisma.$transaction(async (tx) => {
      await deletePostChildren(tx, { id });
      // deleted replies keep a null parent and are erased on their own
      await tx.post.delete({ where: { id } });
    });
  }

  async purgeIntegration(id: string) {
    const integration = await this._prisma.integration.findUniqueOrThrow({
      where: { id },
      select: { picture: true },
    });
    await this._prisma.$transaction(
      async (tx) => {
        const posts = { integrationId: id };
        await deletePostChildren(tx, posts);
        await tx.post.deleteMany({ where: posts });
        await tx.plugs.deleteMany({ where: posts });
        await tx.exisingPlugData.deleteMany({ where: posts });
        await tx.integrationsWebhooks.deleteMany({ where: posts });
        await tx.integration.delete({ where: { id } });
      },
      { timeout: 60_000 }
    );
    await this.removeFiles([integration.picture]);
  }

  async purgeUser(id: string) {
    await this._prisma.$transaction(async (tx) => {
      const user = { userId: id };
      await tx.userOrganization.deleteMany({ where: user });
      await tx.itemUser.deleteMany({ where: user });
      await tx.oAuthAuthorization.deleteMany({ where: user });
      // comments the user wrote in other workspaces stay, without the author
      await tx.user.delete({ where: { id } });
    });
  }

  async purgeOrganization(id: string) {
    const [media, integrations] = await Promise.all([
      this._prisma.media.findMany({
        where: { organizationId: id },
        select: { path: true, thumbnail: true },
      }),
      this._prisma.integration.findMany({
        where: { organizationId: id },
        select: { picture: true },
      }),
    ]);

    await this._prisma.$transaction(
      async (tx) => {
        const org = { organizationId: id };
        const integration = { organizationId: id };
        const posts = { OR: [org, { integration }] };
        const apps = { oauthApp: org };

        await tx.tagsPosts.deleteMany({ where: { tag: { orgId: id } } });
        await deletePostChildren(tx, posts);
        await tx.comments.deleteMany({ where: org });
        await tx.errors.deleteMany({ where: org });
        await tx.post.deleteMany({ where: posts });

        await tx.plugs.deleteMany({ where: { OR: [org, { integration }] } });
        await tx.exisingPlugData.deleteMany({ where: { integration } });
        await tx.integrationsWebhooks.deleteMany({
          where: { OR: [{ integration }, { webhook: org }] },
        });
        await tx.integration.deleteMany({ where: integration });

        await tx.oAuthAuthorization.deleteMany({ where: { OR: [org, apps] } });
        await tx.oAuthSelfHostedAuthorization.deleteMany({ where: apps });
        await tx.oAuthApp.deleteMany({ where: org });
        await tx.clippingClip.deleteMany({ where: { clipping: org } });
        await tx.clipping.deleteMany({ where: org });
        await tx.customer.deleteMany({ where: { orgId: id } });
        await tx.tags.deleteMany({ where: { orgId: id } });
        await tx.usedCodes.deleteMany({ where: { orgId: id } });
        await tx.signatures.deleteMany({ where: org });
        await tx.webhooks.deleteMany({ where: org });
        await tx.autoPost.deleteMany({ where: org });
        await tx.sets.deleteMany({ where: org });
        await tx.thirdParty.deleteMany({ where: org });
        await tx.notifications.deleteMany({ where: org });
        await tx.credits.deleteMany({ where: org });
        await tx.subscription.deleteMany({ where: org });
        await tx.gitHub.deleteMany({ where: org });
        await tx.userOrganization.deleteMany({ where: org });
        await tx.media.deleteMany({ where: org });
        await tx.organization.delete({ where: { id } });
      },
      { timeout: 60_000 }
    );

    // after the commit: a failed transaction leaves the workspace and its files
    await this.removeFiles([
      ...media.flatMap((m) => [m.path, m.thumbnail]),
      ...integrations.map((i) => i.picture),
    ]);
  }
}
