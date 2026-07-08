import type { PetSpecies } from "../pets/types.js";
import type { HealthBand, HungerBand } from "../pets/types.js";

export type SpeechTrigger =
  | { kind: "commit" }
  | { kind: "branch-switch" }
  | { kind: "hunger-band"; band: HungerBand }
  | { kind: "health-band"; band: HealthBand }
  | { kind: "ambient" }
  | { kind: "dead" };

export function lineForTrigger(
  species: PetSpecies,
  trigger: SpeechTrigger,
  random: () => number
): string {
  switch (trigger.kind) {
    case "commit":
      return choose(species.speech.git.commit, random);
    case "branch-switch":
      return choose(species.speech.git.branchSwitch, random);
    case "hunger-band":
      return choose(species.speech.hunger[trigger.band], random);
    case "health-band":
      return choose(species.speech.health[trigger.band], random);
    case "ambient":
      return choose(species.speech.ambient, random);
    case "dead":
      return choose(species.speech.dead, random);
  }
}

function choose(lines: string[], random: () => number): string {
  const index = Math.floor(random() * lines.length);
  return lines[index] ?? lines[0] ?? "...";
}
