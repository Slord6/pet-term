import type { SpeechState } from "../domain/pet-state.js";
import type { PetSpecies } from "../pets/types.js";
import { meter, truncateMiddle } from "../util/format.js";

export interface RenderModel {
  species: PetSpecies;
  frameIndex: number;
  ownerName: string;
  petName: string;
  hunger: number;
  health: number;
  ageDays: number;
  maxAgeDays: number;
  averageHealth: number;
  commitCount: number;
  branchSwitchCount: number;
  repoCount: number;
  rootPath: string;
  lastEventLabel: string;
  speech?: SpeechState;
  isDead: boolean;
  ambientMuted: boolean;
  nearbyPets: NearbyPetRenderModel[];
}

export interface NearbyPetRenderModel {
  ownerName: string;
  petName: string;
  speciesName: string;
  artFrames: string[][];
  ageDays: number;
  health: number;
  hunger: number;
  isDead: boolean;
}

export function buildHeader(model: RenderModel): string {
  return [
    `Owner: ${truncateMiddle(model.ownerName, 24)}   Pet: ${truncateMiddle(model.petName, 24)} the ${model.species.name}`,
    `Root: ${truncateMiddle(model.rootPath, 72)}`,
    `Repos: ${model.repoCount}   Nearby: ${model.nearbyPets.length}   Last: ${truncateMiddle(model.lastEventLabel, 40)}`
  ].join("\n");
}

export function buildSpeech(model: RenderModel): string {
  if (!model.speech) {
    return `${model.petName} is listening for git activity.`;
  }

  return model.speech.text;
}

export function buildArt(model: RenderModel): string {
  return model.species.frames[model.frameIndex % model.species.frames.length].join("\n");
}

export function buildNearbyArt(model: RenderModel): string {
  if (model.nearbyPets.length === 0) {
    return "No nearby pets detected.";
  }

  return model.nearbyPets.slice(0, 2).map((pet) => buildNearbyPetCard(pet, model.frameIndex)).join("\n\n");
}

export function buildStats(model: RenderModel): string {
  const lines = [
    `Health [${meter(model.health, 10)}] ${Math.round(model.health)}   Hunger [${meter(model.hunger, 10)}] ${Math.round(model.hunger)}`,
    `Age ${model.ageDays} / ${model.maxAgeDays} active days   Avg hp ${Math.round(model.averageHealth)}`,
    `Commits ${model.commitCount}   Branch switches ${model.branchSwitchCount}`,
    `Status ${model.isDead ? "dead" : "alive"}   Ambient ${model.ambientMuted ? "muted" : "on"}`
  ];

  if (model.nearbyPets.length === 0) {
    lines.push("Nearby none");
    return lines.join("\n");
  }

  lines.push(`Nearby ${model.nearbyPets.length}`);

  for (const pet of model.nearbyPets.slice(0, 3)) {
    lines.push(buildNearbyPetLine(pet));
  }

  if (model.nearbyPets.length > 3) {
    lines.push(`...and ${model.nearbyPets.length - 3} more nearby pets`);
  }

  return lines.join("\n");
}

export function buildFooter(): string {
  return "q quit   r rescan repos   m toggle ambient chatter   ctrl+c force quit";
}

function buildNearbyPetLine(pet: NearbyPetRenderModel): string {
  const identity = truncateMiddle(`${pet.ownerName}/${pet.petName} [${pet.speciesName}]`, 34);
  const status = pet.isDead ? " dead" : "";
  return `${identity} age ${pet.ageDays} hp ${Math.round(pet.health)} hu ${Math.round(pet.hunger)}${status}`;
}

function buildNearbyPetCard(pet: NearbyPetRenderModel, frameIndex: number): string {
  const identity = truncateMiddle(`${pet.ownerName}/${pet.petName}`, 24);
  const stats = `age ${pet.ageDays} hp ${Math.round(pet.health)} hu ${Math.round(pet.hunger)}${pet.isDead ? " dead" : ""}`;
  const artLines = pet.artFrames[frameIndex % pet.artFrames.length] ?? pet.artFrames[0] ?? [];
  return [`${identity} [${pet.speciesName}]`, ...artLines, stats].join("\n");
}
