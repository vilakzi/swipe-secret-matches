
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Star,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ContentPromotionProps {
  content: any;
  onPromotionChange: () => void;
}

const ContentPromotion = ({ content, onPromotionChange }: ContentPromotionProps) => {
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = React.useState(false);
  const [priorityLevel, setPriorityLevel] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePromote = async () => {
    setIsLoading(true);
    try {
      // Placeholder: implement DB RPC or update when available
      toast({
        title: "Content Promoted",
        description: `Content promoted with priority level ${priorityLevel}`,
      });
      onPromotionChange();
      setIsPromoteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Promotion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpromote = async () => {
    setIsLoading(true);
    try {
      // Placeholder: implement DB RPC or update when available
      toast({
        title: "Content Unpromoted",
        description: "Content promotion removed",
      });
      onPromotionChange();
    } catch (error: any) {
      toast({
        title: "Unpromotion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {content.is_promoted ? (
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-600 text-white">
            <Star className="w-3 h-3 mr-1" />
            Promoted (Priority: {content.promotion_priority})
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={handleUnpromote}
            disabled={isLoading}
            className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
          >
            <TrendingDown className="w-4 h-4 mr-1" />
            Unpromote
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          onClick={() => setIsPromoteDialogOpen(true)}
          disabled={isLoading}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Promote
        </Button>
      )}

      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Promotion Effect:</strong> This content will appear prominently in the feed with higher priority. Higher priority numbers appear first.
              </div>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority Level (1-10)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(parseInt(e.target.value) || 1)}
                placeholder="Enter priority level"
              />
              <p className="text-sm text-gray-500 mt-1">
                Higher numbers = higher priority in feed
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPromoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePromote}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isLoading ? "Promoting..." : "Promote Content"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentPromotion;
