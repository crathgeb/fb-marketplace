# FB Marketplace Listings Manager

A web application for managing Facebook Marketplace listings at scale. Edit product details, preview media, approve listings, and export to Facebook's bulk upload format.

## Features

- **Three-panel interface**: Browse listings in sidebar, preview images/videos, edit details
- **Auto-save**: Changes save automatically with debounced updates
- **Approval workflow**: Mark listings as approved before bulk export
- **Media support**: Images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, WebM)
- **AI-powered listing generation**: Claude skills for researching products and writing descriptions
- **Bulk export**: Export approved listings to Facebook Marketplace template format

## Quick Start

```bash
# Install dependencies
cd app && npm install

# Start development servers (client + API)
npm run dev
```

The app runs at http://localhost:5173 with the API at http://localhost:3001.

## Project Structure

```
fb-marketplace/
├── app/                    # React + Express web application
├── listings/               # Product listing folders
│   └── [Product Name]/
│       ├── *.jpeg          # Product images
│       ├── title.md        # Listing title
│       ├── description.md  # Listing description
│       ├── price.md        # Listing price
│       └── approved.md     # Approval status
├── inbox/                  # Drop images for processing
├── scripts/                # Automation scripts
└── .claude/                # AI skills and commands
```

## Workflow

### 1. Add Product Images

Drop product photos into a folder under `listings/`:

```
listings/
  My Product/
    IMG_001.jpeg
    IMG_002.jpeg
```

### 2. Generate Listing Content

Use Claude to analyze images and generate listing files:

```bash
./scripts/generate-all-listings.sh
```

Or generate a single listing:

```bash
claude "/generate-listing @listings/My Product"
```

### 3. Edit in Web App

Start the app and refine titles, descriptions, and prices:

```bash
cd app && npm run dev
```

### 4. Approve Listings

Click "Approve" in the editor for listings ready to publish.

### 5. Export to Facebook

Export approved listings to bulk upload format:

```bash
./scripts/export-template.sh
```

## Scripts

| Script | Purpose |
|--------|---------|
| `generate-all-listings.sh` | Generate listings for all folders missing description.md |
| `export-template.sh` | Export approved listings to FB bulk upload template |
| `process-inbox.sh` | Organize inbox images into listing folders |

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express 5, Node.js
- **AI Integration**: Claude Code skills for product research and listing generation

## Development

```bash
cd app

# Run client only
npm run dev:client

# Run server only
npm run dev:server

# Build for production
npm run build

# Lint code
npm run lint
```

## License

MIT License - see [LICENSE](LICENSE) for details.
