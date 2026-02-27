import { RetrievedChunk } from "../context/types";

export interface EnvelopeInput {
  principles: string[];
  conventions: string[];
  glossary: Record<string, string>;
  chunks: RetrievedChunk[];
  task: string;
}

export const buildContextEnvelope = (input: EnvelopeInput): string => {
  const principles = input.principles.length ? input.principles.map((p) => `- ${p}`).join("\n") : "- No team principles configured.";
  const conventions = input.conventions.length ? input.conventions.map((c) => `- ${c}`).join("\n") : "- No repository conventions detected.";
  const glossaryEntries = Object.entries(input.glossary);
  const glossary = glossaryEntries.length ? glossaryEntries.map(([term, def]) => `- ${term}: ${def}`).join("\n") : "- No glossary terms configured.";

  const context = input.chunks.length
    ? input.chunks
        .map(({ chunk, score, pinned }) => {
          const pin = pinned ? " [PINNED]" : "";
          return `- ${chunk.title}${pin} [Source: ${chunk.source}] (score: ${score.toFixed(2)})\n  ${chunk.snippet}\n  Citation: [Source: ${chunk.source}]`;
        })
        .join("\n\n")
    : "- No relevant context found.";

  return `TEAM PRINCIPLES:\n${principles}\n\nREPO CONVENTIONS:\n${conventions}\n\nDOMAIN TERMS:\n${glossary}\n\nRELEVANT CONTEXT:\n${context}\n\nTASK:\n${input.task}`;
};
