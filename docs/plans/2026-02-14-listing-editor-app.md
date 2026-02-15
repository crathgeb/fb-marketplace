# FB Marketplace Listing Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web interface for viewing and editing FB Marketplace listings with image preview, text editing, and approval workflow.

**Architecture:** Vite + React frontend with shadcn/ui components. Express API server for filesystem operations. Vite proxies `/api/*` to Express. Auto-save with 1s debounce.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, Express, concurrently

---

### Task 1: Initialize Vite Project

**Files:**
- Create: `app/package.json`
- Create: `app/tsconfig.json`
- Create: `app/vite.config.ts`
- Create: `app/index.html`
- Create: `app/src/main.tsx`
- Create: `app/src/App.tsx`
- Create: `app/src/index.css`

**Step 1: Create app directory and initialize project**

```bash
cd /Users/crathgeb/projects/fb-marketplace
mkdir -p app
cd app
npm create vite@latest . -- --template react-ts
```

Select: React, TypeScript when prompted.

**Step 2: Install dependencies**

```bash
cd /Users/crathgeb/projects/fb-marketplace/app
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure Tailwind**

Update `app/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `app/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: Verify app runs**

Run: `npm run dev`
Expected: Vite dev server starts on http://localhost:5173

**Step 5: Commit**

```bash
git add app/
git commit -m "feat: initialize Vite React TypeScript project with Tailwind"
```

---

### Task 2: Set Up shadcn/ui

**Files:**
- Create: `app/components.json`
- Create: `app/src/lib/utils.ts`
- Create: `app/src/components/ui/button.tsx`
- Create: `app/src/components/ui/input.tsx`
- Create: `app/src/components/ui/textarea.tsx`
- Create: `app/src/components/ui/scroll-area.tsx`

**Step 1: Initialize shadcn**

```bash
cd /Users/crathgeb/projects/fb-marketplace/app
npx shadcn@latest init
```

Select defaults:
- TypeScript: yes
- Style: Default
- Base color: Slate
- CSS variables: yes

**Step 2: Add required components**

```bash
cd /Users/crathgeb/projects/fb-marketplace/app
npx shadcn@latest add button input textarea scroll-area
```

**Step 3: Verify components exist**

Run: `ls app/src/components/ui/`
Expected: button.tsx, input.tsx, textarea.tsx, scroll-area.tsx

**Step 4: Commit**

```bash
git add app/
git commit -m "feat: add shadcn/ui components"
```

---

### Task 3: Create Express API Server

**Files:**
- Create: `app/server/index.ts`
- Modify: `app/package.json` (add server deps and scripts)
- Modify: `app/vite.config.ts` (add proxy)

**Step 1: Install server dependencies**

```bash
cd /Users/crathgeb/projects/fb-marketplace/app
npm install express cors
npm install -D @types/express @types/cors tsx concurrently
```

**Step 2: Create server file**

Create `app/server/index.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3001;
const LISTINGS_DIR = path.join(__dirname, '../../listings');

app.use(cors());
app.use(express.json());
app.use(express.text());

