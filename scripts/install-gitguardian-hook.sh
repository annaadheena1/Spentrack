#!/usr/bin/env bash

set -euo pipefail

HOOK_PATH=".git/hooks/pre-commit"

cat > "$HOOK_PATH" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if ! command -v ggshield >/dev/null 2>&1; then
  echo "ggshield is not installed. Install it before committing." >&2
  exit 1
fi

if [[ -z "${GITGUARDIAN_API_KEY:-}" ]]; then
  echo "GITGUARDIAN_API_KEY is not set. Export it before committing." >&2
  exit 1
fi

ggshield secret scan pre-commit
EOF

chmod +x "$HOOK_PATH"

echo "GitGuardian pre-commit hook installed at $HOOK_PATH"