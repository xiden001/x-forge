import { RetrievedChunk, RetrievalSignals, RuntimeConfig, ContextIndex } from "./types";
import { scoreChunk } from "./scorer";
import { approximateTokenCount, tokenizeKeywords, truncateToTokenBudget } from "../utils/tokenizer";

const byScoreDesc = (a: RetrievedChunk, b: RetrievedChunk): number => b.score - a.score;

export class ContextRetriever {
  public retrieve(index: ContextIndex, config: RuntimeConfig, signals: RetrievalSignals): RetrievedChunk[] {
    const result: RetrievedChunk[] = [];
    const pinnedSources = new Set(config.alwaysInclude);

    const fastCandidates = this.fastCandidateFilter(index, signals);

    for (const chunk of fastCandidates) {
      const pinned = pinnedSources.has(chunk.source);
      const score = scoreChunk(chunk, signals) + (pinned ? 10 : 0);
      result.push({ chunk, score, pinned });
    }

    const sorted = result.sort(byScoreDesc).slice(0, config.maxChunks * 4);
    const top = this.enforceTokenBudget(sorted, config.maxChunks, config.maxTokens);

    return top;
  }

  private fastCandidateFilter(index: ContextIndex, signals: RetrievalSignals) {
    const tokens = tokenizeKeywords(`${signals.prompt} ${signals.filePath} ${signals.selection} ${signals.filenameKeywords.join(" ")}`);
    const candidateIds = new Set<string>();

    for (const token of tokens) {
      const ids = index.keywordIndex[token];
      if (!Array.isArray(ids)) {
        continue;
      }
      ids.forEach((id) => candidateIds.add(id));
    }

    if (!candidateIds.size) {
      return index.chunks;
    }

    const idSet = candidateIds;
    return index.chunks.filter((chunk) => idSet.has(chunk.id));
  }

  private enforceTokenBudget(chunks: RetrievedChunk[], maxChunks: number, maxTokens: number): RetrievedChunk[] {
    const result: RetrievedChunk[] = [];
    let used = 0;

    for (const item of chunks) {
      if (result.length >= maxChunks) {
        break;
      }

      const tokens = approximateTokenCount(item.chunk.text);
      if (used + tokens > maxTokens) {
        const remaining = Math.max(maxTokens - used, 60);
        const trimmedText = truncateToTokenBudget(item.chunk.text, remaining);
        result.push({
          ...item,
          chunk: {
            ...item.chunk,
            text: trimmedText,
            snippet: truncateToTokenBudget(item.chunk.snippet, Math.max(remaining / 2, 30))
          }
        });
        break;
      }

      result.push(item);
      used += tokens;
    }

    return result;
  }
}
