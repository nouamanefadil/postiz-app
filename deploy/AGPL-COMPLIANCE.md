# AGPL-3.0 compliance: Tayra Social

> Engineering checklist, not legal advice. Have a lawyer review it before
> Tayra Social is offered to customers.

Tayra Social is a modified version of **Postiz**, Copyright (C) 2025 Nevo David,
licensed under the **GNU Affero General Public License v3.0 or (at your option) any
later version** (see `/LICENSE`). Renaming or rebranding does not change that: the
whole program, including Tayra Social's modifications, stays under the AGPL, and
whoever runs it for users has the obligations below.

## Status

| Obligation | Where it comes from | Status |
|---|---|---|
| Keep the license text | AGPL §4, §5 | Done: `/LICENSE` in the repo, `/app/LICENSE` in every image (CI verifies), OCI label `org.opencontainers.image.licenses=AGPL-3.0` |
| Keep copyright and license notices | §4, §5 | Done: no upstream notice is removed. Rule for all future work: never delete or alter upstream copyright/license headers or the `LICENSE` file |
| Mark modifications, with dates | §5(a) | Done for this change set (see "Modification log"); keep it up to date. Git history is the detailed record |
| License modifications under AGPL | §5(c) | Done: all Tayra changes in this repository are AGPL-3.0 |
| Offer the source to network users | §13 | Done (branch `feature/tayra-branding`): "Source code" link to the deployed commit on every authentication page and in Settings (see below). Keep the repository public |
| **Own Terms of Service and Privacy Policy** | consumer and data-protection law (not the AGPL) | **OPEN, blocks the commercial launch**: the Postiz links were removed and the registration line is hidden until `TERMS_URL` / `PRIVACY_URL` are set in `libraries/helpers/src/utils/brand.ts` |
| Corresponding Source includes build/deploy scripts | §1 | Done: `Dockerfile.dev`, `.github/workflows/`, `deploy/` are in the public repo |
| Third-party licenses reviewed | each dependency | **OPEN**: Polotno needs a commercial license or must stay disabled (see below) |
| No added restrictions on users | §10 | Rule: Terms of Service must not forbid what the AGPL allows (copying, modifying the source) |

## §13: the network-use obligation

Anyone who interacts with Tayra Social over the network must be **prominently offered**
the Corresponding Source of the exact version they are using, at no charge.

What exists already:
- the fork is public: `https://github.com/nouamanefadil/postiz-app`;
- every production image is built from one commit and labelled with it
  (`org.opencontainers.image.revision`); the deployed commit is the image tag
  `sha-<commit>` and is recorded in `/var/lib/tayra-deploy/history`;
- `NEXT_PUBLIC_VERSION` (`git describe` of the commit) is shown in the app.

- a visible notice, "Tayra Social is based on Postiz and licensed under the GNU
  AGPL-3.0. **Source code**", under the forms of every authentication page and at
  the bottom of the Settings menu (`components/layout/source.code.notice.tsx`).
  The link is `https://github.com/nouamanefadil/postiz-app/tree/<deployed commit>`,
  derived from `NEXT_PUBLIC_VERSION` by `sourceCodeUrl()` in
  `libraries/helpers/src/utils/brand.ts` (repository root if the version is unknown).

To keep it valid:
- keep the repository public, or provide the source another way if it ever becomes
  private (a download of the exact deployed commit, offered in the app);
- keep each deployed commit reachable (do not delete branches or force-push `main`;
  `main` is protected against both).

## Third-party dependencies

The AGPL covers Postiz's own code. Each dependency keeps its own license, and some
restrict commercial use regardless of the AGPL.

**Polotno** (`polotno`, the in-app design editor). Its license reads: free for
non-commercial products and local development; **commercial usage requires a paid
license** from polotno.com. The editor is **not** disabled when `NEXT_PUBLIC_POLOTNO`
is empty (as in production today): the media dialog
(`apps/frontend/src/components/media/media.component.tsx`) always loads it, and the
variable only supplies Polotno's API key. Before charging customers: either buy a
Polotno license, or remove/hide the editor in a Tayra feature PR.

Spot-checked, permissive: Next.js (MIT), NestJS (MIT), Temporal SDK (MIT),
CopilotKit (MIT), Prisma (Apache-2.0), Mastra (Apache-2.0), sharp (Apache-2.0).

Full review before launch, from a clean install:
```bash
pnpm licenses list --prod --long > licenses.txt
```
Flag anything that is not MIT / ISC / BSD / Apache-2.0 / MPL-2.0 / AGPL / GPL-compatible,
especially "SEE LICENSE IN", "UNLICENSED", "Commercial", SSPL, BSL and Elastic. Also
check fonts, icons and images shipped in `apps/frontend/public`.

## Name and branding

The AGPL does not license the Postiz name or logo. Use "Tayra Social" as the product
name. Factual credit such as "based on Postiz" is fine, but do not suggest that the
Postiz project endorses Tayra Social.

