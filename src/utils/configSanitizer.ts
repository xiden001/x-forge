import { RuntimeConfig, TeamContextYaml } from "../context/types";
import { sanitizeRelativePaths } from "./contextPathFilter";

const MAX_ENTRIES = 200;
const MAX_VALUE_LENGTH = 300;

const sanitizeStringArray = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_ENTRIES);
};

const sanitizeGlossary = (value: unknown, fallback: Record<string, string>): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const sanitized: Record<string, string> = Object.create(null) as Record<string, string>;
  for (const [rawKey, rawValue] of Object.entries(value)) {
    if (typeof rawValue !== "string") {
      continue;
    }

    const key = rawKey.trim().slice(0, MAX_VALUE_LENGTH);
    const text = rawValue.trim().slice(0, MAX_VALUE_LENGTH);
    if (!key || !text) {
      continue;
    }

    sanitized[key] = text;
    if (Object.keys(sanitized).length >= MAX_ENTRIES) {
      break;
    }
  }

  return Object.keys(sanitized).length ? sanitized : fallback;
};

const sanitizeIntegerInRange = (value: unknown, fallback: number, min: number, max: number): number => {
  let numericValue: number;

  if (value === undefined || value === null) {
    numericValue = fallback;
  } else if (typeof value === "number") {
    numericValue = value;
  } else {
    const converted = Number(value);
    numericValue = Number.isFinite(converted) ? converted : fallback;
  }

  const floored = Math.floor(numericValue);
  const clampedToMin = Math.max(floored, min);
  return Math.min(clampedToMin, max);
};

const sanitizeBoolean = (value: unknown, fallback: boolean): boolean => (typeof value === "boolean" ? value : fallback);

export const sanitizeRuntimeConfig = (config: RuntimeConfig): RuntimeConfig => ({
  ...config,
  maxChunks: sanitizeIntegerInRange(config.maxChunks, 5, 1, 20),
  maxTokens: sanitizeIntegerInRange(config.maxTokens, 1200, 200, 8000),
  maxCandidateChunks: sanitizeIntegerInRange(config.maxCandidateChunks, 2000, 200, 20_000),
  confirmBeforeClipboardWrite: sanitizeBoolean(config.confirmBeforeClipboardWrite, true),
  scanPaths: sanitizeRelativePaths(sanitizeStringArray(config.scanPaths, ["docs", "adr"])),
  alwaysInclude: sanitizeRelativePaths(sanitizeStringArray(config.alwaysInclude, ["docs/architecture.md"])),
  excludePaths: sanitizeRelativePaths(sanitizeStringArray(config.excludePaths, [])),
  principles: sanitizeStringArray(config.principles, []),
  glossary: sanitizeGlossary(config.glossary, Object.create(null) as Record<string, string>)
});

export const mergeYamlIntoConfig = (config: RuntimeConfig, yamlData: TeamContextYaml | undefined): RuntimeConfig => {
  if (!yamlData) {
    return sanitizeRuntimeConfig(config);
  }

  const merged: RuntimeConfig = {
    ...config,
    principles: sanitizeStringArray(yamlData.principles, config.principles),
    glossary: sanitizeGlossary(yamlData.glossary, config.glossary),
    alwaysInclude: sanitizeRelativePaths(sanitizeStringArray(yamlData.alwaysInclude, config.alwaysInclude)),
    excludePaths: sanitizeRelativePaths(sanitizeStringArray(yamlData.exclude, config.excludePaths))
  };

  return sanitizeRuntimeConfig(merged);
};
