import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Globe,
  Lock,
  Users,
  Image,
  Video,
  Star
} from 'lucide-react';
import { useAdminContent, AdminContent } from '@/hooks/useAdminContent';
import ContentPromotion from './ContentPromotion';

const ContentManager = () => {
  const { content, loading, updateContent, deleteContent, refetch } = useAdminContent();
  const [editingContent, setEditingContent] = useState<AdminContent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <Globe className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'archived': return <Lock className="w-4 h-4" />;
      default: return <Edit className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'draft': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'restricted': return <Users className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const handleEdit = (item: AdminContent) => {
    setEditingContent(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingContent) return;
    try {
      await updateContent(editingContent.id, editingContent);
    } catch (error) {
      console.error("Failed to update content", error);
    } finally {
      setIsEditDialogOpen(false);
      setEditingContent(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteContent(id);
      } catch (error) {
        console.error("Failed to delete content", error);
      }
    }
  };

  const handlePublish = async (item: AdminContent) => {
    try {
      await updateContent(item.id, {
        status: 'published',
        published_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to publish content", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading content...</div>;
  }

  // Sort content by promotion priority first, then by created date
  const sortedContent = [...content].sort((a, b) => {
    if (a.is_promoted && !b.is_promoted) return -1;
    if (!a.is_promoted && b.is_promoted) return 1;
    if (a.is_promoted && b.is_promoted) {
      return (b.promotion_priority || 0) - (a.promotion_priority || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedContent.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden relative">
              {/* Promotion indicator */}
              {item.is_promoted && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-yellow-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Priority {item.promotion_priority}
                  </Badge>
                </div>
              )}
              
              {/* Content Preview */}
              <div className="aspect-video bg-gray-100 relative">
                {item.content_type === 'image' ? (
                  <img
                    src={item.file_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.file_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={`${getStatusColor(item.status)} text-white`}>
                    {getStatusIcon(item.status)}
                    <span className="ml-1 capitalize">{item.status}</span>
                  </Badge>
                </div>
                {/* Content Type Badge */}
                {!item.is_promoted && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      {item.content_type === 'image' ? (
                        <Image className="w-3 h-3 mr-1" />
                      ) : (
                        <Video className="w-3 h-3 mr-1" />
                      )}
                      {item.content_type}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Content Info */}
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2 truncate">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {item.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    {getVisibilityIcon(item.visibility)}
                    {item.visibility}
                  </span>
                </div>

                {/* Promotion Controls */}
                <div className="mb-3">
                  <ContentPromotion 
                    content={item} 
                    onPromotionChange={refetch}
                  />
                </div>
                
                {/* Actions */}
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {item.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(item)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Edit Dialog - keep existing code the same */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
            </DialogHeader>
            {editingContent && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editingContent.title}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      title: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingContent.description || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      description: e.target.value
                    })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editingContent.status}
                      onValueChange={(value) => setEditingContent({
                        ...editingContent,
                        status: value as AdminContent['status']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select
                      value={editingContent.visibility}
                      onValueChange={(value) => setEditingContent({
                        ...editingContent,
                        visibility: value as AdminContent['visibility']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editingContent.status === 'scheduled' && (
                  <div>
                    <Label htmlFor="scheduled_at">Scheduled Date</Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={editingContent.scheduled_at ? 
                        new Date(editingContent.scheduled_at).toISOString().slice(0, 16) : ''
                      }
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : undefined
                      })}
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ContentManager;
