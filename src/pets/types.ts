export type HungerBand = "starving" | "hungry" | "content" | "full";
export type HealthBand = "critical" | "weak" | "steady" | "thriving";

export interface PetSpeechBank {
  hunger: Record<HungerBand, string[]>;
  health: Record<HealthBand, string[]>;
  git: {
    commit: string[];
    branchSwitch: string[];
  };
  ambient: string[];
  dead: string[];
}

export interface PetSpecies {
  id: string;
  name: string;
  frames: string[][];
  speech: PetSpeechBank;
}
