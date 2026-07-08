import type { PetState, SpeechState } from "./pet-state.js";
import type { PetSpecies } from "../pets/types.js";
import type { HealthBand, HungerBand } from "../pets/types.js";
import { clamp } from "../util/format.js";
import { lineForTrigger } from "./speech.js";

export interface GitEvent {
  type: "commit" | "branch-switch";
  repoPath: string;
  message: string;
  occurredAt: Date;
}

export interface EngineOutcome {
  changed: boolean;
  speech?: SpeechState;
}

const HUNGER_DECAY_PER_MINUTE = 40 / 60;
const LOW_HEALTH_DECAY_PER_MINUTE = 3 / 60;
const MID_HEALTH_DECAY_PER_MINUTE = 1.2 / 60;
const HIGH_HEALTH_RECOVERY_PER_MINUTE = 1.5 / 60;
const MID_HEALTH_RECOVERY_PER_MINUTE = 0.6 / 60;
const MAX_MINUTES_PER_TICK = 15;
const AMBIENT_COOLDOWN_MINUTES = 3;
const AMBIENT_CHANCE_PER_TICK = 0.08;

export class PetEngine {
  constructor(
    private readonly state: PetState,
    private readonly species: PetSpecies,
    private readonly random: () => number = Math.random
  ) {}

  getState(): PetState {
    return this.state;
  }

  getAgeDays(): number {
    return this.state.activeDays.length;
  }

  getAverageLifetimeHealth(): number {
    return this.state.healthSampleTotal / Math.max(this.state.healthSampleMinutes, 1);
  }

  getMaxAgeDays(): number {
    return 7 + Math.round((this.getAverageLifetimeHealth() / 100) * 14);
  }

  isDead(): boolean {
    return Boolean(this.state.deathAt);
  }

  tick(now: Date): EngineOutcome {
    if (this.isDead()) {
      this.state.lastTickAt = now.toISOString();
      return { changed: false };
    }

    const previousHungerBand = getHungerBand(this.state.hunger);
    const previousHealthBand = getHealthBand(this.state.health);
    const previousLastTick = new Date(this.state.lastTickAt);
    const elapsedMinutes = Math.max(
      0,
      Math.min((now.getTime() - previousLastTick.getTime()) / 60000, MAX_MINUTES_PER_TICK)
    );

    this.state.lastTickAt = now.toISOString();

    if (elapsedMinutes === 0) {
      return { changed: false };
    }

    this.state.hunger = clamp(this.state.hunger - elapsedMinutes * HUNGER_DECAY_PER_MINUTE, 0, 100);

    if (this.state.hunger < 20) {
      this.state.health = clamp(this.state.health - elapsedMinutes * LOW_HEALTH_DECAY_PER_MINUTE, 0, 100);
    } else if (this.state.hunger < 35) {
      this.state.health = clamp(this.state.health - elapsedMinutes * MID_HEALTH_DECAY_PER_MINUTE, 0, 100);
    } else if (this.state.hunger > 80) {
      this.state.health = clamp(this.state.health + elapsedMinutes * HIGH_HEALTH_RECOVERY_PER_MINUTE, 0, 100);
    } else if (this.state.hunger > 65) {
      this.state.health = clamp(this.state.health + elapsedMinutes * MID_HEALTH_RECOVERY_PER_MINUTE, 0, 100);
    }

    this.state.healthSampleTotal += this.state.health * elapsedMinutes;
    this.state.healthSampleMinutes += elapsedMinutes;

    if (this.state.health <= 0) {
      return this.die(now, "health");
    }

    const hungerBand = getHungerBand(this.state.hunger);
    if (hungerBand !== previousHungerBand) {
      return this.makeOutcome(now, "alert", lineForTrigger(this.species, { kind: "hunger-band", band: hungerBand }, this.random));
    }

    const healthBand = getHealthBand(this.state.health);
    if (healthBand !== previousHealthBand) {
      return this.makeOutcome(now, "alert", lineForTrigger(this.species, { kind: "health-band", band: healthBand }, this.random));
    }

    const ambient = this.maybeAmbient(now);
    if (ambient) {
      return ambient;
    }

    return { changed: true };
  }

