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
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-700">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-white">{provider.display_name}</h1>
          <div className="flex space-x-2">
            <Button
              onClick={handleContact}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button variant="ghost" size="sm" className="text-white">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Profile Header */}
        <Card className="bg-black/20 backdrop-blur-md border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <img
                  src={provider.profile_image_url || '/placeholder.svg'}
                  alt={provider.display_name}
                  className="w-32 h-32 rounded-full object-cover"
                />
                <OnlineStatus 
                  isOnline={isUserOnline(provider.id)} 
                  size="lg"
                  className="absolute -bottom-2 -right-2"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{provider.display_name}</h1>
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    Provider
                  </Badge>
                  {provider.isAvailable && (
                    <Badge className="bg-green-600 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      Available
                    </Badge>
                  )}
                </div>

                {provider.serviceCategory && (
                  <Badge className="bg-blue-600 text-white mb-3">
                    {provider.serviceCategory}
                  </Badge>
                )}

                <div className="flex items-center space-x-4 mb-3">
                  {provider.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {renderStars(provider.rating)}
                      </div>
                      <span className="text-yellow-400 font-semibold">{provider.rating.toFixed(1)}</span>
                      {provider.reviewCount && (
                        <span className="text-gray-400 text-sm">({provider.reviewCount} reviews)</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {provider.location}
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleContact}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-white/10">
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'about', label: 'About' },
            { id: 'posts', label: `Posts (${posts.length})` },
            { id: 'services', label: 'Services' }
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className={`${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <Card className="bg-black/20 backdrop-blur-md border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{provider.bio || 'No bio available.'}</p>
              
              {provider.profile_images && provider.profile_images.length > 1 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Photos</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {provider.profile_images.slice(1).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${provider.display_name} ${index + 2}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-black/20 backdrop-blur-md border-gray-700">
                    <CardContent className="p-0">
                      <div className="relative">
                        {post.post_type === 'image' ? (
                          <img
                            src={post.content_url}
                            alt="Post content"
                            className="w-full h-64 object-cover rounded-t"
                          />
                        ) : (
                          <div className="w-full h-64 bg-gray-700 rounded-t flex items-center justify-center">
                            <Video className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className={`${
                            post.promotion_type === 'free_2h' 
                              ? 'bg-green-600' 
                              : 'bg-purple-600'
                          }`}>
                            {post.promotion_type === 'free_2h' ? '2H Free' : 
                             post.promotion_type === 'paid_8h' ? '8H Promoted' : '12H Promoted'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-400 text-sm">
                          Posted {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-black/20 backdrop-blur-md border-gray-700">
                <CardContent className="p-8 text-center">
                  <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No posts yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <Card className="bg-black/20 backdrop-blur-md border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              {provider.services && provider.services.length > 0 ? (
                <div className="grid gap-3">
                  {provider.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                      <span className="text-white">{service}</span>
                      <Button size="sm" variant="outline" className="border-purple-500 text-purple-400">
                        Inquire
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No services listed.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;
