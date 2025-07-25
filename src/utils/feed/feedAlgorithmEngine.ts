import { FeedItem, ContentScore } from '@/components/feed/types/feedTypes';

export interface AlgorithmConfig {
  recencyWeight: number;
  engagementWeight: number;
  diversityWeight: number;
  userActivityWeight: number;
  adminBoostMultiplier: number;
  freshContentBoostHours: number;
}

const DEFAULT_CONFIG: AlgorithmConfig = {
  recencyWeight: 0.3,
  engagementWeight: 0.4,
  diversityWeight: 0.15,
  userActivityWeight: 0.15,
  adminBoostMultiplier: 2.5,
  freshContentBoostHours: 6
};

export class FeedAlgorithmEngine {
  private config: AlgorithmConfig;
  private seenContent: Set<string> = new Set();
  private contentTypeHistory: string[] = [];
  private sessionStartTime: number = Date.now();

  constructor(config: AlgorithmConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  public scoreContent(items: FeedItem[]): FeedItem[] {
    const now = Date.now();
    
    return items.map(item => {
      const score = this.calculateContentScore(item, now);
      return { ...item, algorithmScore: score };
    });
  }

  public rankContent(items: FeedItem[]): FeedItem[] {
    // Anti-staleness: Remove content seen in current session
    const unseenItems = items.filter(item => !this.seenContent.has(item.id));
    
    // Sort by total score (descending) - handle both number and ContentScore types
    const ranked = unseenItems.sort((a, b) => {
      const aScore = typeof a.algorithmScore === 'object' ? a.algorithmScore.totalScore : (a.algorithmScore || 0);
      const bScore = typeof b.algorithmScore === 'object' ? b.algorithmScore.totalScore : (b.algorithmScore || 0);
      return bScore - aScore;
    });
    
    // Apply diversity mixing
    const diverseMix = this.applyDiversityMixing(ranked);
    
    // Mark content as seen
    diverseMix.forEach(item => this.seenContent.add(item.id));
    
    return diverseMix;
  }

  private calculateContentScore(item: FeedItem, now: number): ContentScore {
    const recencyScore = this.calculateRecencyScore(item, now);
    const engagementScore = this.calculateEngagementScore(item);
    const diversityScore = this.calculateDiversityScore(item);
    const userActivityScore = this.calculateUserActivityScore(item);

    // Apply admin boost - check if profile has admin role or if it's an admin post
    const isAdminContent = item.profile.role === 'admin' || 
                          item.profile.userType === 'admin' ||
                          (item.type === 'post' && item.profile.role === 'admin');
    const adminMultiplier = isAdminContent ? this.config.adminBoostMultiplier : 1;

    const totalScore = (
      recencyScore * this.config.recencyWeight +
      engagementScore * this.config.engagementWeight +
      diversityScore * this.config.diversityWeight +
      userActivityScore * this.config.userActivityWeight
    ) * adminMultiplier;

    return {
      recencyScore,
      engagementScore,
      diversityScore,
      userActivityScore,
      totalScore
    };
  }

  private calculateRecencyScore(item: FeedItem, now: number): number {
    // For posts, use the post creation time if available, otherwise use profile join date
    let contentTime = now;
    if (item.type === 'post' && (item as any).createdAt) {
      contentTime = new Date((item as any).createdAt).getTime();
    } else if (item.profile.joinDate) {
      contentTime = new Date(item.profile.joinDate).getTime();
    }
    
    const ageHours = (now - contentTime) / (1000 * 60 * 60);
    
    // Fresh content boost (within configured hours)
    if (ageHours <= this.config.freshContentBoostHours) {
      return 1.0;
    }
    
    // Exponential decay: score decreases as content gets older
    return Math.max(0.1, Math.exp(-ageHours / 24)); // Decay over 24 hours
  }

  private calculateEngagementScore(item: FeedItem): number {
    // Mock engagement data - in real implementation, this would come from database
    const baseEngagement = Math.random() * 0.5 + 0.25; // 0.25-0.75 base score
    
    // Boost for admin content
    const isAdminContent = item.profile.role === 'admin' || 
                          item.profile.userType === 'admin' ||
                          (item.type === 'post' && item.profile.role === 'admin');
    if (isAdminContent) {
      return Math.min(1.0, baseEngagement * 1.5);
    }
    
    return baseEngagement;
  }

  private calculateDiversityScore(item: FeedItem): number {
    const contentType = item.type === 'post' ? 'post' : 'profile';
    const recentTypes = this.contentTypeHistory.slice(-5);
    
    // Boost score if content type is different from recent items
    const typeFrequency = recentTypes.filter(type => type === contentType).length;
    return Math.max(0.2, 1.0 - (typeFrequency * 0.2));
  }

  private calculateUserActivityScore(item: FeedItem): number {
    // Score based on user activity and profile completeness
    const hasWhatsapp = item.profile.whatsapp && item.profile.whatsapp.length > 0;
    const hasBio = item.profile.bio && item.profile.bio.length > 10;
    const isServiceProvider = item.profile.userType === 'service_provider';
    
    let score = 0.5; // Base score
    if (hasWhatsapp) score += 0.2;
    if (hasBio) score += 0.2;
    if (isServiceProvider) score += 0.1;
    
    return Math.min(1.0, score);
  }

  private applyDiversityMixing(items: FeedItem[]): FeedItem[] {
    const mixed: FeedItem[] = [];
    const posts = items.filter(item => item.type === 'post');
    const profiles = items.filter(item => item.type === 'profile');
    
    // Interleave posts and profiles for diversity
    const maxLength = Math.max(posts.length, profiles.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < posts.length) {
        mixed.push(posts[i]);
        this.contentTypeHistory.push('post');
      }
      if (i < profiles.length) {
        mixed.push(profiles[i]);
        this.contentTypeHistory.push('profile');
      }
    }
    
    // Keep history manageable
    if (this.contentTypeHistory.length > 20) {
      this.contentTypeHistory = this.contentTypeHistory.slice(-10);
    }
    
    return mixed;
  }

  public resetSession(): void {
    this.seenContent.clear();
    this.contentTypeHistory = [];
    this.sessionStartTime = Date.now();
  }

  public getSessionStats() {
    return {
      seenContentCount: this.seenContent.size,
      sessionDuration: Date.now() - this.sessionStartTime,
      contentTypeHistory: [...this.contentTypeHistory]
    };
  }
}
