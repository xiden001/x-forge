import { strict as assert } from "assert";
import { chunkSection } from "../../src/context/chunker";

describe("chunkSection", () => {
  it("creates at least one chunk with metadata", () => {
    const text = Array.from({ length: 2500 }, (_, i) => `word${i}`).join(" ");
    const chunks = chunkSection("docs/architecture.md", "Architecture", text, Date.now());

    assert.ok(chunks.length >= 1);
    assert.equal(chunks[0].source, "docs/architecture.md");
    assert.equal(chunks[0].title, "Architecture");
    assert.ok(chunks[0].snippet.length > 0);
  });
});
