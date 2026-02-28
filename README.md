# X-Forge (VS Code Extension)

X-Forge injects **team context** into AI prompts so developers can keep using their preferred coding assistants with better repository awareness.

> Local-first by design: X-Forge indexes docs in your workspace and never sends data externally.
X-Forge injects your team’s documentation, architecture decisions, and domain knowledge directly into AI prompts — so outputs align with how your team actually builds software.

In Simple terms :- 

Stop copying docs into prompts.  
Stop rewriting AI responses.  
Keep your AI aligned with your codebase.

---

## Why X-Forge?

AI assistants are powerful — but they don’t understand your team’s:

- architecture decisions  
- domain terminology  
- coding conventions  
- business rules  

Developers compensate by manually pasting docs into prompts or rewriting AI output.

X-Forge fixes this.

---

## What It Does

When you ask AI to generate code, X-Forge:

✔ finds relevant team docs  
✔ injects architecture & domain context  
✔ aligns output with team conventions  
✔ shows exactly what context was used  

**Result: better AI output on the first try.**

---

## What Makes This Different from claude.md or README docs?

Static docs are passive. X-Forge is contextual.

| Static Docs | X-Forge |
|------------|------------|
| Must be opened manually | Injected automatically |
| Not task-aware | Context-aware |
| Easy to forget | Always applied |
| Overwhelming | Only relevant info included |
| No transparency | Shows context sources |

---

## How It Works

When you trigger an AI prompt:

1. X-Forge scans your repository documentation.
2. It selects context relevant to your current file and task.
3. It injects a structured context envelope.
4. You receive aligned, higher-quality AI output.

---
## Example

You want to prompt/ask your AI:

> Add validation to prevent duplicate SKUs during import, core logic sits in /inventory/productImporter.php.

X-Forge automatically injects:

- inventory validation rules  
- SKU uniqueness constraints  
- error logging conventions  
- data normalization requirements  

The AI response now follows your team’s architecture and data integrity rules.

---

## Key Points

### Context-Aware Injection
Injects only the most relevant documentation.

### Team Knowledge Alignment
Ensures AI suggestions follow team architecture and standards.

### Domain Glossary Awareness
Prevents terminology mistakes and misunderstandings.

### ADR (Architecture Decision Record) & Architecture Surfacing
Automatically surfaces design decisions when relevant.

### Transparency Panel
See what context was used and where it came from.

### Zero Friction Workflow
No copy/paste. No prompt rewriting.

---

## Features

- Indexes repository context from:
  - `docs/**`
  - `adr/**`
  - `README.md`
  - `CONTRIBUTING.md`
  - `team-context.yaml` (optional overrides)
- Chunks markdown into retrievable context units with metadata.
- Retrieves top relevant chunks using keyword scoring + path/title affinity.
- Builds a structured **Context Envelope** for prompt injection.
- Supports two usage modes:
  - **Copy Prompt with Context** (default clipboard flow)
  - **Prompt Preview** (read-only preview document)
- Shows exactly what context was used in a dedicated **Team Context** sidebar.

## Commands

Open Command Palette and run:

- `Team Context: Show Context Used`
- `Team Context: Refresh Index`
- `Team Context: Toggle Injection`
- `Team Context: Copy Prompt with Context`
- `Team Context: Prompt Preview`

## Team Context Sidebar

Activity Bar -> **Team Context**

Displays:

- last retrieved chunks
- chunk title
- source file
- relevance score
- expandable snippet/full chunk text

Includes a toolbar refresh action.

## Configuration

Workspace settings (`settings.json`):

```json
{
  "teamContext.enabled": true,
  "teamContext.maxChunks": 5,
  "teamContext.maxTokens": 1200,
  "teamContext.scanPaths": ["docs", "adr"],
  "teamContext.alwaysInclude": ["docs/architecture.md"],
  "teamContext.excludePaths": [],
  "teamContext.indexOnStartup": true
}
```

## `team-context.yaml` overrides

Optional file at workspace root:

```yaml
principles:
  - Prefer service-layer architecture
  - Avoid business logic in controllers

glossary:
  SKU: Stock keeping unit
  PSP: Payment service provider

alwaysInclude:
  - docs/architecture.md

exclude:
  - docs/archive
```

If present, these values override extension defaults for principles/glossary/alwaysInclude/exclude.

### Run in VS Code

1. Open this repo in VS Code.
2. Press `F5` to launch an Extension Development Host.
3. Use Command Palette commands listed above.

Compatible with VS Code and VSCodium (Open VSX packaging supported).

## Logging

X-Forge writes operational logs to output channel: **ContextForge**.

## Example context files included

- `docs/architecture.md`
- `adr/0001-sample-adr.md`
