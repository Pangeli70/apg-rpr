import {
  ApgGui_Builder
} from "./apg-gui/lib/classes/ApgGui_Builder.ts";
import {
  ApgRpr_Debug_GuiBuilder
} from "./ApgRpr_Debug_GuiBuilder.ts";
import {
  ApgGui_Logger_GuiBuilder
} from "./apg-gui/lib/builders/ApgGui_Logger_GuiBuilder.ts";
import {
  ApgGui_Stats_GuiBuilder
} from "./apg-gui/lib/builders/ApgGui_Stats_GuiBuilder.ts";
import {
  ApgWgl_GuiBuilder
} from "./apg-wgl/lib/classes/ApgWgl_GuiBuilder.ts";
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
   */
  buildControls() {
    const controls = [];
    controls.push(this.#buildSimulatorDetailsControl());
    controls.push(new ApgGui_Stats_GuiBuilder(this.gui, this.simulator.stats).buildControls());
    controls.push(new ApgRpr_Debug_GuiBuilder(this.gui, this.simulator.debugInfo).buildControls());
    controls.push(new ApgGui_Logger_GuiBuilder(this.gui, this.simulator.logger).buildControls());
    controls.push(this.#buildFullscreenButtonControl());
    controls.push(this.#buildGetUrlButtonControl());
    controls.push(new ApgWgl_GuiBuilder(this.gui, this.name, this.simulator.viewer).buildControls());
    controls.push(this.#buildCreditsDialogControl(this.CREDITS_DIALOG_CNT));
    controls.push(this.#buildCreditsDialogOpenButtonControl(this.CREDITS_DIALOG_CNT));
    const r = controls.join("\n");
    return r;
  }
  buildHudControls() {
    return "";
  }
  buildSimulationChangeControl() {
    const simulationsKVs = /* @__PURE__ */ new Map();
    for (const simulation of this.simulator.simulationsNames) {
      simulationsKVs.set(simulation, simulation);
    }
    const id = "simulationSelectControl";
    const r = this.buildSelectControl(
      id,
      "",
      this.settings.simulation,
      simulationsKVs,
      () => {
        const select = this.gui.controls.get(id).element;
        this.settings.simulation = select.value;
        this.gui.logNoTime(`Simulation control change event: ${select.value}`);
      }
    );
    return r;
  }
  #buildSimulatorDetailsControl() {
    const controls = [];
    const state = this.settings;
    controls.push(this.#buildVelocityIterationsControl(
      "simulationVelocityIterationsControl",
      state
    ));
    controls.push(this.#buildSimulationIterationsControl(
      "simulationFrictionIterationsControl",
      state
    ));
    controls.push(this.#buildStabilizationIterationsControl(
      "simulationStabilizationIterationsControl",
      state
    ));
    controls.push(this.#buildCcdStepsControl(
      "simulationCcdStepsIterationsControl",
      state
    ));
    controls.push(this.#buildLinearErrorControl(
      "simulationLinearErrorControl",
      state
    ));
    controls.push(this.#buildErrorReductionRatioControl(
      "simulationErrorReductionRatioControl",
      state
    ));
    controls.push(this.#buildPredictionDistanceControl(
      "simulationPredictionDistanceControl",
      state
    ));
    controls.push(this.#buildSimulationSpeedControl(
      "simulationSpeedControl",
      state
    ));
    controls.push(this.#buildGravityDetailsControl(
      "simulationGravityDetailsControl",
      state
    ));
    controls.push(this.#buildResetButtonControl(
      "resetButtonControl"
    ));
    controls.push(this.#buildResetCameraButtonControl(
      "resetCameraButtonControl"
    ));
    controls.push(this.#buildDebugModeButtonControl(
      "debugModeButtonControl"
    ));
    const id = "simulatorDetailsControl";
    const r = this.buildDetailsControl(
      id,
      "Simulator settings",
      controls,
      this.settings.isSimulatorDetailsOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.settings.isSimulatorDetailsOpened = !this.settings.isSimulatorDetailsOpened;
          this.gui.devLogNoTime(`${id} details toggled`);
        }
      }
    );
    return r;
  }
  buildRestartButtonControl() {
    const r = this.buildButtonControl(
      "restartButtonControl",
      "Restart",
      () => {
        this.settings.doRestart = true;
        this.gui.devLogNoTime("Restart button pressed");
      }
    );
    return r;
  }
  #buildDebugModeButtonControl(aId) {
    const initialTitle = `Debug mode ${this.settings.isDebugMode ? "Off" : "On"}`;
    const r = this.buildButtonControl(
      aId,
      initialTitle,
      () => {
        this.settings.isDebugMode = !this.settings.isDebugMode;
        const button = this.gui.controls.get(aId).element;
        const title = `Debug mode ${this.settings.isDebugMode ? "Off" : "On"}`;
        button.innerText = title;
        this.gui.devLogNoTime("Debug mode button pressed");
      }
    );
    return r;
  }
  #buildFullscreenButtonControl() {
    const id = "fullscreenButtonControl";
    const r = this.buildButtonControl(
      id,
      "Go full screen",
      () => {
        const button = this.gui.controls.get(id).element;
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
    return r;
  }
  #buildGetUrlButtonControl() {
    const id = "getUrlButtonControl";
    const r = this.buildButtonControl(
      id,
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
    return r;
  }
  // -------------------------------------------------------------------------
  // #region Rapier world Settings 
  #buildVelocityIterationsControl(aId, state) {
    const caption = "Velocity precision";
    const r = this.buildRangeControl(
      aId,
      caption,
      this.settings.velocityIterations,
      this.settings.velocityIterationsMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.velocityIterations = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
      }
    );
    this.gui.setReactiveControl(aId, state, "velocityIterations");
    this.gui.setReactiveControl(aId + "Value", state, "velocityIterations");
    return r;
  }
  #buildSimulationIterationsControl(aId, state) {
    const caption = "Friction precision";
    const r = this.buildRangeControl(
      aId,
      caption,
      this.settings.frictionIterations,
      this.settings.frictionIterationsMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.frictionIterations = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
      }
    );
    this.gui.setReactiveControl(aId, state, "frictionIterations");
    this.gui.setReactiveControl(aId + "Value", state, "frictionIterations");
    return r;
  }
  #buildStabilizationIterationsControl(aId, state) {
    const caption = "Stabilization precision";
    const r = this.buildRangeControl(
      aId,
      caption,
      this.settings.stabilizationIterations,
      this.settings.stabilizationIterationsMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.stabilizationIterations = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
      }
    );
    this.gui.setReactiveControl(aId, state, "stabilizationIterations");
    this.gui.setReactiveControl(aId + "Value", state, "stabilizationIterations");
    return r;
  }
  #buildCcdStepsControl(aId, astate) {
    const caption = "CCD steps";
    const r = this.buildRangeControl(
      aId,
      caption,
      this.settings.ccdSteps,
      this.settings.ccdStepsMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.ccdSteps = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
      }
    );
    this.gui.setReactiveControl(aId, astate, "ccdSteps");
    this.gui.setReactiveControl(aId + "Value", astate, "ccdSteps");
    return r;
  }
  #buildLinearErrorControl(aId, astate) {
    const caption = "Linear error";
    const r = this.buildRangeControl(
      aId,
      caption,
      this.settings.linearError,
      this.settings.linearErrorMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.linearError = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
      }
    );
    this.gui.setReactiveControl(aId, astate, "linearError");
    this.gui.setReactiveControl(aId + "Value", astate, "linearError");
    return r;
  }
  #buildErrorReductionRatioControl(aId, astate) {
    const caption = "Error reduction";
    const r = this.buildRangeControl(
      aId,
      caption,
      this.settings.errorReductionRatio,
      this.settings.errorReductionRatioMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.errorReductionRatio = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
      }
    );
    this.gui.setReactiveControl(aId, astate, "errorReductionRatio");
    this.gui.setReactiveControl(aId + "Value", astate, "errorReductionRatio");
    return r;
  }
  #buildPredictionDistanceControl(aId, astate) {
    const caption = "Prediction distance";
    const r = this.buildRangeControl(
      aId,
      caption,
      this.settings.predictionDistance,
      this.settings.predictionDistanceMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.predictionDistance = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
      }
    );
    this.gui.setReactiveControl(aId, astate, "predictionDistance");
    this.gui.setReactiveControl(aId + "Value", astate, "predictionDistance");
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  // #region Speed and reset
  #buildSimulationSpeedControl(aId, astate) {
    const caption = "Slowdown";
    const r = this.buildRangeControl(
      aId,
      caption,
      this.settings.slowDownFactor,
      this.settings.slowdownMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.slowDownFactor = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
      }
    );
    this.gui.setReactiveControl(aId, astate, "slowDownFactor");
    this.gui.setReactiveControl(aId + "Value", astate, "slowDownFactor");
    return r;
  }
  #buildResetCameraButtonControl(aId) {
    const resetCameraButtonControl = this.buildButtonControl(
      aId,
      "Reset camera",
      () => {
        this.settings.doResetCamera = true;
        this.gui.devLogNoTime("Reset camera button pressed");
      }
    );
    return resetCameraButtonControl;
  }
  #buildResetButtonControl(aId) {
    const r = this.buildButtonControl(
      aId,
      "Reset",
      () => {
        this.settings.doResetToDefaults = true;
        this.gui.devLogNoTime("Reset settings button pressed");
      }
    );
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // #region Gravity
  #buildGravityDetailsControl(aId, astate) {
    const controls = [];
    controls.push(this.#buildGravityXControl(
      "simulationGravityXControl",
      astate
    ));
    controls.push(this.#buildGravityYControl(
      "simulationGravityYControl",
      astate
    ));
    controls.push(this.#buildGravityZControl(
      "simulationGravityZControl",
      astate
    ));
    const caption = "Gravity";
    const r = this.buildDetailsControl(
      aId,
      caption,
      controls
    );
    return r;
  }
  #buildGravityXControl(aId, astate) {
    const r = this.buildRangeControl(
      aId,
      "X axis",
      this.settings.gravity.x,
      this.settings.gravityXMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.gravity.x = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
      }
    );
    this.gui.setReactiveControl(aId, astate, "gravity.x");
    this.gui.setReactiveControl(aId + "Value", astate, "gravity.x");
    return r;
  }
  #buildGravityYControl(aId, astate) {
    const r = this.buildRangeControl(
      aId,
      "Y axis",
      this.settings.gravity.y,
      this.settings.gravityYMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.gravity.y = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
      }
    );
    this.gui.setReactiveControl(aId, astate, "gravity.y");
    this.gui.setReactiveControl(aId + "Value", astate, "gravity.y");
    return r;
  }
  #buildGravityZControl(aId, astate) {
    const r = this.buildRangeControl(
      aId,
      "Z axis",
      this.settings.gravity.z,
      this.settings.gravityZMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this.settings.gravity.z = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
      }
    );
    this.gui.setReactiveControl(aId, astate, "gravity.z");
    this.gui.setReactiveControl(aId + "Value", astate, "gravity.z");
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  // #region Credits dialog
  #buildCreditsDialogControl(aid) {
    const controls = [];
    const footer = this.gui.document.getElementById("footer");
    controls.push(footer.innerHTML);
    controls.push(this.buildButtonControl(
      "creditsCloseButtonControl",
      "Close",
      () => {
        const dialog = this.gui.controls.get(aid).element;
        dialog.close();
      }
    ));
    const r = this.buildDialogControl(
      "creditsDialogControl",
      "Credits:",
      controls
    );
    return r;
  }
  #buildCreditsDialogOpenButtonControl(aid) {
    const r = this.buildButtonControl(
      "creditsButtonControl",
      "Credits",
      () => {
        const dialog = this.gui.controls.get(aid).element;
        dialog.showModal();
      }
    );
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
}
