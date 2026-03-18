#!/usr/bin/env bash
# Start an interactive Claude Code remote-control session.
# The terminal stays active locally while also being accessible remotely.

set -euo pipefail

NAME="${1:-AI-PM}"

echo "Starting interactive remote-control session: $NAME"
echo "Connect at: https://claude.ai/code"
echo ""

claude --remote-control "$NAME"
