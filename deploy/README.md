# Tayra Social: CI/CD and production deployment

Tayra Social is a modified version of [Postiz](https://github.com/gitroomhq/postiz-app)
(AGPL-3.0). This folder holds everything that builds, ships and runs it at
`https://social.maisontayra.com`. Licensing duties: [AGPL-COMPLIANCE.md](AGPL-COMPLIANCE.md).

```
feature/* | fix/* | upstream-sync/*
        │  pull request into main
        ▼
  CI (ci.yml) + DB schema gate (db-schema-gate.yml)    ← required checks
        │  merge
        ▼
  CI on main ──success──▶ Deploy production (deploy-production.yml)
                            1. build + push ghcr.io/nouamanefadil/tayra-social:sha-<commit>
                            2. move :latest to it
                            3. SSH (forced command) ─▶ VPS /opt/tayra-deploy/deploy.sh sha-<commit>
                                 backup DB ─▶ switch image ─▶ health check ─▶ rollback image on failure
                            4. public URL check, job summary
```

There is no staging environment. Test locally before opening the PR.

## Files

| Path | What it is |
|---|---|
| `.github/workflows/ci.yml` | PR + main checks: install, type checks, advisory lint, shellcheck, compose validation, Docker build (PRs) |
| `.github/workflows/db-schema-gate.yml` | Fails a PR that changes `schema.prisma` until it is labelled `db-schema-reviewed` |
| `.github/workflows/deploy-production.yml` | Build, publish and deploy after CI passes on `main` |
| `deploy/vps/deploy.sh` | The only command the deploy SSH key can run. Backup, switch, verify, roll back |
| `deploy/vps/backup.sh` | `pg_dump` of the Postiz database, verified, newest 7 kept |
| `deploy/vps/health-check.sh` | Container, pm2, API, database, frontend, soak and public URL checks |
| `.dockerignore` | Keeps `.env*`, keys and deploy tooling out of the image; keeps `LICENSE` in |

Upstream files (`Dockerfile.dev`, `docker-compose.yaml`, upstream workflows) are not
modified, so upstream releases merge cleanly.

## CI

Runs on every pull request into `main` and every push to `main`.

| Check | How | Blocking |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` (pnpm and Node versions from `package.json`) | yes |
| Type check backend | `tsc --noEmit -p apps/backend/tsconfig.build.json` | yes |
| Type check worker | `tsc --noEmit -p apps/orchestrator/tsconfig.build.json` | yes |
| Type check frontend | `tsc --noEmit -p apps/frontend/tsconfig.json` | yes |
| ESLint | changed files under `apps/frontend/src`, frontend config | **no** (see below) |
| Shellcheck | `deploy/vps/*.sh` | yes |
| Compose | `docker compose -f docker-compose.yaml config` | yes |
| Docker build (PRs) | `Dockerfile.dev`, BuildKit checks, image contents check | yes |
| DB schema gate | label required when `schema.prisma` changes | yes |

Not available, documented instead of faked:

- **Tests.** The repo has no test files, and `pnpm test` needs `@nx/jest`, which is
  not installed. Add a CI step together with the first real test.
- **Blocking lint.** The repo-root ESLint config (`eslint.config.mjs`) crashes while
  loading (circular config error in `FlatCompat`), so backend and worker cannot be
  linted. The frontend config works, but upstream code already has errors under it
  (`no-explicit-any` and others), so a blocking lint would fail every upstream sync.
  Lint runs advisory on changed frontend files; make it blocking once the baseline is clean.
- **Separate `pnpm run build`.** The Docker build runs the real production
  `pnpm run build`, so CI does not build twice.

Type checks need `NODE_OPTIONS=--max-old-space-size=4096` (same as the production
build); the default heap runs out of memory on the backend.

## Image

`ghcr.io/nouamanefadil/tayra-social`, public, `linux/amd64` (the VPS is x86_64).

- `sha-<40-char commit>`: immutable. Built once per commit and never overwritten (a
  re-run finds the existing tag and skips the build). **Production only ever runs these.**
- `latest`: convenience pointer to the newest main build. Never deployed.
- Labels: `org.opencontainers.image.source`, `.revision` (commit), `.version`
  (`git describe`), `.licenses=AGPL-3.0`, and `com.maisontayra.prisma-schema-sha256`
  (lets `deploy.sh` warn when the schema changes).
- Built from the unmodified `Dockerfile.dev`, the same process upstream uses for the
  official image. `NEXT_PUBLIC_VERSION` is always set: without it the frontend
  behaves as Postiz's hosted cloud instead of a self-hosted install.
- `/app/LICENSE` (AGPL-3.0) is in the image. No `.env` file is (verified in CI).
- BuildKit reuses the base layers (apt, pnpm) of the previous `latest`. Everything
  after `COPY . /app` rebuilds each time (about 20 to 25 minutes). Faster builds
  would need a custom Dockerfile, which would drift from upstream.

## Deploy workflow security

`deploy-production.yml` uses `workflow_run`, which always runs the copy of the file on
`main` with the production secrets. Guards:

- runs only in `nouamanefadil/postiz-app`, only when CI **succeeded**, only for a
  **push** event (not a PR), only when the head repository is this repository (a fork
  PR from a branch called `main` matches `branches: [main]` but fails these checks);
- deploys exactly `workflow_run.head_sha`, the commit CI tested, and only if it is
  still the tip of `main` (an older run finishing late never overwrites a newer
  deploy; it is skipped with a notice);
- one production deploy at a time (`concurrency: production-deploy`, never cancelled
  mid-run). If several merges queue up, GitHub keeps only the newest pending run;
- secrets live in the `production` environment, which only `main` can use;
- third-party actions are pinned to commit SHAs;
- untrusted event fields are only used in `if:` expressions, never inside shell.

On the server, the key can do exactly one thing: `sudo /opt/tayra-deploy/deploy.sh
<argument>`. The script accepts only `^sha-[0-9a-f]{40}$`, pulls only from
`ghcr.io/nouamanefadil/tayra-social`, and checks that the image's revision label
matches the tag. The key has no shell, no port forwarding, and the user is not in
the `docker` group.

Public repository: Actions logs are public. The scripts print status lines only.
Container logs and `pm2 jlist` (which contains environment variables) never reach
stdout; failed-container logs are saved on the server in `/var/log/tayra-deploy/`.

## What a deploy does on the VPS

`deploy.sh sha-<commit>` (as root via sudo, one at a time via `flock`):

1. **Preflight, nothing changed yet.** `docker-compose.image.yml` exists, Compose
   actually uses it, and the running container matches what Compose says. If the
   commit is already running it only re-runs the health check.
2. **Rollback target.** Records the running image **by registry digest** (for the
   official image: `ghcr.io/gitroomhq/postiz-app@sha256:…`), so a later upstream push
   to `:latest` cannot change what a rollback restores, and checks it is present
   locally.
3. **New image.** Pulls `sha-<commit>` (unless already on the server) and verifies its
   revision label. Logs a NOTE when the Prisma schema hash differs from the running image.
4. **Backup.** `backup.sh`: `pg_dump --format=custom` from inside `postiz-postgres`,
   verified with `pg_restore --list`, saved as
   `/opt/postiz-backups/db/postiz-<UTC time>-before-sha-<commit>.dump` (root only).
   Keeps the newest 7 and never deletes the one just written. Fails if less than 2 GB
   is free. **A failed backup aborts the deploy.**
5. **Switch.** Rewrites `docker-compose.image.yml` and runs
   `docker compose up -d --no-deps --pull never postiz`. Only the `postiz` container is
   recreated. Postgres, Redis, Temporal, Elasticsearch, volumes, networks and the
   other projects on the server are not touched. Never `down`, never `prune`.
6. **Health check** (`health-check.sh`, up to 10 minutes):
   container running and Docker healthcheck `healthy`, fewer than 3 restarts;
   pm2 `backend`, `frontend`, `orchestrator` all `online`;
   from inside the container `GET /api/` = 200, `GET /api/auth/can-register` = 200 with
   JSON (this endpoint counts organizations in PostgreSQL because production has
   `DISABLE_REGISTRATION=true`, so it proves database connectivity), `GET /` = 2xx/3xx;
   then a 60-second soak during which no pm2 process may restart (the worker has no HTTP
   port; this catches it crash-looping on Redis or Temporal); then
   `https://social.maisontayra.com` through Nginx Proxy Manager.
7. **Failure:** saves the failed container's logs on the server, writes the digest-pinned
   previous image back, recreates `postiz`, runs the full health check again.
   **The database is never restored automatically.**

Exit codes, also shown in the GitHub job summary:

| Code | Meaning |
|---|---|
| 0 | deployed and healthy |
| 1 | failed; production unchanged, or rolled back to the previous image and healthy |
| 2 | failed **and** rollback failed: production needs a human, see "Rollback failed" |
| 64 | invalid tag rejected |

Server files: `/var/log/tayra-deploy/deploy-<run>.log`, `/var/lib/tayra-deploy/history`
(one line per deploy with the previous image digest), `/opt/postiz-backups/db/`.

## Database schema changes

Postiz has no migration files: the container runs `prisma db push` on every start, so a
schema change is applied by the first start of the new image. Rolling back the image
does **not** undo it. If the new schema added a column that already holds data, the
previous image's `db push` refuses to drop it, the old container cannot start, and the
rollback fails (exit 2).

So, before merging any PR that changes
`libraries/nestjs-libraries/src/database/prisma/schema.prisma`:

1. Read the diff. Safe: new tables, new **nullable** columns or columns with a
   default, new indexes. Unsafe: dropped or renamed columns or tables, type
   changes, new `NOT NULL` without a default, new unique constraints on existing data.
2. For an unsafe change, split it: first ship code that works with both schemas,
   then the destructive change in a later release.
3. Check that a recent backup restores (`pg_restore --list` on the newest dump).
4. Add the label `db-schema-reviewed` to the PR. The `db-schema-review` check
   turns green. If more schema commits follow, remove and re-add the label after reviewing them.

Upstream release syncs almost always change the schema. Review them the same way.

## One-time setup

Order matters: set up the VPS and GitHub **before** the first merge into `main`,
because that merge deploys. If something is missing the deploy fails before touching
production (no SSH user, image not public, missing image file) and can be re-run with
"Re-run failed jobs" once fixed.

### 1. GitHub: disable upstream workflows that do not belong in the fork

| Workflow | Why |
|---|---|
| `build.yml` | duplicate full build on every push; replaced by `ci.yml` |
| `build-containers.yml` | any tag push would try to publish to `ghcr.io/gitroomhq/postiz-app` |
| `staging-conflicts.yml` | 10-minute cron that runs Claude with upstream's secrets |

```bash
gh workflow disable build.yml -R nouamanefadil/postiz-app
gh workflow disable build-containers.yml -R nouamanefadil/postiz-app
gh workflow disable staging-conflicts.yml -R nouamanefadil/postiz-app
```

Kept: `codeql.yml` (security scanning), and `deploy-aws.yml` / `stale.yml`, which are
guarded to `gitroomhq/postiz-app` and never run here. The files are not edited, so
upstream merges do not conflict. After every upstream sync, check
`gh workflow list --all` for new or renamed upstream workflows.

### 2. Deploy SSH key (on your Mac)

A dedicated key, used only by GitHub Actions. Not your personal `tayra_vps` key.

```bash
ssh-keygen -t ed25519 -N "" -C "tayra-deploy@github-actions" -f ~/.ssh/tayra_deploy_gha
ssh-keygen -F 72.62.189.177 -f ~/.ssh/known_hosts   # pinned host key, for VPS_KNOWN_HOSTS
```

Check that the printed host key matches the server
(`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the VPS). Use only the line(s)
for the host, without the `# Host … found` comment.

### 3. VPS (as root, one block at a time)

Nothing here restarts a container.

**Scripts.** From the Mac, in the repo:
```bash
scp -i ~/.ssh/tayra_vps deploy/vps/deploy.sh deploy/vps/backup.sh deploy/vps/health-check.sh root@72.62.189.177:/tmp/
```
On the VPS:
```bash
install -d -o root -g root -m 755 /opt/tayra-deploy
install -o root -g root -m 755 /tmp/deploy.sh /tmp/backup.sh /tmp/health-check.sh /opt/tayra-deploy/
rm /tmp/deploy.sh /tmp/backup.sh /tmp/health-check.sh
```

**Deploy user.** No password, not in the `docker` group.
```bash
adduser --system --group --shell /bin/sh --home /home/tayra-deploy tayra-deploy
install -d -o root -g root -m 755 /home/tayra-deploy/.ssh
# Paste the content of ~/.ssh/tayra_deploy_gha.pub in place of PUBLIC_KEY:
printf '%s\n' 'restrict,command="sudo -n /opt/tayra-deploy/deploy.sh \"$SSH_ORIGINAL_COMMAND\"" PUBLIC_KEY' \
  > /home/tayra-deploy/.ssh/authorized_keys
chmod 644 /home/tayra-deploy/.ssh/authorized_keys      # root-owned: the user cannot change it
printf '%s\n' 'tayra-deploy ALL=(root) NOPASSWD: /opt/tayra-deploy/deploy.sh' > /etc/sudoers.d/tayra-deploy
chmod 440 /etc/sudoers.d/tayra-deploy
visudo -cf /etc/sudoers.d/tayra-deploy
sshd -T | grep -iE '^(allowusers|allowgroups|passwordauthentication|pubkeyauthentication)'
```
If `allowusers` / `allowgroups` is set, add `tayra-deploy` to it in
`/etc/ssh/sshd_config` and `systemctl reload ssh`.

**Compose wiring.** Makes Compose read the image from `docker-compose.image.yml`.
The first version names the image exactly as today, so nothing changes and nothing restarts:
```bash
cd /opt/postiz
before=$(docker compose config --hash postiz)
printf '%s\n' \
  '# Managed by /opt/tayra-deploy/deploy.sh. Do not edit by hand (see deploy/README.md).' \
  'services:' '  postiz:' '    image: ghcr.io/gitroomhq/postiz-app:latest' > docker-compose.image.yml
chmod 644 docker-compose.image.yml
install -d -m 700 /opt/postiz-backups
cp -a .env "/opt/postiz-backups/env-before-tayra-deploy-$(date -u +%Y%m%dT%H%M%SZ)"   # copy, not printed
printf '\n# Tayra Social deploy: compose files, in order\nCOMPOSE_FILE=docker-compose.yaml:docker-compose.override.yml:docker-compose.image.yml\n' >> .env
grep -qxF docker-compose.image.yml .git/info/exclude || echo docker-compose.image.yml >> .git/info/exclude
after=$(docker compose config --hash postiz)
[ "$before" = "$after" ] && echo "OK: postiz config unchanged, no restart" || echo "STOP: config changed, undo the .env line"
docker compose config --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["services"]["postiz"]["image"])'
# expected: ghcr.io/gitroomhq/postiz-app:latest
```
From now on every `docker compose` command in `/opt/postiz` (yours included) uses the
deployed image. Do not run Compose with explicit `-f` flags there, which would bypass
`docker-compose.image.yml` and recreate the container with the official image.

**Dry checks** (read-only for production):
```bash
/opt/tayra-deploy/health-check.sh 120        # should end with HEALTHY
/opt/tayra-deploy/backup.sh setup-test       # creates the first verified dump
```

**Key restriction** (from the Mac; both must be refused):
```bash
ssh -i ~/.ssh/tayra_deploy_gha tayra-deploy@72.62.189.177 'id'   # usage message, exit 64
ssh -i ~/.ssh/tayra_deploy_gha -t tayra-deploy@72.62.189.177     # no shell, exit 64
```

### 4. GitHub: environment, secrets, variable

Settings → Environments → **New environment** `production`:
- Deployment branches and tags: **Selected branches**, add `main`.
- No required reviewers (deploys are automatic after merge).

Environment secrets:

| Secret | Value |
|---|---|
| `VPS_HOST` | `72.62.189.177` |
| `VPS_USER` | `tayra-deploy` |
| `VPS_SSH_PORT` | `22` (or your SSH port) |
| `VPS_SSH_KEY` | full content of `~/.ssh/tayra_deploy_gha` (private key) |
| `VPS_KNOWN_HOSTS` | the host key line(s) from step 2 |

Environment variable: `PRODUCTION_URL` = `https://social.maisontayra.com`.

No registry secret: pushing uses the built-in `GITHUB_TOKEN`; the VPS pulls the public image anonymously.

### 5. GitHub: protect `main`

Settings → Rules → Rulesets → **New branch ruleset** `main`, target the default branch:
- Restrict deletions; Block force pushes;
- Require a pull request before merging, **0** required approvals (you cannot approve your own PR);
- Require status checks to pass, with branches up to date: `Type check, lint, scripts`,
  `Docker build`, `db-schema-review`;
- Bypass list empty (or yourself only, for emergencies).

The checks appear in the picker after they have run once on a PR.

### 6. GHCR package: make it public (after the first image push)

GitHub creates new packages as private, so the first deploy fails at the pull step
("is the GHCR package public?"), with production unchanged. Then:
github.com/nouamanefadil → Packages → `tayra-social` → Package settings →
Change visibility → **Public**. Check that "Manage Actions access" lists
`postiz-app` with write access, then re-run the failed deploy job.

### 7. Upstream release tags

`git describe` gives the image version (`v2.26.0-9-gc22451b`). The fork has no tags,
so versions fall back to the short commit until a release tag is pushed:
```bash
git push origin v2.26.0     # only after build-containers.yml is disabled (step 1)
```

## First deploy (official image → Tayra image)

The first merge into `main` switches production from `ghcr.io/gitroomhq/postiz-app:latest`
to `tayra-social:sha-<commit>`. Production runs v2.26.0, and `main` is v2.26.0 plus 9
upstream commits whose only schema change replaces indexes (no columns), so `db push`
is safe in both directions.

The rollback target is the official image pinned by digest (`…/postiz-app@sha256:…`,
present on the server), so a failed first deploy returns to exactly today's image.
Merge when you can watch the Actions run (about 35 minutes).

## Rollback

**Automatic:** on any failure after the switch, `deploy.sh` restores the previous image
(exit 1).

**To an earlier Tayra release:** revert the bad commit with a PR (normal flow), or on the
VPS as root:
```bash
tail /var/lib/tayra-deploy/history                       # find the commit
/opt/tayra-deploy/deploy.sh sha-<earlier 40-char commit> # backup, switch, health check, auto-rollback
```

**To the official Postiz image:** take the digest from the `previous=` field of the first
line in `/var/lib/tayra-deploy/history`, then:
```bash
cd /opt/postiz
printf '%s\n' 'services:' '  postiz:' '    image: ghcr.io/gitroomhq/postiz-app@sha256:<digest>' > docker-compose.image.yml
docker compose up -d --no-deps --pull never postiz
/opt/tayra-deploy/health-check.sh
```

### Rollback failed (exit 2)

Usually the previous image cannot start against a schema the new image changed.
1. Look at `/var/log/tayra-deploy/deploy-<run>-failed-container.log` and
   `docker logs --tail 200 postiz` (on the server, not in a public place).
2. Prefer **rolling forward**: fix the bug, merge, deploy.
3. Restore the database only as a deliberate decision. It discards everything written
   since the backup:
   ```bash
   cd /opt/postiz
   docker compose stop postiz
   # point docker-compose.image.yml at the image that matches the backup (the previous image)
   docker exec -i postiz-postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' \
     < /opt/postiz-backups/db/postiz-<time>-before-sha-<commit>.dump
   docker compose up -d --no-deps --pull never postiz
   /opt/tayra-deploy/health-check.sh
   ```

## Upstream Postiz updates (release tags only)

Never merge upstream `main`. Only tagged, stable releases:

1. Watch releases: github.com/gitroomhq/postiz-app/releases (Watch → Custom → Releases).
2. Pick a release, read its notes, wait a few days for `.1` fixes if it is large.
3. Branch and merge the tag:
   ```bash
   git fetch upstream --tags
   git switch -c upstream-sync/v2.27.0 main
   git merge --no-ff v2.27.0
   ```
4. Review: `git diff main...v2.27.0 --stat`, the schema diff
   (`git diff main v2.27.0 -- libraries/nestjs-libraries/src/database/prisma/schema.prisma`),
   and `git diff main v2.27.0 --stat -- .github/workflows` (new or renamed workflows).
5. Resolve conflicts keeping Tayra changes (they are marked `Tayra Social` in comments).
6. Test locally (`pnpm install`, type checks, `pnpm run dev` against a copy of the data).
7. `git push origin upstream-sync/v2.27.0 v2.27.0`, open a PR into `main`, add
   `db-schema-reviewed` after the schema review, merge when green.
8. Disable any new upstream workflow that does not belong in the fork (setup step 1).

## Updating the VPS scripts

CI cannot change the scripts on the server (by design). After a change to
`deploy/vps/*.sh` is merged, repeat "Scripts" in setup step 3.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Deploy workflow did not start | CI must succeed on a **push** to main; the deploy file must exist on `main`; check the `guard` job (skipped means not the tip of main) |
| `Permission denied (publickey)` | `VPS_SSH_KEY` / `authorized_keys` mismatch, `AllowUsers` in sshd, or wrong `VPS_USER` / `VPS_SSH_PORT` |
| `Host key verification failed` | `VPS_KNOWN_HOSTS` missing or wrong host key line |
| `sudo: a password is required` | `/etc/sudoers.d/tayra-deploy` missing, or the path in it differs from the forced command |
| `cannot pull … (is the GHCR package public?)` | Setup step 6 |
| `compose does not use docker-compose.image.yml` | `COMPOSE_FILE` line missing from `/opt/postiz/.env` |
| `running container uses … but compose says …` | someone ran Compose by hand with other files or edited the image file; fix by hand, then re-run |
| `database backup failed` | `postiz-postgres` down, or less than 2 GB free (`df -h /`) |
| Health check times out | read `/var/log/tayra-deploy/deploy-<run>-failed-container.log` on the server |
| `a pm2 process restarted during the soak` | usually the worker (`orchestrator`) losing Temporal or Redis |
| `another deploy is running` | a previous run still holds the lock; wait, or check `ps aux | grep deploy.sh` |
