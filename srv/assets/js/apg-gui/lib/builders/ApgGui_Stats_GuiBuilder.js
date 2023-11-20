import {
  ApgGui_Builder
} from "../classes/ApgGui_Builder.ts";
export class ApgGui_Stats_GuiBuilder extends ApgGui_Builder {
  _stats;
  constructor(agui, astats) {
    super(agui, "Stats gui builder");
    this._stats = astats;
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
    const panelsNames = this._stats.panelsNames;
    const keyValues = /* @__PURE__ */ new Map();
    keyValues.set(this._stats.SHOW_ALL_PANELS.toString(), "All");
    for (let i = 0; i < panelsNames.length; i++) {
      keyValues.set(`${i}`, panelsNames[i]);
    }
    const STAT_PANEL_SELECT_CNT = "statPanelSelectControl";
    const statPanelSelectControl = this.buildSelectControl(
      STAT_PANEL_SELECT_CNT,
      "Show",
      this._stats.currentPanelKey,
      keyValues,
      () => {
        const select = this.gui.controls.get(STAT_PANEL_SELECT_CNT).element;
        const newPanelIndex = parseInt(select.value);
        this._stats.showPanel(newPanelIndex);
      }
    );
    const STAT_DIV_SELECT_CNT = "statDivControl";
    const statDivControl = this.buildDivControl(
      STAT_DIV_SELECT_CNT,
      "",
      "",
      this._stats.element
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
          this._stats.isStatsPanelOpened = !this._stats.isStatsPanelOpened;
        }
      }
    );
    return r;
  }
}