## Modification log

Record every Tayra Social change to the upstream code here (date, what, why). New
files carry the Tayra Social context in a header comment; edits to upstream files are
marked with a `Tayra Social:` comment where the file format allows.

| Date | Change | Files |
|---|---|---|
| 2026-11-15 | CI/CD and production deployment infrastructure | `.github/workflows/ci.yml`, `.github/workflows/deploy-production.yml`, `.github/workflows/db-schema-gate.yml`, `deploy/**` (new) |
| 2026-11-15 | Docker build context: keep `LICENSE` in the image, exclude `.env*`, keys and deploy tooling | `.dockerignore` (modified upstream file, marked) |
| 2026-11-16 | Tayra Social branding: name, logo, favicon, navy/gold theme (dark and light), truthful auth and onboarding copy (Postiz testimonials, user counts and tutorial video removed), Postiz legal and affiliate links removed, analytics no longer reports to postiz.com, AGPL "Source code" notice | `apps/frontend/**` (theme tokens in `colors.scss`, rule in `global.scss`, ~60 components and pages), `libraries/helpers/src/utils/brand.ts` (new), `libraries/react-shared-libraries/src/translation/*` (product name in all locales via one i18next post-processor), backend user-facing messages and the email template |
| 2026-11-16 | Social connect: the "Add Channel" endpoint refuses with a clear configuration message (variable names only) when a provider's OAuth credentials are empty, instead of sending the user to Meta/TikTok with an empty `client_id` | `apps/backend/src/api/routes/integrations.controller.ts`, `libraries/nestjs-libraries/src/integrations/social/social.integrations.interface.ts` (optional `requiredEnv`), Facebook, Instagram, Instagram Standalone, TikTok and TikTok Business providers, `apps/frontend/src/components/launches/add.provider.component.tsx` |
| 2026-11-16 | Add Channel: every OAuth provider declares its required credentials (`requiredEnv`, `A|B` = either), so a click on an unconfigured provider shows a clear message instead of a broken provider page; Reconnect buttons show the same message instead of navigating to `/undefined`; the two TikTok tiles are labelled "TikTok" and "TikTok Business" | `apps/backend/src/api/routes/integrations.controller.ts`, 19 provider files in `libraries/nestjs-libraries/src/integrations/social/`, `apps/frontend/src/components/launches/launches.component.tsx`, `apps/frontend/src/components/platform-analytics/render.analytics.tsx` |
| 2026-11-16 | MCP OAuth on a single domain: the advertised protected-resource URL keeps the backend path (`/api`), and the image nginx sends the root OAuth discovery paths (`/.well-known/oauth-protected-resource|oauth-authorization-server|openid-configuration/...`) to the backend, so MCP clients can sign in to `/api/mcp-oauth-dynamic` | `libraries/nestjs-libraries/src/chat/start.mcp.ts`, `var/docker/nginx.conf` |
| 2026-11-16 | Instagram (Facebook Business) via Meta Instagram API with Unified Login when `INSTAGRAM_UNIFIED_CONFIG_ID` is set: login dialog with `config_id` (no scope), Business Integration System User token, accounts from `/me/assigned_instagram_accounts` (no Facebook Page). Unset = previous Facebook Login flow | `libraries/nestjs-libraries/src/integrations/social/instagram.provider.ts` |
| 2026-11-17 | Connect links (MCP `integrationConnectTool`, public API `POST /integrations/connect`, the connect page) refuse a platform whose OAuth credentials are empty with the same configuration message as the dashboard, instead of a platform URL with an empty `client_id`; the check moved to `IntegrationManager.notConfiguredMessage` and the dashboard endpoint uses it | `libraries/nestjs-libraries/src/integrations/integration.manager.ts`, `libraries/nestjs-libraries/src/database/prisma/integrations/integration.service.ts`, `apps/backend/src/api/routes/integrations.controller.ts` |
| 2026-11-17 | Public API `GET /public/v1/social/:integration` (400 `{ msg }`) and enterprise `POST /enterprise/url` (empty body, its existing failure answer) refuse a platform whose OAuth credentials are empty, so no entry point creates a platform URL with an empty `client_id` | `apps/backend/src/public-api/routes/v1/public.integrations.controller.ts`, `apps/backend/src/api/routes/enterprise.controller.ts` |
| 2026-11-18 | Public Terms of Service (`/terms`) and Privacy Policy (`/privacy`) for Tayra Social, open without login; links in the sign-in / settings footer notice, on the connect-link page and in the registration form (`TERMS_URL` / `PRIVACY_URL`). Missing business details are shown as "To complete" placeholders, filled in `LEGAL` in `legal.page.tsx` | `apps/frontend/src/proxy.ts`, `apps/frontend/src/components/launches/connect.link.tsx`, new `apps/frontend/src/app/(app)/(legal)/`, new `apps/frontend/src/components/legal/legal.page.tsx` |
