
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { demoProfiles } from '@/data/demoProfiles';
import { toast } from '@/hooks/use-toast';
import { ProviderData, ProviderPost } from '@/types/provider';

export function useProviderProfile(providerId?: string) {
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [posts, setPosts] = useState<ProviderPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (providerId) {
      fetchProviderData();
      fetchProviderPosts();
    }
    // eslint-disable-next-line
  }, [providerId]);

  const fetchProviderData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', providerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProvider({
          ...data,
          serviceCategory: data.serviceCategory || 'Beauty & Wellness',
          services: data.services || ['Massage Therapy', 'Facial Treatment', 'Body Therapy', 'Aromatherapy'],
          rating: 4.8,
          reviewCount: 127,
          isAvailable: Math.random() > 0.3
        });
      } else {
        // Demo fallback
        const demoProvider = demoProfiles.find(profile => profile.id === providerId);
        if (demoProvider) {
          setProvider({
            id: demoProvider.id,
            display_name: demoProvider.name,
            bio: demoProvider.bio,
            location: demoProvider.location,
            whatsapp: demoProvider.whatsapp,
            profile_image_url: demoProvider.image,
            profile_images: demoProvider.portfolio || [demoProvider.image],
            serviceCategory: demoProvider.serviceCategory,
            services: demoProvider.services,
            rating: demoProvider.rating,
            reviewCount: demoProvider.reviewCount,
            isAvailable: demoProvider.isAvailable
          });
        } else {
          throw new Error('Provider not found');
        }
      }
    } catch (error: any) {
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Error loading profile",
        description: error.message || "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        const demoProvider = demoProfiles.find(profile => profile.id === providerId);
        if (demoProvider && demoProvider.posts) {
          const demoPosts: ProviderPost[] = demoProvider.posts.map((postUrl: string, index: number) => ({
            id: `demo-post-${demoProvider.id}-${index}`,
            content_url: postUrl,
            post_type: 'image',
            created_at: new Date().toISOString(),
            promotion_type: 'free_2h'
          }));
          setPosts(demoPosts);
        } else {
          setPosts([]);
        }
      } else {
        setPosts(data || []);
      }
    } catch (error: any) {
      setPosts([]);
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Error loading provider content",
        description: error.message || "Unknown error",
        variant: "destructive"
      });
    }
  };

  return { provider, posts, loading, error };
}
