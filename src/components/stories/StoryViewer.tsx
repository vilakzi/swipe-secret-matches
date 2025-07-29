import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface Story {
  id: string;
  user_id: string;
  content_url: string;
  story_type: string;
  expires_at: string;
  views_count: number;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  story,
  onClose,
  onNext,
  onPrevious,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const duration = story.story_type === 'video' ? 15000 : 5000; // 15s for video, 5s for image
    const interval = 100; // Update every 100ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [story, isPaused, onNext]);

  useEffect(() => {
    setProgress(0);
  }, [story]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') onPrevious();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'Escape') onClose();
    if (e.key === ' ') {
      e.preventDefault();
      setIsPaused(!isPaused);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPaused]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-black border-none h-full max-h-screen">
        <div className="relative h-full flex flex-col">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 z-10 p-2">
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div
                className="bg-white h-1 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                {story.profiles?.avatar_url ? (
                  <img
                    src={story.profiles.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                )}
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  {story.profiles?.username || 'User'}
                </p>
                <p className="text-gray-300 text-xs">
                  {new Date(story.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-white">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{story.views_count}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-black/20 h-auto p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div 
            className="flex-1 flex items-center justify-center bg-black relative"
            onClick={() => setIsPaused(!isPaused)}
          >
            {story.story_type === 'image' ? (
              <img
                src={story.content_url}
                alt="Story content"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={story.content_url}
                autoPlay
                muted
                className="max-w-full max-h-full object-contain"
                onEnded={onNext}
              />
            )}

            {/* Navigation areas */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="absolute left-0 top-0 w-1/3 h-full flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-8 h-8 text-white bg-black/50 rounded-full p-1" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-0 top-0 w-1/3 h-full flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-8 h-8 text-white bg-black/50 rounded-full p-1" />
            </button>
          </div>

          {/* Pause indicator */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="text-white text-lg">⏸️</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};