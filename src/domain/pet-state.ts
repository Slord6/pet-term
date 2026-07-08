export interface SpeechState {
  text: string;
  tone: "event" | "alert" | "ambient" | "dead";
  createdAt: string;
}

export interface PetState {
  version: number;
  speciesId: string;
  ownerName: string;
  petName: string;
  hunger: number;
  health: number;
  createdAt: string;
  lastTickAt: string;
  lastEventAt?: string;
  lastSpeechAt?: string;
  deathAt?: string;
  deathReason?: string;
  activeDays: string[];
  commitCount: number;
  branchSwitchCount: number;
  gitEventCount: number;
  healthSampleTotal: number;
  healthSampleMinutes: number;
  ambientMuted: boolean;
}

export interface RootState {
  version: number;
  rootPath: string;
  pet: PetState;
  repoOffsets: Record<string, number>;
}

export function createInitialPetState(
  speciesId: string,
  ownerName: string,
  petName: string,
  now: Date
): PetState {
  return {
    version: 2,
    speciesId,
    ownerName,
    petName,
    hunger: 65,
    health: 80,
    createdAt: now.toISOString(),
    lastTickAt: now.toISOString(),
    activeDays: [],
    commitCount: 0,
    branchSwitchCount: 0,
    gitEventCount: 0,
    healthSampleTotal: 80,
    healthSampleMinutes: 1,
    ambientMuted: false
  };
}
