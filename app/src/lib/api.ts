import type { Listing } from '@/types';

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
