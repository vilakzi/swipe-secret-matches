
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type AdminContent = {
  id: string;
  title: string;
  description?: string;
  content_type: 'image' | 'video';
  file_url: string;
  thumbnail_url?: string;
  file_size?: number;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'restricted';
  scheduled_at?: string;
  published_at?: string;
  view_count: number;
  like_count: number;
  share_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

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

  const createContent = async (contentData: Partial<AdminContent>) => {
    try {
      const { data, error } = await supabase
        .from('admin_content')
        .insert([contentData])
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

  const updateContent = async (id: string, updates: Partial<AdminContent>) => {
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

  useEffect(() => {
    fetchContent();
  }, []);

  return {
    content,
    loading,
    createContent,
    updateContent,
    deleteContent,
    refetch: fetchContent,
  };
};
