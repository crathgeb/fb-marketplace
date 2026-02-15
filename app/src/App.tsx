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
