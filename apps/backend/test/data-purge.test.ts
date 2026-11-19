// Tayra Social regression test, run by CI (.github/workflows/ci.yml) against a
// throwaway Postgres (DATABASE_URL, schema from `prisma db push`). Runs the real
// DataPurgeService: what was deleted more than 90 days ago is erased with the
// rows and files that hang off it, everything else is left alone.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { DataPurgeService } from '@gitroom/nestjs-libraries/database/prisma/purge/data.purge.service';
import { LocalStorage } from '@gitroom/nestjs-libraries/upload/local.storage';

assert.ok(process.env.DATABASE_URL, 'needs a throwaway Postgres');
assert.ok(
  /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL!),
  'refuses to run against a non-local database'
);
process.env.FRONTEND_URL = 'https://social.example.test';

const prisma = new PrismaService();
const service = new DataPurgeService(prisma);
const uploads = mkdtempSync(join(tmpdir(), 'purge-'));
const local = new LocalStorage(uploads);
// records every removal, so the test also catches paths that must never
// reach the storage (another bucket or host: Cloudflare ignores the host)
const removed: string[] = [];
service.storage = {
  removeFile: (path: string) => {
    removed.push(path);
    return local.removeFile(path);
  },
} as any;

const DAY = 24 * 60 * 60 * 1000;
const OLD = new Date(Date.now() - 91 * DAY);
const RECENT = new Date(Date.now() - 10 * DAY);
const file = (name: string) => {
  writeFileSync(join(uploads, name), 'x');
  return `${process.env.FRONTEND_URL}/uploads/${name}`;
};
const onDisk = (name: string) => existsSync(join(uploads, name));
const id = () => randomUUID();

async function org(deletedAt: Date | null = null) {
  return prisma.organization.create({ data: { name: 'org', deletedAt } });
}
async function user(deletedAt: Date | null = null) {
  return prisma.user.create({
    data: {
      email: `${id()}@x.test`,
      providerName: 'LOCAL',
      timezone: 0,
      deletedAt,
    },
  });
}
async function integration(
  organizationId: string,
  deletedAt: Date | null = null,
  picture?: string
) {
  return prisma.integration.create({
    data: {
      organizationId,
      internalId: id(),
      name: 'channel',
      providerIdentifier: 'x',
      type: 'social',
      token: 'dummy',
      picture,
      deletedAt,
    },
  });
}
async function post(
  organizationId: string,
  integrationId: string,
  deletedAt: Date | null = null,
  extra: { parentPostId?: string; image?: string; settings?: string } = {}
) {
  const p = await prisma.post.create({
    data: {
      organizationId,
      integrationId,
      content: 'hello',
      group: id(),
      publishDate: new Date(),
      deletedAt,
      ...extra,
    },
  });
  // the rows that block a post's deletion
  const tag = await prisma.tags.create({
    data: { name: 't', color: '#000', orgId: organizationId },
  });
  await prisma.tagsPosts.create({ data: { postId: p.id, tagId: tag.id } });
  await prisma.comments.create({
    data: { content: 'c', organizationId, postId: p.id },
  });
  await prisma.errors.create({
    data: { message: 'e', platform: 'x', organizationId, postId: p.id },
  });
  return p;
}
async function media(
  organizationId: string,
  name: string,
  deletedAt: Date | null
) {
  return prisma.media.create({
    data: { organizationId, name, path: file(name), deletedAt },
  });
}
const exists = async (model: any, rowId: string) =>
  !!(await model.findUnique({ where: { id: rowId } }));

