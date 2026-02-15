#!/bin/bash

# Generate FB Marketplace listings for all folders that don't have them yet
# Usage: ./scripts/generate-all-listings.sh

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
echo -e "${BLUE}FB Marketplace Listing Generator${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if listings directory exists
if [ ! -d "$LISTINGS_DIR" ]; then
    echo -e "${YELLOW}Error: listings directory not found at $LISTINGS_DIR${NC}"
    exit 1
fi

# Count folders
total_folders=0
skipped_folders=0
processed_folders=0

# First pass: count totals
for folder in "$LISTINGS_DIR"/*/; do
    [ -d "$folder" ] || continue
    ((total_folders++))
done

echo -e "Found ${BLUE}$total_folders${NC} folders in listings/"
echo ""

# Second pass: process folders
for folder in "$LISTINGS_DIR"/*/; do
    # Skip if not a directory
    [ -d "$folder" ] || continue

    folder_name=$(basename "$folder")

    # Check if description.md already exists
    if [ -f "$folder/description.md" ]; then
        echo -e "${YELLOW}[SKIP]${NC} $folder_name - description.md already exists"
        ((skipped_folders++))
        continue
    fi

    # Check if folder has any images
    image_count=$(find "$folder" -maxdepth 1 -type f \( -iname "*.jpeg" -o -iname "*.jpg" -o -iname "*.png" -o -iname "*.heic" -o -iname "*.webp" \) 2>/dev/null | wc -l | tr -d ' ')

    if [ "$image_count" -eq 0 ]; then
        echo -e "${YELLOW}[SKIP]${NC} $folder_name - no images found"
        ((skipped_folders++))
        continue
    fi

    echo -e "${GREEN}[PROCESS]${NC} $folder_name ($image_count images)"

    # Launch Claude Code to generate the listing
    # Using -p for print mode (non-interactive) and --dangerously-skip-permissions to avoid prompts
    claude -p "/generate-listing @listings/$folder_name" --dangerously-skip-permissions

    ((processed_folders++))

    echo -e "${GREEN}[DONE]${NC} $folder_name"
    echo ""
done

echo -e "${BLUE}========================================${NC}"
echo -e "Summary:"
echo -e "  Total folders:     $total_folders"
echo -e "  Processed:         ${GREEN}$processed_folders${NC}"
echo -e "  Skipped:           ${YELLOW}$skipped_folders${NC}"
echo -e "${BLUE}========================================${NC}"
