#!/bin/bash
# PreToolUse hook for Bash commands.
# Blocks commands that would print secrets to the terminal.
#
# How it works:
#   - Claude Code pipes JSON to stdin with the command about to run
#   - We extract the command string with jq
#   - We check it against patterns that would expose secrets
#   - Exit 0 = allow, Exit 2 = block

# Read the JSON input from Claude Code
INPUT=$(cat)

# Extract the bash command Claude wants to run
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# If no command found, allow (not a Bash tool call we care about)
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Patterns that would expose secret values.
# Matches: echo $TOKEN, cat .env, printenv, etc.
DANGEROUS_PATTERNS=(
  'echo.*\$.*TOKEN'
  'echo.*\$.*KEY'
  'echo.*\$.*SECRET'
  'echo.*\$.*PASSWORD'
  'cat.*\.env'
  'cat.*credentials'
  'cat.*\.ctx/'
  'printenv'
  'env\b'
  'set\b.*\|'
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -iqE "$pattern"; then
    echo "BLOCKED: Command would expose secrets. Pattern matched: $pattern" >&2
    exit 2
  fi
done

# No dangerous patterns found — allow the command
exit 0
