
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useContentPromotion = () => {
  const [isLoading, setIsLoading] = useState(false);

  const promoteContent = async (contentId: string, priorityLevel: number = 1) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('promote_admin_content', {
        content_id: contentId,
        priority_level: priorityLevel
      });

      if (error) throw error;

      toast({
        title: "Content Promoted",
        description: `Content promoted with priority level ${priorityLevel}`,
      });

      return true;
    } catch (error: any) {
      console.error('Promotion error:', error);
      toast({
        title: "Promotion Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unpromoteContent = async (contentId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('unpromote_admin_content', {
        content_id: contentId
      });

      if (error) throw error;

      toast({
        title: "Content Unpromoted",
        description: "Content promotion removed",
      });

      return true;
    } catch (error: any) {
      console.error('Unpromotion error:', error);
      toast({
        title: "Unpromotion Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const promoteUserEmail = async (email: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_admin', {
        _user_email: email
      });

      if (error) throw error;

      toast({
        title: "User Promoted",
        description: `${email} has been promoted to admin`,
      });

      return true;
    } catch (error: any) {
      console.error('User promotion error:', error);
      toast({
        title: "User Promotion Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    promoteContent,
    unpromoteContent,
    promoteUserEmail,
    isLoading
  };
};
