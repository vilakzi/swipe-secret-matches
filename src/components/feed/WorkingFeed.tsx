
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileOptimizedFeed from './MobileOptimizedFeed';

const WorkingFeed = () => {
  const isMobile = useIsMobile();
  
  // Use mobile-optimized feed for better performance
  return <MobileOptimizedFeed />;
};

export default WorkingFeed;
