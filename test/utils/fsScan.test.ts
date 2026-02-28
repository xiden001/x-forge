import { strict as assert } from "assert";
import { shouldIncludeRelativePath } from "../../src/utils/contextPathFilter";

describe("shouldIncludeRelativePath", () => {
  it("includes root README/CONTRIBUTING and team-context.yaml", () => {
    assert.equal(shouldIncludeRelativePath("README.md", ["docs", "adr"]), true);
    assert.equal(shouldIncludeRelativePath("CONTRIBUTING.md", ["docs", "adr"]), true);
    assert.equal(shouldIncludeRelativePath("team-context.yaml", ["docs", "adr"]), true);
  });

  it("includes only files under configured scan roots", () => {
    assert.equal(shouldIncludeRelativePath("docs/architecture.md", ["docs", "adr"]), true);
    assert.equal(shouldIncludeRelativePath("adr/0001.md", ["docs", "adr"]), true);
    assert.equal(shouldIncludeRelativePath("node_modules/pkg/docs/guide.md", ["docs", "adr"]), false);
    assert.equal(shouldIncludeRelativePath("vendor/docs/guide.md", ["docs", "adr"]), false);
    assert.equal(shouldIncludeRelativePath("src/index.ts", ["docs", "adr"]), false);
  });

  it("supports custom scan roots", () => {
    assert.equal(shouldIncludeRelativePath("knowledge/guide.md", ["knowledge"]), true);
    assert.equal(shouldIncludeRelativePath("docs/guide.md", ["knowledge"]), false);
  });
});
