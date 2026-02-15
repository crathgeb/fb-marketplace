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
├── app/                    # Web application (React + Express)
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Sidebar.tsx     # Listing navigation panel
│   │   │   ├── MediaViewer.tsx # Image/video preview with thumbnails
│   │   │   ├── Editor.tsx      # Title/description/price editor
│   │   │   └── ui/             # shadcn/ui components (button, textarea, etc.)
│   │   ├── lib/
│   │   │   └── api.ts      # API client functions
│   │   ├── hooks/
│   │   │   └── useDebounce.ts  # Debounce hook for auto-save
│   │   ├── App.tsx         # Main app component
│   │   └── types.ts        # TypeScript interfaces
│   └── server/
│       └── index.ts        # Express API server
├── listings/               # Product listing folders (gitignored)
├── inbox/                  # Drop images here for processing
├── scripts/                # Shell scripts for automation
├── templates/              # Export templates
└── .claude/                # Claude Code skills and commands
```

### Listing Folder Structure

Each product gets its own folder under `listings/`. The folder name becomes the listing identifier in the app.

```
listings/
└── Dewalt Reciprocating Saw/
    ├── IMG_001.jpeg        # Product photos (required)
    ├── IMG_002.jpeg        # Multiple images supported
    ├── title.md            # Listing title (max 100 chars)
    ├── description.md      # Full product description
    ├── price.md            # Price with rationale
    └── approved.md         # Present = ready for export
```

| File | Purpose | Required |
|------|---------|----------|
| `*.jpeg/png/gif/webp` | Product images | Yes (at least one) |
| `*.mp4/mov/webm` | Product videos | No |
| `title.md` | Short, searchable title | Yes |
| `description.md` | Detailed description with specs | Yes |
| `price.md` | Price and pricing notes | Yes |
| `approved.md` | Approval marker (content ignored) | No |
| `listing.md` | Optional seller notes for AI | No |

The `approved.md` file acts as a flag. Its presence marks the listing as approved; the actual content is ignored. The app creates/deletes this file when you toggle approval.

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
