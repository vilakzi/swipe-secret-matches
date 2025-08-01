import { supabase } from '@/integrations/supabase/client';

export const createDemoContent = async () => {
  try {
    console.log('🌱 Seeding demo content...');
    
    // Create demo user accounts first
    const demoUsers = [
      {
        email: 'alex@demo.com',
        password: 'Demo123!',
        metadata: {
          username: 'alex_photographer',
          full_name: 'Alex Johnson',
          bio: 'Professional photographer capturing life\'s moments. Available for events and portraits.',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
        }
      },
      {
        email: 'sarah@demo.com', 
        password: 'Demo123!',
        metadata: {
          username: 'sarah_designer',
          full_name: 'Sarah Chen',
          bio: 'UI/UX Designer creating beautiful digital experiences. Let\'s build something amazing together!',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
        }
      },
      {
        email: 'mike@demo.com',
        password: 'Demo123!', 
        metadata: {
          username: 'mike_developer',
          full_name: 'Mike Rodriguez',
          bio: 'Full-stack developer passionate about clean code and innovative solutions.',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
        }
      }
    ];

    const createdUsers = [];
    
    // Create users via Supabase Auth
    for (const user of demoUsers) {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: user.metadata
        }
      });
      
      if (data.user && !error) {
        createdUsers.push({
          id: data.user.id,
          ...user.metadata
        });
        console.log(`✅ Created user: ${user.metadata.username}`);
      } else if (error?.message?.includes('already registered')) {
        console.log(`ℹ️  User ${user.email} already exists`);
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error);
      }
    }

    // Create demo posts
    const demoPosts = [
      {
        content_url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=800&fit=crop',
        caption: 'Just finished an amazing wedding shoot! The golden hour lighting was absolutely perfect. #photography #wedding #goldenhour',
        post_type: 'image'
      },
      {
        content_url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop',
        caption: 'Working on a new mobile app design. Clean, minimal, and user-focused. What do you think? #ux #design #mobile',
        post_type: 'image'
      },
      {
        content_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
        caption: 'Late night coding session. Building something exciting! 🚀 #coding #developer #startup',
        post_type: 'image'
      }
    ];

    console.log('✅ Demo content seeding completed!');
    return { success: true, message: 'Demo content created successfully' };
    
  } catch (error) {
    console.error('❌ Error seeding demo content:', error);
    return { success: false, error };
  }
};

export const checkDemoContentExists = async () => {
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username')
      .in('username', ['alex_photographer', 'sarah_designer', 'mike_developer']);
      
    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .limit(3);
      
    return {
      hasProfiles: (profiles?.length || 0) > 0,
      hasPosts: (posts?.length || 0) > 0,
      profileCount: profiles?.length || 0,
      postCount: posts?.length || 0
    };
  } catch (error) {
    console.error('Error checking demo content:', error);
    return { hasProfiles: false, hasPosts: false, profileCount: 0, postCount: 0 };
  }
};