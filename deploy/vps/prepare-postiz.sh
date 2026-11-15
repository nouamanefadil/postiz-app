#!/usr/bin/env bash
# Prepares /opt/postiz for production. Starts NO containers, touches no other project,
# never prints secrets. Safe to re-run: it never overwrites .env or an existing backup.
# Usage: sudo bash prepare-postiz.sh /path/to/docker-compose.override.yml
set -euo pipefail
umask 077
cd /opt/postiz
OVERRIDE_SRC="${1:?pass the path to docker-compose.override.yml}"
fail() { echo "BLOCKER: $*" >&2; exit 1; }
ok()   { echo "ok    $*"; }

echo "== PHASE A: audit (read-only)"
[ -f docker-compose.yaml ] || fail "no docker-compose.yaml in /opt/postiz"
git status --short || true
docker network inspect npm_default >/dev/null 2>&1 || fail "network npm_default not found"
ok "npm_default exists"
docker inspect npm-npm-1 --format '{{json .NetworkSettings.Networks}}' | grep -q '"npm_default"' \
  || fail "npm-npm-1 is not attached to npm_default"
ok "npm-npm-1 is on npm_default"

# Fresh install only: secrets are applied by Postgres at first init, so existing data would keep the old passwords.
existing=$(docker ps -a --filter label=com.docker.compose.project=postiz --format '{{.Names}}')
[ -z "$existing" ] || fail "Postiz containers already exist: $existing (stop and ask before continuing)"
vols=$(docker volume ls --filter label=com.docker.compose.project=postiz --format '{{.Name}}')
[ -z "$vols" ] || fail "Postiz volumes already exist: $vols (passwords in them would not change; ask before continuing)"
ok "no existing Postiz containers or volumes"

# Fixed container/network names in the official file must not collide with other projects.
for n in postiz postiz-postgres postiz-redis temporal temporal-postgresql temporal-elasticsearch temporal-admin-tools temporal-ui spotlight; do
  if docker container inspect "$n" >/dev/null 2>&1; then fail "container name '$n' is already used by another project"; fi
done
ok "no container name collisions"
if docker network inspect temporal-network >/dev/null 2>&1; then
  fail "a network named temporal-network already exists (owned by: $(docker network inspect temporal-network --format '{{index .Labels "com.docker.compose.project"}}'))"
fi
ok "temporal-network name is free"

echo "== PHASE B: backup"
ts=$(date +%Y%m%d-%H%M%S)
bdir="/opt/postiz-backups/$ts"
[ -e "$bdir" ] && fail "backup dir $bdir already exists"
mkdir -p "$bdir"
cp -a docker-compose.yaml dynamicconfig "$bdir"/
[ -f docker-compose.override.yml ] && cp -a docker-compose.override.yml "$bdir"/
[ -f .env ] && cp -a .env "$bdir"/
ok "backup in $bdir"

echo "== PHASE C: configuration"
if [ -f docker-compose.override.yml ] && ! cmp -s docker-compose.override.yml "$OVERRIDE_SRC"; then
  fail "a different docker-compose.override.yml already exists (backed up to $bdir); merge by hand"
fi
install -m 644 "$OVERRIDE_SRC" docker-compose.override.yml
ok "override installed"

if [ -f .env ]; then
  ok ".env already exists, left untouched"
else
  # hex = URL-safe, so it can sit inside DATABASE_URL without escaping
  {
    echo "POSTIZ_JWT_SECRET=$(openssl rand -hex 64)"
    echo "POSTIZ_DB_PASSWORD=$(openssl rand -hex 32)"
    echo "TEMPORAL_DB_PASSWORD=$(openssl rand -hex 32)"
    echo "# Optional integrations, leave empty until you have credentials:"
    for k in FACEBOOK_APP_ID FACEBOOK_APP_SECRET INSTAGRAM_APP_ID INSTAGRAM_APP_SECRET TIKTOK_CLIENT_ID TIKTOK_CLIENT_SECRET; do echo "$k="; done
  } > .env
  ok ".env generated"
