import blessed from "blessed";
import type { RenderModel } from "./render.js";
import { buildArt, buildFooter, buildHeader, buildNearbyArt, buildSpeech, buildStats } from "./render.js";

export class PetScreen {
  private readonly screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: "pet-term"
  });

  private readonly header = blessed.box({
    top: 0,
    left: 1,
    width: "100%-2",
    height: 3,
    tags: false
  });

  private readonly speech = blessed.box({
    top: 3,
    left: "center",
    width: "70%",
    height: 5,
    border: "line",
    padding: { left: 1, right: 1 },
    valign: "middle"
  });

  private readonly art = blessed.box({
    top: 9,
    left: "25%-12",
    width: 22,
    height: 8,
    border: "line",
    align: "center",
    valign: "middle"
  });

  private readonly nearby = blessed.box({
    top: 9,
    left: "50%+2",
    width: 30,
    height: 14,
    border: "line",
    padding: { left: 1, right: 1 }
  });

  private readonly stats = blessed.box({
    bottom: 2,
    left: "center",
    width: "70%",
    height: 10,
    border: "line",
    padding: { left: 1, right: 1 }
  });

  private readonly footer = blessed.box({
    bottom: 0,
    left: 1,
    width: "100%-2",
    height: 1,
    tags: false
  });

  constructor() {
    this.screen.append(this.header);
    this.screen.append(this.speech);
    this.screen.append(this.art);
    this.screen.append(this.nearby);
    this.screen.append(this.stats);
    this.screen.append(this.footer);
  }

  bindQuit(onQuit: () => void): void {
    this.screen.key(["q", "C-c"], () => onQuit());
  }

  bindRescan(onRescan: () => void): void {
    this.screen.key(["r"], () => onRescan());
  }

  bindMute(onMute: () => void): void {
    this.screen.key(["m"], () => onMute());
  }

  render(model: RenderModel): void {
    this.header.setContent(buildHeader(model));
    this.speech.setLabel(` ${model.ownerName}'s ${model.petName} `);
    this.speech.setContent(buildSpeech(model));
    this.art.setLabel(` ${model.petName} `);
    this.art.setContent(buildArt(model));
    this.nearby.setLabel(" Nearby pets ");
    this.nearby.setContent(buildNearbyArt(model));
    this.stats.setLabel(` ${model.petName} status `);
    this.stats.setContent(buildStats(model));
    this.footer.setContent(buildFooter());
    this.screen.render();
  }

  destroy(): void {
    this.screen.destroy();
  }
}
