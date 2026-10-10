#!/usr/bin/env bash
# Create a clean copy of this project with a single fresh commit, ready to
# push to a new public repository. Your existing history is not touched, so
# nothing in it can leak.
#
# Usage: scripts/export-public.sh <empty-target-directory>
#
# What it does:
#   1. Copies only the files git tracks (ignored files such as your API keys,
#      uploads, and personal style guides never come along).
#   2. Runs scripts/check-public-clean.sh on the copy and stops if it fails.
#   3. Starts a new git repository on the main branch with one commit.
#
# It never pushes. After you review the result, add a remote and push yourself.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <empty-target-directory>" >&2
  exit 2
fi

src="$(git rev-parse --show-toplevel)"
mkdir -p "$1"
dest="$(cd "$1" && pwd)"

if [ -n "$(ls -A "$dest")" ]; then
  echo "Target directory is not empty: $dest" >&2
  exit 2
fi

if [ -n "$(git -C "$src" status --porcelain --untracked-files=no)" ]; then
  echo "You have uncommitted changes to tracked files. Commit them first so the export matches." >&2
  exit 2
fi

(cd "$src" && git ls-files -z | xargs -0 -I{} cp --parents {} "$dest")

if ! bash "$src/scripts/check-public-clean.sh" "$dest"; then
  echo "Export stopped: fix the failures above, commit, and run again." >&2
  find "$dest" -mindepth 1 -delete
  exit 1
fi

cd "$dest"
git init -q -b main
git add -A
git commit -q -m "Initial public release"
echo
echo "Clean repository created at: $dest"
echo "The commit author comes from your git config. Check it, and fix it if needed:"
echo "  git log -1 --format='%an <%ae>'"
echo "  git commit --amend --reset-author --no-edit"
echo
echo "Then add your remote and push:"
echo "  git remote add origin https://github.com/<owner>/<new-repo>.git"
echo "  git push -u origin main"