(async () => {
  // A workspace closed 91 days ago, with most of what a workspace can hold
  const closed = await org(OLD);
  const owner = await user();
  await prisma.userOrganization.create({
    data: { userId: owner.id, organizationId: closed.id },
  });
  const closedChannel = await integration(
    closed.id,
    null,
    file('closed-avatar.png')
  );
  const closedPost = await post(closed.id, closedChannel.id);
  const closedMedia = await media(closed.id, 'closed-media.png', null);
  const hook = await prisma.webhooks.create({
    data: { name: 'w', url: 'https://x.test', organizationId: closed.id },
  });
  await prisma.integrationsWebhooks.create({
    data: { integrationId: closedChannel.id, webhookId: hook.id },
  });
  await prisma.plugs.create({
    data: {
      organizationId: closed.id,
      integrationId: closedChannel.id,
      plugFunction: 'f',
      data: '{}',
    },
  });
  await prisma.signatures.create({
    data: { organizationId: closed.id, content: 's', autoAdd: false },
  });
  await prisma.notifications.create({
    data: { organizationId: closed.id, content: 'n' },
  });
  const app = await prisma.oAuthApp.create({
    data: {
      name: 'a',
      redirectUrl: 'https://x.test',
      clientId: id(),
      organizationId: closed.id,
    },
  });
  await prisma.oAuthAuthorization.create({
    data: { oauthAppId: app.id, userId: owner.id, organizationId: closed.id },
  });

  // A workspace closed 10 days ago: kept
  const recentlyClosed = await org(RECENT);

  // A live workspace
  const live = await org();
  const channel = await integration(live.id);
  const oldChannel = await integration(live.id, OLD, file('old-avatar.png'));
  const oldChannelPost = await post(live.id, oldChannel.id); // never deleted itself
  const recentChannel = await integration(live.id, RECENT);
  const oldPost = await post(live.id, channel.id, OLD);
  const recentPost = await post(live.id, channel.id, RECENT);
  const livePost = await post(live.id, channel.id);
  const oldParent = await post(live.id, channel.id, OLD);
  const liveReply = await post(live.id, channel.id, null, {
    parentPostId: oldParent.id,
  });
  const oldMedia = await media(live.id, 'old.png', OLD);
  const usedMedia = await media(live.id, 'used.png', OLD);
  const postUsingMedia = await post(live.id, channel.id, null, {
    image: JSON.stringify([{ id: usedMedia.id, path: usedMedia.path }]),
  });
  const recentMedia = await media(live.id, 'recent.png', RECENT);
  // media used only in a live post's settings (YouTube thumbnail)
  const settingsMedia = await media(live.id, 'settings.png', OLD);
  await post(live.id, channel.id, null, {
    settings: JSON.stringify({ thumbnail: { path: settingsMedia.path } }),
  });
  // paths and thumbnails can be set by the client: a deleted row naming
  // another workspace's file, or an external URL, must not remove it
  const other = await org();
  const otherMedia = await media(other.id, 'other.png', null);
  const sameFile = await prisma.media.create({
    data: {
      organizationId: live.id,
      name: 'dup',
      path: otherMedia.path,
      thumbnail: otherMedia.path,
      deletedAt: OLD,
    },
  });
  const external = await prisma.media.create({
    data: {
      organizationId: live.id,
      name: 'ext',
      path: 'https://elsewhere.test/x.png',
      deletedAt: OLD,
    },
  });

  const deletedUser = await user(OLD);
  await prisma.userOrganization.create({
    data: { userId: deletedUser.id, organizationId: live.id },
  });
  const comment = await prisma.comments.create({
    data: {
      content: 'c',
      organizationId: live.id,
      postId: livePost.id,
      userId: deletedUser.id,
    },
  });
  const recentlyDeletedUser = await user(RECENT);

  // Dry run: counts, erases nothing
  const dry = await service.purge(true);
  assert.deepEqual(dry, {
    dryRun: true,
    organizations: 1,
    integrations: 1,
    posts: 1, // oldParent has a live reply
    media: 3, // oldMedia, sameFile, external; usedMedia and settingsMedia are in live posts
    users: 1,
    failed: 0,
  });
  assert.ok(await exists(prisma.organization, closed.id));
  assert.ok(await exists(prisma.post, oldPost.id));
  assert.ok(onDisk('old.png'));

  const run = await service.purge(false);
  assert.deepEqual(run, { ...dry, dryRun: false });

  // Erased, with their files
  assert.ok(!(await exists(prisma.organization, closed.id)));
  assert.ok(!(await exists(prisma.integration, closedChannel.id)));
  assert.ok(!(await exists(prisma.post, closedPost.id)));
  assert.ok(!(await exists(prisma.media, closedMedia.id)));
  assert.ok(!(await exists(prisma.oAuthApp, app.id)));
  assert.equal(
    await prisma.webhooks.count({ where: { organizationId: closed.id } }),
    0
  );
  assert.ok(!onDisk('closed-media.png') && !onDisk('closed-avatar.png'));
  assert.ok(!(await exists(prisma.integration, oldChannel.id)));
  assert.ok(!(await exists(prisma.post, oldChannelPost.id)));
  assert.ok(!onDisk('old-avatar.png'));
  assert.ok(!(await exists(prisma.post, oldPost.id)));
  assert.ok(!(await exists(prisma.media, oldMedia.id)));
  assert.ok(!onDisk('old.png'));
  assert.ok(!(await exists(prisma.user, deletedUser.id)));
  assert.equal(
    (await prisma.comments.findUnique({ where: { id: comment.id } }))?.userId,
    null
  );

  // Kept
  assert.ok(await exists(prisma.user, owner.id)); // a live user of the closed workspace
  assert.ok(await exists(prisma.organization, recentlyClosed.id));
  assert.ok(await exists(prisma.organization, live.id));
  assert.ok(await exists(prisma.integration, channel.id));
  assert.ok(await exists(prisma.integration, recentChannel.id));
  assert.ok(await exists(prisma.post, recentPost.id));
  assert.ok(await exists(prisma.post, livePost.id));
  assert.ok(await exists(prisma.post, oldParent.id));
  assert.equal(
    (await prisma.post.findUnique({ where: { id: liveReply.id } }))
      ?.parentPostId,
    oldParent.id
  );
  assert.ok(await exists(prisma.post, postUsingMedia.id));
  assert.ok((await exists(prisma.media, usedMedia.id)) && onDisk('used.png'));
  assert.ok(
    (await exists(prisma.media, recentMedia.id)) && onDisk('recent.png')
  );
  assert.ok(await exists(prisma.user, recentlyDeletedUser.id));
  assert.equal(
    await prisma.comments.count({ where: { postId: livePost.id } }),
    2
  );

  assert.ok(!(await exists(prisma.media, sameFile.id)));
  assert.ok(!(await exists(prisma.media, external.id)));
  assert.ok(!removed.includes(external.path));
  assert.ok(!removed.includes(otherMedia.path));
  assert.ok((await exists(prisma.media, otherMedia.id)) && onDisk('other.png'));
  assert.ok(
    (await exists(prisma.media, settingsMedia.id)) && onDisk('settings.png')
  );

  // A row no longer deleted (a channel reconnected after the run listed it)
  // is not erased
  const cutoff = { lt: new Date() };
  assert.equal(await service.purgeIntegration(channel.id, cutoff), false);
  assert.equal(await service.purgeOrganization(live.id, cutoff), false);
  assert.equal(await service.purgePost(livePost.id, cutoff), false);
  assert.equal(await service.purgeUser(owner.id, cutoff), false);
  assert.ok(await exists(prisma.integration, channel.id));
  assert.ok(await exists(prisma.post, livePost.id));

  // Nothing left to do
  const again = await service.purge(false);
  assert.deepEqual(again, {
    ...dry,
    dryRun: false,
    organizations: 0,
    integrations: 0,
    posts: 0,
    media: 0,
    users: 0,
  });

  await prisma.$disconnect();
  console.log('data-purge: ok');
})().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
