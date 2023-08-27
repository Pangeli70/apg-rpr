import { ApgGui_Builder } from "./ApgGuiBuilder.ts";
import { ApgRprSimStatsGuiBuilder } from "./ApgRprSimStatsGuiBuilder.ts";
import { ApgRprSimDebugGuiBuilder } from "./ApgRprSimDebugGuiBuilder.ts";
export class ApgRprSim_GuiBuilder extends ApgGui_Builder {
  params;
  CREDITS_DIALOG_CNT = "creditsDialogControl";
  constructor(agui, aparams) {
    super(agui, aparams.simulation);
    this.params = aparams;
  }
  /**
   * 
   * @returns 
   */
  buildHtml() {
    const statsGroupControl = new ApgRprSimStatsGuiBuilder(this.gui, this.params).buildHtml();
    const debugGroupControl = new ApgRprSimDebugGuiBuilder(this.gui, this.params.debugInfo).buildHtml();
    const simulationGroupControl = this.#buildSimulationGroupControl();
    const creditsDialogControl = this.#buildCreditsDialogControl();
    const RESTART_BTN_CNT = "restartButtonControl";
    const restartSimulationButtonControl = this.buildButtonControl(
      RESTART_BTN_CNT,
      "Restart",
      () => {
        this.params.restart = true;
        this.gui.log("Restart button pressed");
      }
    );
    const CREDITS_BTN_CNT = "creditsButtonControl";
    const creditsButtonControl = this.buildButtonControl(
      CREDITS_BTN_CNT,
      "Credits",
      () => {
        const dialog = this.gui.controls.get(this.CREDITS_DIALOG_CNT).element;
        dialog.showModal();
      }
    );
    const controls = [
      restartSimulationButtonControl,
      simulationGroupControl,
      statsGroupControl,
      debugGroupControl,
      creditsDialogControl,
      creditsButtonControl
    ];
    const r = controls.join("\n");
    return r;
  }
  #buildSimulationGroupControl() {
    const keyValues = /* @__PURE__ */ new Map();
    for (const panel of this.params.simulations) {
      keyValues.set(panel, panel);
    }
    const SIM_SELECT_CNT = "simulationSelectControl";
    const simulationSelectControl = this.buildSelectControl(
      SIM_SELECT_CNT,
      "Change",
      this.params.simulation,
      keyValues,
      () => {
        const select = this.gui.controls.get(SIM_SELECT_CNT).element;
        this.params.simulation = select.value;
      }
    );
    const SIM_VEL_ITER_CNT = "simulationVelocityIterationControl";
    const simulationVelocityIterationControl = this.buildRangeControl(
      SIM_VEL_ITER_CNT,
      "Precision",
      this.params.guiSettings.velocityIterations,
      this.params.guiSettings.velocityIterationsMMS.min,
      this.params.guiSettings.velocityIterationsMMS.max,
      this.params.guiSettings.velocityIterationsMMS.step,
      () => {
        const range = this.gui.controls.get(SIM_VEL_ITER_CNT).element;
        this.params.guiSettings.velocityIterations = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_VEL_ITER_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_SPEED_CNT = "simulationSpeedControl";
    const simulationSpeedControl = this.buildRangeControl(
      SIM_SPEED_CNT,
      "Slowdown",
      this.params.guiSettings.slowdown,
      this.params.guiSettings.slowdownMMS.min,
      this.params.guiSettings.slowdownMMS.max,
      this.params.guiSettings.slowdownMMS.step,
      () => {
        const range = this.gui.controls.get(SIM_SPEED_CNT).element;
        this.params.guiSettings.slowdown = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_SPEED_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildGroupControl(
      "simulationGroupControl",
      "Simulation:",
      [
        simulationSelectControl,
        simulationVelocityIterationControl,
        simulationSpeedControl
      ],
      this.params.guiSettings.isSimulationGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.params.guiSettings.isSimulationGroupOpened = !this.params.guiSettings.isSimulationGroupOpened;
          this.gui.log("Simulation group toggled");
        }
      }
    );
    return r;
  }
  #buildCreditsDialogControl() {
    const footer = this.gui.document.getElementById("footer");
    footer.innerHTML;
    const CREDITS_CLOSE_BTN_CNT = "creditsCloseButtonControl";
    const creditsCloseButtonControl = this.buildButtonControl(
      CREDITS_CLOSE_BTN_CNT,
      "Close",
      () => {
        const dialog = this.gui.controls.get(this.CREDITS_DIALOG_CNT).element;
        dialog.close();
      }
    );
    const r = this.buildDialogControl(
      this.CREDITS_DIALOG_CNT,
      "Credits:",
      [
        footer.innerHTML,
        creditsCloseButtonControl
      ]
    );
    return r;
  }
}
