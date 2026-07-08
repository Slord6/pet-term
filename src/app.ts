import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { PetEngine, type GitEvent } from "./domain/pet-engine.js";
import type { RootState, SpeechState } from "./domain/pet-state.js";
import { GitPoller } from "./git/poller.js";
import { PetDiscovery } from "./network/discovery.js";
import { getPetSpecies } from "./pets/index.js";
import { StateStore } from "./store/state-store.js";
import { PetScreen } from "./tui/screen.js";
import type { RenderModel } from "./tui/render.js";

const FRAME_MS_MIN = 250;
const FRAME_MS_MAX = 1200;
const TICK_MS = 1000;
const POLL_MS = 5000;
const RESCAN_MS = 60000;
const SPEECH_TTL_MS = 10000;

export interface RunAppOptions {
  ownerName?: string;
  petName?: string;
  speciesId?: string;
}

export async function runApp(rootArg: string, options: RunAppOptions = {}): Promise<void> {
  const rootPath = resolve(rootArg);
  await assertDirectory(rootPath);

  const store = new StateStore(rootPath);
  const loadedState = await store.load();
  applyIdentityOverrides(loadedState, options);
  const species = getPetSpecies(loadedState.pet.speciesId);
  const engine = new PetEngine(loadedState.pet, species);
  const poller = new GitPoller(rootPath, loadedState.repoOffsets);
  const screen = new PetScreen();
  let render: () => void = () => undefined;
  const discovery = new PetDiscovery(
    () => {
      if (!shuttingDown) {
        render();
      }
    },
    (message) => {
      lastEventLabel = message;
      render();
    }
  );

  let frameIndex = 0;
  let currentSpeech: SpeechState | undefined;
  let lastEventLabel = "waiting for git activity";
  let shuttingDown = false;
  let resolveExit: (() => void) | undefined;
  const exitPromise = new Promise<void>((resolve) => {
    resolveExit = resolve;
  });

  await poller.scan();
  await persistState(store, loadedState, poller);

  discovery.updateLocalPresence({
    ownerName: engine.getState().ownerName,
    petName: engine.getState().petName,
    speciesId: engine.getState().speciesId,
    speciesName: species.name,
    ageDays: engine.getAgeDays(),
    health: engine.getState().health,
    hunger: engine.getState().hunger,
    isDead: engine.isDead()
  });

  render = (): void => {
    discovery.updateLocalPresence({
      ownerName: engine.getState().ownerName,
      petName: engine.getState().petName,
      speciesId: engine.getState().speciesId,
      speciesName: species.name,
      ageDays: engine.getAgeDays(),
      health: engine.getState().health,
      hunger: engine.getState().hunger,
      isDead: engine.isDead()
    });

    const model: RenderModel = {
      species,
      frameIndex,
      ownerName: engine.getState().ownerName,
      petName: engine.getState().petName,
      hunger: engine.getState().hunger,
      health: engine.getState().health,
      ageDays: engine.getAgeDays(),
      maxAgeDays: engine.getMaxAgeDays(),
      averageHealth: engine.getAverageLifetimeHealth(),
      commitCount: engine.getState().commitCount,
      branchSwitchCount: engine.getState().branchSwitchCount,
      repoCount: poller.getRepoCount(),
      rootPath,
      lastEventLabel,
      speech: currentSpeech && !speechExpired(currentSpeech, new Date()) ? currentSpeech : undefined,
      isDead: engine.isDead(),
      ambientMuted: engine.getState().ambientMuted,
      nearbyPets: discovery.getRemotePets().map((pet) => ({
        ...(() => {
          const remoteSpecies = getPetSpecies(pet.speciesId, pet.speciesName);
          return {
            speciesName: remoteSpecies.name,
            artFrames: remoteSpecies.frames
          };
        })(),
        ownerName: pet.ownerName,
        petName: pet.petName,
        ageDays: pet.ageDays,
        health: pet.health,
        hunger: pet.hunger,
        isDead: pet.isDead
      }))
    };

    screen.render(model);
  };

  try {
    await discovery.start();
  } catch (error) {
    lastEventLabel = error instanceof Error ? error.message : String(error);
  }

  const queueSpeech = (speech: SpeechState | undefined): void => {
    if (speech) {
      currentSpeech = speech;
    }
  };

  const shutdown = async (): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    clearTimeout(frameTimer);
    clearInterval(tickTimer);
    clearInterval(pollTimer);
    clearInterval(scanTimer);
    await persistState(store, loadedState, poller);
    await discovery.stop();
    screen.destroy();
    resolveExit?.();
  };

  screen.bindQuit(() => {
    void shutdown();
  });

  screen.bindMute(() => {
    engine.toggleAmbientMute();
    void persistState(store, loadedState, poller);
    render();
  });

  screen.bindRescan(() => {
    runSafe(async () => {
      await poller.scan();
      lastEventLabel = `rescanned ${poller.getRepoCount()} repos`;
      await persistState(store, loadedState, poller);
      render();
    }, (message) => {
      lastEventLabel = message;
      render();
    });
  });

  let frameTimer: ReturnType<typeof setTimeout> | undefined;
  const scheduleNextFrame = (): void => {
    frameTimer = setTimeout(() => {
      frameIndex = (frameIndex + 1) % species.frames.length;
      render();

      if (!shuttingDown) {
        scheduleNextFrame();
      }
    }, getNextFrameDelayMs());
  };
  scheduleNextFrame();

  const tickTimer = setInterval(() => {
    runSafe(async () => {
      const outcome = engine.tick(new Date());
      queueSpeech(outcome.speech);
      await persistState(store, loadedState, poller);
      render();
    }, (message) => {
      lastEventLabel = message;
      render();
    });
  }, TICK_MS);

  const pollTimer = setInterval(() => {
    runSafe(async () => {
      const events = await poller.poll();

      for (const event of events) {
        handleEvent(event, engine, queueSpeech);
      }

      if (events.length > 0) {
        const event = events[events.length - 1];
        lastEventLabel = `${event.type} in ${event.repoPath}`;
      }

      await persistState(store, loadedState, poller);
      render();
    }, (message) => {
      lastEventLabel = message;
      render();
    });
  }, POLL_MS);

  const scanTimer = setInterval(() => {
    runSafe(async () => {
      await poller.scan();
      await persistState(store, loadedState, poller);
      render();
    }, (message) => {
      lastEventLabel = message;
      render();
    });
  }, RESCAN_MS);

  render();
  await exitPromise;
}

