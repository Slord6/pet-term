import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { RunAppOptions } from "./app.js";
import { isPetSpeciesId, petSpeciesIds } from "./pets/index.js";

const OWNER_NAME_ENV = "PET_TERM_OWNER_NAME";
const PET_NAME_ENV = "PET_TERM_PET_NAME";
const PET_TYPE_ENV = "PET_TERM_PET_TYPE";

export interface ParseArgsResult {
  rootArg?: string;
  options: RunAppOptions;
  showHelp: boolean;
}

export function parseArgs(argv: string[]): ParseArgsResult {
  const options: RunAppOptions = {};
  let rootArg: string | undefined;
  let showHelp = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      showHelp = true;
      continue;
    }

    if (arg.startsWith("--owner-name=")) {
      options.ownerName = getRequiredName(arg.split("=").slice(1).join("="), "--owner-name");
      continue;
    }

    if (arg === "--owner-name") {
      index += 1;
      options.ownerName = getRequiredName(argv[index], "--owner-name");
      continue;
    }

    if (arg.startsWith("--pet-name=")) {
      options.petName = getRequiredName(arg.split("=").slice(1).join("="), "--pet-name");
      continue;
    }

    if (arg === "--pet-name") {
      index += 1;
      options.petName = getRequiredName(argv[index], "--pet-name");
      continue;
    }

    if (arg.startsWith("--pet-type=")) {
      options.speciesId = getRequiredPetType(arg.split("=").slice(1).join("="), "--pet-type");
      continue;
    }

    if (arg === "--pet-type") {
      index += 1;
      options.speciesId = getRequiredPetType(argv[index], "--pet-type");
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (rootArg) {
      throw new Error("Only one root directory may be provided");
    }

    rootArg = arg;
  }

  return { rootArg, options, showHelp };
}

export function readEnvOptions(env: NodeJS.ProcessEnv): RunAppOptions {
  const options: RunAppOptions = {};

  if (env[OWNER_NAME_ENV] !== undefined) {
    options.ownerName = getRequiredName(env[OWNER_NAME_ENV], OWNER_NAME_ENV);
  }

  if (env[PET_NAME_ENV] !== undefined) {
    options.petName = getRequiredName(env[PET_NAME_ENV], PET_NAME_ENV);
  }

  if (env[PET_TYPE_ENV] !== undefined) {
    options.speciesId = getRequiredPetType(env[PET_TYPE_ENV], PET_TYPE_ENV);
  }

  return options;
}

export async function readDotEnvOptions(rootArg: string, cwd = process.cwd()): Promise<RunAppOptions> {
  const env: NodeJS.ProcessEnv = {};
  const filePaths = new Set([join(resolve(rootArg), ".env"), join(resolve(cwd), ".env")]);

  for (const filePath of filePaths) {
    const parsed = await readDotEnvFile(filePath);

    for (const [key, value] of Object.entries(parsed)) {
      if (env[key] === undefined) {
        env[key] = value;
      }
    }
  }

  return readEnvOptions(env);
}

export function mergeRunAppOptions(base: RunAppOptions, overrides: RunAppOptions): RunAppOptions {
  return {
    ...base,
    ...overrides
  };
}

export function buildHelpText(): string {
  return [
    "Usage: pet-term <root-directory> [--owner-name <name>] [--pet-name <name>] [--pet-type <type>]",
    `Pet types: ${petSpeciesIds.join(", ")}`,
    `Env: ${OWNER_NAME_ENV}, ${PET_NAME_ENV}, ${PET_TYPE_ENV}`
  ].join("\n");
}

export function parseDotEnvText(source: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};

  for (const rawLine of source.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const separatorIndex = normalized.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    const value = normalized.slice(separatorIndex + 1).trim();

    if (key.length === 0) {
      continue;
    }

    env[key] = stripWrappingQuotes(value);
  }

  return env;
}

function getRequiredName(value: string | undefined, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`Missing value for ${label}`);
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new Error(`Missing value for ${label}`);
  }

  return trimmed;
}

function getRequiredPetType(value: string | undefined, label: string): string {
  const speciesId = getRequiredName(value, label);

  if (!isPetSpeciesId(speciesId)) {
    throw new Error(`Unknown pet type: ${speciesId}. Expected one of: ${petSpeciesIds.join(", ")}`);
  }

  return speciesId;
}

async function readDotEnvFile(filePath: string): Promise<NodeJS.ProcessEnv> {
  try {
    const source = await readFile(filePath, "utf8");
    return parseDotEnvText(source);
  } catch {
    return {};
  }
}

function stripWrappingQuotes(value: string): string {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];

    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }

  return value;
}
