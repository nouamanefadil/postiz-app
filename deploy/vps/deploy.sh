#!/usr/bin/env bash
# Tayra Social: deploy one immutable image to the Postiz service, with backup,
# health verification and automatic rollback of the application image.
#
#   deploy.sh sha-<40 hex commit>
#
# Exit codes: 0 deployed and healthy (or already deployed and healthy)
#             1 deploy failed, nothing changed or rolled back to the previous image
#             2 deploy failed AND rollback failed: production needs a human
#            64 invalid argument
#
# Installed root-owned in /opt/tayra-deploy/ and run by the `tayra-deploy` SSH key
# through a forced command + sudo (see deploy/README.md). It only ever recreates
# the single `postiz` service (`up -d --no-deps`); it never touches the database,
# Redis, Temporal, Elasticsearch, volumes, networks or other projects, and never
# restores the database automatically.
#
# Everything written to stdout ends up in the (public) GitHub Actions log, so
# it prints status lines only. Container logs go to a root-only file.
set -Eeuo pipefail
umask 077

POSTIZ_DIR="${POSTIZ_DIR:-/opt/postiz}"
SERVICE="${SERVICE:-postiz}"
APP_CONTAINER="${APP_CONTAINER:-postiz}"
IMAGE_REPO="${IMAGE_REPO:-ghcr.io/nouamanefadil/tayra-social}"
IMAGE_FILE="${IMAGE_FILE:-docker-compose.image.yml}"
LOG_DIR="${LOG_DIR:-/var/log/tayra-deploy}"
STATE_DIR="${STATE_DIR:-/var/lib/tayra-deploy}"
LOCK_FILE="${LOCK_FILE:-/run/lock/tayra-deploy.lock}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-600}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TAG="${1:-}"
if ! [[ "$TAG" =~ ^sha-[0-9a-f]{40}$ ]]; then
  echo "usage: deploy.sh sha-<40 lowercase hex commit sha>" >&2
  exit 64
fi
NEW_IMAGE="$IMAGE_REPO:$TAG"
SCHEMA_LABEL="com.maisontayra.prisma-schema-sha256"

mkdir -p "$LOG_DIR" "$STATE_DIR"
chmod 700 "$LOG_DIR" "$STATE_DIR"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-${TAG:4:12}"
LOG="$LOG_DIR/deploy-$RUN_ID.log"

log() { echo "[deploy] $*"; }
die() { log "ERROR: $*"; exit 1; }
compose() { docker compose --project-directory "$POSTIZ_DIR" "$@"; }

write_image_file() {
  local tmp
  tmp="$(mktemp "$POSTIZ_DIR/.$IMAGE_FILE.XXXXXX")"
  printf '%s\n' \
    "# Managed by /opt/tayra-deploy/deploy.sh. Do not edit by hand (see deploy/README.md)." \
    "# Written $(date -u +%Y-%m-%dT%H:%M:%SZ) by deploy run $RUN_ID" \
    "services:" \
    "  $SERVICE:" \
    "    image: $1" > "$tmp"
  chmod 644 "$tmp"
  mv -f "$tmp" "$POSTIZ_DIR/$IMAGE_FILE"
}

# Image Compose would run for $SERVICE. `config --images <service>` lists every
# service, so read the merged config instead. It contains interpolated secrets:
# parsed in memory, only the image name is printed.
compose_image() {
  compose config --format json \
    | python3 -c 'import json, sys; print(json.load(sys.stdin)["services"][sys.argv[1]]["image"])' "$SERVICE"
}

image_label() { docker image inspect -f "{{index .Config.Labels \"$2\"}}" "$1" 2>/dev/null || true; }

SWITCHED=0
ROLLING_BACK=0
ROLLBACK_REF=""
BACKUP_FILE=""

rollback() {
  ROLLING_BACK=1
  trap - ERR
  set +e
  log "ROLLING BACK application image to $ROLLBACK_REF"
  docker logs --tail 300 "$APP_CONTAINER" > "$LOG_DIR/deploy-$RUN_ID-failed-container.log" 2>&1
  log "failed container's last 300 log lines saved on the server: $LOG_DIR/deploy-$RUN_ID-failed-container.log"
  if write_image_file "$ROLLBACK_REF" \
    && compose up -d --no-deps --pull never "$SERVICE" \
    && "$HERE/health-check.sh" "$HEALTH_TIMEOUT"; then
    echo "$RUN_ID $TAG rolled-back-to=$ROLLBACK_REF" >> "$STATE_DIR/history"
    log "rollback OK: production is healthy on the previous image. Database was NOT restored."
    log "pre-deploy backup: ${BACKUP_FILE:-none}"
    exit 1
  fi
  echo "$RUN_ID $TAG ROLLBACK-FAILED" >> "$STATE_DIR/history"
  log "ROLLBACK FAILED: production needs manual intervention (deploy/README.md, 'Rollback failed')."
  log "previous image: $ROLLBACK_REF"
  log "pre-deploy backup: ${BACKUP_FILE:-none}"
  exit 2
}

