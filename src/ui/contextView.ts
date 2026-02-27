import * as vscode from "vscode";
import { RetrievedChunk } from "../context/types";

class ContextTreeItem extends vscode.TreeItem {
  public constructor(public readonly chunk: RetrievedChunk) {
    super(`${chunk.chunk.title} (${chunk.score.toFixed(2)})`, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = chunk.chunk.source;
    this.tooltip = `${chunk.chunk.title}\n${chunk.chunk.source}\nScore: ${chunk.score.toFixed(2)}`;
    this.contextValue = "contextChunk";
  }
}

class ContextDetailItem extends vscode.TreeItem {
  public constructor(label: string, value: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = value;
    this.tooltip = value;
  }
}

export class ContextViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly emitter = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  private chunks: RetrievedChunk[] = [];

  public readonly onDidChangeTreeData = this.emitter.event;

  public setChunks(chunks: RetrievedChunk[]): void {
    this.chunks = chunks;
    this.emitter.fire(undefined);
  }

  public getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    if (!element) {
      if (!this.chunks.length) {
        return [new vscode.TreeItem("No context retrieved yet.", vscode.TreeItemCollapsibleState.None)];
      }

      return this.chunks.map((chunk) => new ContextTreeItem(chunk));
    }

    if (element instanceof ContextTreeItem) {
      return [
        new ContextDetailItem("Source", element.chunk.chunk.source),
        new ContextDetailItem("Snippet", element.chunk.chunk.snippet),
        new ContextDetailItem("Text", element.chunk.chunk.text)
      ];
    }

    return [];
  }
}
