export const approximateTokenCount = (text: string): number => {
  if (!text.trim()) {
    return 0;
  }

  return Math.ceil(text.length / 4);
};

export const truncateToTokenBudget = (text: string, maxTokens: number): string => {
  if (maxTokens <= 0) {
    return "";
  }

  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars - 3)}...`;
};

export const tokenizeKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_\-/\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
};
