# X-Forge (VS Code Extension)

X-Forge injects **team context** into AI prompts so developers can keep using their preferred coding assistants with better repository awareness.

> Local-first by design: X-Forge indexes docs in your workspace and never sends data externally.

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
