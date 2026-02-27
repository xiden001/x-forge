import * as path from "path";
import * as vscode from "vscode";
import { ContextIndex, RetrievedChunk, RetrievalSignals, RuntimeConfig } from "../context/types";
import { ContextRetriever } from "../context/retriever";
import { buildContextEnvelope } from "./envelopeBuilder";

export interface AssembledPrompt {
  envelope: string;
  retrieved: RetrievedChunk[];
}

export class PromptAssembler {
  private readonly retriever = new ContextRetriever();

  public assemble(index: ContextIndex | undefined, config: RuntimeConfig, task: string): AssembledPrompt {
    const editor = vscode.window.activeTextEditor;
    const document = editor?.document;
    const selectionText = editor ? document?.getText(editor.selection) ?? "" : "";

    const signals: RetrievalSignals = {
      prompt: task,
      filePath: document ? vscode.workspace.asRelativePath(document.uri, false) : "",
      language: document?.languageId ?? "plaintext",
      selection: selectionText.slice(0, 4000),
      filenameKeywords: document ? path.basename(document.fileName).split(/[^a-zA-Z0-9]+/) : []
    };

    const retrieved = index ? this.retriever.retrieve(index, config, signals) : [];

    const conventions = this.deriveConventions(retrieved);

    return {
      envelope: buildContextEnvelope({
        principles: config.principles,
        conventions,
        glossary: config.glossary,
        chunks: retrieved,
        task
      }),
      retrieved
    };
  }

  private deriveConventions(chunks: RetrievedChunk[]): string[] {
    const conventions = new Set<string>();
    for (const { chunk } of chunks) {
      if (/convention|standard|guideline|architecture/i.test(chunk.title)) {
        conventions.add(`${chunk.title} [Source: ${chunk.source}]`);
      }
    }

    return Array.from(conventions).slice(0, 6);
  }
}
