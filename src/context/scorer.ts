import { ContextChunk, RetrievalSignals } from "./types";
import { tokenizeKeywords } from "../utils/tokenizer";

const overlapScore = (a: string[], b: string[]): number => {
  if (!a.length || !b.length) {
    return 0;
  }

  const bSet = new Set(b);
  let overlap = 0;
  for (const token of a) {
    if (bSet.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(a.length, 1);
};

export const semanticScoreStub = (_chunk: ContextChunk, _signals: RetrievalSignals): number => {
  return 0;
};

export const scoreChunk = (chunk: ContextChunk, signals: RetrievalSignals): number => {
  const pathTokens = tokenizeKeywords(signals.filePath);
  const promptTokens = tokenizeKeywords(`${signals.prompt} ${signals.selection}`);
  const titleTokens = tokenizeKeywords(chunk.title);
  const sourceTokens = tokenizeKeywords(chunk.source);
  const chunkTokens = tokenizeKeywords(`${chunk.text.slice(0, 500)} ${chunk.tags.join(" ")}`);

  const filenameAffinity = overlapScore(sourceTokens, pathTokens) * 2.2;
  const keywordOverlap = overlapScore(chunkTokens, promptTokens) * 4;
  const headingMatch = overlapScore(titleTokens, promptTokens) * 2;
  const languageMatch = chunkTokens.includes(signals.language.toLowerCase()) ? 0.5 : 0;

  return filenameAffinity + keywordOverlap + headingMatch + languageMatch + semanticScoreStub(chunk, signals);
};
