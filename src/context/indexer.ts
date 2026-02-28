import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { chunkSection } from "./chunker";
import { ContextChunk, ContextIndex, IndexManifest, RuntimeConfig, TeamContextYaml } from "./types";
import { splitMarkdownByHeading } from "../utils/markdownToText";
import { scanContextFiles } from "../utils/fsScan";
import { tokenizeKeywords } from "../utils/tokenizer";
import { ContextStorage } from "./storage";

const MAX_FILE_BYTES = 500_000;

export class ContextIndexer {
  public constructor(
    private readonly storage: ContextStorage,
    private readonly output: vscode.OutputChannel
  ) {}

  public async loadIndex(): Promise<ContextIndex | undefined> {
    return this.storage.load();
  }

  public async indexWorkspace(config: RuntimeConfig): Promise<{ index: ContextIndex; config: RuntimeConfig }> {
    const files = await scanContextFiles(config.scanPaths, config.excludePaths);
    const chunks: ContextChunk[] = [];
    const sourceUpdates: Record<string, number> = {};
    let yamlData: TeamContextYaml | undefined;

    for (const file of files) {
      try {
        const stat = await vscode.workspace.fs.stat(file);
        if (stat.size > MAX_FILE_BYTES) {
          this.output.appendLine(`Skipping huge file: ${file.fsPath}`);
          continue;
        }

        const relative = vscode.workspace.asRelativePath(file, false);
        const bytes = await vscode.workspace.fs.readFile(file);
        const content = Buffer.from(bytes).toString("utf8");

        if (relative.endsWith("team-context.yaml")) {
          yamlData = yaml.load(content) as TeamContextYaml;
          continue;
        }

        const sections = splitMarkdownByHeading(content);
        for (const section of sections) {
          chunks.push(...chunkSection(relative, section.title, section.content, stat.mtime));
        }

        sourceUpdates[relative] = stat.mtime;
      } catch (error) {
        this.output.appendLine(`Unable to index ${file.fsPath}: ${String(error)}`);
      }
    }

    const mergedConfig: RuntimeConfig = {
      ...config,
      principles: yamlData?.principles ?? config.principles,
      glossary: yamlData?.glossary ?? config.glossary,
      alwaysInclude: yamlData?.alwaysInclude ?? config.alwaysInclude,
      excludePaths: yamlData?.exclude ?? config.excludePaths
    };

    const keywordIndex: Record<string, string[]> = Object.create(null) as Record<string, string[]>;
    for (const chunk of chunks) {
      const terms = new Set(tokenizeKeywords(`${chunk.title} ${chunk.text.slice(0, 1000)} ${chunk.source}`));
      for (const term of terms) {
        if (!Array.isArray(keywordIndex[term])) {
          keywordIndex[term] = [];
        }
        keywordIndex[term].push(chunk.id);
      }
    }

    const manifest: IndexManifest = {
      version: 1,
      indexedAt: Date.now(),
      chunkCount: chunks.length,
      sources: sourceUpdates
    };

    await this.storage.save(manifest, chunks, keywordIndex);
    this.output.appendLine(`Indexed ${chunks.length} chunks from ${Object.keys(sourceUpdates).length} files.`);

    return {
      index: { manifest, chunks, keywordIndex },
      config: mergedConfig
    };
  }
}
