import { blob } from "./blob.js";
import { crow } from "./crow.js";
import { elephant } from "./elephant.js";
import { wolf } from "./wolf.js";
import type { PetSpecies } from "./types.js";

export const pets: Record<string, PetSpecies> = {
  [crow.id]: crow,
  [blob.id]: blob,
  [wolf.id]: wolf,
  [elephant.id]: elephant
};

export const petSpeciesIds = Object.keys(pets);

export function isPetSpeciesId(id: string): boolean {
  return id in pets;
}

export function getPetSpecies(id: string, fallbackName = "Unknown Pet"): PetSpecies {
  return pets[id] ?? createFallbackSpecies(id, fallbackName);
}

function createFallbackSpecies(id: string, name: string): PetSpecies {
  return {
    id,
    name,
    frames: [["   (?)   ", "  /|_|\\  ", "   / \\"]],
    speech: {
      hunger: {
        starving: ["I need git activity."],
        hungry: ["A little work would help."],
        content: ["This is manageable."],
        full: ["Plenty of activity for now."]
      },
      health: {
        critical: ["This pet is in rough shape."],
        weak: ["This pet could use attention."],
        steady: ["This pet is doing fine."],
        thriving: ["This pet looks great."]
      },
      git: {
        commit: ["A good commit helps."],
        branchSwitch: ["A quick branch hop helps a bit."]
      },
      ambient: ["Listening for more git activity."],
      dead: ["This pet has gone quiet."]
    }
  };
}
