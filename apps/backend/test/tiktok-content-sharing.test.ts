// Tayra Social regression test, run by CI (.github/workflows/ci.yml).
// TikTok Content Sharing Guidelines: the settings rules that block a post
// (TikTokDto) and the creator_info dashboard function. No network: fetch is
// stubbed with canned TikTok responses. Dummy tokens only.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TikTokDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { TiktokProvider } from '@gitroom/nestjs-libraries/integrations/social/tiktok.provider';

const base = {
  title: '',
  privacy_level: 'SELF_ONLY',
  duet: false,
  stitch: false,
  comment: false,
  autoAddMusic: 'no',
  brand_content_toggle: false,
  brand_organic_toggle: false,
  content_posting_method: 'DIRECT_POST',
};

const errorsOf = async (settings: object) =>
  (
    await validate(plainToInstance(TikTokDto, { ...base, ...settings }))
  ).flatMap((e) => Object.values(e.constraints || {}));

(async () => {
  // A plain private post is valid.
  assert.deepEqual(await errorsOf({}), []);

  // Disclosure on without a choice is blocked; either choice unblocks it.
  assert.deepEqual(await errorsOf({ disclose: true }), [
    'You need to indicate if your content promotes yourself, a third party, or both.',
  ]);
  assert.deepEqual(
    await errorsOf({ disclose: true, brand_organic_toggle: true }),
    []
  );
  // UPLOAD ignores every setting, so it is not blocked.
  assert.deepEqual(
    await errorsOf({ disclose: true, content_posting_method: 'UPLOAD' }),
    []
  );

  // Branded content cannot be private.
  assert.deepEqual(await errorsOf({ brand_content_toggle: true }), [
    'Branded content visibility cannot be set to private.',
  ]);
  assert.deepEqual(
    await errorsOf({
      brand_content_toggle: true,
      privacy_level: 'PUBLIC_TO_EVERYONE',
    }),
    []
  );

  // The posting screen's block reason stops the post with its own message.
  assert.deepEqual(await errorsOf({ blocked_reason: 'Too long' }), [
    'Too long',
  ]);
  assert.deepEqual(await errorsOf({ blocked_reason: '' }), []);

  // creatorInfo is callable from the dashboard and maps TikTok's answer.
  const provider = new TiktokProvider();
  assert.equal(
    new IntegrationManager().isDashboardCallable(provider, 'creatorInfo'),
    true
  );

  const realFetch = globalThis.fetch;
  const stub = (body: object) => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(body))) as typeof fetch;
  };

  stub({
    data: {
      creator_nickname: 'Maison Tayra',
      creator_username: 'maisontayra',
      creator_avatar_url: 'https://example.com/a.jpg',
      privacy_level_options: ['SELF_ONLY'],
      comment_disabled: true,
      duet_disabled: false,
      stitch_disabled: true,
      max_video_post_duration_sec: 300,
    },
    error: { code: 'ok', message: '' },
  });
  assert.deepEqual(await provider.creatorInfo('dummy-token'), {
    nickname: 'Maison Tayra',
    username: 'maisontayra',
    avatar: 'https://example.com/a.jpg',
    privacyLevelOptions: ['SELF_ONLY'],
    commentDisabled: true,
    duetDisabled: false,
    stitchDisabled: true,
    maxVideoPostDurationSec: 300,
  });

  stub({
    data: {},
    error: {
      code: 'spam_risk_too_many_posts',
      message: 'The user has reached the daily post limit',
    },
  });
  const blocked = await provider.creatorInfo('dummy-token');
  assert.ok('error' in blocked && /cannot post right now/.test(blocked.error));

  globalThis.fetch = realFetch;
  console.log('tiktok-content-sharing: ok');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
