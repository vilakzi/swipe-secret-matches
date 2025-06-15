
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <label className="text-sm font-medium" htmlFor="content-title">Title</label>
        <Input
          id="content-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Content title (optional - uses filename if empty)"
          aria-label="Content Title"
        />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="content-category">Category</label>
        <Select value={category} onValueChange={setCategory as any}>
          <SelectTrigger id="content-category" aria-label="Category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} aria-label={cat.label}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <label className="text-sm font-medium" htmlFor="content-description">Description</label>
      <Textarea
        id="content-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Content description..."
        rows={3}
        aria-label="Content Description"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium" htmlFor="content-tags">Tags (comma-separated)</label>
        <Input
          id="content-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="trending, viral, featured..."
          aria-label="Content Tags"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="content-schedule">
          Schedule Publication (optional)
        </label>
        <Input
          type="datetime-local"
          id="content-schedule"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          aria-label="Schedule Publication Date"
        />
      </div>
    </div>
  </div>
);

export default EnhancedContentUploadForm;

