#!/bin/bash

# Export listings to FB Marketplace Bulk Upload Template
# Usage: ./scripts/export-template.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LISTINGS_DIR="$PROJECT_ROOT/listings"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}FB Marketplace Template Exporter${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if listings directory exists
if [ ! -d "$LISTINGS_DIR" ]; then
    echo -e "${YELLOW}Error: listings directory not found at $LISTINGS_DIR${NC}"
    exit 1
fi

# Count folders with complete listings (have all 3 required files)
complete_count=0
incomplete_count=0

for folder in "$LISTINGS_DIR"/*/; do
    [ -d "$folder" ] || continue
    [[ "$(basename "$folder")" == .* ]] && continue

    if [ -f "$folder/title.md" ] && [ -f "$folder/description.md" ] && [ -f "$folder/price.md" ]; then
        ((complete_count++))
    else
        ((incomplete_count++))
    fi
done

if [ "$complete_count" -eq 0 ]; then
    echo -e "${YELLOW}No complete listings found in listings/${NC}"
    echo -e "Each listing folder needs: title.md, description.md, price.md"
    exit 0
fi

echo -e "Found ${GREEN}$complete_count${NC} complete listings ready for export"
if [ "$incomplete_count" -gt 0 ]; then
    echo -e "Found ${YELLOW}$incomplete_count${NC} incomplete listings (will be skipped)"
fi
echo ""
echo -e "${BLUE}Launching Claude Code to export template...${NC}"
echo ""

# Launch Claude Code to export the template
cd "$PROJECT_ROOT"
claude -p "/export-template" --dangerously-skip-permissions

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Export complete${NC}"
echo -e "${GREEN}========================================${NC}"
