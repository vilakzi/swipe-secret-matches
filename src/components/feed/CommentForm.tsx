
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface CommentFormProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  submitting: boolean;
}

const CommentForm = ({ value, onChange, onSubmit, disabled, submitting }: CommentFormProps) => (
  <form onSubmit={onSubmit} className="flex space-x-2">
    <Input
      value={value}
      onChange={onChange}
      placeholder="Write a comment..."
      className="flex-1 bg-gray-700 border-gray-600 text-white"
      disabled={disabled}
    />
    <Button
      type="submit"
      size="sm"
      disabled={!value.trim() || disabled}
      className="bg-purple-600 hover:bg-purple-700"
    >
      {submitting ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
    </Button>
  </form>
);

export default CommentForm;
