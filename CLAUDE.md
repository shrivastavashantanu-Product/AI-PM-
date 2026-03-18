# AI-PM Remote Control Project

This project is configured for use with **Claude Code remote control**, enabling you to connect to and control Claude Code sessions from any device (phone, tablet, browser) while the session runs locally on your machine.

## Project Overview

A scaffold for running and managing Claude Code remote-control sessions, including helper scripts, configuration, and documentation.

## Getting Started

### Prerequisites
- Claude Code v2.1.51 or later (`claude --version`)
- Logged in via claude.ai account (`/login`) — API key auth does NOT work
- Pro, Max, Team, or Enterprise subscription

### Starting a Remote Session

```bash
# Interactive session (terminal + remote access simultaneously)
npm run remote

# Server mode (headless, supports multiple concurrent sessions)
npm run remote:server

# Server mode with worktree isolation per session
npm run remote:server:worktree

# Custom session name
npm run remote -- --name "My Feature Work"
```

### Connecting From Another Device
1. **Browser**: Open the session URL printed in the terminal at `claude.ai/code`
2. **Mobile**: Press spacebar in server mode to show QR code, then scan with the Claude app (iOS/Android)
3. **Session list**: Open `claude.ai/code` → find your session by name (green dot = online)

## Scripts

| Script | Description |
|--------|-------------|
| `scripts/remote.sh` | Start an interactive remote-control session |
| `scripts/remote-server.sh` | Start a server-mode session (headless, multi-user) |

## Configuration

Claude Code settings live in `.claude/settings.json`. Edit permissions, MCP servers, and other options there.

## Notes

- The terminal process must stay running; closing it ends the session
- Network outages > ~10 minutes will require a session restart
- Remote sessions inherit this project's `.claude/settings.json`, CLAUDE.md, and any MCP servers
- Extended thinking is not supported in remote control sessions
