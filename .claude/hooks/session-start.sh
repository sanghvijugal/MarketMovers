#!/bin/bash
# Reinstalls the motion and 3D skill packs into ~/.claude/skills in Claude Code cloud sessions.
# The container is reset between sessions, so user-level skills do not persist on their own.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

export DISABLE_TELEMETRY=1 DO_NOT_TRACK=1

# repo, and one skill from it that marks the pack as already installed
PACKS=(
  "remotion-dev/skills remotion-create"
  "greensock/gsap-skills gsap-core"
  "CloudAI-X/threejs-skills threejs-fundamentals"
)

for entry in "${PACKS[@]}"; do
  read -r repo marker <<<"$entry"
  if [ -f "$HOME/.claude/skills/$marker/SKILL.md" ]; then
    echo "skills: $repo already installed"
    continue
  fi
  # a failed download should not block the session from starting
  if npx -y skills add "$repo" -g -a claude-code -s '*' -y --copy >/dev/null 2>&1; then
    echo "skills: installed $repo"
  else
    echo "skills: could not install $repo (network?), continuing" >&2
  fi
done
