import * as path from "path";
import * as vscode from "vscode";

const includePatterns = ["**/*.md", "**/*.markdown", "team-context.yaml"];

export const scanContextFiles = async (scanPaths: string[], excludePaths: string[]): Promise<vscode.Uri[]> => {
  const roots = ["README.md", "CONTRIBUTING.md", ...scanPaths.map((p) => `${p}/**`)];
  const includeGlob = `{${[...roots, ...includePatterns].join(",")}}`;
  const excludes = excludePaths.length ? `{${excludePaths.map((p) => `${p}/**`).join(",")}}` : undefined;
  const discovered = await vscode.workspace.findFiles(includeGlob, excludes);

  const unique = new Map<string, vscode.Uri>();
  for (const uri of discovered) {
    const normalized = uri.fsPath.split(path.sep).join("/");
    if (normalized.endsWith("README.md") || normalized.endsWith("CONTRIBUTING.md") || normalized.includes("/docs/") || normalized.includes("/adr/") || normalized.endsWith("team-context.yaml")) {
      unique.set(uri.toString(), uri);
    }
  }

  return Array.from(unique.values());
};
