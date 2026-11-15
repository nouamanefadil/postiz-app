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

Status: steps 1 to 4 were completed and verified on 2026-11-15. The commands below
are the ones that were run; repeat them only to rebuild the setup (new server, key
rotation). Shell: every block is plain `bash`. They also work pasted into macOS
`zsh` as written, but if you put SSH options into a variable, run the block with
`bash` (zsh does not word-split `$VAR`).

### 1. GitHub: Actions on the fork, and upstream workflows

GitHub keeps workflows off on a fork until the owner clicks **"I understand my
workflows, go ahead and enable them"** on the Actions tab (UI only). Only then are
workflows registered and can be disabled one by one:

| Workflow | Why | State |
|---|---|---|
| `build.yml` | duplicate full build on every push; replaced by `ci.yml` | `disabled_manually` |
| `build-containers.yml` | any tag push would try to publish to `ghcr.io/gitroomhq/postiz-app` | `disabled_manually` |
| `staging-conflicts.yml` | 10-minute cron that runs Claude with upstream's secrets | `disabled_fork` |

```bash
gh workflow disable build.yml -R nouamanefadil/postiz-app
gh workflow disable build-containers.yml -R nouamanefadil/postiz-app
gh api "repos/nouamanefadil/postiz-app/actions/workflows?per_page=100" --jq '.workflows[] | "\(.state)\t\(.path)"'
```

`staging-conflicts.yml` (like `stale.yml`) is a scheduled workflow, and GitHub
disables scheduled workflows on forks automatically (`disabled_fork`). Leave it that
way. The API refuses to disable it again ("not active"), and enabling it to then
disable it would arm the 10-minute cron. If the Actions tab ever offers to enable
scheduled workflows on this fork, do not accept.

Kept: `codeql.yml` (security scanning), and `deploy-aws.yml` / `stale.yml`, which are
guarded to `gitroomhq/postiz-app` and never run here. The files are not edited, so
upstream merges do not conflict. After every upstream sync, re-run the `gh api` line
above and look for new or renamed upstream workflows.

### 2. Deploy SSH key (on your Mac)

A dedicated key, used only by GitHub Actions. Never your personal `tayra_vps` key.

```bash
ls ~/.ssh/tayra_social_deploy* 2>/dev/null && echo "exists: do not overwrite"
ssh-keygen -q -t ed25519 -a 100 -N "" -C "tayra-social-deploy@github-actions" -f ~/.ssh/tayra_social_deploy
chmod 600 ~/.ssh/tayra_social_deploy && chmod 644 ~/.ssh/tayra_social_deploy.pub
ssh-keygen -lf ~/.ssh/tayra_social_deploy.pub        # note the SHA256 fingerprint
```

No passphrase: GitHub Actions must use the key unattended, and a passphrase would have
to be stored as another secret right next to it. The key is contained instead: it
can only run the forced deploy command (step 3), and can be revoked on its own.
Never print the private key, paste it anywhere, or put it on the server.

### 3. VPS (as root over `tayra_vps`, one block at a time)

Nothing here restarts a container.

**Scripts.** From the Mac, in the repo (into a root-only staging directory):
```bash
ssh -i ~/.ssh/tayra_vps root@72.62.189.177 'install -d -o root -g root -m 700 /root/tayra-install'
scp -i ~/.ssh/tayra_vps deploy/vps/deploy.sh deploy/vps/backup.sh deploy/vps/health-check.sh root@72.62.189.177:/root/tayra-install/
shasum -a 256 deploy/vps/*.sh                          # compare with the server below
```
On the VPS:
```bash
cd /root/tayra-install && sha256sum deploy.sh backup.sh health-check.sh
install -d -o root -g root -m 755 /opt/tayra-deploy
install -o root -g root -m 755 deploy.sh backup.sh health-check.sh /opt/tayra-deploy/
cd / && rm -r /root/tayra-install
install -d -o root -g root -m 700 /opt/postiz-backups /opt/postiz-backups/db /var/log/tayra-deploy /var/lib/tayra-deploy
```
The scripts contain no secrets; 755 root-owned means only root can change them.

**Deploy user.** Locked password, only its own group (no `docker`, no `sudo`), and a
root-owned home so it cannot change its own SSH setup:
```bash
adduser --system --group --shell /bin/sh --home /home/tayra-deploy tayra-deploy
chown root:root /home/tayra-deploy && chmod 755 /home/tayra-deploy
install -d -o root -g root -m 755 /home/tayra-deploy/.ssh
id tayra-deploy; passwd -S tayra-deploy          # groups=…(tayra-deploy) only; status L (locked)
```
`/bin/sh` is required: sshd runs the forced command through the user's shell. It never
gives an interactive shell, because the key below always runs the forced command.

