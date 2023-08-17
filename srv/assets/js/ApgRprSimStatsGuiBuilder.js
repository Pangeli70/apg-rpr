import { ApgGuiBuilder } from "./ApgGuiBuilder.ts";
export class ApgRprSimStatsGuiBuilder extends ApgGuiBuilder {
  stats;
  constructor(agui, astats) {
    super(agui);
    this.stats = astats;
  }
  build() {
    const statsGroupControl = this.#buildStatsGroupControl();
    const controls = [
      statsGroupControl
    ];
    const r = controls.join("\n");
    return r;
  }
  #buildStatsGroupControl() {
    const panelsNames = Array.from(this.stats.panels.keys());
    const keyValues = /* @__PURE__ */ new Map();
    for (let i = 0; i < panelsNames.length; i++) {
      keyValues.set(`${i}`, panelsNames[i]);
    }
    const STAT_PANEL_SELECT_CNT = "statPanelSelectControl";
    const statPanelSelectControl = this.buildSelectControl(
      STAT_PANEL_SELECT_CNT,
      "Stat",
      this.stats.currentPanelIndex.toString(),
      keyValues,
      () => {
        const select = this.gui.controls.get(STAT_PANEL_SELECT_CNT).element;
        const newPanelIndex = parseInt(select.value);
        this.stats.showPanel(newPanelIndex);
      }
    );
    const STAT_DIV_SELECT_CNT = "statDivControl";
    const statDivControl = this.buildDivControl(
      STAT_DIV_SELECT_CNT,
      "",
      "",
      this.stats.container
    );
    const r = this.buildGroupControl(
      "Statistics:",
      [
        statPanelSelectControl,
        statDivControl
      ]
    );
    return r;
  }
}
