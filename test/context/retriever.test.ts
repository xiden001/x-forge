import { strict as assert } from "assert";
import { ContextRetriever } from "../../src/context/retriever";
import { ContextChunk, ContextIndex, RetrievalSignals, RuntimeConfig } from "../../src/context/types";

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
        // Simulates polluted/legacy data where a key resolves to non-array.
        __proto__: {} as unknown as string[]
      }
    };

    const config: RuntimeConfig = {
      enabled: true,
      maxChunks: 5,
      maxTokens: 1200,
      scanPaths: ["docs"],
      alwaysInclude: [],
      excludePaths: [],
      indexOnStartup: true,
      principles: [],
      glossary: {}
    };

    const signals: RetrievalSignals = {
      prompt: "how to harden __proto__ handling",
      filePath: "src/index.ts",
      language: "typescript",
      selection: "",
      filenameKeywords: ["index"]
    };

    const retriever = new ContextRetriever();
    const result = retriever.retrieve(index, config, signals);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].chunk.id, "c1");
  });
});
