#!/bin/bash

# Process images in inbox/ folder into organized listing folders
# Usage: ./scripts/process-inbox.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INBOX_DIR="$PROJECT_ROOT/inbox"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}FB Marketplace Inbox Processor${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if inbox directory exists
if [ ! -d "$INBOX_DIR" ]; then
    echo -e "${YELLOW}Error: inbox directory not found at $INBOX_DIR${NC}"
    exit 1
fi

# Count images in inbox
image_count=$(find "$INBOX_DIR" -maxdepth 1 -type f \( -iname "*.jpeg" -o -iname "*.jpg" -o -iname "*.png" -o -iname "*.heic" -o -iname "*.webp" \) 2>/dev/null | wc -l | tr -d ' ')

if [ "$image_count" -eq 0 ]; then
    echo -e "${YELLOW}No images found in inbox/${NC}"
    echo -e "Add product photos to the inbox folder and run again."
    exit 0
fi

echo -e "Found ${GREEN}$image_count${NC} images in inbox/"
echo ""
echo -e "${BLUE}Launching Claude Code to process images...${NC}"
echo ""

# Launch Claude Code to process the inbox
cd "$PROJECT_ROOT"
claude -p "/process-inbox" --dangerously-skip-permissions

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Inbox processing complete${NC}"
echo -e "${GREEN}========================================${NC}"
