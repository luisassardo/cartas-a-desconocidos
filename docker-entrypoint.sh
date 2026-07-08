#!/bin/sh
set -e

# Los volúmenes de Railway se montan como root. Aseguramos que los
# directorios de datos persistentes sean escribibles por el usuario de la
# app antes de arrancar, y luego dejamos privilegios de root.
DATA_DIR="${DATA_DIR:-/app/data}"
UPLOADS_DIR="${UPLOADS_DIR:-/app/uploads}"

mkdir -p "$DATA_DIR" "$UPLOADS_DIR"
chown -R cartas:cartas "$DATA_DIR" "$UPLOADS_DIR" 2>/dev/null || true

exec su-exec cartas:cartas "$@"
