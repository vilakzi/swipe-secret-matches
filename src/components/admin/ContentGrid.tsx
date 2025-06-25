
import React from 'react';
import { AdminContent } from '@/hooks/useAdminContent';
import ContentCard from './ContentCard';

interface ContentGridProps {
  content: AdminContent[];
  onEdit: (item: AdminContent) => void;
  onDelete: (id: string) => void;
  onPublish: (item: AdminContent) => void;
  onPromotionChange: () => void;
}

const ContentGrid = ({ content, onEdit, onDelete, onPublish, onPromotionChange }: ContentGridProps) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedContent.map((item) => (
        <ContentCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onPublish={onPublish}
          onPromotionChange={onPromotionChange}
        />
      ))}
    </div>
  );
};

export default ContentGrid;
