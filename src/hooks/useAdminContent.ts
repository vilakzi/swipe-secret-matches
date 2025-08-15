
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Define admin content types manually since they don't exist in database
export interface AdminContent {
  id: string;
  admin_id: string;
  title: string;
  content: string;
  content_type: string;
  category: string;
  status: string;
  approval_status?: string;
  rejection_reason?: string;
  moderation_notes?: string;
  created_at: string;
  updated_at: string;
  // Additional fields for compatibility
  is_promoted?: boolean;
  promotion_priority?: number;
  file_url?: string;
  description?: string;
  view_count?: number;
  like_count?: number;
  share_count?: number;
  visibility?: string;
  scheduled_at?: string;
  tags?: string[];
  file_size?: number;
  content_hash?: string;
  published_at?: string;
}

export interface AdminContentInsert {
  admin_id: string;
  title: string;
  content: string;
  content_type: string;
  category: string;
  status?: string;
  file_url?: string;
  description?: string;
  visibility?: string;
  scheduled_at?: string;
  tags?: string[];
  thumbnail_url?: string;
  file_size?: number;
  published_at?: string;
  metadata?: any;
}

export interface AdminContentUpdate {
  title?: string;
  content?: string;
  content_type?: string;
  category?: string;
  status?: string;
  approval_status?: string;
  rejection_reason?: string;
  moderation_notes?: string;
  published_at?: string;
  file_url?: string;
  description?: string;
  visibility?: string;
  scheduled_at?: string;
  tags?: string[];
}

export const useAdminContent = () => {
  const [content, setContent] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (contentData: Omit<AdminContentInsert, 'admin_id'>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const insertData: AdminContentInsert = {
        ...contentData,
        admin_id: user.id,
      };

      const { data, error } = await supabase
        .from('admin_content')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      setContent(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Content created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateContent = async (id: string, updates: AdminContentUpdate) => {
    try {
      const { data, error } = await supabase
        .from('admin_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setContent(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContent(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const approveContent = async (id: string, moderationNotes?: string) => {
    return updateContent(id, {
      // @ts-ignore
      approval_status: 'approved',
      // @ts-ignore
      moderation_notes: moderationNotes || null,
    } as any);
  };

  const rejectContent = async (id: string, reason: string, moderationNotes?: string) => {
    return updateContent(id, {
      // @ts-ignore
      approval_status: 'rejected',
      // @ts-ignore
      rejection_reason: reason,
      // @ts-ignore
      moderation_notes: moderationNotes || null,
    } as any);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return {
    content,
    loading,
    createContent,
    updateContent,
    deleteContent,
    approveContent,
    rejectContent,
    refetch: fetchContent,
  };
};
