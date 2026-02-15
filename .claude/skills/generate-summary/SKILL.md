---
name: fb-marketplace:generate-summary
description: Use when creating FB Marketplace listing files from a folder of product images. Analyzes images for brand/model, researches the product, and generates title.md, description.md, and price.md files.
---

# Generate FB Marketplace Listing Summary

## Overview

Analyze product images in a listings folder, identify brand/model information, research the product online, and generate listing files for FB Marketplace.

## When to Use

- When you have a folder in `/listings/` with product images
- When you need to create title, description, and price files for a listing
- When you want to automate FB Marketplace listing creation

## Required Input

- **Folder path**: A folder in the `listings/` directory containing product images (JPEG, PNG, etc.)

## Workflow

```dot
digraph generate_summary {
    rankdir=TB;
    node [shape=box];

    start [label="Receive folder path" shape=ellipse];
    find_images [label="1. Find all images in folder"];
    analyze [label="2. Analyze each image\nIdentify product, brand, model"];
    extract [label="3. Extract brand identifiers\nand model numbers"];
    has_brand [label="Brand/model found?" shape=diamond];
    research [label="4. Invoke fb-marketplace:research-item\nwith identified product"];
    manual [label="Use image analysis for\ngeneric description"];
    check_listing [label="5. Check for existing listing.md\nfor additional context"];
    generate [label="6. Generate output files"];
    done [label="Files created" shape=ellipse];

    start -> find_images;
    find_images -> analyze;
    analyze -> extract;
    extract -> has_brand;
    has_brand -> research [label="yes"];
    has_brand -> manual [label="no"];
    research -> check_listing;
    manual -> check_listing;
    check_listing -> generate;
    generate -> done;
}
```

## Steps

### 1. Find All Images

Scan the provided folder for image files:

- `.jpeg`, `.jpg`, `.png`, `.heic`, `.webp`

### 2. Analyze Images

Use the Read tool to view each image. For each image, identify:

- **What is the product?** (category, type)
- **Condition**: New, like new, good, fair
- **Quantity**: Single item or multiple
- **Visible brand names or logos**
- **Model numbers, serial numbers, or product codes**
- **Size indicators** (if visible)

### 3. Extract Brand/Model Information

Look for:

- Brand name on product or packaging
- Model number (often on stickers, tags, or embossed)
- UPC/barcode numbers
- Any text that identifies the specific product

**Common locations:**

- Front label/logo
- Bottom or back of product
- Tags on clothing/shoes
- Stickers on electronics
- Embossed text on tools

### 4. Research Product

If brand/model is identified:

```
Invoke skill: fb-marketplace:research-item
Input: Brand name, model number, product category
```

If no brand/model found:

- Use generic product description from image analysis
- Estimate pricing based on similar items
- Note "Unbranded" or "Generic" in listing

### 5. Check Existing listing.md

If a `listing.md` file exists in the folder:

- Read it for additional context (sizes, quantities, notes)
- Incorporate this information into the output

### 6. Generate Output Files

Create three files in the listing folder:

#### title.md

```markdown
[Concise, searchable title - max 100 chars]
[Brand] [Product Type] [Key Feature/Size] - [Condition]
```

**Title formula:**

- Lead with brand (if known)
- Include product type
- Add distinguishing feature (size, color, model)
- Keep under 100 characters
- Use title case

**Examples:**

- `Galanz ExpressWave 1100W Microwave - Inverter Technology`
- `3 Pairs Rubber Boots - Men's Sizes 9, 10, 13`
- `SKLZ Quick Ladder Agility Training Set - 15ft`

#### description.md

```markdown
[Detailed description for FB Marketplace]

## Product Details

[From research or image analysis]

## Condition

[Describe actual condition based on images]

## Includes

[List what's included]

## Specifications

[Dimensions, capacity, etc. if known]

## Pickup

Local pickup only in Chapel Hill off of Larkin Lane.
```

**Description guidelines:**

- Start with a hook (what it is, why it's great)
- Include specifications from research
- Describe actual condition honestly
- List what's included
- Keep paragraphs short for mobile reading

#### price.md

```markdown
[Recommended price or price range]

## Pricing Rationale

- Retail: $XX
- Used market range: $XX - $XX
- Condition adjustment: [factor]
- Recommended: $XX
```

## Output File Locations

All files are created in the same folder as the images:

```
listings/
  [Item Folder]/
    IMG_xxxx.jpeg     # Original images
    listing.md        # Optional: existing notes
    title.md          # Generated
    description.md    # Generated
    price.md          # Generated
```

## Example Execution

For folder `listings/Galanz ExpressWAve Microwave/`:

1. Find images: `IMG_8417.jpeg`, `IMG_8418.jpeg`, `IMG_8420.jpeg`
2. Analyze: Galanz ExpressWave microwave, stainless steel, 1100W inverter
3. Extract: Brand=Galanz, Model=ExpressWave, 1100W
4. Research: Invoke `fb-marketplace:research-item` with "Galanz ExpressWave 1100W microwave"
5. Check: No existing listing.md
6. Generate:
   - `title.md`: "Galanz ExpressWave 1100W Microwave - Inverter Technology - Excellent Condition"
   - `description.md`: Full description with specs from research
   - `price.md`: "$45-55" based on research showing $80-100 retail

## Common Mistakes

| Mistake                  | Fix                                              |
| ------------------------ | ------------------------------------------------ |
| Missing brand in images  | Look at all angles, check bottom/back of product |
| Overly long titles       | Keep under 100 chars, focus on searchable terms  |
| Generic descriptions     | Use research to add specific features and specs  |
| Pricing without research | Always invoke research-item for accurate pricing |
| Ignoring listing.md      | Check for existing notes that add context        |
