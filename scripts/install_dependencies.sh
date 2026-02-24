#!/bin/bash
# install_dependencies.sh
# BeforeInstall hook – installs and enables Nginx on Amazon Linux 2023.
# Idempotent: safe to run multiple times.

set -euo pipefail

echo "[install_dependencies] Starting..."

# ── Install Nginx if not already installed ────────────────────────
if ! command -v nginx &>/dev/null; then
    echo "[install_dependencies] Nginx not found. Installing..."
    dnf install -y nginx
    echo "[install_dependencies] Nginx installed."
else
    echo "[install_dependencies] Nginx is already installed. Skipping install."
fi

# ── Enable Nginx to start on boot ────────────────────────────────
systemctl enable nginx
echo "[install_dependencies] Nginx enabled on boot."

# ── Start Nginx if it is not already running ─────────────────────
if ! systemctl is-active --quiet nginx; then
    systemctl start nginx
    echo "[install_dependencies] Nginx started."
else
    echo "[install_dependencies] Nginx is already running."
fi

echo "[install_dependencies] Done."
