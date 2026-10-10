#!/usr/bin/env bash
# Scan a tree for things that should never be published.
#
# Usage: scripts/check-public-clean.sh [directory]
#   With no argument, scans the files git tracks in the current repository.
#
# Built-in checks: API key shapes, private keys, secrets and env files, and
# personal style guides. For anything specific to you (a former employer, a
# client name, an email address), list one pattern per line in a file named
# .publish-denylist at the repository root. That file is gitignored, so the
# words you list never end up in the published tree.
set -u

repo_root="$(git rev-parse --show-toplevel)"
target="${1:-}"
fail=0

if [ -n "$target" ]; then
  root="$(cd "$target" && pwd)"
  list_files() { (cd "$root" && find . -type f -not -path './.git/*' -not -path './node_modules/*' -not -path './.next/*' | sed 's|^\./||'); }
else
  root="$repo_root"
  list_files() { (cd "$root" && git ls-files); }
fi

denylist="$repo_root/.publish-denylist"

report() { echo "FAIL: $1"; fail=1; }

# 1. Files that must never ship
while IFS= read -r f; do
  case "$f" in
    .claude-secrets.json|.env|.env.*|*.pem) report "secret or env file is present: $f" ;;
    style-guides/custom/*) [ "$f" = "style-guides/custom/.gitkeep" ] || report "personal style guide is present: $f" ;;
    uploads/*) [ "$f" = "uploads/.gitkeep" ] || report "uploaded file is present: $f" ;;
  esac
done < <(list_files)

# 2. Secret shapes in file contents
secret_re='(sk-ant-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}|xox[baprs]-[A-Za-z0-9-]{10,})'
while IFS= read -r f; do
  [ "$f" = "package-lock.json" ] && continue
  if grep -I -n -E -q "$secret_re" "$root/$f" 2>/dev/null; then
    report "possible secret in $f"
  fi
done < <(list_files)

# 3. Your own deny patterns
if [ -f "$denylist" ]; then
  while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue
    case "$pattern" in \#*) continue ;; esac
    while IFS= read -r f; do
      [ "$f" = "package-lock.json" ] && continue
      if grep -I -n -i -E -q -- "$pattern" "$root/$f" 2>/dev/null; then
        report "denied pattern '$pattern' found in $f"
      fi
    done < <(list_files)
  done < "$denylist"
else
  echo "NOTE: no .publish-denylist found, so only the built-in checks ran."
fi

if [ "$fail" -eq 0 ]; then
  echo "OK: nothing that should stay private was found."
fi
exit "$fail"
