import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
