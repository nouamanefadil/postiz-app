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
type Before = { lt: Date };

// Rows that hang off a set of posts and block their deletion
async function deletePostChildren(tx: Tx, post: Prisma.PostWhereInput) {
  await tx.tagsPosts.deleteMany({ where: { post } });
  await tx.comments.deleteMany({ where: { post } });
  await tx.errors.deleteMany({ where: { post } });
}

// Locks the row and checks it is still deleted: a channel reconnected (its
// deletedAt reset) since the run listed it must not be erased
async function stillDeleted(
  tx: Tx,
  table: 'Organization' | 'Integration' | 'Post' | 'User',
  id: string,
  deletedAt: Before
) {
  const rows = await tx.$queryRawUnsafe<unknown[]>(
    `SELECT id FROM "${table}" WHERE id = $1 AND "deletedAt" < $2 FOR UPDATE`,
    id,
    deletedAt.lt
  );
  return rows.length > 0;
}

// Live posts keep their media in `image`, and some settings (YouTube
// thumbnail) in `settings`
const inLivePost = (path: string): Prisma.PostWhereInput => ({
  deletedAt: null,
  OR: [{ image: { contains: path } }, { settings: { contains: path } }],
});

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
    const query = { where: { deletedAt }, select: { id: true }, take: BATCH };

    // Closed workspaces first: erasing one erases its channels, posts and media
    const kinds: [
      Kind,
      () => Promise<string[]>,
      (id: string, deletedAt: Before) => Promise<boolean>
    ][] = [
      [
        'organizations',
        async () => ids(await this._prisma.organization.findMany(query)),
        (id, d) => this.purgeOrganization(id, d),
      ],
      [
        'integrations',
        async () => ids(await this._prisma.integration.findMany(query)),
        (id, d) => this.purgeIntegration(id, d),
      ],
      [
        'posts',
        async () =>
          ids(
            await this._prisma.post.findMany({
              ...query,
              // a live comment or thread reply would lose its parent
              where: { deletedAt, childrenPost: { none: { deletedAt: null } } },
            })
          ),
        (id, d) => this.purgePost(id, d),
      ],
      [
        'media',
        () => this.mediaToPurge(deletedAt),
        (id, d) => this.purgeMedia(id, d),
      ],
      [
        'users',
        async () => ids(await this._prisma.user.findMany(query)),
        (id, d) => this.purgeUser(id, d),
      ],
    ];

    for (const [kind, find, erase] of kinds) {
      for (const id of await find()) {
        if (dryRun) {
          result[kind]++;
          continue;
        }
        try {
          if (await erase(id, deletedAt)) result[kind]++;
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
  private async mediaToPurge(deletedAt: Before) {
    const media = await this._prisma.media.findMany({
      where: {
        deletedAt,
        userPicture: { none: {} },
        agencies: { none: {} },
        oauthApps: { none: {} },
      },
      select: { id: true, path: true, thumbnail: true },
      take: BATCH,
    });
    const free: string[] = [];
    for (const m of media) {
      const paths = [m.path, m.thumbnail].filter((p): p is string => !!p);
      const used = await this._prisma.post.count({
        where: { OR: paths.map(inLivePost) },
      });
      if (!used) free.push(m.id);
    }
    return free;
  }

  // A file is removed only if it is in our storage and nothing left in the
  // database points to it: paths and thumbnails can be set by the client, so
  // two rows (or two workspaces) can name the same file. Returns false when a
  // removal failed (logged); a file already gone counts as removed.
  private async removeFiles(paths: (string | null | undefined)[]) {
    const base =
      process.env.STORAGE_PROVIDER === 'cloudflare'
        ? process.env.CLOUDFLARE_BUCKET_URL
        : `${process.env.FRONTEND_URL}/uploads`;
    let ok = true;
    for (const path of new Set(paths)) {
      if (!path || !base || !path.startsWith(`${base}/`)) continue;
      const [media, integrations, posts] = await Promise.all([
        this._prisma.media.count({
          where: { OR: [{ path }, { thumbnail: path }] },
        }),
        this._prisma.integration.count({ where: { picture: path } }),
        this._prisma.post.count({ where: inLivePost(path) }),
      ]);
      if (media || integrations || posts) continue;
      try {
        await this.storage.removeFile(path);
      } catch (err: any) {
        if (err?.code !== 'ENOENT') {
          ok = false;
          console.error(`Data purge: file not removed: ${err?.message}`);
        }
      }
    }
    return ok;
  }

  // Files are removed after the rows, so the "still referenced" check does
  // not see the rows being erased. A file that could not be removed stays
  // and is reported in the logs.
  async purgeMedia(id: string, deletedAt: Before) {
    const media = await this._prisma.media.findUniqueOrThrow({ where: { id } });
    const { count } = await this._prisma.media.deleteMany({
      where: { id, deletedAt },
    });
    if (!count) return false;
    await this.removeFiles([media.path, media.thumbnail]);
    return true;
  }

  async purgePost(id: string, deletedAt: Before) {
    return this._prisma.$transaction(async (tx) => {
      if (!(await stillDeleted(tx, 'Post', id, deletedAt))) return false;
      await deletePostChildren(tx, { id });
      // deleted replies keep a null parent and are erased on their own
      await tx.post.delete({ where: { id } });
      return true;
    });
  }

  async purgeIntegration(id: string, deletedAt: Before) {
    const integration = await this._prisma.integration.findUniqueOrThrow({
      where: { id },
      select: { picture: true },
    });
    const erased = await this._prisma.$transaction(
      async (tx) => {
        if (!(await stillDeleted(tx, 'Integration', id, deletedAt))) {
          return false;
        }
        // every post of the channel, the channel is gone
        const posts = { integrationId: id };
        await deletePostChildren(tx, posts);
        await tx.post.deleteMany({ where: posts });
        await tx.plugs.deleteMany({ where: posts });
        await tx.exisingPlugData.deleteMany({ where: posts });
        await tx.integrationsWebhooks.deleteMany({ where: posts });
        await tx.integration.delete({ where: { id } });
        return true;
      },
      { timeout: 60_000 }
    );
    if (erased) await this.removeFiles([integration.picture]);
    return erased;
  }

  async purgeUser(id: string, deletedAt: Before) {
    return this._prisma.$transaction(async (tx) => {
      if (!(await stillDeleted(tx, 'User', id, deletedAt))) return false;
      const user = { userId: id };
      await tx.userOrganization.deleteMany({ where: user });
      await tx.itemUser.deleteMany({ where: user });
      await tx.oAuthAuthorization.deleteMany({ where: user });
      // comments the user wrote in other workspaces stay, without the author
      await tx.user.delete({ where: { id } });
      return true;
    });
  }

  async purgeOrganization(id: string, deletedAt: Before) {
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

    const erased = await this._prisma.$transaction(
      async (tx) => {
        if (!(await stillDeleted(tx, 'Organization', id, deletedAt))) {
          return false;
        }
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
        return true;
      },
      { timeout: 60_000 }
    );

    // after the commit: a failed transaction leaves the workspace and its files
    if (erased) {
      await this.removeFiles([
        ...media.flatMap((m) => [m.path, m.thumbnail]),
        ...integrations.map((i) => i.picture),
      ]);
    }
    return erased;
  }
}
