import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import UserManagementTable from "./UserManagementTable";
import { useError } from '@/components/common/ErrorTaskBar';

export interface UserOverview {
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

  const { addError } = useError();

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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_user_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      addError("Failed to load user data");
      setUsers([]);
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
      await fetchUsers();
    } catch (error: any) {
      addError("Failed to update user status");
    }
  };

  const handleRemoveContent = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove all content posted by this user? This cannot be undone.")) {
      return;
    }
    setRemovingContentUserId(userId);
    try {
      const { error: adminContentError } = await supabase
        .from('admin_content')
        .delete()
        .eq('admin_id', userId);

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

      await fetchUsers();
    } catch (error: any) {
      addError("Failed to remove user content");
    } finally {
      setRemovingContentUserId(null);
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
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-white">User Management</CardTitle>
          <div className="flex items-center space-x-2 w-full md:w-auto mt-2 md:mt-0">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 sm:w-64 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border-gray-700">
          {!filteredUsers.length ? (
            <div className="flex justify-center items-center h-40 text-muted-foreground text-center text-sm">
              No users found. {searchTerm ? "Try a different search or check your spelling." : "If you're expecting users, check your Supabase data."}
            </div>
          ) : (
            <UserManagementTable
              users={filteredUsers}
              removingContentUserId={removingContentUserId}
              onBlockUser={handleBlockUser}
              onRemoveContent={handleRemoveContent}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
