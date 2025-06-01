
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface ProfileEditorHeaderProps {
  onSave: () => void;
  onCancel: () => void;
}

const ProfileEditorHeader = ({ onSave, onCancel }: ProfileEditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} className="bg-purple-600 hover:bg-purple-700">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditorHeader;
