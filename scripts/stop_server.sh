#!/bin/bash
# stop_server.sh
# ApplicationStop hook – gracefully stops Nginx.
# Does NOT fail if Nginx is not running.

set -euo pipefail

echo "[stop_server] Starting..."

if systemctl is-active --quiet nginx; then
    echo "[stop_server] Stopping Nginx..."
    systemctl stop nginx
    echo "[stop_server] Nginx stopped."
else
    echo "[stop_server] Nginx is not running. Nothing to stop."
fi

echo "[stop_server] Done."
