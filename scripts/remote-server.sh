#!/usr/bin/env bash
# Start a headless Claude Code remote-control server session.
# Supports multiple concurrent remote connections.
# Press spacebar to display a QR code for mobile connections.

set -euo pipefail

NAME="${1:-AI-PM Server}"
SPAWN="${2:-same-dir}"   # "same-dir" or "worktree"
CAPACITY="${3:-8}"

echo "Starting remote-control server: $NAME"
echo "Spawn mode:  $SPAWN"
echo "Capacity:    $CAPACITY concurrent sessions"
echo "Connect at:  https://claude.ai/code"
echo ""

claude remote-control \
  --name "$NAME" \
  --spawn "$SPAWN" \
  --capacity "$CAPACITY"
