import { ApgGui_Builder } from "./ApgGuiBuilder.ts";
export class ApgRprSimStatsGuiBuilder extends ApgGui_Builder {
  params;
  stats;
  constructor(agui, aparams) {
    super(agui, aparams.simulation);
    this.params = aparams;
    this.stats = this.params.stats;
  }
  buildHtml() {
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
      "statsGroupControl",
      "Statistics:",
      [
        statPanelSelectControl,
        statDivControl
      ],
      this.params.guiSettings.isStatsGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.params.guiSettings.isStatsGroupOpened = !this.params.guiSettings.isStatsGroupOpened;
          this.gui.log("Stats group toggled");
        }
      }
    );
    return r;
  }
}
