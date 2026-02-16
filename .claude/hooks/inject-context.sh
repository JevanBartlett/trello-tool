#!/bin/bash
# Re-inject critical project state after context compaction.
# Claude loses memory when context is compressed — this puts it back.

echo "=== CONTEXT RE-INJECTED AFTER COMPACTION ==="
echo ""
echo "Read these files to restore session state:"
echo ""
cat HANDOFF.md
