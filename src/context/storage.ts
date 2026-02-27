import * as vscode from "vscode";
import { ContextChunk, ContextIndex, IndexManifest } from "./types";

const INDEX_FILE = "index.json";
const CHUNKS_FILE = "chunks.json";
const KEYWORDS_FILE = "keywords.json";

const safeReadJson = async <T>(uri: vscode.Uri): Promise<T | undefined> => {
  try {
    const bytes = await vscode.workspace.fs.readFile(uri);
    return JSON.parse(Buffer.from(bytes).toString("utf8")) as T;
  } catch {
    return undefined;
  }
};

const writeJson = async (uri: vscode.Uri, data: unknown): Promise<void> => {
  const bytes = Buffer.from(JSON.stringify(data, null, 2), "utf8");
  await vscode.workspace.fs.writeFile(uri, bytes);
};

export class ContextStorage {
  public constructor(private readonly storageUri: vscode.Uri) {}

  private fileUri(fileName: string): vscode.Uri {
    return vscode.Uri.joinPath(this.storageUri, fileName);
  }

  public async ensureReady(): Promise<void> {
    await vscode.workspace.fs.createDirectory(this.storageUri);
  }

  public async save(manifest: IndexManifest, chunks: ContextChunk[], keywordIndex: Record<string, string[]>): Promise<void> {
    await this.ensureReady();
    await Promise.all([
      writeJson(this.fileUri(INDEX_FILE), manifest),
      writeJson(this.fileUri(CHUNKS_FILE), chunks),
      writeJson(this.fileUri(KEYWORDS_FILE), keywordIndex)
    ]);
  }

  public async load(): Promise<ContextIndex | undefined> {
    await this.ensureReady();
    const [manifest, chunks, keywordIndex] = await Promise.all([
      safeReadJson<IndexManifest>(this.fileUri(INDEX_FILE)),
      safeReadJson<ContextChunk[]>(this.fileUri(CHUNKS_FILE)),
      safeReadJson<Record<string, string[]>>(this.fileUri(KEYWORDS_FILE))
    ]);

    if (!manifest || !chunks || !keywordIndex) {
      return undefined;
    }

    return { manifest, chunks, keywordIndex };
  }
}
