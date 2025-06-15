
import React, { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

interface AdminFeedTile {
  id: string;
  mediaType: "image" | "video";
  mediaURL: string;
  ownerID: string;
  timestamp: string | number | Date;
  ownerName?: string;
  tileColor?: string;
  visibility?: boolean;
}

interface AdminFeedRotatorProps {
  adminFeedTiles: AdminFeedTile[];
  onDelete?: (id: string) => void; // Optional deletion callback
}

const AdminFeedRotator: React.FC<AdminFeedRotatorProps> = ({
  adminFeedTiles,
  onDelete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedLength = adminFeedTiles.length;
  const intervalRef = useRef<number | null>(null);

  // Loop over tiles every 5 seconds
  useEffect(() => {
    if (feedLength === 0) return;
    intervalRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % feedLength);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [feedLength]);

  // Reset index if feed tiles change
  useEffect(() => {
    setCurrentIndex(0);
  }, [feedLength]);

  if (!feedLength) return null;

  const tile = adminFeedTiles[currentIndex];

  const isImage = tile.mediaType === "image";
  const isVideo = tile.mediaType === "video";
  const frameColor = tile.tileColor || "red";

  return (
    <div className="w-full h-full flex items-center justify-center select-none">
      <div
        className={`relative flex flex-col items-center justify-center w-full max-w-lg aspect-video border-4 rounded-xl overflow-hidden bg-black shadow-xl animate-fade-in`}
        style={{ borderColor: frameColor }}
      >
        {/* DELETE ICON */}
        {onDelete && (
          <button
            className="absolute top-3 right-3 z-20 bg-black/70 hover:bg-red-700 border border-gray-700 rounded-full p-2 text-white"
            onClick={() => onDelete(tile.id)}
            aria-label="Delete this admin tile"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
        {/* MEDIA */}
        <div className="flex items-center justify-center w-full h-full bg-red-950/50">
          {isImage && (
            <img
              src={tile.mediaURL}
              alt="admin media"
              className="object-contain w-full h-full max-h-[80vh] transition-all duration-500"
              draggable={false}
            />
          )}
          {isVideo && (
            <video
              src={tile.mediaURL}
              controls
              className="object-contain w-full h-full max-h-[80vh] transition-all duration-500"
            ></video>
          )}
        </div>
        {/* USER INFO */}
        <div className="w-full px-5 py-2 bg-black/50 flex items-center justify-between border-t border-red-600 text-white text-xs font-medium min-h-8">
          <span>
            {tile.ownerName ? tile.ownerName : tile.ownerID.slice(0, 8)}
          </span>
          <span>
            {tile.timestamp
              ? new Date(tile.timestamp).toLocaleString()
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedRotator;