  applyGitEvent(event: GitEvent, now: Date): EngineOutcome {
    if (this.isDead()) {
      return { changed: false };
    }

    const previousHungerBand = getHungerBand(this.state.hunger);
    const previousHealthBand = getHealthBand(this.state.health);

    this.markActiveDay(event.occurredAt);
    this.state.lastEventAt = event.occurredAt.toISOString();
    this.state.lastTickAt = now.toISOString();
    this.state.gitEventCount += 1;

    if (event.type === "commit") {
      this.state.commitCount += 1;
      this.state.hunger = clamp(this.state.hunger + 10, 0, 100);
    } else {
      this.state.branchSwitchCount += 1;
      this.state.hunger = clamp(this.state.hunger + 2, 0, 100);
    }

    this.state.healthSampleTotal += this.state.health;
    this.state.healthSampleMinutes += 1;

    if (this.getAgeDays() > this.getMaxAgeDays()) {
      return this.die(now, "age");
    }

    const eventSpeech = lineForTrigger(
      this.species,
      event.type === "commit" ? { kind: "commit" } : { kind: "branch-switch" },
      this.random
    );

    const hungerBand = getHungerBand(this.state.hunger);
    if (hungerBand !== previousHungerBand) {
      return this.makeOutcome(now, "event", eventSpeech);
    }

    const healthBand = getHealthBand(this.state.health);
    if (healthBand !== previousHealthBand) {
      return this.makeOutcome(now, "event", eventSpeech);
    }

    return this.makeOutcome(now, "event", eventSpeech);
  }

  toggleAmbientMute(): boolean {
    this.state.ambientMuted = !this.state.ambientMuted;
    return this.state.ambientMuted;
  }

  private markActiveDay(now: Date): void {
    const day = now.toISOString().slice(0, 10);

    if (!this.state.activeDays.includes(day)) {
      this.state.activeDays.push(day);
      this.state.activeDays.sort();
    }
  }

  private maybeAmbient(now: Date): EngineOutcome | undefined {
    if (this.state.ambientMuted) {
      return undefined;
    }

    if (this.state.lastEventAt === undefined) {
      return undefined;
    }

    const lastSpeechAt = this.state.lastSpeechAt ?? this.state.lastEventAt;

    if (!lastSpeechAt) {
      return undefined;
    }

    const sinceLastSpeechMinutes = Math.max(0, (now.getTime() - new Date(lastSpeechAt).getTime()) / 60000);

    if (sinceLastSpeechMinutes < AMBIENT_COOLDOWN_MINUTES) {
      return undefined;
    }

    if (this.random() > AMBIENT_CHANCE_PER_TICK) {
      return undefined;
    }

    return this.makeOutcome(now, "ambient", lineForTrigger(this.species, { kind: "ambient" }, this.random));
  }

  private die(now: Date, reason: "health" | "age"): EngineOutcome {
    this.state.deathAt = now.toISOString();
    this.state.deathReason = reason;
    return this.makeOutcome(now, "dead", lineForTrigger(this.species, { kind: "dead" }, this.random));
  }

  private makeOutcome(
    now: Date,
    tone: SpeechState["tone"],
    text: string
  ): EngineOutcome {
    this.state.lastSpeechAt = now.toISOString();

    return {
      changed: true,
      speech: {
        text,
        tone,
        createdAt: this.state.lastSpeechAt
      }
    };
  }
}

export function getHungerBand(hunger: number): HungerBand {
  if (hunger < 20) {
    return "starving";
  }

  if (hunger < 45) {
    return "hungry";
  }

  if (hunger < 75) {
    return "content";
  }

  return "full";
}

export function getHealthBand(health: number): HealthBand {
  if (health < 20) {
    return "critical";
  }

  if (health < 45) {
    return "weak";
  }

  if (health < 75) {
    return "steady";
  }

  return "thriving";
}
