import * as vscode from "vscode";
import { ContextStorage } from "./context/storage";
import { ContextIndexer } from "./context/indexer";
import { RuntimeConfig } from "./context/types";
import { ContextViewProvider } from "./ui/contextView";
import { CommandController, CommandState } from "./ui/commands";

const defaultPrinciples = [
  "Keep modules small and testable.",
  "Prefer explicit interfaces and deterministic behavior."
];

const loadConfig = (): RuntimeConfig => {
  const cfg = vscode.workspace.getConfiguration("teamContext");
  return {
    enabled: cfg.get<boolean>("enabled", true),
    maxChunks: cfg.get<number>("maxChunks", 5),
    maxTokens: cfg.get<number>("maxTokens", 1200),
    scanPaths: cfg.get<string[]>("scanPaths", ["docs", "adr"]),
    alwaysInclude: cfg.get<string[]>("alwaysInclude", ["docs/architecture.md"]),
    excludePaths: cfg.get<string[]>("excludePaths", []),
    indexOnStartup: cfg.get<boolean>("indexOnStartup", true),
    principles: defaultPrinciples,
    glossary: {}
  };
};

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const output = vscode.window.createOutputChannel("ContextForge");
  context.subscriptions.push(output);

  const view = new ContextViewProvider();
  context.subscriptions.push(vscode.window.registerTreeDataProvider("teamContext.view", view));

  const storage = new ContextStorage(context.globalStorageUri);
  const indexer = new ContextIndexer(storage, output);

  const state: CommandState = {
    config: loadConfig(),
    index: await indexer.loadIndex(),
    lastRetrieved: [],
    injectionEnabled: context.workspaceState.get<boolean>("teamContext.injectionEnabled", true)
  };

  const persistState = async (nextState: CommandState): Promise<void> => {
    await context.workspaceState.update("teamContext.lastIndexedAt", nextState.index?.manifest.indexedAt ?? 0);
  };

  const controller = new CommandController(context, indexer, view, output, state, persistState);
  context.subscriptions.push(...controller.register());

  if (state.config.indexOnStartup && state.config.enabled) {
    try {
      await controller.refreshIndex(false);
    } catch (error) {
      output.appendLine(`Startup indexing failed: ${String(error)}`);
    }
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("teamContext")) {
        state.config = loadConfig();
        output.appendLine("Reloaded Team Context configuration.");
      }
    })
  );

  output.appendLine("X-Forge activated.");
}

export function deactivate(): void {
  // no-op
}
