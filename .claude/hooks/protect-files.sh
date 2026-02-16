#!/bin/bash
# PreToolUse hook for Edit and Write tools.
# Blocks Claude from modifying files that should never be touched.
#
# How it works:
#   - Claude Code pipes JSON with the target file path
#   - We check it against a list of protected patterns
#   - Exit 0 = allow, Exit 2 = block

INPUT=$(cat)

# Extract the file path from the tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# If no file path, allow (shouldn't happen but be safe)
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Protected file patterns
PROTECTED=(
  '\.env$'
  '\.env\.'
  'credentials'
  '\.ctx/'
  'package-lock\.json$'
  '\.git/'
)

for pattern in "${PROTECTED[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    echo "BLOCKED: $FILE_PATH is a protected file." >&2
    exit 2
  fi
done

exit 0