# Invoked via `trap on_error ERR`. ShellCheck reports trap-only functions as
# SC2317 (<= 0.10, e.g. Ubuntu 24.04 runners) or SC2329 (>= 0.11).
# shellcheck disable=SC2317,SC2329
on_error() {
  local rc=$?
  [ "$ROLLING_BACK" = 1 ] && exit 2
  if [ "$SWITCHED" = 1 ]; then
    log "unexpected error (exit $rc) after switching images"
    rollback
  fi
  log "unexpected error (exit $rc) before switching images; production unchanged"
  exit 1
}

main() {
  trap on_error ERR
  log "run $RUN_ID: deploying $NEW_IMAGE"
  cd "$POSTIZ_DIR"

  # --- Preflight: nothing is changed until all of this passes. ---------------
  [ -f "$IMAGE_FILE" ] || die "$POSTIZ_DIR/$IMAGE_FILE missing: one-time VPS setup not done (deploy/README.md)"
  local file_image effective running
  file_image="$(awk '$1 == "image:" {print $2}' "$IMAGE_FILE")"
  effective="$(compose_image)"
  [ "$effective" = "$file_image" ] \
    || die "compose does not use $IMAGE_FILE (effective image '$effective'); COMPOSE_FILE in $POSTIZ_DIR/.env must list it"
  running="$(docker inspect -f '{{.Config.Image}}' "$APP_CONTAINER")" || die "container $APP_CONTAINER not found"
  [ "$running" = "$effective" ] \
    || die "running container uses '$running' but compose says '$effective'; resolve the drift by hand first"

  if [ "$running" = "$NEW_IMAGE" ]; then
    log "$NEW_IMAGE is already deployed; verifying health only"
    "$HERE/health-check.sh" "$HEALTH_TIMEOUT" || die "already deployed but unhealthy; not touching it"
    exit 0
  fi

  # Pin the rollback target by digest, so a later push to a mutable tag such as
  # the official :latest cannot change what a rollback restores.
  local running_id repo digest
  running_id="$(docker inspect -f '{{.Image}}' "$APP_CONTAINER")"
  repo="${running%@*}"
  [[ "${repo##*/}" == *:* ]] && repo="${repo%:*}"
  digest="$(docker image inspect -f '{{range .RepoDigests}}{{println .}}{{end}}' "$running_id" | grep -m1 "^$repo@sha256:" || true)"
  ROLLBACK_REF="${digest:-$running}"
  [ -n "$digest" ] || log "WARNING: no registry digest for the running image; rollback will use '$running'"
  docker image inspect "$ROLLBACK_REF" > /dev/null || die "rollback image $ROLLBACK_REF is not available locally"
  log "current image: $running"
  log "rollback image: $ROLLBACK_REF (present locally)"

  # sha- tags are never rebuilt, so a copy already on the server is the same image.
  if ! docker image inspect "$NEW_IMAGE" > /dev/null 2>&1; then
    log "pulling $NEW_IMAGE"
    docker pull --quiet "$NEW_IMAGE" > /dev/null || die "cannot pull $NEW_IMAGE (is the GHCR package public?)"
  fi
  local revision
  revision="$(image_label "$NEW_IMAGE" org.opencontainers.image.revision)"
  [ "$revision" = "${TAG#sha-}" ] || die "image revision label '$revision' does not match tag $TAG"
  log "image verified: revision $revision, version $(image_label "$NEW_IMAGE" org.opencontainers.image.version)"

  local old_schema new_schema
  old_schema="$(image_label "$running_id" "$SCHEMA_LABEL")"
  new_schema="$(image_label "$NEW_IMAGE" "$SCHEMA_LABEL")"
  if [ "$old_schema" != "$new_schema" ]; then
    log "NOTE: Prisma schema differs from the running image (${old_schema:-unknown} -> ${new_schema:-unknown})."
    log "NOTE: the new image runs 'prisma db push' on start. An image rollback does not undo schema changes."
  fi

  BACKUP_FILE="$("$HERE/backup.sh" "before-$TAG")" || die "database backup failed; deploy aborted, production unchanged"
  log "database backup: $BACKUP_FILE"

  # --- Switch: from here on any failure rolls back. -------------------------
  SWITCHED=1
  write_image_file "$NEW_IMAGE"
  compose config --quiet
  log "recreating only the '$SERVICE' service"
  compose up -d --no-deps --pull never "$SERVICE"

  if ! "$HERE/health-check.sh" "$HEALTH_TIMEOUT"; then
    log "health verification FAILED for $NEW_IMAGE"
    rollback
  fi

  echo "$RUN_ID $TAG ok previous=$ROLLBACK_REF backup=$BACKUP_FILE" >> "$STATE_DIR/history"
  log "SUCCESS: $NEW_IMAGE is live and healthy"
}

# One deploy at a time on this server (GitHub concurrency is the first guard).
if command -v flock > /dev/null; then
  exec 9> "$LOCK_FILE"
  flock -n 9 || { echo "[deploy] another deploy is running" >&2; exit 1; }
fi

main 2>&1 | tee -a "$LOG"
exit "${PIPESTATUS[0]}"
