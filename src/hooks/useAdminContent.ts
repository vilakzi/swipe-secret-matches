
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Use the database type directly to avoid mismatches
type AdminContentRow = Database['public']['Tables']['admin_content']['Row'];
type AdminContentInsert = Database['public']['Tables']['admin_content']['Insert'];
type AdminContentUpdate = Database['public']['Tables']['admin_content']['Update'];

export type AdminContent = AdminContentRow;

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
