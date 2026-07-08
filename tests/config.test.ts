import { describe, expect, it } from "vitest";
import { buildHelpText, mergeRunAppOptions, parseArgs, parseDotEnvText, readEnvOptions } from "../src/config.js";

describe("config", () => {
  it("parses the pet type flag", () => {
    const result = parseArgs(["/tmp/project", "--pet-type", "blob", "--owner-name", "sam"]);

    expect(result.rootArg).toBe("/tmp/project");
    expect(result.options).toEqual({ speciesId: "blob", ownerName: "sam" });
  });

  it("reads identity settings from environment variables", () => {
    const options = readEnvOptions({
      PET_TERM_OWNER_NAME: "sam",
      PET_TERM_PET_NAME: "Moss",
      PET_TERM_PET_TYPE: "blob"
    });

    expect(options).toEqual({
      ownerName: "sam",
      petName: "Moss",
      speciesId: "blob"
    });
  });

  it("lets cli options override env options", () => {
    const merged = mergeRunAppOptions(
      { ownerName: "sam", petName: "Moss", speciesId: "crow" },
      { petName: "Pixel", speciesId: "blob" }
    );

    expect(merged).toEqual({ ownerName: "sam", petName: "Pixel", speciesId: "blob" });
  });

  it("rejects unknown pet types", () => {
    expect(() => parseArgs(["/tmp/project", "--pet-type", "otter"])).toThrow(
      "Unknown pet type: otter. Expected one of: crow, blob, wolf, elephant"
    );
  });

  it("documents supported env vars and pet types in help text", () => {
    const help = buildHelpText();

    expect(help).toContain("--pet-type <type>");
    expect(help).toContain("Pet types: crow, blob, wolf, elephant");
    expect(help).toContain("PET_TERM_OWNER_NAME");
    expect(help).toContain("PET_TERM_PET_NAME");
    expect(help).toContain("PET_TERM_PET_TYPE");
  });

  it("parses .env file content", () => {
    const env = parseDotEnvText([
      "# pet-term settings",
      "PET_TERM_OWNER_NAME=sam",
      "export PET_TERM_PET_NAME='Moss'",
      "PET_TERM_PET_TYPE=blob"
    ].join("\n"));

    expect(readEnvOptions(env)).toEqual({
      ownerName: "sam",
      petName: "Moss",
      speciesId: "blob"
    });
  });
});
