#!/bin/bash
# start_server.sh
# ApplicationStart hook – sets permissions on web root and starts/reloads Nginx.

set -euo pipefail

echo "[start_server] Starting..."

# ── Set correct ownership and permissions ─────────────────────────
echo "[start_server] Setting ownership and permissions on /var/www/html/..."
chown -R nginx:nginx /var/www/html/
chmod -R 755 /var/www/html/

# ── Start or reload Nginx ─────────────────────────────────────────
if systemctl is-active --quiet nginx; then
    echo "[start_server] Nginx is running. Reloading configuration..."
    systemctl reload nginx
    echo "[start_server] Nginx reloaded."
else
    echo "[start_server] Starting Nginx..."
    systemctl start nginx
    echo "[start_server] Nginx started."
fi

echo "[start_server] Done."
