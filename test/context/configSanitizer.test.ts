import { strict as assert } from "assert";
import { mergeYamlIntoConfig, sanitizeRuntimeConfig } from "../../src/utils/configSanitizer";
import { RuntimeConfig } from "../../src/context/types";

const baseConfig: RuntimeConfig = {
  enabled: true,
  maxChunks: 5,
  maxTokens: 1200,
  scanPaths: ["docs", "adr"],
  alwaysInclude: ["docs/architecture.md"],
  excludePaths: [],
  indexOnStartup: true,
  principles: ["Keep modules small and testable."],
  glossary: { DDD: "Domain-driven design" }
};

describe("configSanitizer", () => {
  it("normalizes numeric limits and path traversal in runtime config", () => {
    const sanitized = sanitizeRuntimeConfig({
      ...baseConfig,
      maxChunks: 999,
      maxTokens: 10,
      scanPaths: ["docs", "../private"],
      alwaysInclude: ["docs/architecture.md", "../secret.md"],
      excludePaths: ["node_modules", "../../"],
      glossary: Object.assign(Object.create(null), { "  TERM  ": "  value  " })
    });

    assert.equal(sanitized.maxChunks, 20);
    assert.equal(sanitized.maxTokens, 200);
    assert.deepEqual(sanitized.scanPaths, ["docs"]);
    assert.deepEqual(sanitized.alwaysInclude, ["docs/architecture.md"]);
    assert.deepEqual(sanitized.excludePaths, ["node_modules"]);
    assert.equal(sanitized.glossary.TERM, "value");
  });

  it("merges yaml overrides while keeping malicious values out", () => {
    const merged = mergeYamlIntoConfig(baseConfig, {
      principles: ["Use deterministic interfaces"],
      glossary: { "": "nope", SAFE: "term" },
      alwaysInclude: ["docs/guide.md", "../pwds"],
      exclude: [".git", "../../etc"]
    });

    assert.deepEqual(merged.principles, ["Use deterministic interfaces"]);
    assert.deepEqual(merged.alwaysInclude, ["docs/guide.md"]);
    assert.deepEqual(merged.excludePaths, [".git"]);
    assert.equal(merged.glossary.SAFE, "term");
  });
});
