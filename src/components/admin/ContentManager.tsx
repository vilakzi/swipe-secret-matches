
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminContent, AdminContent } from '@/hooks/useAdminContent';
import ContentGrid from './ContentGrid';
import ContentEditDialog from './ContentEditDialog';

const ContentManager = () => {
  const { content, loading, updateContent, deleteContent, refetch } = useAdminContent();
  const [editingContent, setEditingContent] = React.useState<AdminContent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

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

  const handleContentChange = (updatedContent: AdminContent) => {
    setEditingContent(updatedContent);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingContent(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading content...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
      </CardHeader>
      <CardContent>
        <ContentGrid
          content={content}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onPromotionChange={refetch}
        />
        
        <ContentEditDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          editingContent={editingContent}
          onContentChange={handleContentChange}
          onSave={handleSaveEdit}
        />
      </CardContent>
    </Card>
  );
};

export default ContentManager;
