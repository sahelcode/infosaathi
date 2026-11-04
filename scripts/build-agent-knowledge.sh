#!/bin/sh
# Rebuild the WhatsApp agent knowledge files (txt + docx) from src/content.
cd "$(dirname "$0")/.." || exit 1
node scripts/build-agent-knowledge.mjs && python3 scripts/agent-knowledge-docx.py
