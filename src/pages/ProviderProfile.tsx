import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, MapPin, Phone, MessageCircle, Clock, Heart, Share, Images, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import OnlineStatus from '@/components/OnlineStatus';
import { usePresence } from '@/hooks/usePresence';
import { demoProfiles } from '@/data/demoProfiles';
import ProviderProfileHeader from '@/components/provider-profile/ProviderProfileHeader';
import ProviderProfileTabs from '@/components/provider-profile/ProviderProfileTabs';

interface ProviderData {
  id: string;
  display_name: string;
  bio: string;
  location: string;
  whatsapp: string;
  profile_image_url: string;
  profile_images: string[];
  serviceCategory?: string;
  services?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
}

interface Post {
  id: string;
  content_url: string;
  post_type: string;
  created_at: string;
  promotion_type: string;
}

const ProviderProfile = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { isUserOnline } = usePresence();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'services'>('about');

  useEffect(() => {
    if (providerId) {
      fetchProviderData();
      fetchProviderPosts();
    }
  }, [providerId]);

  const fetchProviderData = async () => {
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
        // Real provider from database
        setProvider({
          ...data,
          serviceCategory: 'Beauty & Wellness',
          services: ['Massage Therapy', 'Facial Treatment', 'Body Therapy', 'Aromatherapy'],
          rating: 4.8,
          reviewCount: 127,
          isAvailable: Math.random() > 0.3
        });
      } else {
        // Fall back to demo data
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
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
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
      
      // If no posts from database, check demo data
      if (!data || data.length === 0) {
        const demoProvider = demoProfiles.find(profile => profile.id === providerId);
        if (demoProvider && demoProvider.posts) {
          // Convert demo posts to Post format
          const demoPosts: Post[] = demoProvider.posts.map((postUrl, index) => ({
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
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (provider?.whatsapp) {
      // Enforced WhatsApp with preset message for providers
      const num = provider.whatsapp.replace(/[^0-9]/g, "");
      const message = encodeURIComponent("Hi, I got your number from ConnectsBuddy looking for hook up services/content.");
      window.open(`https://wa.me/${num}?text=${message}`, '_blank');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Provider not found</h2>
          <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      {/* Header */}
      <ProviderProfileHeader
        provider={provider}
        onBack={() => navigate('/')}
      />

      {/* TABS */}
      <div className="max-w-4xl mx-auto p-4 pt-8">
        <ProviderProfileTabs
          provider={provider}
          posts={posts}
        />
      </div>
    </div>
  );
};

export default ProviderProfile;