function handleEvent(
  event: GitEvent,
  engine: PetEngine,
  queueSpeech: (speech: SpeechState | undefined) => void
): void {
  const outcome = engine.applyGitEvent(event, new Date());
  queueSpeech(outcome.speech);
}

async function persistState(store: StateStore, state: RootState, poller: GitPoller): Promise<void> {
  state.repoOffsets = poller.getOffsets();
  await store.save(state);
}

function speechExpired(speech: SpeechState, now: Date): boolean {
  return now.getTime() - new Date(speech.createdAt).getTime() > SPEECH_TTL_MS;
}

function getNextFrameDelayMs(): number {
  return Math.floor(Math.random() * (FRAME_MS_MAX - FRAME_MS_MIN + 1)) + FRAME_MS_MIN;
}

async function assertDirectory(rootPath: string): Promise<void> {
  const details = await stat(rootPath);

  if (!details.isDirectory()) {
    throw new Error(`${rootPath} is not a directory`);
  }
}

function runSafe(task: () => Promise<void>, onError: (message: string) => void): void {
  void task().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    onError(message);
  });
}

function applyIdentityOverrides(state: RootState, options: RunAppOptions): void {
  const previousSpeciesId = state.pet.speciesId;

  if (options.speciesId && options.speciesId !== previousSpeciesId) {
    state.pet.speciesId = options.speciesId;

    if (!options.petName && state.pet.petName === getPetSpecies(previousSpeciesId).name) {
      state.pet.petName = getPetSpecies(options.speciesId).name;
    }
  }

  if (options.ownerName) {
    state.pet.ownerName = options.ownerName;
  }

  if (options.petName) {
    state.pet.petName = options.petName;
  }
}