fi
chmod 600 .env
chown root:root .env
ok ".env is $(stat -c '%a %U' .env)"
grep -qxF '.env' .git/info/exclude 2>/dev/null || echo '.env' >> .git/info/exclude
grep -qxF 'docker-compose.override.yml' .git/info/exclude || echo 'docker-compose.override.yml' >> .git/info/exclude
git check-ignore -q .env || fail ".env is not git-ignored"
ok ".env is git-ignored"

echo "== PHASE D: validation (no secrets are printed)"
docker compose config -q || fail "docker compose config -q failed"
ok "docker compose config -q"
CHECK=$(cat <<'PY'
import json, sys
c = json.load(sys.stdin)
s = c["services"]
errs = []
want = {"postiz","postiz-postgres","postiz-redis","spotlight","temporal-elasticsearch","temporal-postgresql","temporal","temporal-admin-tools","temporal-ui"}
missing = want - set(s)
if missing: errs.append(f"missing services: {sorted(missing)}")
for name, svc in s.items():
    if svc.get("ports") and "debug" not in (svc.get("profiles") or []):
        errs.append(f"{name} publishes ports")
p = s["postiz"]
if set(p["networks"]) != {"postiz-network","temporal-network","npm_default"}:
    errs.append(f"postiz networks wrong: {sorted(p['networks'])}")
if not c["networks"]["npm_default"].get("external"):
    errs.append("npm_default is not external")
e = p["environment"]
for k in ["MAIN_URL","FRONTEND_URL","NEXT_PUBLIC_BACKEND_URL","JWT_SECRET","DATABASE_URL","REDIS_URL","BACKEND_INTERNAL_URL","TEMPORAL_ADDRESS","STORAGE_PROVIDER","UPLOAD_DIRECTORY","IS_GENERAL","DISABLE_REGISTRATION"]:
    if not e.get(k): errs.append(f"postiz env {k} empty")
if not e["MAIN_URL"] == e["FRONTEND_URL"] == "https://social.maisontayra.com": errs.append("domain URLs wrong")
if e["NEXT_PUBLIC_BACKEND_URL"] != "https://social.maisontayra.com/api": errs.append("backend URL wrong")
if len(e["JWT_SECRET"]) < 64 or "random string" in e["JWT_SECRET"]: errs.append("JWT_SECRET weak/default")
pg = s["postiz-postgres"]["environment"]
want_url = f"postgresql://{pg['POSTGRES_USER']}:{pg['POSTGRES_PASSWORD']}@postiz-postgres:5432/{pg['POSTGRES_DB']}"
if e["DATABASE_URL"] != want_url: errs.append("DATABASE_URL does not match postiz-postgres credentials")
tp = s["temporal-postgresql"]["environment"]; t = s["temporal"]["environment"]
if tp["POSTGRES_PASSWORD"] != t["POSTGRES_PWD"] or tp["POSTGRES_USER"] != t["POSTGRES_USER"]:
    errs.append("temporal DB credentials mismatch")
for v in (pg["POSTGRES_PASSWORD"], tp["POSTGRES_PASSWORD"]):
    if v in ("postiz-password","temporal") or len(v) < 32: errs.append("a default/weak DB password remains")
if pg["POSTGRES_PASSWORD"] == tp["POSTGRES_PASSWORD"]: errs.append("DB passwords are not independent")
for vol in ["postgres-volume","postiz-redis-data","postiz-config","postiz-uploads","temporal-postgres-data","temporal-es-data"]:
    if vol not in c["volumes"]: errs.append(f"volume {vol} missing")
if errs:
    print("\n".join("FAIL  "+x for x in errs)); sys.exit(1)
print("ok    all services, env vars, credentials, networks, volumes and ports check out")
PY
)
docker compose config --format json | python3 -c "$CHECK" || fail "validation failed (see FAIL lines)"
echo "== Done. Nothing was started. Review, then deploy with the commands from the plan."
