import { ContextChunk } from "./types";
import { approximateTokenCount, tokenizeKeywords } from "../utils/tokenizer";

const MIN_TOKENS = 400;
const MAX_TOKENS = 800;

const createId = (source: string, title: string, idx: number): string => `${source}::${title}::${idx}`;

export const chunkSection = (
  source: string,
  title: string,
  text: string,
  lastUpdated: number
): ContextChunk[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: ContextChunk[] = [];
  let pointer = 0;
  let idx = 0;

  while (pointer < words.length) {
    let size = 0;
    const chunkWords: string[] = [];

    while (pointer < words.length && size < MAX_TOKENS) {
      const candidate = words[pointer];
      const candidateTokens = approximateTokenCount(candidate + " ");

      if (size + candidateTokens > MAX_TOKENS && size >= MIN_TOKENS) {
        break;
      }

      chunkWords.push(candidate);
      size += candidateTokens;
      pointer += 1;
    }

    if (!chunkWords.length) {
      break;
    }

    const chunkText = chunkWords.join(" ");
    chunks.push({
      id: createId(source, title, idx),
      title,
      source,
      text: chunkText,
      snippet: `${chunkText.slice(0, 240)}${chunkText.length > 240 ? "..." : ""}`,
      tags: tokenizeKeywords(`${source} ${title}`).slice(0, 15),
      lastUpdated
    });

    idx += 1;
  }

  return chunks;
};
