#!/usr/bin/env bash
# Tayra Social: dump the Postiz PostgreSQL database before a deploy.
#
#   backup.sh [label]      prints the path of the verified dump on success
#
# Read-only for the database (pg_dump). Never prints credentials: pg_dump runs
# inside the database container over its local socket, so no password is used.
# Keeps the newest $KEEP dumps; the dump it just wrote is never deleted.
set -Eeuo pipefail
umask 077

DB_CONTAINER="${DB_CONTAINER:-postiz-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/opt/postiz-backups/db}"
KEEP="${KEEP:-7}"
MIN_FREE_MB="${MIN_FREE_MB:-2048}"

log() { echo "[backup] $*" >&2; }
die() { log "ERROR: $*"; exit 1; }

label="${1:-manual}"
label="${label//[^A-Za-z0-9._-]/_}"   # only safe filename characters
label="${label:0:80}"

[ "$(docker inspect -f '{{.State.Running}}' "$DB_CONTAINER" 2>/dev/null)" = true ] \
  || die "database container '$DB_CONTAINER' is not running"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

free_mb=$(df -Pm "$BACKUP_DIR" | awk 'NR==2 {print $4}')
[ "$free_mb" -ge "$MIN_FREE_MB" ] || die "only ${free_mb} MB free in $BACKUP_DIR (need ${MIN_FREE_MB} MB)"

# Names come from the container's own environment; neither is a secret.
db_user=$(docker exec "$DB_CONTAINER" printenv POSTGRES_USER)
db_name=$(docker exec "$DB_CONTAINER" printenv POSTGRES_DB)
[ -n "$db_user" ] && [ -n "$db_name" ] || die "POSTGRES_USER/POSTGRES_DB not set in $DB_CONTAINER"

file="$BACKUP_DIR/postiz-$(date -u +%Y%m%dT%H%M%SZ)-${label}.dump"
tmp="$file.partial"
trap 'rm -f -- "$tmp"' EXIT

log "dumping database '$db_name' to $file"
docker exec "$DB_CONTAINER" pg_dump -U "$db_user" -d "$db_name" --format=custom > "$tmp" \
  || die "pg_dump failed"
[ -s "$tmp" ] || die "dump is empty"
# A custom-format dump that pg_restore can list is complete and readable.
docker exec -i "$DB_CONTAINER" pg_restore --list < "$tmp" > /dev/null \
  || die "dump failed verification (pg_restore --list)"
mv -- "$tmp" "$file"
trap - EXIT
log "ok: $(du -h "$file" | cut -f1) verified"

# Retention: newest first, skip the first $KEEP, never touch the new dump.
# File names are generated above from safe characters, so `ls` output is safe to read.
# shellcheck disable=SC2012
ls -1t "$BACKUP_DIR"/postiz-*.dump 2>/dev/null | tail -n +"$((KEEP + 1))" \
  | while IFS= read -r old; do
      [ "$old" = "$file" ] && continue
      log "retention: removing $old"
      rm -f -- "$old"
    done

echo "$file"
