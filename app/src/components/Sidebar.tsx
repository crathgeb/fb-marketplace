import { ScrollArea } from '@/components/ui/scroll-area';
import type { Listing } from '@/types';
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
