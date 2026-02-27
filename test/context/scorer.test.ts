import { strict as assert } from "assert";
import { scoreChunk } from "../../src/context/scorer";
import { ContextChunk, RetrievalSignals } from "../../src/context/types";

describe("scoreChunk", () => {
  it("scores relevant chunks higher", () => {
    const relevant: ContextChunk = {
      id: "1",
      title: "Payment Service Guidelines",
      source: "docs/payments.md",
      text: "Use PSP adapters and SKU validation in payment services.",
      snippet: "Use PSP adapters...",
      tags: ["payment"],
      lastUpdated: Date.now()
    };

    const irrelevant: ContextChunk = {
      ...relevant,
      id: "2",
      title: "Frontend color palette",
      source: "docs/ui.md",
      text: "Blue green red",
      tags: ["css"]
    };

    const signals: RetrievalSignals = {
      prompt: "Refactor payment PSP adapter",
      filePath: "src/payments/service.ts",
      language: "typescript",
      selection: "function createCharge() {}",
      filenameKeywords: ["service", "payment"]
    };

    assert.ok(scoreChunk(relevant, signals) > scoreChunk(irrelevant, signals));
  });
});
