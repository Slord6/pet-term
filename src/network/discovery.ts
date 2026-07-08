import { createSocket, type Socket } from "node:dgram";
import { hostname } from "node:os";
import { clamp } from "../util/format.js";
import { shortHash } from "../util/hash.js";

const DISCOVERY_PORT = 42124;
const MULTICAST_ADDRESS = "239.255.42.99";
const BROADCAST_ADDRESS = "255.255.255.255";
const ANNOUNCE_MS = 3000;
const PRUNE_MS = 5000;
const STALE_MS = 12000;
const PROTOCOL = "pet-term-presence/v1";

export interface LocalPetPresence {
  ownerName: string;
  petName: string;
  speciesId: string;
  speciesName: string;
  ageDays: number;
  health: number;
  hunger: number;
  isDead: boolean;
}

export interface RemotePetPresence extends LocalPetPresence {
  instanceId: string;
  lastSeenAt: string;
}

interface PresencePayload extends LocalPetPresence {
  protocol: string;
  instanceId: string;
}

export class PetDiscovery {
  private readonly remotePets = new Map<string, RemotePetPresence>();
  private readonly instanceId = buildInstanceId();
  private socket?: Socket;
  private localPresence?: LocalPetPresence;
  private announceTimer?: ReturnType<typeof setInterval>;
  private pruneTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly onChange?: () => void,
    private readonly onError?: (message: string) => void
  ) {}

  async start(): Promise<void> {
    if (this.socket) {
      return;
    }

    const socket = createSocket({ type: "udp4", reuseAddr: true });
    this.socket = socket;

    try {
      socket.on("message", (message) => this.handleMessage(message));
      socket.on("error", (error) => {
        this.onError?.(`discovery unavailable: ${error.message}`);
      });

      await new Promise<void>((resolve, reject) => {
        const handleBindError = (error: Error): void => {
          socket.off("listening", handleListening);
          reject(error);
        };

        const handleListening = (): void => {
          socket.off("error", handleBindError);
          resolve();
        };

        socket.once("error", handleBindError);
        socket.once("listening", handleListening);
        socket.bind(DISCOVERY_PORT, "0.0.0.0");
      });
    } catch (error) {
      this.socket = undefined;
      socket.close();
      throw error;
    }

    socket.setBroadcast(true);
    socket.setMulticastLoopback(true);
    socket.setMulticastTTL(1);

    try {
      socket.addMembership(MULTICAST_ADDRESS);
    } catch (error) {
      this.onError?.(`multicast discovery unavailable: ${toErrorMessage(error)}`);
    }

    this.announceTimer = setInterval(() => {
      void this.announce();
    }, ANNOUNCE_MS);

    this.pruneTimer = setInterval(() => {
      this.pruneStalePeers();
    }, PRUNE_MS);

    await this.announce();
  }

  updateLocalPresence(presence: LocalPetPresence): void {
    this.localPresence = sanitiseLocalPresence(presence);
  }

  getRemotePets(): RemotePetPresence[] {
    return [...this.remotePets.values()].sort(compareRemotePets);
  }

  async stop(): Promise<void> {
    if (this.announceTimer) {
      clearInterval(this.announceTimer);
      this.announceTimer = undefined;
    }

    if (this.pruneTimer) {
      clearInterval(this.pruneTimer);
      this.pruneTimer = undefined;
    }

    const socket = this.socket;
    this.socket = undefined;

    if (!socket) {
      return;
    }

    await new Promise<void>((resolve) => {
      socket.close(() => resolve());
    });
  }

  private handleMessage(message: Buffer): void {
    const remotePet = parsePresenceMessage(message.toString("utf8"), this.instanceId, new Date());

    if (!remotePet) {
      return;
    }

    this.remotePets.set(remotePet.instanceId, remotePet);
    this.onChange?.();
  }

  private pruneStalePeers(): void {
    const now = Date.now();
    let changed = false;

    for (const [instanceId, pet] of this.remotePets.entries()) {
      if (now - new Date(pet.lastSeenAt).getTime() > STALE_MS) {
        this.remotePets.delete(instanceId);
        changed = true;
      }
    }

    if (changed) {
      this.onChange?.();
    }
  }

  private async announce(): Promise<void> {
    if (!this.socket || !this.localPresence) {
      return;
    }

    const payload = JSON.stringify({
      protocol: PROTOCOL,
      instanceId: this.instanceId,
      ...this.localPresence
    } satisfies PresencePayload);

    await Promise.allSettled([
      sendMessage(this.socket, payload, DISCOVERY_PORT, MULTICAST_ADDRESS),
      sendMessage(this.socket, payload, DISCOVERY_PORT, BROADCAST_ADDRESS)
    ]);
  }
}

export function parsePresenceMessage(
  rawMessage: string,
  localInstanceId: string,
  now: Date
): RemotePetPresence | undefined {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawMessage);
  } catch {
    return undefined;
  }

  if (!isRecord(parsed) || parsed.protocol !== PROTOCOL || parsed.instanceId === localInstanceId) {
    return undefined;
  }

  const speciesId = getDisplayName(parsed.speciesId, "unknown-pet");

  return {
    instanceId: getDisplayName(parsed.instanceId, "unknown-instance"),
    ownerName: getDisplayName(parsed.ownerName, "owner"),
    petName: getDisplayName(parsed.petName, "Pet"),
    speciesId,
    speciesName: getDisplayName(parsed.speciesName, speciesId),
    ageDays: getWholeNumber(parsed.ageDays, 0),
    health: getMeterValue(parsed.health, 0),
    hunger: getMeterValue(parsed.hunger, 0),
    isDead: typeof parsed.isDead === "boolean" ? parsed.isDead : false,
    lastSeenAt: now.toISOString()
  };
}

function buildInstanceId(): string {
  return shortHash(`${hostname()}:${process.pid}:${Date.now()}:${Math.random()}`);
}

function sanitiseLocalPresence(presence: LocalPetPresence): LocalPetPresence {
  return {
    ownerName: getDisplayName(presence.ownerName, "owner"),
    petName: getDisplayName(presence.petName, "Pet"),
    speciesId: getDisplayName(presence.speciesId, "unknown-pet"),
    speciesName: getDisplayName(presence.speciesName, presence.speciesId),
    ageDays: getWholeNumber(presence.ageDays, 0),
    health: getMeterValue(presence.health, 0),
    hunger: getMeterValue(presence.hunger, 0),
    isDead: Boolean(presence.isDead)
  };
}

function getDisplayName(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function getWholeNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.round(value));
}

function getMeterValue(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return clamp(value, 0, 100);
}

function compareRemotePets(left: RemotePetPresence, right: RemotePetPresence): number {
  return [left.ownerName, left.petName, left.speciesName, left.instanceId].join("\0").localeCompare(
    [right.ownerName, right.petName, right.speciesName, right.instanceId].join("\0")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function sendMessage(socket: Socket, message: string, port: number, address: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    socket.send(message, port, address, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
