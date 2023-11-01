import {
  ApgGui_Builder
} from "./ApgGui_Builder.ts";
export class ApgRpr_Stats_GuiBuilder extends ApgGui_Builder {
  stats;
  constructor(agui, astats) {
    super(agui, "Stats gui builder");
    this.stats = astats;
  }
  buildControls() {
    const statsGroupControl = this.#buildStatsGroupControl();
    const controls = [
      statsGroupControl
    ];
    const r = controls.join("\n");
    return r;
  }
  #buildStatsGroupControl() {
    const panelsNames = this.stats.panelsNames;
    const keyValues = /* @__PURE__ */ new Map();
    keyValues.set(this.stats.SHOW_ALL_PANELS.toString(), "All");
    for (let i = 0; i < panelsNames.length; i++) {
      keyValues.set(`${i}`, panelsNames[i]);
    }
    const STAT_PANEL_SELECT_CNT = "statPanelSelectControl";
    const statPanelSelectControl = this.buildSelectControl(
      STAT_PANEL_SELECT_CNT,
      "Show",
      this.stats.currentPanelKey,
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
    const r = this.buildDetailsControl(
      "statsGroupControl",
      "Statistics:",
      [
        statPanelSelectControl,
        statDivControl
      ],
      false,
      () => {
        if (!this.gui.isRefreshing) {
          this.stats.isStatsPanelOpened = !this.stats.isStatsPanelOpened;
        }
      }
    );
    return r;
  }
}
