import { describe, expect, it } from "vitest";
import { lineForTrigger } from "../src/domain/speech.js";
import { getPetSpecies } from "../src/pets/index.js";

describe("blob pet", () => {
  it("is available in the pet registry", () => {
    expect(getPetSpecies("blob").name).toBe("Blob");
  });

  it("uses blob-specific speech", () => {
    const line = lineForTrigger(getPetSpecies("blob"), { kind: "commit" }, () => 0);

    expect(line).toBe("Excellent commit. I have absorbed it.");
  });
});

describe("wolf pet", () => {
  it("is available in the pet registry", () => {
    expect(getPetSpecies("wolf").name).toBe("Wolf");
  });

  it("uses wolf-specific speech", () => {
    const line = lineForTrigger(getPetSpecies("wolf"), { kind: "commit" }, () => 0);

    expect(line).toBe("Fresh commit. Good catch.");
  });
});

describe("elephant pet", () => {
  it("is available in the pet registry", () => {
    expect(getPetSpecies("elephant").name).toBe("Elephant");
  });

  it("uses elephant-specific speech", () => {
    const line = lineForTrigger(getPetSpecies("elephant"), { kind: "commit" }, () => 0);

    expect(line).toBe("A commit worth remembering.");
  });
});
