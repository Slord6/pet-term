import type { GitEvent } from "../domain/pet-engine.js";

export function parseReflogLine(repoPath: string, line: string): GitEvent | undefined {
  const parts = line.split("\t");
  const message = parts[1]?.trim();

  if (!message) {
    return undefined;
  }

  const metadata = parts[0] ?? "";
  const metaMatch = metadata.match(/\s(\d{10})\s[+-]\d{4}$/);
  const occurredAt = metaMatch ? new Date(Number(metaMatch[1]) * 1000) : new Date();

  if (message.startsWith("commit")) {
    return {
      type: "commit",
      repoPath,
      message,
      occurredAt
    };
  }

  if (message.startsWith("checkout: moving from ")) {
    return {
      type: "branch-switch",
      repoPath,
      message,
      occurredAt
    };
  }

  return undefined;
}

export function parseReflogChunk(repoPath: string, chunk: string): GitEvent[] {
  return chunk
    .split(/\r?\n/)
    .map((line) => parseReflogLine(repoPath, line))
    .filter((event): event is GitEvent => event !== undefined);
}
