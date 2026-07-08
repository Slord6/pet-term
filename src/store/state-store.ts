import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir, userInfo } from "node:os";
import { join, resolve } from "node:path";
import { shortHash } from "../util/hash.js";
import { createInitialPetState, type RootState } from "../domain/pet-state.js";
import { getPetSpecies } from "../pets/index.js";

const STATE_DIR = join(homedir(), ".pet-term");
const DEFAULT_SPECIES_ID = "crow";

export class StateStore {
  constructor(private readonly rootPath: string) {}

  async load(): Promise<RootState> {
    const now = new Date();
    const filePath = this.getFilePath();

    try {
      const raw = await readFile(filePath, "utf8");
      return normaliseRootState(JSON.parse(raw), this.rootPath, now);
    } catch {
      const ownerName = getDefaultOwnerName();
      const petName = getPetSpecies(DEFAULT_SPECIES_ID).name;

      return {
        version: 2,
        rootPath: resolve(this.rootPath),
        pet: createInitialPetState(DEFAULT_SPECIES_ID, ownerName, petName, now),
        repoOffsets: {}
      };
    }
  }

  async save(state: RootState): Promise<void> {
    await mkdir(STATE_DIR, { recursive: true });
    await writeFile(this.getFilePath(), `${JSON.stringify(state, null, 2)}\n`, "utf8");
  }

  private getFilePath(): string {
    const resolvedRoot = resolve(this.rootPath);
    return join(STATE_DIR, `${shortHash(resolvedRoot)}.json`);
  }
}

function normaliseRootState(raw: unknown, rootPath: string, now: Date): RootState {
  const resolvedRoot = resolve(rootPath);
  const source = isRecord(raw) ? raw : {};
  const petSource = isRecord(source.pet) ? source.pet : {};
  const speciesId = getString(petSource.speciesId, DEFAULT_SPECIES_ID);
  const ownerName = getDisplayName(petSource.ownerName, getDefaultOwnerName());
  const petName = getDisplayName(petSource.petName, getPetSpecies(speciesId).name);
  const baseState = createInitialPetState(speciesId, ownerName, petName, now);

  return {
    version: 2,
    rootPath: resolvedRoot,
    pet: {
      ...baseState,
      ...petSource,
      version: 2,
      speciesId,
      ownerName,
      petName,
      createdAt: getString(petSource.createdAt, baseState.createdAt),
      lastTickAt: now.toISOString(),
      lastEventAt: getOptionalString(petSource.lastEventAt),
      lastSpeechAt: getOptionalString(petSource.lastSpeechAt),
      deathAt: getOptionalString(petSource.deathAt),
      deathReason: getOptionalString(petSource.deathReason),
      activeDays: getStringArray(petSource.activeDays),
      hunger: getNumber(petSource.hunger, baseState.hunger),
      health: getNumber(petSource.health, baseState.health),
      commitCount: getNumber(petSource.commitCount, baseState.commitCount),
      branchSwitchCount: getNumber(petSource.branchSwitchCount, baseState.branchSwitchCount),
      gitEventCount: getNumber(petSource.gitEventCount, baseState.gitEventCount),
      healthSampleTotal: getNumber(petSource.healthSampleTotal, baseState.healthSampleTotal),
      healthSampleMinutes: getNumber(petSource.healthSampleMinutes, baseState.healthSampleMinutes),
      ambientMuted: getBoolean(petSource.ambientMuted, baseState.ambientMuted)
    },
    repoOffsets: getStringNumberRecord(source.repoOffsets)
  };
}

function getDefaultOwnerName(): string {
  return getDisplayName(userInfo().username, "owner");
}

function getDisplayName(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function getString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function getStringNumberRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    return {};
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1])
  );

  return Object.fromEntries(entries);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
