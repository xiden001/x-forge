import * as vscode from "vscode";
import { normalizePath, normalizeScanRoot, shouldIncludeRelativePath } from "./contextPathFilter";

const includePatterns = ["**/*.md", "**/*.markdown", "team-context.yaml"];
const defaultExcludeRoots = ["node_modules", ".git", ".yarn", ".pnpm-store", ".vscode-test"];

export const scanContextFiles = async (scanPaths: string[], excludePaths: string[]): Promise<vscode.Uri[]> => {
  const roots = ["README.md", "CONTRIBUTING.md", ...scanPaths.map((p) => `${normalizeScanRoot(p)}/**`)];
  const includeGlob = `{${[...roots, ...includePatterns].join(",")}}`;

  const allExcludes = [...defaultExcludeRoots, ...excludePaths.map(normalizeScanRoot)].filter(Boolean);
  const excludes = allExcludes.length ? `{${allExcludes.map((p) => `${p}/**`).join(",")}}` : undefined;

  const discovered = await vscode.workspace.findFiles(includeGlob, excludes);

  const unique = new Map<string, vscode.Uri>();
  for (const uri of discovered) {
    const relative = normalizePath(vscode.workspace.asRelativePath(uri, false));
    if (shouldIncludeRelativePath(relative, scanPaths)) {
      unique.set(uri.toString(), uri);
    }
  }

  return Array.from(unique.values());
};
