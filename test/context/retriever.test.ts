import { strict as assert } from "assert";
import { ContextRetriever } from "../../src/context/retriever";
import { ContextChunk, ContextIndex, RetrievalSignals, RuntimeConfig } from "../../src/context/types";

const baseConfig: RuntimeConfig = {
  enabled: true,
  maxChunks: 5,
  maxTokens: 1200,
  maxCandidateChunks: 2000,
  confirmBeforeClipboardWrite: true,
  scanPaths: ["docs"],
  alwaysInclude: [],
  excludePaths: [],
  indexOnStartup: true,
  principles: [],
  glossary: {}
};

const baseSignals: RetrievalSignals = {
  prompt: "how to harden __proto__ handling",
  filePath: "src/index.ts",
  language: "typescript",
  selection: "",
  filenameKeywords: ["index"]
};

describe("ContextRetriever", () => {
  it("ignores non-array keyword index entries like __proto__ without throwing", () => {
    const chunk: ContextChunk = {
      id: "c1",
      title: "Prototype Safety",
      source: "docs/safety.md",
      text: "Use safe dictionaries when indexing untrusted tokens.",
      snippet: "Use safe dictionaries...",
      tags: [],
      lastUpdated: Date.now()
    };

    const index: ContextIndex = {
      manifest: {
        version: 1,
        indexedAt: Date.now(),
        chunkCount: 1,
        sources: { "docs/safety.md": Date.now() }
      },
      chunks: [chunk],
      keywordIndex: {
        __proto__: {} as unknown as string[]
      }
    };

    const retriever = new ContextRetriever();
    const result = retriever.retrieve(index, baseConfig, baseSignals);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].chunk.id, "c1");
  });

  it("caps fallback candidate scoring when there are no keyword matches", () => {
    const chunks: ContextChunk[] = [
      {
        id: "a",
        title: "A",
        source: "docs/a.md",
        text: "alpha",
        snippet: "alpha",
        tags: [],
        lastUpdated: Date.now()
      },
      {
        id: "b",
        title: "B",
        source: "docs/b.md",
        text: "beta",
        snippet: "beta",
        tags: [],
        lastUpdated: Date.now()
      },
      {
        id: "c",
        title: "C",
        source: "docs/c.md",
        text: "gamma",
        snippet: "gamma",
        tags: [],
        lastUpdated: Date.now()
      }
    ];

    const index: ContextIndex = {
      manifest: {
        version: 1,
        indexedAt: Date.now(),
        chunkCount: chunks.length,
        sources: { "docs/a.md": 1, "docs/b.md": 1, "docs/c.md": 1 }
      },
      chunks,
      keywordIndex: Object.create(null) as Record<string, string[]>
    };

    const retriever = new ContextRetriever();
    const result = retriever.retrieve(
      index,
      {
        ...baseConfig,
        maxCandidateChunks: 2,
        maxChunks: 3,
        maxTokens: 800
      },
      {
        ...baseSignals,
        prompt: "zzzz-no-match-token"
      }
    );

    assert.equal(result.length, 2);
    assert.deepEqual(result.map((entry) => entry.chunk.id), ["a", "b"]);
  });
});
