import { describe, expect, it } from "vitest";
import { PetEngine } from "../src/domain/pet-engine.js";
import { createInitialPetState } from "../src/domain/pet-state.js";
import { crow } from "../src/pets/crow.js";

describe("PetEngine", () => {
  it("commit events feed the pet more than branch switches", () => {
    const state = createInitialPetState("crow", "sam", "Pixel", new Date("2026-07-06T10:00:00Z"));
    const engine = new PetEngine(state, crow, () => 0);

    engine.applyGitEvent(
      {
        type: "branch-switch",
        repoPath: "/tmp/repo",
        message: "checkout: moving from main to feature",
        occurredAt: new Date("2026-07-06T10:01:00Z")
      },
      new Date("2026-07-06T10:01:00Z")
    );

    expect(engine.getState().hunger).toBe(67);

    engine.applyGitEvent(
      {
        type: "commit",
        repoPath: "/tmp/repo",
        message: "commit: add tests",
        occurredAt: new Date("2026-07-06T10:02:00Z")
      },
      new Date("2026-07-06T10:02:00Z")
    );

    expect(engine.getState().hunger).toBe(77);
  });

  it("decays hunger only when ticked during runtime", () => {
    const state = createInitialPetState("crow", "sam", "Pixel", new Date("2026-07-06T10:00:00Z"));
    const engine = new PetEngine(state, crow, () => 1);

    engine.tick(new Date("2026-07-06T11:00:00Z"));

    expect(engine.getState().hunger).toBeCloseTo(55, 1);
    expect(engine.getState().health).toBe(80);
  });

  it("tracks age by active git days", () => {
    const state = createInitialPetState("crow", "sam", "Pixel", new Date("2026-07-06T10:00:00Z"));
    const engine = new PetEngine(state, crow, () => 0);

    engine.applyGitEvent(
      {
        type: "commit",
        repoPath: "/tmp/repo",
        message: "commit: one",
        occurredAt: new Date("2026-07-06T10:00:00Z")
      },
      new Date("2026-07-06T10:00:00Z")
    );

    engine.applyGitEvent(
      {
        type: "commit",
        repoPath: "/tmp/repo",
        message: "commit: two",
        occurredAt: new Date("2026-07-08T10:00:00Z")
      },
      new Date("2026-07-08T10:00:00Z")
    );

    expect(engine.getAgeDays()).toBe(2);
  });
});
