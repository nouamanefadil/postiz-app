#!/usr/bin/env bash
# Tayra Social: verify the running Postiz container.
#
#   health-check.sh [timeout_seconds]     exit 0 = healthy
#
# 1. container running, Docker healthcheck "healthy", not crash-looping
# 2. pm2 processes backend, frontend, orchestrator all "online"
# 3. from inside the container: GET /api/ = 200, GET /api/auth/can-register
#    = 200 with JSON (counts organizations in PostgreSQL when registration is
#    disabled, so it proves DB connectivity), GET / = 2xx/3xx
# 4. soak: after $SOAK_SECONDS, pm2 restart counters unchanged and HTTP still ok
#    (catches the worker crash-looping on Redis/Temporal; it has no HTTP port)
# 5. public URL through Nginx Proxy Manager
#
# Prints only status lines. `pm2 jlist` contains the full process environment
# (secrets), so it is parsed inside the container and only name/status/restarts
# leave it.
set -Eeuo pipefail

APP_CONTAINER="${APP_CONTAINER:-postiz}"
PUBLIC_URL="${PUBLIC_URL-https://social.maisontayra.com}"   # empty = skip public check
PM2_APPS="${PM2_APPS:-backend frontend orchestrator}"
SOAK_SECONDS="${SOAK_SECONDS:-60}"
MAX_RESTARTS="${MAX_RESTARTS:-2}"
TIMEOUT="${1:-600}"

log() { echo "[health] $*"; }
# Print each line of $2 prefixed with "[health] $1".
logs() { local l; while IFS= read -r l; do [ -n "$l" ] && echo "[health] $1$l"; done <<<"$2"; return 0; }
fail() { log "FAIL: $*"; exit 1; }
deadline=$((SECONDS + TIMEOUT))

# One line per probe: "ok|FAIL <name> <status>". Exit 0 only if all pass.
probe_http() {
  docker exec "$APP_CONTAINER" node -e '
    const base = "http://127.0.0.1:5000";
    const checks = [
      ["backend", "/api/", async (r) => r.status === 200],
      ["database", "/api/auth/can-register", async (r) =>
        r.status === 200 && typeof (await r.json()).register === "boolean"],
      ["frontend", "/", async (r) => r.status >= 200 && r.status < 400],
    ];
    (async () => {
      let ok = true;
      for (const [name, path, test] of checks) {
        let line;
        try {
          const r = await fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(15000) });
          const pass = await test(r);
          ok = ok && pass;
          line = `${pass ? "ok  " : "FAIL"} ${name} ${path} -> ${r.status}`;
        } catch (e) {
          ok = false;
          line = `FAIL ${name} ${path} -> ${e.name}`;
        }
        console.log(line);
      }
      process.exit(ok ? 0 : 1);
    })();
  ' 2>/dev/null
}

# Prints "name status restarts" per pm2 process.
pm2_state() {
  docker exec "$APP_CONTAINER" node -e '
    const s = require("child_process").execSync("pm2 jlist", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    for (const p of JSON.parse(s.slice(s.indexOf("["))))
      console.log(p.name, p.pm2_env.status, p.pm2_env.restart_time);
  ' 2>/dev/null
}

# Exit 0 if every expected pm2 app is online.
pm2_all_online() {
  local state="$1" app
  for app in $PM2_APPS; do
    grep -qE "^$app online " <<<"$state" || return 1
  done
}

log "waiting up to ${TIMEOUT}s for $APP_CONTAINER"
while :; do
  read -r status health restarts < <(docker inspect -f \
    '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} {{.RestartCount}}' \
    "$APP_CONTAINER" 2>/dev/null || echo "missing none 0")
  [ "$restarts" -le "$MAX_RESTARTS" ] || fail "container restarted $restarts times (crash loop)"
  [ "$health" != unhealthy ] || fail "Docker healthcheck reports unhealthy"

  if [ "$status" = running ] && { [ "$health" = healthy ] || [ "$health" = none ]; }; then
    state=$(pm2_state || true)
    if pm2_all_online "$state" && http=$(probe_http); then
      log "container=$status health=$health restarts=$restarts"
      logs "pm2 " "$state"
      logs "" "$http"
      break
    fi
  fi
  [ "$SECONDS" -lt "$deadline" ] || {
    log "last state: container=$status health=$health restarts=$restarts"
    logs "pm2 " "${state:-}"
    logs "" "$(probe_http || true)"
    fail "not healthy after ${TIMEOUT}s"
  }
  sleep 10
done

log "soak: watching pm2 restart counters for ${SOAK_SECONDS}s"
sleep "$SOAK_SECONDS"
after=$(pm2_state || true)
pm2_all_online "$after" || { logs "pm2 " "$after"; fail "a pm2 process is no longer online"; }
[ "$after" = "$state" ] || {
  logs "before: " "$state"; logs "after:  " "$after"
  fail "a pm2 process restarted during the soak"
}
probe_http > /dev/null || fail "HTTP checks failed after soak"
log "ok: stable for ${SOAK_SECONDS}s"

if [ -n "$PUBLIC_URL" ]; then
  for attempt in 1 2 3 4 5 6; do
    api=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$PUBLIC_URL/api/auth/can-register" || echo 000)
    web=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$PUBLIC_URL/" || echo 000)
    if [ "$api" = 200 ] && [ "$web" -ge 200 ] && [ "$web" -lt 400 ]; then
      log "ok: $PUBLIC_URL api=$api web=$web"
      break
    fi
    log "public URL not ready (api=$api web=$web), attempt $attempt/6"
    [ "$attempt" -lt 6 ] || fail "$PUBLIC_URL is not serving the app"
    sleep 10
  done
fi

log "HEALTHY"
