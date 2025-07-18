
import React, { useEffect, useRef } from 'react';

interface PostCardEngagementProps {
  itemId: string;
  engagementTracker?: any;
  children: React.ReactNode;
}

const PostCardEngagement = ({ itemId, engagementTracker, children }: PostCardEngagementProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const viewTrackedRef = useRef(false);

  // Mobile-optimized engagement tracking
  useEffect(() => {
    if (!engagementTracker || viewTrackedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            // Lower threshold for mobile
            if (!viewTrackedRef.current) {
              engagementTracker.trackItemView(itemId);
              viewTrackedRef.current = true;
            }
          } else if (viewTrackedRef.current) {
            engagementTracker.trackItemViewEnd(itemId);
          }
        });
      },
      { threshold: [0.3, 0.7] } // Multiple thresholds for better mobile detection
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
      if (viewTrackedRef.current) {
        engagementTracker.trackItemViewEnd(itemId);
      }
    };
  }, [itemId, engagementTracker]);

  return (
    <div ref={cardRef}>
      {children}
    </div>
  );
};

export default PostCardEngagement;
