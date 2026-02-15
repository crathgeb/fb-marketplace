# FB Marketplace Listings Manager

A full-stack application for managing, editing, and bulk-exporting Facebook Marketplace listings. The web app provides a three-panel interface for browsing listings, viewing product media, and editing listing details with auto-save.

## Bash Commands

```bash
# Development (runs client + server concurrently)
cd app && npm run dev

# Client only (Vite dev server on :5173)
cd app && npm run dev:client

# Server only (Express API on :3001)
cd app && npm run dev:server

# Build for production
cd app && npm run build

# Lint
cd app && npm run lint

# Generate listings for all folders missing description.md
./scripts/generate-all-listings.sh

# Export approved listings to FB bulk upload template
./scripts/export-template.sh

# Process images from inbox into listing folders
./scripts/process-inbox.sh
```

## Project Structure

```
fb-marketplace/
├── app/                    # Web application
│   ├── src/
│   │   ├── App.tsx         # Main app component (three-panel layout)
│   │   ├── types.ts        # TypeScript interfaces (Listing, ListingContent)
│   │   ├── components/
│   │   │   ├── Sidebar.tsx     # Listing navigation
│   │   │   ├── MediaViewer.tsx # Image/video preview
│   │   │   ├── Editor.tsx      # Title/description/price editor
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── api.ts      # API client functions
│   │   │   └── utils.ts    # Tailwind utilities (cn)
│   │   └── hooks/
│   │       └── useDebounce.ts  # Debounce hook for auto-save
│   └── server/
│       └── index.ts        # Express API server
├── listings/               # Product listing folders (gitignored)
│   └── [Product Name]/
│       ├── *.jpeg/png      # Product images
│       ├── title.md        # Listing title
│       ├── description.md  # Listing description
│       ├── price.md        # Listing price
│       └── approved.md     # Approval marker (presence = approved)
├── inbox/                  # Drop images here for processing
├── scripts/                # Automation scripts
└── .claude/
    ├── commands/           # Claude slash commands
    └── skills/             # Claude skills for listing generation
```

## Tech Stack

**Frontend:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 3, shadcn/ui (New York style), Radix UI, Lucide icons

**Backend:** Express 5, Node.js with ES modules

**Development:** tsx (TypeScript execution), concurrently, ESLint

## Code Style

- TypeScript with strict mode enabled
- Path aliases: `@/` maps to `src/`
- React functional components with hooks
- shadcn/ui components in `src/components/ui/`
- Custom components use Props interfaces (e.g., `EditorProps`)
- Debounced auto-save (1000ms delay) for editor changes
- API functions in `src/lib/api.ts`

## API Endpoints

All endpoints use `/api` prefix (proxied to :3001 in dev):

- `GET /api/listings` - List all listings with metadata
- `GET /api/listings/:name/file/:filename` - Read listing file content
- `PUT /api/listings/:name/file/:filename` - Save listing file content
- `POST /api/listings/:name/approve` - Mark listing as approved
- `DELETE /api/listings/:name/approve` - Remove approval
- `GET /api/listings/:name/media/:filename` - Serve media files

## Listing Data Structure

Each listing is a folder in `listings/` containing:

| File | Purpose |
|------|---------|
| `title.md` | Product title (max 100 chars) |
| `description.md` | Full product description with specs |
| `price.md` | Price and pricing rationale |
| `approved.md` | Present = approved for export |
| `*.jpeg/png/gif/webp` | Product images |
| `*.mp4/mov/webm` | Product videos |

## Claude Skills

Located in `.claude/skills/`:

- **generate-summary**: Analyzes product images, researches brand/model, generates title.md, description.md, price.md
- **research-item**: Looks up product pricing and specifications online
- **export-template**: Exports approved listings to FB Marketplace bulk upload format
- **process-inbox**: Organizes inbox images into listing folders

## Important Notes

- Listings directory is gitignored - contains user product data
- Server reads from `../../listings` relative to server/index.ts
- Vite proxies `/api` to Express server on :3001
- Auto-save uses 1000ms debounce to prevent excessive API calls
- Approval status stored as file presence, not content
