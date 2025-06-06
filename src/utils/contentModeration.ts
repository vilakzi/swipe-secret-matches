
// Content moderation utilities
export const moderateContent = (content: string): { isAllowed: boolean; reason?: string } => {
  if (!content || content.trim().length === 0) {
    return { isAllowed: false, reason: 'Content cannot be empty' };
  }

  // Check content length
  if (content.length > 5000) {
    return { isAllowed: false, reason: 'Content too long' };
  }

  // Basic spam detection
  const spamPatterns = [
    /(.)\1{10,}/i, // Repeated characters
    /http[s]?:\/\/[^\s]{3,}/gi, // Multiple URLs
    /\b(buy now|click here|free money|guaranteed|winner)\b/gi, // Spam words
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return { isAllowed: false, reason: 'Content appears to be spam' };
    }
  }

  // Check for excessive capitalization
  const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (upperCaseRatio > 0.5 && content.length > 20) {
    return { isAllowed: false, reason: 'Excessive capitalization detected' };
  }

  return { isAllowed: true };
};

export const filterProfanity = (text: string): string => {
  // Basic profanity filter - in production, use a more comprehensive solution
  const profanityList = ['badword1', 'badword2']; // Add actual words as needed
  
  let filteredText = text;
  profanityList.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });
  
  return filteredText;
};
