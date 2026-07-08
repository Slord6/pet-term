import { describe, expect, it } from "vitest";
import { parseReflogChunk, parseReflogLine } from "../src/git/reflog.js";

describe("reflog parsing", () => {
  it("parses commit reflog lines", () => {
    const event = parseReflogLine(
      "/tmp/repo",
      "abc def Sam <sam@example.com> 1783332000 +0000\tcommit: add feature"
    );

    expect(event?.type).toBe("commit");
    expect(event?.repoPath).toBe("/tmp/repo");
  });

  it("parses checkout reflog lines as branch switches", () => {
    const event = parseReflogLine(
      "/tmp/repo",
      "abc def Sam <sam@example.com> 1783332000 +0000\tcheckout: moving from main to feature"
    );

    expect(event?.type).toBe("branch-switch");
  });

  it("filters irrelevant reflog lines", () => {
    const events = parseReflogChunk(
      "/tmp/repo",
      [
        "abc def Sam <sam@example.com> 1783332000 +0000\tcommit: add feature",
        "abc def Sam <sam@example.com> 1783332001 +0000\treset: moving to HEAD~1"
      ].join("\n")
    );

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("commit");
  });
});
