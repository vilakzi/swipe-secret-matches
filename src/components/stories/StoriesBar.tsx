import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X } from 'lucide-react';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewer } from './StoryViewer';
import { toast } from '@/hooks/use-toast';

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

export const StoriesBar = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = async (story: Story) => {
    setSelectedStory(story);
    
    // Record story view
    if (story.user_id !== user?.id) {
      try {
        await supabase
          .from('story_views')
          .insert({
            story_id: story.id,
            user_id: user?.id
          });
      } catch (error) {
        console.error('Error recording story view:', error);
      }
    }
  };

  const handleStoryCreated = () => {
    setShowCreateModal(false);
    fetchStories();
  };

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-800 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide">
        {/* Add Story Button */}
        <div className="flex-shrink-0 flex flex-col items-center space-y-1">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
          <span className="text-xs text-gray-400">Your Story</span>
        </div>

        {/* Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 flex flex-col items-center space-y-1">
            <button
              onClick={() => handleStoryClick(story)}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1 hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                {story.story_type === 'image' ? (
                  <img
                    src={story.content_url}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={story.content_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                )}
              </div>
            </button>
            <span className="text-xs text-gray-400 truncate w-16 text-center">
              {story.profiles?.username || 'User'}
            </span>
          </div>
        ))}
      </div>

      <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStoryCreated={handleStoryCreated}
      />

      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onNext={() => {
            const currentIndex = stories.findIndex(s => s.id === selectedStory.id);
            const nextStory = stories[currentIndex + 1];
            if (nextStory) {
              handleStoryClick(nextStory);
            } else {
              setSelectedStory(null);
            }
          }}
          onPrevious={() => {
            const currentIndex = stories.findIndex(s => s.id === selectedStory.id);
            const prevStory = stories[currentIndex - 1];
            if (prevStory) {
              handleStoryClick(prevStory);
            }
          }}
        />
      )}
    </>
  );
};