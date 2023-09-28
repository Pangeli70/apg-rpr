import { ApgGui_Builder } from "./ApgGuiBuilder.ts";
export class ApgWgl_GuiBuilder extends ApgGui_Builder {
  params;
  VIEWER_SETTINGS_DIALOG_CNT = "ViewerSettingsDialogControl";
  constructor(agui, aname, aparams) {
    super(agui, aname);
    this.params = {
      ...aparams,
      worldSizeMMS: { min: 500, max: 2e3, step: 500 },
      toneMappingValues: /* @__PURE__ */ new Map([
        ["0", "NoToneMapping"],
        ["1", "LinearToneMapping"],
        ["2", "ReinhardToneMapping"],
        ["3", "CineonToneMapping"],
        ["5", "ACESFilmicToneMapping"],
        ["6", "CustomToneMapping"]
      ]),
      outputColorSpaceValues: /* @__PURE__ */ new Map([
        ["", "NoColorSpace"],
        ["srgb", "SRGBColorSpace"],
        ["srgb-linear", "LinearSRGBColorSpace"],
        ["display-p3", "DisplayP3ColorSpace"]
      ]),
      shadowMapTypeValues: /* @__PURE__ */ new Map([
        ["0", "BasicShadowMap "],
        ["1", "PCFShadowMap"],
        ["2", "PCFSoftShadowMap"],
        ["3", "VSMShadowMap"]
      ])
    };
  }
  /**
   * 
   * @returns 
   */
  buildHtml() {
    const viewerSettingsDialogControl = this.#buildViewerSettingsDialogControl();
    const VIEWER_SETTINGS_BTN_CNT = "ViewerSettingsButtonControl";
    const viewerSettingsButtonControl = this.buildButtonControl(
      VIEWER_SETTINGS_BTN_CNT,
      "Viewer",
      () => {
        const dialog = this.gui.controls.get(this.VIEWER_SETTINGS_DIALOG_CNT).element;
        dialog.showModal();
      }
    );
    const controls = [
      viewerSettingsDialogControl,
      viewerSettingsButtonControl
    ];
    const r = controls.join("\n");
    return r;
  }
  buildSimulationChangeControl() {
    const simulationsKVs = /* @__PURE__ */ new Map();
    for (const panel of this.params.simulations) {
      simulationsKVs.set(panel, panel);
    }
    const SIM_SELECT_CNT = "simulationSelectControl";
    const r = this.buildSelectControl(
      SIM_SELECT_CNT,
      "",
      this.params.simulation,
      simulationsKVs,
      () => {
        const select = this.gui.controls.get(SIM_SELECT_CNT).element;
        this.params.simulation = select.value;
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
        this.params.restart = true;
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
    const SIM_FRIC_ITER_CNT = "simulationFrictionIterationsControl";
    const simulationFrictionIterationsControl = this.buildRangeControl(
      SIM_FRIC_ITER_CNT,
      "Friction precision",
      this.params.guiSettings.frictionIterations,
      this.params.guiSettings.frictionIterationsMMS.min,
      this.params.guiSettings.frictionIterationsMMS.max,
      this.params.guiSettings.frictionIterationsMMS.step,
      () => {
        const range = this.gui.controls.get(SIM_FRIC_ITER_CNT).element;
        this.params.guiSettings.frictionIterations = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_FRIC_ITER_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_STAB_ITER_CNT = "simulationStabilizationIterationsControl";
    const simulationStabilizationIterationsControl = this.buildRangeControl(
      SIM_STAB_ITER_CNT,
      "Stabilization precision",
      this.params.guiSettings.stabilizationIterations,
      this.params.guiSettings.stabilizationIterationsMMS.min,
      this.params.guiSettings.stabilizationIterationsMMS.max,
      this.params.guiSettings.stabilizationIterationsMMS.step,
      () => {
        const range = this.gui.controls.get(SIM_STAB_ITER_CNT).element;
        this.params.guiSettings.stabilizationIterations = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_STAB_ITER_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_LIN_ERR_CNT = "simulationLinearErrorControl";
    const simulationLinearErrorControl = this.buildRangeControl(
      SIM_LIN_ERR_CNT,
      "Linear error",
      this.params.guiSettings.linearError,
      this.params.guiSettings.linearErrorMMS.min,
      this.params.guiSettings.linearErrorMMS.max,
      this.params.guiSettings.linearErrorMMS.step,
      () => {
        const range = this.gui.controls.get(SIM_LIN_ERR_CNT).element;
        this.params.guiSettings.linearError = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_LIN_ERR_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_ERR_REDUC_RATIO_CNT = "simulationErrorReductionRatioControl";
    const simulationErrorReductionRatioControl = this.buildRangeControl(
      SIM_ERR_REDUC_RATIO_CNT,
      "Error reduction",
      this.params.guiSettings.errorReductionRatio,
      this.params.guiSettings.errorReductionRatioMMS.min,
      this.params.guiSettings.errorReductionRatioMMS.max,
      this.params.guiSettings.errorReductionRatioMMS.step,
      () => {
        const range = this.gui.controls.get(SIM_ERR_REDUC_RATIO_CNT).element;
        this.params.guiSettings.errorReductionRatio = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_ERR_REDUC_RATIO_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const SIM_PREDICTION_DISTANCE_CNT = "simulationPredictionDistanceControl";
    const simulationPredictionDistanceControl = this.buildRangeControl(
      SIM_PREDICTION_DISTANCE_CNT,
      "Prediction distance",
      this.params.guiSettings.predictionDistance,
      this.params.guiSettings.predictionDistanceMMS.min,
      this.params.guiSettings.predictionDistanceMMS.max,
      this.params.guiSettings.predictionDistanceMMS.step,
      () => {
        const range = this.gui.controls.get(SIM_PREDICTION_DISTANCE_CNT).element;
        this.params.guiSettings.predictionDistance = parseFloat(range.value);
        const output = this.gui.controls.get(`${SIM_PREDICTION_DISTANCE_CNT}Value`).element;
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
    const RESET_BTN_CNT = "resetButtonControl";
    const resetButtonControl = this.buildButtonControl(
      RESET_BTN_CNT,
      "Reset",
      () => {
        this.params.guiSettings.doResetToDefaults = true;
        this.gui.logNoTime("Reset button pressed");
      }
    );
    const r = this.buildGroupControl(
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
      this.params.guiSettings.isSimulationGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.params.guiSettings.isSimulationGroupOpened = !this.params.guiSettings.isSimulationGroupOpened;
          this.gui.logNoTime("Simulation group toggled");
        }
      }
    );
    return r;
  }
  #buildViewerSettingsDialogControl() {
    const VIEWER_SETTINGS_CLOSE_BTN_CNT = "viewerSettingsDialogCloseButtonControl";
    const viewerSettingsDialogCloseButtonControl = this.buildButtonControl(
      VIEWER_SETTINGS_CLOSE_BTN_CNT,
      "Close",
      () => {
        const dialog = this.gui.controls.get(this.VIEWER_SETTINGS_DIALOG_CNT).element;
        dialog.close();
      }
    );
    const r = this.buildDialogControl(
      this.VIEWER_SETTINGS_DIALOG_CNT,
      "Credits:",
      [
        viewerSettingsDialogCloseButtonControl
      ]
    );
    return r;
  }
}