**Forced-command key.** Replace `PUBLIC_KEY` with the single line of
`~/.ssh/tayra_social_deploy.pub` (the public key only):
```bash
printf '%s\n' 'restrict,command="sudo -n /opt/tayra-deploy/deploy.sh \"$SSH_ORIGINAL_COMMAND\"" PUBLIC_KEY' \
  > /home/tayra-deploy/.ssh/authorized_keys
chown root:root /home/tayra-deploy/.ssh/authorized_keys && chmod 644 /home/tayra-deploy/.ssh/authorized_keys
ssh-keygen -lf /home/tayra-deploy/.ssh/authorized_keys   # same fingerprint as on the Mac
```
`restrict` turns off PTY, port, agent and X11 forwarding for this key, even though the
server allows them in general.

**sudoers.** Validate a temporary file first: a broken file in `/etc/sudoers.d` can
break `sudo` for everyone.
```bash
tmp=$(mktemp)
printf '%s\n' 'tayra-deploy ALL=(root) NOPASSWD: /opt/tayra-deploy/deploy.sh' > "$tmp"
visudo -cf "$tmp" && install -o root -g root -m 440 "$tmp" /etc/sudoers.d/tayra-deploy; rm -f "$tmp"
visudo -c
sudo -l -U tayra-deploy                          # exactly: (root) NOPASSWD: /opt/tayra-deploy/deploy.sh
sshd -T | grep -iE '^(allowusers|allowgroups)'   # empty = nothing to change
```
If `allowusers` / `allowgroups` is set, adding `tayra-deploy` to it is an sshd change:
do it deliberately (`sshd -t` before `systemctl reload ssh`).

**Compose wiring.** Makes Compose read the image from `docker-compose.image.yml`.
The first version names the image exactly as today. The hashes of **all** services
must be identical before and after, which proves nothing will be recreated; the
block undoes itself otherwise:
```bash
cd /opt/postiz
before=$(docker compose config --hash '*')
printf '%s\n' \
  '# Managed by /opt/tayra-deploy/deploy.sh. Do not edit by hand (see deploy/README.md).' \
  'services:' '  postiz:' '    image: ghcr.io/gitroomhq/postiz-app:latest' > docker-compose.image.yml
chmod 644 docker-compose.image.yml
envbak="/opt/postiz-backups/env-before-tayra-deploy-$(date -u +%Y%m%dT%H%M%SZ)"
cp -a .env "$envbak"                              # copy, never printed
printf '\n# Tayra Social deploy: compose files, in order\nCOMPOSE_FILE=docker-compose.yaml:docker-compose.override.yml:docker-compose.image.yml\n' >> .env
grep -qxF docker-compose.image.yml .git/info/exclude || echo docker-compose.image.yml >> .git/info/exclude
after=$(docker compose config --hash '*')
if [ "$before" = "$after" ]; then echo "OK: all service hashes unchanged, no restart"
else cp -a "$envbak" .env && rm -f docker-compose.image.yml && echo "STOP: hashes changed, wiring undone"; fi
docker compose config --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["services"]["postiz"]["image"])'
# expected: ghcr.io/gitroomhq/postiz-app:latest
```
From now on every `docker compose` command in `/opt/postiz` (yours included) uses the
deployed image. Do not run Compose with explicit `-f` flags there, which would bypass
`docker-compose.image.yml` and recreate the container with the official image.

**Dry checks** (read-only for production):
```bash
/opt/tayra-deploy/health-check.sh 300        # ends with HEALTHY (includes the public URL)
/opt/tayra-deploy/backup.sh setup-test       # creates the first verified dump
```

