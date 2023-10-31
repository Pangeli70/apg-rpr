import {
  ApgGui_Builder
} from "./ApgGui_Builder.ts";
import {
  ApgRprSim_DebugGuiBuilder
} from "./ApgRprSim_DebugGuiBuilder.ts";
import {
  ApgRprSim_LoggerGuiBuilder
} from "./ApgRprSim_LoggerGuiBuilder.ts";
import {
  ApgRprSim_StatsGuiBuilder
} from "./ApgRprSim_StatsGuiBuilder.ts";
import {
  ApgWgl_GuiBuilder
} from "./ApgWgl_GuiBuilder.ts";
export class ApgRpr_Simulator_GuiBuilder extends ApgGui_Builder {
  simulator;
  settings;
  CREDITS_DIALOG_CNT = "creditsDialogControl";
  constructor(asimulator, asettings) {
    super(asimulator.gui, asettings.simulation);
    this.simulator = asimulator;
    this.settings = asettings;
  }
  /**
   * 
   * @returns 
   */
  buildPanel() {
    const simulationGroupControl = this.#buildSimulationGroupControl();
    const statsGroupControl = new ApgRprSim_StatsGuiBuilder(this.gui, this.simulator.stats).buildPanel();
    const debugGroupControl = new ApgRprSim_DebugGuiBuilder(this.gui, this.simulator.debugInfo).buildPanel();
    const loggerGroupControl = new ApgRprSim_LoggerGuiBuilder(this.gui, this.simulator.logger).buildPanel();
    const FULLSCREEN_BTN_CNT = "fullscreenButtonControl";
    const fullscreenButtonControl = this.buildButtonControl(
      FULLSCREEN_BTN_CNT,
      "Go full screen",
      () => {
        const button = this.gui.controls.get(FULLSCREEN_BTN_CNT).element;
        const docElement = this.gui.document.documentElement;
        if (docElement.requestFullscreen) {
          if (!this.gui.document.fullscreenElement) {
            docElement.requestFullscreen();
            button.innerText = "Exit full screen";
          } else {
            this.gui.document.exitFullscreen();
            button.innerText = "Go full screen";
          }
        } else {
          alert("Full screen not supported");
        }
      }
    );
    const GET_URL_BTN_CNT = "getUrlButtonControl";
    const getUrlButtonControl = this.buildButtonControl(
      GET_URL_BTN_CNT,
      "Get url",
      () => {
        const stringifiedSettings = JSON.stringify(this.settings);
        const b64EncodedSettings = btoa(stringifiedSettings);
        alert(stringifiedSettings);
        alert(b64EncodedSettings);
        alert("length: " + b64EncodedSettings.length);
        prompt("Copy url", "p=" + b64EncodedSettings);
      }
    );
    const creditsDialogControl = this.#buildCreditsDialogControl();
    const CREDITS_BTN_CNT = "creditsButtonControl";
    const creditsButtonControl = this.buildButtonControl(
      CREDITS_BTN_CNT,
      "Credits",
      () => {
        const dialog = this.gui.controls.get(this.CREDITS_DIALOG_CNT).element;
        dialog.showModal();
      }
    );
    const viewerSettingsControls = new ApgWgl_GuiBuilder(this.gui, this.name, this.simulator.viewer).buildPanel();
    const controls = [
      simulationGroupControl,
      statsGroupControl,
      debugGroupControl,
      loggerGroupControl,
      fullscreenButtonControl,
      getUrlButtonControl,
      creditsDialogControl,
      creditsButtonControl,
      viewerSettingsControls
    ];
    const r = controls.join("\n");
    return r;
  }
  buildHud() {
    return "";
  }
  buildSimulationChangeControl() {
    const simulationsKVs = /* @__PURE__ */ new Map();
    for (const simulation of this.simulator.simulationsNames) {
      simulationsKVs.set(simulation, simulation);
    }
    const SIM_SELECT_CNT = "simulationSelectControl";
    const r = this.buildSelectControl(
      SIM_SELECT_CNT,
      "",
      this.settings.simulation,
      simulationsKVs,
      () => {
        const select = this.gui.controls.get(SIM_SELECT_CNT).element;
        this.settings.simulation = select.value;
      }
    );
    return r;
  }
  buildRestartButtonControl() {
    const RESTART_BTN_CNT = "restartButtonControl";
    const r = this.buildButtonControl(
      RESTART_BTN_CNT,
      "Restart",
      () => {
        this.settings.doRestart = true;
        this.gui.logNoTime("Restart button pressed");
      }
    );
    return r;
  }
  #buildSimulationGroupControl() {
    const SIM_VEL_ITER_CNT = "simulationVelocityIterationsControl";
    const simulationVelocityIterationsControl = this.buildRangeControl(
      SIM_VEL_ITER_CNT,
      "Velocity precision",
      this.settings.velocityIterations,
      this.settings.velocityIterationsMMS,
      () => {
        const range = this.gui.controls.get(SIM_VEL_ITER_CNT).element;
        this.settings.velocityIterations = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_VEL_ITER_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_FRIC_ITER_CNT = "simulationFrictionIterationsControl";
    const simulationFrictionIterationsControl = this.buildRangeControl(
      SIM_FRIC_ITER_CNT,
      "Friction precision",
      this.settings.frictionIterations,
      this.settings.frictionIterationsMMS,
      () => {
        const range = this.gui.controls.get(SIM_FRIC_ITER_CNT).element;
        this.settings.frictionIterations = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_FRIC_ITER_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_STAB_ITER_CNT = "simulationStabilizationIterationsControl";
    const simulationStabilizationIterationsControl = this.buildRangeControl(
      SIM_STAB_ITER_CNT,
      "Stabilization precision",
      this.settings.stabilizationIterations,
      this.settings.stabilizationIterationsMMS,
      () => {
        const range = this.gui.controls.get(SIM_STAB_ITER_CNT).element;
        this.settings.stabilizationIterations = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_STAB_ITER_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_LIN_ERR_CNT = "simulationLinearErrorControl";
    const simulationLinearErrorControl = this.buildRangeControl(
      SIM_LIN_ERR_CNT,
      "Linear error",
      this.settings.linearError,
      this.settings.linearErrorMMS,
      () => {
        const range = this.gui.controls.get(SIM_LIN_ERR_CNT).element;
        this.settings.linearError = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_LIN_ERR_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_ERR_REDUC_RATIO_CNT = "simulationErrorReductionRatioControl";
    const simulationErrorReductionRatioControl = this.buildRangeControl(
      SIM_ERR_REDUC_RATIO_CNT,
      "Error reduction",
      this.settings.errorReductionRatio,
      this.settings.errorReductionRatioMMS,
      () => {
        const range = this.gui.controls.get(SIM_ERR_REDUC_RATIO_CNT).element;
        this.settings.errorReductionRatio = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_ERR_REDUC_RATIO_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_PREDICTION_DISTANCE_CNT = "simulationPredictionDistanceControl";
    const simulationPredictionDistanceControl = this.buildRangeControl(
      SIM_PREDICTION_DISTANCE_CNT,
      "Prediction distance",
      this.settings.predictionDistance,
      this.settings.predictionDistanceMMS,
      () => {
        const range = this.gui.controls.get(SIM_PREDICTION_DISTANCE_CNT).element;
        this.settings.predictionDistance = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_PREDICTION_DISTANCE_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_SPEED_CNT = "simulationSpeedControl";
    const simulationSpeedControl = this.buildRangeControl(
      SIM_SPEED_CNT,
      "Slowdown",
      this.settings.slowDownFactor,
      this.settings.slowdownMMS,
      () => {
        const range = this.gui.controls.get(SIM_SPEED_CNT).element;
        this.settings.slowDownFactor = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_SPEED_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const RESET_BTN_CNT = "resetButtonControl";
    const resetButtonControl = this.buildButtonControl(
      RESET_BTN_CNT,
      "Reset",
      () => {
        this.settings.doResetToDefaults = true;
        this.gui.logNoTime("Reset button pressed");
      }
    );
    const r = this.buildDetailsControl(
      "simulationGroupControl",
      "Simulation:",
      [
        simulationVelocityIterationsControl,
        simulationFrictionIterationsControl,
        simulationStabilizationIterationsControl,
        simulationLinearErrorControl,
        simulationErrorReductionRatioControl,
        simulationPredictionDistanceControl,
        simulationSpeedControl,
        resetButtonControl
      ],
      this.settings.isSimulationGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.settings.isSimulationGroupOpened = !this.settings.isSimulationGroupOpened;
          this.gui.logNoTime("Simulation group toggled");
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
