import { readdir, readFile, stat } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import type { RepoDescriptor } from "./repo-state.js";

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".cache",
  "coverage"
]);

export async function discoverGitRepos(rootPath: string): Promise<RepoDescriptor[]> {
  const found = new Map<string, RepoDescriptor>();
  await walk(resolve(rootPath), found);
  return [...found.values()].sort((a, b) => a.repoPath.localeCompare(b.repoPath));
}

async function walk(currentPath: string, found: Map<string, RepoDescriptor>): Promise<void> {
  let entries;

  try {
    entries = await readdir(currentPath, { withFileTypes: true });
  } catch {
    return;
  }

  const gitMarker = entries.find((entry) => entry.name === ".git");
  if (gitMarker) {
    const gitDir = await resolveGitDir(currentPath, join(currentPath, ".git"));
    found.set(currentPath, { repoPath: currentPath, gitDir });
  }

  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .filter((entry) => !SKIP_DIRS.has(entry.name))
      .map((entry) => walk(join(currentPath, entry.name), found))
  );
}

async function resolveGitDir(repoPath: string, gitPath: string): Promise<string> {
  const gitStat = await stat(gitPath);

  if (gitStat.isDirectory()) {
    return gitPath;
  }

  const pointer = await readFile(gitPath, "utf8");
  const match = pointer.match(/^gitdir:\s*(.+)$/m);

  if (!match) {
    throw new Error(`Unsupported .git file in ${repoPath}`);
  }

  const target = match[1].trim();
  return resolve(repoPath, isAbsolute(target) ? target : target);
}
