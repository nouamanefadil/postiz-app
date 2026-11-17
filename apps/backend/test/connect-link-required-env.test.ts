// Tayra Social regression test, run by CI (.github/workflows/ci.yml).
// Runs the real IntegrationManager, every backend entry point that starts an
// OAuth connection (dashboard endpoint, public API /social/:integration,
// connect links via MCP / public API and the connect page, enterprise /url),
// against Redis' in-memory mock (no REDIS_URL). Dummy credentials only.
import assert from 'node:assert/strict';
import { HttpException } from '@nestjs/common';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import {
  IntegrationManager,
  socialIntegrationList,
} from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { IntegrationConnectTool } from '@gitroom/nestjs-libraries/chat/tools/integration.connect.tool';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';
import { IntegrationsController } from '../src/api/routes/integrations.controller';
import { PublicIntegrationsController } from '../src/public-api/routes/v1/public.integrations.controller';
import { EnterpriseController } from '../src/api/routes/enterprise.controller';

assert.equal(process.env.REDIS_URL, undefined, 'must run on the Redis mock');
process.env.FRONTEND_URL = 'https://social.maisontayra.com';
process.env.JWT_SECRET = 'test-only-jwt-secret';
const ALL_ENV = [
  ...new Set(
    socialIntegrationList.flatMap((p) =>
      (p.requiredEnv || []).flatMap((n) => n.split('|'))
    )
  ),
];
const clear = () =>
  [...ALL_ENV, 'INSTAGRAM_UNIFIED_CONFIG_ID'].forEach(
    (k) => delete process.env[k]
  );
const SECRETS = ['igsecretDUMMY', 'fbsecretDUMMY', 'ttsecretDUMMY'];
const standaloneOn = () =>
  Object.assign(process.env, {
    INSTAGRAM_APP_ID: '111222333',
    INSTAGRAM_APP_SECRET: 'igsecretDUMMY',
  });
const unifiedOn = () =>
  Object.assign(process.env, {
    FACEBOOK_APP_ID: '999888777',
    FACEBOOK_APP_SECRET: 'fbsecretDUMMY',
    INSTAGRAM_UNIFIED_CONFIG_ID: '29955961580668093',
  });
const msg = (vars: string) =>
  `Instagram\n(Standalone) is not configured on this server yet. The administrator must set ${vars}.`;
const BOTH = msg('INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET');

const manager = new IntegrationManager();
const service = new IntegrationService(
  {} as any,
  {} as any,
  manager,
  {} as any,
  {} as any,
  {} as any,
  {} as any
);
const tool = new IntegrationConnectTool(service, manager).run() as any;
const dashboard = new IntegrationsController(
  manager,
  service,
  {} as any,
  {} as any
);
const publicApi = new PublicIntegrationsController(
  service,
  {} as any,
  {} as any,
  {} as any,
  manager,
  {} as any,
  {} as any,
  {} as any,
  {} as any,
  {} as any,
  {} as any
);
const org = { id: 'org-1' } as any;
const enterprise = new EnterpriseController(
  manager,
  { getOrgByApiKey: async () => org } as any,
  service,
  {} as any
);

// One function per entry point: a URL string when it starts OAuth, or what it refused with
type Out = { url: string } | { refused: string };
const refusedBy = (e: any): Out => ({
  refused:
    e instanceof HttpException
      ? JSON.stringify(e.getResponse())
      : String(e?.message ?? e),
});
const entry: Record<string, (p: string) => Promise<Out>> = {
  'dashboard Add Channel / invite / Reconnect': async (p) => {
    try {
      const r: any = await dashboard.getIntegrationUrl(p, '', '', '', '', org);
      return r?.url ? { url: r.url } : { refused: r?.message };
    } catch (e) {
      return refusedBy(e);
    }
  },
  'public API GET /social/:integration': async (p) => {
    try {
      const r: any = await publicApi.getIntegrationUrl(p, '', org);
      return { url: r.url };
    } catch (e) {
      return refusedBy(e);
    }
  },
  'MCP integrationConnectTool + connect page': async (p) => {
    const r = await tool.execute(
      { platform: p },
      { mcp: { extra: { authInfo: org } }, requestContext: new Map() }
    );
    if (r.output.errors) return { refused: r.output.errors };
    try {
      return {
        url: (
          await service.startConnectLink(
            r.output.url.split('/integrations/connect/')[1]
          )
        ).url,
      };
    } catch (e) {
      return refusedBy(e);
    }
  },
  'public API POST /integrations/connect + connect page': async (p) => {
    try {
      const { url } = await service.createConnectLink('org-1', p);
      return {
        url: (
          await service.startConnectLink(url.split('/integrations/connect/')[1])
        ).url,
      };
    } catch (e) {
      return refusedBy(e);
    }
  },
  'enterprise POST /enterprise/url': async (p) => {
    const params = AuthService.signJWT({
      redirectUrl: 'https://example.com/back',
      apiKey: 'k',
      provider: p,
      webhookUrl: 'https://example.com/hook',
    });
    const r = await enterprise.redirectParams(params);
    return r ? { url: r } : { refused: '(empty body)' };
  },
};
const EMPTY_CLIENT = /[?&](client_id|client_key|clientId)=(&|$)/;
const q = (url: string) => Object.fromEntries(new URL(url).searchParams);
const noSecrets = (s: string) => SECRETS.every((x) => !s.includes(x));

