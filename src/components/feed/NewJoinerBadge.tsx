
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface NewJoinerBadgeProps {
  isNewJoiner?: boolean;
}

const NewJoinerBadge = ({ isNewJoiner }: NewJoinerBadgeProps) => {
  const { isAdmin } = useUserRole();
  
  // Only show to admins for monitoring purposes
  if (!isNewJoiner || !isAdmin) return null;

  return (
    <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
      <Sparkles className="w-3 h-3 mr-1" />
      New Joiner
    </div>
  );
};

export default NewJoinerBadge;
