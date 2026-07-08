import { describe, expect, it } from "vitest";
import { parsePresenceMessage } from "../src/network/discovery.js";

describe("parsePresenceMessage", () => {
  it("keeps remote species names for pets added later", () => {
    const remotePet = parsePresenceMessage(
      JSON.stringify({
        protocol: "pet-term-presence/v1",
        instanceId: "remote-1",
        ownerName: "alex",
        petName: "Moss",
        speciesId: "otter",
        speciesName: "Otter",
        ageDays: 5,
        health: 66,
        hunger: 59,
        isDead: false
      }),
      "local-1",
      new Date("2026-07-07T12:00:00Z")
    );

    expect(remotePet).toMatchObject({
      ownerName: "alex",
      petName: "Moss",
      speciesId: "otter",
      speciesName: "Otter",
      ageDays: 5,
      health: 66,
      hunger: 59,
      isDead: false
    });
  });

  it("ignores presence messages from the local session", () => {
    const remotePet = parsePresenceMessage(
      JSON.stringify({
        protocol: "pet-term-presence/v1",
        instanceId: "local-1",
        ownerName: "alex",
        petName: "Moss",
        speciesId: "otter",
        speciesName: "Otter",
        ageDays: 5,
        health: 66,
        hunger: 59,
        isDead: false
      }),
      "local-1",
      new Date("2026-07-07T12:00:00Z")
    );

    expect(remotePet).toBeUndefined();
  });
});
