
const alwaysIncludeFiles = new Set(["README.md", "CONTRIBUTING.md", "team-context.yaml"]);

export const normalizePath = (value: string): string =>
  value.replace(/[\\/]+/g, "/").replace(/^\.\//, "");

const hasTraversal = (value: string): boolean => value.split("/").some((part) => part === ".." || part === ".");

export const normalizeScanRoot = (scanPath: string): string => {
  const normalized = normalizePath(scanPath).replace(/^\/+/, "").replace(/\/+$/, "");
  if (!normalized || hasTraversal(normalized)) {
    return "";
  }

  return normalized;
};

export const sanitizeRelativePaths = (values: string[]): string[] => {
  const unique = new Set<string>();

  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const normalized = normalizeScanRoot(value);
    if (!normalized) {
      continue;
    }

    unique.add(normalized);
  }

  return Array.from(unique);
};

export const shouldIncludeRelativePath = (relativePath: string, scanPaths: string[]): boolean => {
  const normalized = normalizePath(relativePath).replace(/^\/+/, "");

  if (alwaysIncludeFiles.has(normalized)) {
    return true;
  }

  if (normalized.endsWith("/README.md") || normalized.endsWith("/CONTRIBUTING.md")) {
    return false;
  }

  const normalizedRoots = sanitizeRelativePaths(scanPaths);
  return normalizedRoots.some((root) => normalized === root || normalized.startsWith(`${root}/`));
};
