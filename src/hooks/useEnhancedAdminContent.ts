
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AdminContentRow = Database['public']['Tables']['admin_content']['Row'];
type AdminContentInsert = Database['public']['Tables']['admin_content']['Insert'];
type AdminContentUpdate = Database['public']['Tables']['admin_content']['Update'];

export type ContentCategory = 'entertainment' | 'news' | 'lifestyle' | 'sports' | 'technology' | 'fashion' | 'food' | 'travel' | 'education' | 'business' | 'health' | 'other';

export interface EnhancedAdminContent extends AdminContentRow {
  category: ContentCategory;
  content_hash: string | null;
  original_file_size: number | null;
  optimized_file_sizes: Record<string, any>;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  auto_published: boolean | null;
  tags?: string[];
}

export const useEnhancedAdminContent = () => {
  const [content, setContent] = useState<EnhancedAdminContent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_content')
        .select(`
          *,
          content_tags(tag)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const contentWithTags = (data || []).map(item => ({
        ...item,
        tags: item.content_tags?.map((tag: any) => tag.tag) || []
      })) as EnhancedAdminContent[];
      
      setContent(contentWithTags);
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

  const createContent = async (contentData: Omit<AdminContentInsert, 'admin_id'> & { 
    tags?: string[];
    category?: ContentCategory;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check for duplicate content if hash is provided
      if (contentData.content_hash) {
        const { data: isDuplicate } = await supabase.rpc('check_duplicate_content', {
          hash_value: contentData.content_hash
        });
        
        if (isDuplicate) {
          throw new Error('This content has already been uploaded');
        }
      }

      const { tags, ...contentWithoutTags } = contentData;
      const insertData: AdminContentInsert = {
        ...contentWithoutTags,
        admin_id: user.id,
        approval_status: 'pending', // All content starts as pending approval
      };

      const { data, error } = await supabase
        .from('admin_content')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (tags && tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          content_id: data.id,
          tag: tag.trim()
        }));

        const { error: tagError } = await supabase
          .from('content_tags')
          .insert(tagInserts);

        if (tagError) console.warn('Failed to add tags:', tagError);
      }
      
      await fetchContent(); // Refresh the list
      toast({
        title: "Success",
        description: "Content created and submitted for approval",
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

  const updateContent = async (id: string, updates: AdminContentUpdate & { tags?: string[] }) => {
    try {
      const { tags, ...contentUpdates } = updates;
      
      const { data, error } = await supabase
        .from('admin_content')
        .update(contentUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update tags if provided
      if (tags !== undefined) {
        // Delete existing tags
        await supabase
          .from('content_tags')
          .delete()
          .eq('content_id', id);

        // Insert new tags
        if (tags.length > 0) {
          const tagInserts = tags.map(tag => ({
            content_id: id,
            tag: tag.trim()
          }));

          await supabase
            .from('content_tags')
            .insert(tagInserts);
        }
      }
      
      await fetchContent(); // Refresh the list
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

  const approveContent = async (id: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update content approval status
      await supabase
        .from('admin_content')
        .update({
          approval_status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          status: 'published' // Auto-publish when approved
        })
        .eq('id', id);

      // Log the approval
      await supabase
        .from('content_approvals')
        .insert({
          content_id: id,
          reviewer_id: user.id,
          action: 'approved',
          notes
        });

      await fetchContent();
      toast({
        title: "Success",
        description: "Content approved and published",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectContent = async (id: string, reason: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update content approval status
      await supabase
        .from('admin_content')
        .update({
          approval_status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', id);

      // Log the rejection
      await supabase
        .from('content_approvals')
        .insert({
          content_id: id,
          reviewer_id: user.id,
          action: 'rejected',
          notes: notes || reason
        });

      await fetchContent();
      toast({
        title: "Content Rejected",
        description: "Content has been rejected",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchContent();
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

  const scheduleContent = async (id: string, scheduledDate: string) => {
    try {
      await supabase
        .from('admin_content')
        .update({
          status: 'scheduled',
          scheduled_at: scheduledDate
        })
        .eq('id', id);

      await fetchContent();
      toast({
        title: "Success",
        description: "Content scheduled successfully",
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
    approveContent,
    rejectContent,
    deleteContent,
    scheduleContent,
    refetch: fetchContent,
  };
};
