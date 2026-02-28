import * as path from "path";

const alwaysIncludeFiles = new Set(["README.md", "CONTRIBUTING.md", "team-context.yaml"]);

export const normalizePath = (value: string): string => value.split(path.sep).join("/").replace(/^\.\//, "");

export const normalizeScanRoot = (scanPath: string): string => normalizePath(scanPath).replace(/^\/+/, "").replace(/\/+$/, "");

export const shouldIncludeRelativePath = (relativePath: string, scanPaths: string[]): boolean => {
  const normalized = normalizePath(relativePath).replace(/^\/+/, "");

  if (alwaysIncludeFiles.has(normalized)) {
    return true;
  }

  if (normalized.endsWith("/README.md") || normalized.endsWith("/CONTRIBUTING.md")) {
    return false;
  }

  const normalizedRoots = scanPaths.map(normalizeScanRoot).filter(Boolean);
  return normalizedRoots.some((root) => normalized === root || normalized.startsWith(`${root}/`));
};
