
import React from "react";
import {
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { ContentCategory } from "@/hooks/useEnhancedAdminContent";

interface EnhancedContentUploadFormProps {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  category: ContentCategory;
  setCategory: (v: ContentCategory) => void;
  tags: string;
  setTags: (v: string) => void;
  scheduledDate: string;
  setScheduledDate: (v: string) => void;
  CONTENT_CATEGORIES: { value: ContentCategory; label: string }[];
}

const EnhancedContentUploadForm = ({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  tags,
  setTags,
  scheduledDate,
  setScheduledDate,
  CONTENT_CATEGORIES,
}: EnhancedContentUploadFormProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Content title (optional - uses filename if empty)"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <Select value={category} onValueChange={setCategory as any}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <label className="text-sm font-medium">Description</label>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Content description..."
        rows={3}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Tags (comma-separated)</label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="trending, viral, featured..."
        />
      </div>
      <div>
        <label className="text-sm font-medium">Schedule Publication (optional)</label>
        <Input
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
        />
      </div>
    </div>
  </div>
);

export default EnhancedContentUploadForm;