**Key restriction tests** (from the Mac, `bash`). Every line must be refused; the last
one proves the real path (sshd → forced command → `sudo -n` → `deploy.sh` preflight)
and stops at the image pull because that image does not exist:
```bash
K=(-i ~/.ssh/tayra_social_deploy -o IdentitiesOnly=yes -o BatchMode=yes); H=tayra-deploy@72.62.189.177
ssh "${K[@]}" $H id < /dev/null;               echo "rc=$? (expect 64, usage message)"
ssh "${K[@]}" $H 'sudo bash -c id' < /dev/null; echo "rc=$? (expect 64)"
ssh "${K[@]}" $H '$(touch /tmp/pwned)' < /dev/null; echo "rc=$? (expect 64)"
ssh "${K[@]}" -tt $H < /dev/null;               echo "rc=$? (expect PTY allocation request failed)"
sftp "${K[@]}" -b /dev/null $H;                 echo "rc=$? (expect Connection closed)"
ssh "${K[@]}" $H sha-0000000000000000000000000000000000000000 < /dev/null; echo "rc=$? (expect 1, cannot pull)"
ssh -i ~/.ssh/tayra_vps root@72.62.189.177 'ls /tmp/pwned 2>&1'   # expect: No such file
```
The `< /dev/null` matters when these lines run inside a script: without it `ssh`
reads the rest of the script from stdin.

### 4. GitHub: environment, secrets, variable

**Environment** `production`, deployable from `main` only, no reviewers, no wait timer:
```bash
R=nouamanefadil/postiz-app
printf '%s' '{"wait_timer":0,"reviewers":null,"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}' \
  | gh api -X PUT repos/$R/environments/production --input -
gh api -X POST repos/$R/environments/production/deployment-branch-policies -f name=main -f type=branch
```

**Pinned host key.** Take the lines you already trust and check them against the
server's own keys, read over the authenticated `tayra_vps` session (do not trust a
fresh `ssh-keyscan`):
```bash
ssh-keygen -F 72.62.189.177 -f ~/.ssh/known_hosts | grep -v '^#' > /tmp/kh && ssh-keygen -lf /tmp/kh
ssh -i ~/.ssh/tayra_vps root@72.62.189.177 'for f in /etc/ssh/ssh_host_*_key.pub; do ssh-keygen -lf "$f"; done'
# every fingerprint must match before continuing
```

**Secrets** (values go in through stdin, never as arguments, never printed):
```bash
printf '%s' '72.62.189.177' | gh secret set VPS_HOST     --env production -R $R
printf '%s' 'tayra-deploy'  | gh secret set VPS_USER     --env production -R $R
printf '%s' '22'            | gh secret set VPS_SSH_PORT --env production -R $R
gh secret set VPS_SSH_KEY     --env production -R $R < ~/.ssh/tayra_social_deploy
gh secret set VPS_KNOWN_HOSTS --env production -R $R < /tmp/kh && rm -f /tmp/kh
gh variable set PRODUCTION_URL --env production -R $R --body 'https://social.maisontayra.com'
gh secret list --env production -R $R            # names and dates only
```

| Secret | Value |
|---|---|
| `VPS_HOST` | `72.62.189.177` |
| `VPS_USER` | `tayra-deploy` |
| `VPS_SSH_PORT` | `22` |
| `VPS_SSH_KEY` | the private key file `~/.ssh/tayra_social_deploy` |
| `VPS_KNOWN_HOSTS` | the verified host key lines |

No registry secret: pushing uses the built-in `GITHUB_TOKEN`; the VPS pulls the public image anonymously.
To rotate the deploy key: generate a new one (step 2), replace the `authorized_keys`
line (step 3), then `gh secret set VPS_SSH_KEY` again.

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
tail /var/lib/tayra-deploy/history                # find the commit
COMMIT=0123456789abcdef0123456789abcdef01234567    # replace: the earlier full 40-char commit
/opt/tayra-deploy/deploy.sh "sha-$COMMIT"         # backup, switch, health check, auto-rollback
```

**To the official Postiz image:** take the digest from the `previous=` field of the first
line in `/var/lib/tayra-deploy/history`, then:
```bash
cd /opt/postiz
head -1 /var/lib/tayra-deploy/history             # previous=ghcr.io/gitroomhq/postiz-app@sha256:…
OFFICIAL='ghcr.io/gitroomhq/postiz-app@sha256:875e61ac5d0ac43c3dec78a78a7032dfb03d9a8c6d4936ebb18adb606cc207c5'  # v2.26.0, check it matches
printf '%s\n' 'services:' '  postiz:' "    image: $OFFICIAL" > docker-compose.image.yml
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
   ls -t /opt/postiz-backups/db/                   # pick the dump taken before the failed deploy
   DUMP=/opt/postiz-backups/db/postiz-20261115T172421Z-setup-test.dump   # replace with that file
   docker exec -i postiz-postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' \
     < "$DUMP"
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
