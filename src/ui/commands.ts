import * as vscode from "vscode";
import { ContextIndexer } from "../context/indexer";
import { ContextIndex, RetrievedChunk, RuntimeConfig } from "../context/types";
import { PromptAssembler } from "../injection/promptAssembler";
import { ContextViewProvider } from "./contextView";

export interface CommandState {
  config: RuntimeConfig;
  index?: ContextIndex;
  lastRetrieved: RetrievedChunk[];
  injectionEnabled: boolean;
}

export class CommandController {
  private readonly assembler = new PromptAssembler();

  public constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly indexer: ContextIndexer,
    private readonly view: ContextViewProvider,
    private readonly output: vscode.OutputChannel,
    private readonly state: CommandState,
    private readonly onStateChanged: (state: CommandState) => Promise<void>
  ) {}

  public register(): vscode.Disposable[] {
    return [
      vscode.commands.registerCommand("teamContext.refreshIndex", async () => this.refreshIndex(true)),
      vscode.commands.registerCommand("teamContext.refreshFromView", async () => this.refreshIndex(true)),
      vscode.commands.registerCommand("teamContext.toggleInjection", async () => this.toggleInjection()),
      vscode.commands.registerCommand("teamContext.copyPromptWithContext", async () => this.copyPromptWithContext()),
      vscode.commands.registerCommand("teamContext.promptPreview", async () => this.promptPreview()),
      vscode.commands.registerCommand("teamContext.showContextUsed", async () => this.showContextUsed())
    ];
  }

  public async refreshIndex(notify: boolean): Promise<void> {
    const result = await this.indexer.indexWorkspace(this.state.config);
    this.state.index = result.index;
    this.state.config = result.config;
    await this.onStateChanged(this.state);
    if (notify) {
      void vscode.window.showInformationMessage(`Team context refreshed (${result.index.manifest.chunkCount} chunks).`);
    }
  }

  private async toggleInjection(): Promise<void> {
    this.state.injectionEnabled = !this.state.injectionEnabled;
    await this.context.workspaceState.update("teamContext.injectionEnabled", this.state.injectionEnabled);
    void vscode.window.showInformationMessage(`Team context injection ${this.state.injectionEnabled ? "enabled" : "disabled"}.`);
  }

  private async copyPromptWithContext(): Promise<void> {
    const prompt = await this.askTaskPrompt();
    if (!prompt) {
      return;
    }

    const assembled = this.assembler.assemble(this.state.index, this.state.config, prompt);
    this.state.lastRetrieved = assembled.retrieved;
    this.view.setChunks(assembled.retrieved);

    const finalPrompt = this.state.injectionEnabled ? assembled.envelope : prompt;
    await vscode.env.clipboard.writeText(finalPrompt);
    this.output.appendLine(`Copied prompt with ${assembled.retrieved.length} context chunks.`);
    void vscode.window.showInformationMessage("Prompt copied to clipboard.");
  }

  private async promptPreview(): Promise<void> {
    const prompt = await this.askTaskPrompt();
    if (!prompt) {
      return;
    }

    const assembled = this.assembler.assemble(this.state.index, this.state.config, prompt);
    this.state.lastRetrieved = assembled.retrieved;
    this.view.setChunks(assembled.retrieved);

    const doc = await vscode.workspace.openTextDocument({
      content: this.state.injectionEnabled ? assembled.envelope : prompt,
      language: "markdown"
    });
    await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
  }

  private async showContextUsed(): Promise<void> {
    this.view.setChunks(this.state.lastRetrieved);
    void vscode.commands.executeCommand("teamContext.view.focus");
    void vscode.window.showInformationMessage(`Showing ${this.state.lastRetrieved.length} retrieved chunks in Team Context view.`);
  }

  private async askTaskPrompt(): Promise<string | undefined> {
    return vscode.window.showInputBox({
      title: "Task Prompt",
      prompt: "Describe the coding task to assemble context for",
      ignoreFocusOut: true
    });
  }
}
