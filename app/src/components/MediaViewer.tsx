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
    <div className="flex flex-col h-full gap-3">
      {/* Large preview */}
      <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center flex-1 min-h-0">
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
        <div className="flex gap-2 overflow-x-auto pb-2 flex-shrink-0">
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
