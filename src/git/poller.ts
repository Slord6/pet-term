import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { parseReflogChunk } from "./reflog.js";
import type { RepoDescriptor } from "./repo-state.js";
import type { GitEvent } from "../domain/pet-engine.js";
import { discoverGitRepos } from "./discover.js";

export class GitPoller {
  private repos = new Map<string, RepoDescriptor>();
  private offsets = new Map<string, number>();

  constructor(
    private readonly rootPath: string,
    initialOffsets: Record<string, number>
  ) {
    for (const [repoPath, offset] of Object.entries(initialOffsets)) {
      this.offsets.set(repoPath, offset);
    }
  }

  async scan(): Promise<void> {
    const discovered = await discoverGitRepos(this.rootPath);

    for (const repo of discovered) {
      this.repos.set(repo.repoPath, repo);

      if (!this.offsets.has(repo.repoPath)) {
        const reflogPath = join(repo.gitDir, "logs", "HEAD");

        try {
          const details = await stat(reflogPath);
          this.offsets.set(repo.repoPath, details.size);
        } catch {
          this.offsets.set(repo.repoPath, 0);
        }
      }
    }
  }

  async poll(): Promise<GitEvent[]> {
    const events: GitEvent[] = [];

    for (const repo of this.repos.values()) {
      const reflogPath = join(repo.gitDir, "logs", "HEAD");
      const previousOffset = this.offsets.get(repo.repoPath) ?? 0;

      let details;
      try {
        details = await stat(reflogPath);
      } catch {
        continue;
      }

      if (details.size < previousOffset) {
        this.offsets.set(repo.repoPath, details.size);
        continue;
      }

      if (details.size === previousOffset) {
        continue;
      }

      const content = await readFile(reflogPath, "utf8");
      const nextChunk = content.slice(previousOffset);
      this.offsets.set(repo.repoPath, content.length);
      events.push(...parseReflogChunk(repo.repoPath, nextChunk));
    }

    return events.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  }

  getRepoCount(): number {
    return this.repos.size;
  }

  getOffsets(): Record<string, number> {
    return Object.fromEntries(this.offsets.entries());
  }
}
