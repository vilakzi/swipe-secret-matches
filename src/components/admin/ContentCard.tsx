
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { AdminContent } from '@/hooks/useAdminContent';
import ContentPromotion from './ContentPromotion';

interface ContentCardProps {
  item: AdminContent;
  onEdit: (item: AdminContent) => void;
  onDelete: (id: string) => void;
  onPublish: (item: AdminContent) => void;
  onPromotionChange: () => void;
}

const ContentCard = ({ item, onEdit, onDelete, onPublish, onPromotionChange }: ContentCardProps) => {
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

  return (
    <div className="border rounded-lg overflow-hidden relative">
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
            onPromotionChange={onPromotionChange}
          />
        </div>
        
        {/* Actions */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(item)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          {item.status === 'draft' && (
            <Button
              size="sm"
              onClick={() => onPublish(item)}
              className="bg-green-600 hover:bg-green-700"
            >
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
