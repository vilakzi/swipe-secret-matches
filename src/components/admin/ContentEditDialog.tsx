
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AdminContent } from '@/hooks/useAdminContent';

interface ContentEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingContent: AdminContent | null;
  onContentChange: (content: AdminContent) => void;
  onSave: () => void;
}

const ContentEditDialog = ({ 
  isOpen, 
  onClose, 
  editingContent, 
  onContentChange, 
  onSave 
}: ContentEditDialogProps) => {
  if (!editingContent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editingContent.title}
              onChange={(e) => onContentChange({
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
              onChange={(e) => onContentChange({
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
                onValueChange={(value) => onContentChange({
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
                onValueChange={(value) => onContentChange({
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
                onChange={(e) => onContentChange({
                  ...editingContent,
                  scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : undefined
                })}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={onSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentEditDialog;
