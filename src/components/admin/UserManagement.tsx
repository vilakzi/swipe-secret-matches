import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ban, Eye, Search, UserCheck, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import UserManagementTable from "./UserManagementTable";

interface UserOverview {
  id: string;
  display_name: string;
  email: string;
  user_type: string;
  role: string;
  created_at: string;
  last_active: string;
  is_blocked: boolean;
  subscribed: boolean;
  subscription_tier: string;
  total_swipes: number;
  total_matches: number;
  total_posts: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserOverview[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingContentUserId, setRemovingContentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_user_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error loading users",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !isBlocked })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: isBlocked ? "User unblocked" : "User blocked",
        description: `User has been ${isBlocked ? 'unblocked' : 'blocked'} successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user block status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const handleRemoveContent = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove all content posted by this user? This cannot be undone.")) {
      return;
    }
    setRemovingContentUserId(userId);
    try {
      // 1. Delete all from admin_content
      const { error: adminContentError } = await supabase
        .from('admin_content')
        .delete()
        .eq('admin_id', userId);

      // 2. Delete all from posts
      const { error: postsError } = await supabase
        .from('posts')
        .delete()
        .eq('provider_id', userId);

      if (adminContentError || postsError) throw adminContentError || postsError;

      toast({
        title: "Content removed",
        description: "All content posted by this user has been deleted.",
        variant: "default"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error removing user content:', error);
      toast({
        title: "Error",
        description: "Failed to remove user content",
        variant: "destructive"
      });
    } finally {
      setRemovingContentUserId(null);
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'service_provider':
        return 'bg-purple-600';
      case 'admin':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-gray-700">
        <CardContent className="p-6">
          <div className="h-64 bg-gray-700 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 backdrop-blur-md border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">User Management</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <UserManagementTable
            users={filteredUsers}
            removingContentUserId={removingContentUserId}
            onBlockUser={handleBlockUser}
            onRemoveContent={handleRemoveContent}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
