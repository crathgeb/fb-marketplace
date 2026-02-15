import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MediaViewer } from '@/components/MediaViewer';
import { Editor } from '@/components/Editor';
import { getListings } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '@/types';
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

  const selectedIndex = listings.findIndex(l => l.name === selectedName);
  const selectedListing = selectedIndex >= 0 ? listings[selectedIndex] : null;

  const handleApprovalChange = () => {
    loadListings();
  };

  const goToPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedName(listings[selectedIndex - 1].name);
    }
  };

  const goToNext = () => {
    if (selectedIndex < listings.length - 1) {
      setSelectedName(listings[selectedIndex + 1].name);
    }
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
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between gap-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={selectedIndex <= 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <h2 className="text-xl font-semibold text-center flex-1 truncate">{selectedListing.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  disabled={selectedIndex >= listings.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="flex-1 flex gap-6 min-h-0">
                <div className="flex-1 min-w-0">
                  <MediaViewer
                    listingName={selectedListing.name}
                    images={selectedListing.images}
                    videos={selectedListing.videos}
                  />
                </div>
                <div className="flex-1 min-w-0 overflow-auto">
                  <Editor
                    listingName={selectedListing.name}
                    approved={selectedListing.approved}
                    onApprovalChange={handleApprovalChange}
                  />
                </div>
              </div>
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
