import { describe, expect, it } from "vitest";
import { crow } from "../src/pets/crow.js";
import { buildHeader, buildNearbyArt, buildSpeech, buildStats, type RenderModel } from "../src/tui/render.js";

function createModel(overrides: Partial<RenderModel> = {}): RenderModel {
  return {
    species: crow,
    frameIndex: 0,
    ownerName: "sam",
    petName: "Pixel",
    hunger: 73,
    health: 84,
    ageDays: 3,
    maxAgeDays: 18,
    averageHealth: 81,
    commitCount: 12,
    branchSwitchCount: 4,
    repoCount: 2,
    rootPath: "/tmp/project",
    lastEventLabel: "commit in /tmp/project",
    isDead: false,
    ambientMuted: false,
    nearbyPets: [],
    ...overrides
  };
}

describe("render", () => {
  it("shows owner, pet, and nearby count in the header", () => {
    const header = buildHeader(
      createModel({
        nearbyPets: [
          {
            ownerName: "alex",
            petName: "Moss",
            speciesName: "Otter",
            artFrames: [[" /\\_", "(o o)"], [" \\_/", "(o o)"]],
            ageDays: 5,
            health: 66,
            hunger: 59,
            isDead: false
          }
        ]
      })
    );

    expect(header).toContain("Owner: sam");
    expect(header).toContain("Pet: Pixel the Crow");
    expect(header).toContain("Nearby: 1");
  });

  it("uses the pet name in the idle speech and remote compact view", () => {
    const model = createModel({
      nearbyPets: [
        {
          ownerName: "alex",
          petName: "Moss",
          speciesName: "Otter",
          artFrames: [[" /\\_", "(o o)"], [" \\_/", "(o o)"]],
          ageDays: 5,
          health: 66,
          hunger: 59,
          isDead: false
        }
      ]
    });

    expect(buildSpeech(model)).toBe("Pixel is listening for git activity.");

    const stats = buildStats(model);
    expect(stats).toContain("Nearby 1");
    expect(stats).toContain("alex/Moss [Otter] age 5 hp 66 hu 59");
  });

  it("renders nearby pet ascii cards", () => {
    const nearbyArt = buildNearbyArt(
      createModel({
        nearbyPets: [
          {
            ownerName: "alex",
            petName: "Moss",
            speciesName: "Otter",
            artFrames: [[" /\\_", "(o o)"], [" \\_/", "(^ ^)"]],
            ageDays: 5,
            health: 66,
            hunger: 59,
            isDead: false
          }
        ]
      })
    );

    expect(nearbyArt).toContain("alex/Moss [Otter]");
    expect(nearbyArt).toContain(" /\\_");
    expect(nearbyArt).toContain("age 5 hp 66 hu 59");
  });

  it("animates nearby pets using the current frame index", () => {
    const nearbyArt = buildNearbyArt(
      createModel({
        frameIndex: 1,
        nearbyPets: [
          {
            ownerName: "alex",
            petName: "Moss",
            speciesName: "Otter",
            artFrames: [[" /\\_", "(o o)"], [" \\_/", "(^ ^)"]],
            ageDays: 5,
            health: 66,
            hunger: 59,
            isDead: false
          }
        ]
      })
    );

    expect(nearbyArt).toContain(" \\_/");
    expect(nearbyArt).toContain("(^ ^)");
  });
});