// Get all listings
app.get('/api/listings', async (req, res) => {
  try {
    const entries = await fs.readdir(LISTINGS_DIR, { withFileTypes: true });
    const listings = await Promise.all(
      entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(async entry => {
          const listingPath = path.join(LISTINGS_DIR, entry.name);
          const files = await fs.readdir(listingPath);
          const approved = files.includes('approved.md');
          const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
          const videos = files.filter(f => /\.(mp4|mov|webm)$/i.test(f));
          return { name: entry.name, approved, images, videos };
        })
    );
    res.json(listings.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read listings' });
  }
});

// Get file content
app.get('/api/listings/:name/file/:filename', async (req, res) => {
  try {
    const { name, filename } = req.params;
    const filePath = path.join(LISTINGS_DIR, name, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    res.type('text/plain').send(content);
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Save file content
app.put('/api/listings/:name/file/:filename', async (req, res) => {
  try {
    const { name, filename } = req.params;
    const filePath = path.join(LISTINGS_DIR, name, filename);
    await fs.writeFile(filePath, req.body, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// Approve listing
app.post('/api/listings/:name/approve', async (req, res) => {
  try {
    const { name } = req.params;
    const filePath = path.join(LISTINGS_DIR, name, 'approved.md');
    await fs.writeFile(filePath, `Approved on ${new Date().toISOString()}\n`, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve listing' });
  }
});

// Unapprove listing
app.delete('/api/listings/:name/approve', async (req, res) => {
  try {
    const { name } = req.params;
    const filePath = path.join(LISTINGS_DIR, name, 'approved.md');
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unapprove listing' });
  }
});

// Serve media files
app.get('/api/listings/:name/media/:filename', async (req, res) => {
  try {
    const { name, filename } = req.params;
    const filePath = path.join(LISTINGS_DIR, name, filename);
    res.sendFile(filePath);
  } catch (err) {
    res.status(404).json({ error: 'Media not found' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
```

**Step 3: Update package.json scripts**

Add to `app/package.json` scripts:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

**Step 4: Configure Vite proxy**

Update `app/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

**Step 5: Test server starts**

Run: `cd /Users/crathgeb/projects/fb-marketplace/app && npm run dev:server`
Expected: "API server running on http://localhost:3001"

**Step 6: Test API endpoint**

Run: `curl http://localhost:3001/api/listings | head -c 200`
Expected: JSON array with listing objects

**Step 7: Commit**

```bash
git add app/
git commit -m "feat: add Express API server with listings endpoints"
```

---

### Task 4: Create API Client

**Files:**
- Create: `app/src/lib/api.ts`
- Create: `app/src/types.ts`

**Step 1: Create types file**

Create `app/src/types.ts`:
```typescript
export interface Listing {
  name: string;
  approved: boolean;
  images: string[];
  videos: string[];
}

export interface ListingContent {
  title: string;
  price: string;
  description: string;
}
```

**Step 2: Create API client**

Create `app/src/lib/api.ts`:
```typescript
import { Listing } from '@/types';

const API_BASE = '/api';

export async function getListings(): Promise<Listing[]> {
  const res = await fetch(`${API_BASE}/listings`);
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
}

export async function getFileContent(name: string, filename: string): Promise<string> {
  const res = await fetch(`${API_BASE}/listings/${encodeURIComponent(name)}/file/${filename}`);
  if (!res.ok) return '';
  return res.text();
}

export async function saveFileContent(name: string, filename: string, content: string): Promise<void> {
  const res = await fetch(`${API_BASE}/listings/${encodeURIComponent(name)}/file/${filename}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: content,
  });
  if (!res.ok) throw new Error('Failed to save file');
}

export async function approveListing(name: string): Promise<void> {
  const res = await fetch(`${API_BASE}/listings/${encodeURIComponent(name)}/approve`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to approve listing');
}

export async function unapproveListing(name: string): Promise<void> {
  const res = await fetch(`${API_BASE}/listings/${encodeURIComponent(name)}/approve`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to unapprove listing');
}

export function getMediaUrl(name: string, filename: string): string {
  return `${API_BASE}/listings/${encodeURIComponent(name)}/media/${encodeURIComponent(filename)}`;
}
```

**Step 3: Commit**

```bash
git add app/src/
git commit -m "feat: add API client and types"
```

---

### Task 5: Create useDebounce Hook

**Files:**
- Create: `app/src/hooks/useDebounce.ts`

**Step 1: Create debounce hook**

Create `app/src/hooks/useDebounce.ts`:
```typescript
import { useEffect, useRef } from 'react';

export function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }) as T;
}
```

**Step 2: Commit**

```bash
git add app/src/hooks/
git commit -m "feat: add useDebounce hook"
```

---

### Task 6: Create Sidebar Component

**Files:**
- Create: `app/src/components/Sidebar.tsx`

**Step 1: Create Sidebar component**

Create `app/src/components/Sidebar.tsx`:
```typescript
import { ScrollArea } from '@/components/ui/scroll-area';
import { Listing } from '@/types';
import { Check } from 'lucide-react';

interface SidebarProps {
  listings: Listing[];
  selectedName: string | null;
  onSelect: (name: string) => void;
}

export function Sidebar({ listings, selectedName, onSelect }: SidebarProps) {
  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b font-semibold">
        Listings ({listings.length})
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {listings.map(listing => (
            <button
              key={listing.name}
              onClick={() => onSelect(listing.name)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-muted transition-colors ${
                selectedName === listing.name ? 'bg-muted' : ''
              }`}
            >
              {listing.approved ? (
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">•</span>
              )}
              <span className="truncate">{listing.name}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

**Step 2: Install lucide-react for icons**

```bash
cd /Users/crathgeb/projects/fb-marketplace/app
npm install lucide-react
```

**Step 3: Commit**

```bash
git add app/
git commit -m "feat: add Sidebar component"
```

---

### Task 7: Create MediaViewer Component

**Files:**
- Create: `app/src/components/MediaViewer.tsx`

**Step 1: Create MediaViewer component**

Create `app/src/components/MediaViewer.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { getMediaUrl } from '@/lib/api';

interface MediaViewerProps {
  listingName: string;
  images: string[];
  videos: string[];
}

export function MediaViewer({ listingName, images, videos }: MediaViewerProps) {
  const allMedia = [...images, ...videos];
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [listingName]);

  if (allMedia.length === 0) {
    return (
      <div className="bg-muted rounded-lg h-64 flex items-center justify-center text-muted-foreground">
        No media files
      </div>
    );
  }

  const selectedFile = allMedia[selectedIndex];
  const isVideo = videos.includes(selectedFile);
  const mediaUrl = getMediaUrl(listingName, selectedFile);

  return (
    <div className="space-y-3">
      {/* Large preview */}
      <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '400px' }}>
        {isVideo ? (
          <video
            key={mediaUrl}
            src={mediaUrl}
            controls
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <img
            key={mediaUrl}
            src={mediaUrl}
            alt={selectedFile}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allMedia.map((file, index) => {
            const isVid = videos.includes(file);
            const thumbUrl = getMediaUrl(listingName, file);
            return (
              <button
                key={file}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                  index === selectedIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                }`}
              >
                {isVid ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    VIDEO
                  </div>
                ) : (
                  <img
                    src={thumbUrl}
                    alt={file}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/src/components/
git commit -m "feat: add MediaViewer component"
```

---

### Task 8: Create Editor Component

**Files:**
- Create: `app/src/components/Editor.tsx`

**Step 1: Create Editor component**

Create `app/src/components/Editor.tsx`:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getFileContent, saveFileContent, approveListing, unapproveListing } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { Check } from 'lucide-react';

interface EditorProps {
  listingName: string;
  approved: boolean;
  onApprovalChange: () => void;
}

export function Editor({ listingName, approved, onApprovalChange }: EditorProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // Load content when listing changes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getFileContent(listingName, 'title.md'),
      getFileContent(listingName, 'price.md'),
      getFileContent(listingName, 'description.md'),
    ]).then(([t, p, d]) => {
      setTitle(t);
      setPrice(p);
      setDescription(d);
      setLoading(false);
    });
  }, [listingName]);

  // Debounced save functions
  const saveTitle = useDebounce(
    useCallback((content: string) => {
      saveFileContent(listingName, 'title.md', content);
    }, [listingName]),
    1000
  );

  const savePrice = useDebounce(
    useCallback((content: string) => {
      saveFileContent(listingName, 'price.md', content);
    }, [listingName]),
    1000
  );

  const saveDescription = useDebounce(
    useCallback((content: string) => {
      saveFileContent(listingName, 'description.md', content);
    }, [listingName]),
    1000
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    saveTitle(value);
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    savePrice(value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    saveDescription(value);
  };

  const handleApprovalToggle = async () => {
    if (approved) {
      await unapproveListing(listingName);
    } else {
      await approveListing(listingName);
    }
    onApprovalChange();
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Listing title..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Price</label>
        <Input
          value={price}
          onChange={e => handlePriceChange(e.target.value)}
          placeholder="$0"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={e => handleDescriptionChange(e.target.value)}
          placeholder="Listing description..."
          rows={12}
        />
      </div>

      <Button
        onClick={handleApprovalToggle}
        variant={approved ? 'outline' : 'default'}
        className="w-full"
      >
        {approved ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Approved
          </>
        ) : (
          'Approve'
        )}
      </Button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/src/components/
git commit -m "feat: add Editor component with auto-save"
```

---

### Task 9: Assemble Main App

**Files:**
- Modify: `app/src/App.tsx`

**Step 1: Update App.tsx**

Replace `app/src/App.tsx`:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MediaViewer } from '@/components/MediaViewer';
import { Editor } from '@/components/Editor';
import { getListings } from '@/lib/api';
import { Listing } from '@/types';
import './index.css';

function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    const data = await getListings();
    setListings(data);
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const selectedListing = listings.find(l => l.name === selectedName);

  const handleApprovalChange = () => {
    loadListings();
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b px-4 py-3 font-semibold text-lg">
        FB Marketplace Listings
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          listings={listings}
          selectedName={selectedName}
          onSelect={setSelectedName}
        />
        <main className="flex-1 overflow-auto p-6">
          {selectedListing ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-xl font-semibold">{selectedListing.name}</h2>
              <MediaViewer
                listingName={selectedListing.name}
                images={selectedListing.images}
                videos={selectedListing.videos}
              />
              <Editor
                listingName={selectedListing.name}
                approved={selectedListing.approved}
                onApprovalChange={handleApprovalChange}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a listing from the sidebar
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
```

**Step 2: Commit**

```bash
git add app/src/
git commit -m "feat: assemble main App with Sidebar, MediaViewer, and Editor"
```

---

### Task 10: Final Testing and Cleanup

**Step 1: Start the full application**

Run: `cd /Users/crathgeb/projects/fb-marketplace/app && npm run dev`

Expected: Both servers start (Vite on 5173, Express on 3001)

**Step 2: Manual verification checklist**

Open http://localhost:5173 in browser and verify:
- [ ] Listings appear in sidebar
- [ ] Clicking a listing shows its media and editor
- [ ] Images display correctly with thumbnail navigation
- [ ] Editing title/price/description auto-saves (check file on disk)
- [ ] Approve button creates approved.md and shows green checkmark
- [ ] Clicking approved listing shows "Approved" button state

**Step 3: Commit final state**

```bash
git add .
git commit -m "feat: complete FB Marketplace listing editor app"
```

---

## Summary

This plan creates a complete listing editor with:
- Vite + React + TypeScript frontend
- Express API server for filesystem operations
- shadcn/ui styling
- Left sidebar with listing names and approval status
- Large image preview with clickable thumbnails
- Auto-saving text editors for title, price, description
- Approval workflow with approved.md file creation
