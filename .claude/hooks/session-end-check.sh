#!/bin/bash
# Stop hook: check if code was changed but session docs weren't updated.
# Only outputs a reminder — zero tokens if nothing needs attention.
#
# Logic:
#   - git diff shows modified files in the working tree
#   - If src/ files changed but HANDOFF.md didn't, remind Claude
#   - If nothing changed, stay silent (exit 0, no output)

# Check if any source files were modified (staged or unstaged)
CODE_CHANGED=$(git diff --name-only HEAD 2>/dev/null | grep -c '^src/')

# Check if HANDOFF.md was modified
HANDOFF_CHANGED=$(git diff --name-only HEAD 2>/dev/null | grep -c 'HANDOFF\.md')

# If code changed but HANDOFF.md didn't, remind
if [ "$CODE_CHANGED" -gt 0 ] && [ "$HANDOFF_CHANGED" -eq 0 ]; then
  echo "Reminder: source files were modified this session but HANDOFF.md has not been updated. Update HANDOFF.md with current state before ending the session."
fi

exit 0
