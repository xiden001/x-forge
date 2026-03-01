import * as vscode from "vscode";
import { buildContextIncludeSources, normalizePath, sanitizeRelativePaths, shouldIncludeRelativePath } from "./contextPathFilter";

const defaultExcludeRoots = ["node_modules", ".git", ".yarn", ".pnpm-store", ".vscode-test"];

export const scanContextFiles = async (scanPaths: string[], excludePaths: string[]): Promise<vscode.Uri[]> => {
  const safeScanPaths = sanitizeRelativePaths(scanPaths);
  const includeGlob = `{${buildContextIncludeSources(safeScanPaths).join(",")}}`;

  const allExcludes = [...defaultExcludeRoots, ...sanitizeRelativePaths(excludePaths)].filter(Boolean);
  const excludes = allExcludes.length ? `{${allExcludes.map((p) => `${p}/**`).join(",")}}` : undefined;

  const discovered = await vscode.workspace.findFiles(includeGlob, excludes);

  const unique = new Map<string, vscode.Uri>();
  for (const uri of discovered) {
    const relative = normalizePath(vscode.workspace.asRelativePath(uri, false));
    if (shouldIncludeRelativePath(relative, safeScanPaths)) {
      unique.set(uri.toString(), uri);
    }
  }

  return Array.from(unique.values());
};
