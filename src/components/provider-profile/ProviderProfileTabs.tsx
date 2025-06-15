import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProviderAboutTab from './ProviderAboutTab';
import ProviderPostsTab from './ProviderPostsTab';
import ProviderServicesTab from './ProviderServicesTab';

export interface ProviderData {
  id: string;
  display_name: string;
  age?: number | null;
  bio: string;
  location: string;
  whatsapp: string;
  profile_image_url: string | null;
  profile_images: string[];
  serviceCategory?: string;
  services?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
}

export interface Post {
  id: string;
  content_url: string;
  post_type: string;
  created_at: string;
  promotion_type: string;
}

interface Props {
  provider: ProviderData;
  posts: Post[];
}

const ProviderProfileTabs = ({ provider, posts }: Props) => {
  const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'services'>('about');
  
  return (
    <>
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
      <div>
        {activeTab === 'about' && (
          <ProviderAboutTab provider={provider} />
        )}
        {activeTab === 'posts' && (
          <ProviderPostsTab posts={posts} />
        )}
        {activeTab === 'services' && (
          <ProviderServicesTab services={provider.services} />
        )}
      </div>
    </>
  );
};

export default ProviderProfileTabs;
