export interface ContextChunk {
  id: string;
  title: string;
  source: string;
  text: string;
  snippet: string;
  tags: string[];
  lastUpdated: number;
}

export interface IndexManifest {
  version: number;
  indexedAt: number;
  chunkCount: number;
  sources: Record<string, number>;
}

export interface TeamContextYaml {
  principles?: string[];
  glossary?: Record<string, string>;
  alwaysInclude?: string[];
  exclude?: string[];
}

export interface RuntimeConfig {
  enabled: boolean;
  maxChunks: number;
  maxTokens: number;
  scanPaths: string[];
  alwaysInclude: string[];
  excludePaths: string[];
  indexOnStartup: boolean;
  maxCandidateChunks: number;
  confirmBeforeClipboardWrite: boolean;
  principles: string[];
  glossary: Record<string, string>;
}

export interface RetrievalSignals {
  prompt: string;
  filePath: string;
  language: string;
  selection: string;
  filenameKeywords: string[];
}

export interface RetrievedChunk {
  chunk: ContextChunk;
  score: number;
  pinned: boolean;
}

export interface ContextIndex {
  manifest: IndexManifest;
  chunks: ContextChunk[];
  keywordIndex: Record<string, string[]>;
}