const run = async (name: string, fn: () => Promise<void>) => {
  clear();
  try {
    await fn();
    console.log(`PASS  ${name}`);
  } catch (e: any) {
    console.log(`FAIL  ${name}  -- ${e.message}`);
    process.exitCode = 1;
  }
};

(async () => {
  // Standalone, every entry point, every credential state
  const states: [string, () => void, string | undefined][] = [
    ['both configured', () => standaloneOn(), undefined],
    [
      'App ID missing',
      () => {
        standaloneOn();
        delete process.env.INSTAGRAM_APP_ID;
      },
      msg('INSTAGRAM_APP_ID'),
    ],
    [
      'App Secret missing',
      () => {
        standaloneOn();
        delete process.env.INSTAGRAM_APP_SECRET;
      },
      msg('INSTAGRAM_APP_SECRET'),
    ],
    [
      'both empty strings',
      () =>
        Object.assign(process.env, {
          INSTAGRAM_APP_ID: '',
          INSTAGRAM_APP_SECRET: '',
        }),
      BOTH,
    ],
    [
      'both whitespace only',
      () =>
        Object.assign(process.env, {
          INSTAGRAM_APP_ID: '  ',
          INSTAGRAM_APP_SECRET: '\t',
        }),
      BOTH,
    ],
    ['both unset', () => {}, BOTH],
  ];
  for (const [state, set, expected] of states) {
    for (const [name, call] of Object.entries(entry)) {
      await run(`Standalone, ${state}: ${name}`, async () => {
        set();
        const r = await call('instagram-standalone');
        if (expected === undefined) {
          assert.ok('url' in r, `refused: ${(r as any).refused}`);
          const u = new URL(r.url);
          assert.equal(
            u.origin + u.pathname,
            'https://www.instagram.com/oauth/authorize'
          );
          assert.equal(q(r.url).client_id, '111222333');
          assert.equal(
            q(r.url).redirect_uri,
            'https://social.maisontayra.com/integrations/social/instagram-standalone'
          );
          assert.ok(noSecrets(r.url));
        } else {
          assert.ok('refused' in r, `generated a URL: ${(r as any).url}`);
          if (!name.startsWith('enterprise'))
            assert.ok(
              r.refused.includes(expected.replace(/\n/g, '\\n')) ||
                r.refused === expected,
              r.refused
            );
          assert.ok(noSecrets(r.refused));
        }
      });
    }
  }

  await run(
    'error shapes: dashboard {err,message}, public API {msg} 400, MCP output.errors, connect page 400',
    async () => {
      assert.deepEqual(
        await dashboard.getIntegrationUrl(
          'instagram-standalone',
          '',
          '',
          '',
          '',
          org
        ),
        { err: true, message: BOTH }
      );
      await assert.rejects(
        publicApi.getIntegrationUrl('instagram-standalone', '', org),
        (e: any) => e.getStatus() === 400 && e.getResponse().msg === BOTH
      );
      assert.deepEqual(
        await tool.execute(
          { platform: 'instagram-standalone' },
          { mcp: { extra: { authInfo: org } }, requestContext: new Map() }
        ),
        { output: { errors: BOTH } }
      );
      standaloneOn();
      const { url } = await service.createConnectLink(
        'org-1',
        'instagram-standalone'
      );
      clear();
      await assert.rejects(
        service.startConnectLink(url.split('/integrations/connect/')[1]),
        (e: any) => e.getStatus() === 400 && e.message === BOTH
      );
    }
  );

  await run(
    'refused attempts store no connect link and no OAuth state',
    async () => {
      const keys: string[] = [];
      const orig = ioRedis.set.bind(ioRedis);
      (ioRedis as any).set = async (k: string, ...a: any[]) => {
        keys.push(k);
        return orig(k, ...a);
      };
      try {
        for (const call of Object.values(entry))
          await call('instagram-standalone');
      } finally {
        (ioRedis as any).set = orig;
      }
      assert.deepEqual(keys, []);
    }
  );

  for (const [name, call] of Object.entries(entry)) {
    await run(`Instagram Unified Login unchanged: ${name}`, async () => {
      unifiedOn();
      const r = await call('instagram');
      assert.ok('url' in r, (r as any).refused);
      const u = new URL(r.url);
      const p = q(r.url);
      assert.equal(
        u.origin + u.pathname,
        'https://www.facebook.com/dialog/oauth'
      );
      assert.deepEqual(
        [p.client_id, p.config_id, p.redirect_uri, p.response_type, p.scope],
        [
          '999888777',
          '29955961580668093',
          'https://social.maisontayra.com/integrations/social/instagram',
          'code',
          undefined,
        ]
      );
    });
  }
  await run(
    'Instagram Unified Login needs no Standalone credentials, Standalone needs no Facebook credentials',
    async () => {
      unifiedOn();
      assert.equal(manager.notConfiguredMessage('instagram'), undefined);
      assert.equal(manager.notConfiguredMessage('instagram-standalone'), BOTH);
      clear();
      standaloneOn();
      assert.equal(
        manager.notConfiguredMessage('instagram-standalone'),
        undefined
      );
      assert.match(
        manager.notConfiguredMessage('instagram')!,
        /FACEBOOK_APP_ID and FACEBOOK_APP_SECRET/
      );
    }
  );
  for (const [name, call] of Object.entries(entry)) {
    await run(
      `Facebook Page and TikTok configured, unchanged: ${name}`,
      async () => {
        Object.assign(process.env, {
          FACEBOOK_APP_ID: '999888777',
          FACEBOOK_APP_SECRET: 'fbsecretDUMMY',
          TIKTOK_CLIENT_ID: 'ttclient',
          TIKTOK_CLIENT_SECRET: 'ttsecretDUMMY',
        });
        const fb = await call('facebook');
        assert.ok('url' in fb, (fb as any).refused);
        assert.equal(
          new URL(fb.url).origin + new URL(fb.url).pathname,
          'https://www.facebook.com/v25.0/dialog/oauth'
        );
        assert.equal(q(fb.url).client_id, '999888777');
        assert.match(q(fb.url).scope, /^pages_show_list,/);
        const tt = await call('tiktok');
        assert.ok('url' in tt, (tt as any).refused);
        assert.equal(new URL(tt.url).host, 'www.tiktok.com');
        assert.equal(q(tt.url).client_key, 'ttclient');
        assert.ok(noSecrets(fb.url + tt.url));
      }
    );
  }

  await run(
    'sweep: no provider, through any entry point, yields a URL while its credentials are empty',
    async () => {
      const leaks: string[] = [];
      for (const p of socialIntegrationList.filter(
        (p) => p.requiredEnv?.length
      )) {
        for (const [name, call] of Object.entries(entry)) {
          clear();
          const r = await call(p.identifier);
          if ('url' in r)
            leaks.push(`${p.identifier} via ${name}: ${r.url.slice(0, 80)}`);
        }
      }
      assert.deepEqual(leaks, []);
    }
  );
  await run(
    'sweep: no generated URL anywhere has an empty client_id/client_key',
    async () => {
      const urls: string[] = [];
      for (const p of socialIntegrationList)
        for (const call of Object.values(entry)) {
          clear();
          const r = await call(p.identifier);
          if ('url' in r) urls.push(r.url);
        }
      assert.deepEqual(
        urls.filter((u) => EMPTY_CLIENT.test(u)),
        []
      );
    }
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
