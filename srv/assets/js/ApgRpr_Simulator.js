import {
  RAPIER,
  md5
} from "./ApgRpr_Deps.ts";
import {
  ApgGui
} from "./apg-gui/lib/classes/ApgGui.ts";
import {
  ApgGui_Stats
} from "./apg-gui/lib/classes/ApgGui_Stats.ts";
import {
  ApgRpr_Colliders_StatsPanel,
  ApgRpr_Step_StatsPanel
} from "./ApgRpr_StatsPanels.ts";
import {
  ApgRpr_Viewer
} from "./ApgRpr_Viewer.ts";
import {
  ApgGui_Logger
} from "./apg-gui/lib/classes/ApgGui_Logger.ts";
export class ApgRpr_Simulator {
  /** Used to interact with the browser we don't like global variables */
  _window;
  /** Used to interact with the DOM we don't like global variables */
  _document;
  get document() {
    return this._document;
  }
  /** The current set of simulations */
  _simulations;
  /** Names of the loaded simulations */
  get simulationsNames() {
    return Array.from(this._simulations.keys());
  }
  /** Default simulation */
  _defaultSimulationName;
  /** Gui */
  _gui;
  get gui() {
    return this._gui;
  }
  /** Logger */
  _logger;
  get logger() {
    return this._logger;
  }
  /** Stats objects */
  _stats = null;
  get stats() {
    return this._stats;
  }
  _stepStatsPanel = null;
  _collidersStatsPanel = null;
  /** The THREE viewer attached to the simulation */
  viewer;
  /** Eventually used for picking objects with a raycaster */
  mouse;
  /** We don't know yet ??? */
  _events;
  /** All the simulation is inside the world */
  _world = null;
  /** Hook to interact with the simulation before each step*/
  _preStepAction = null;
  /** Hook to interact with the simulation after each step*/
  _postStepAction = null;
  /** This is used to count the number of times the step function is called and to manage the slowdown */
  _runCall = 0;
  /** The simulation slowdown factor: 1 means run continuously. 
   * When set to MAX_SLOWDOWN the simulation is stopped */
  _slowdownFactor = 1;
  set slowDownFactor(a) {
    this._slowdownFactor = a;
  }
  /** Used to keep track of requestAnimationFrame timings and 
   * make the simulation time indipendent */
  // @WARNING this is experimental, if the simulation goes time indipendant 
  // it will be no more fully deterministic and so reproducible
  _lastFrameTime = -1;
  /** We run the simulation only if the document has the focus */
  _documentHasFocus = false;
  /** The simulation is in debug mode so we show collider edges and vectors and collect additional data */
  _isInDebugMode = false;
  set debugMode(a) {
    this._isInDebugMode = a;
  }
  /** The debug info contain the simulation step counter and other data*/
  debugInfo;
  /** The last snapshot collected to be eventually stored or transmitted */
  snapshot;
  /** The simulation step of the snapshot */
  _snapshotStepId = 0;
  DEFAULT_GRAVITY = 9.8;
  DEFAULT_GRAVITY_X = 0;
  DEFAULT_GRAVITY_Y = -this.DEFAULT_GRAVITY;
  DEFAULT_GRAVITY_Z = 0;
  /** This sets the viewer and the world*/
  DEFAULT_SCENE_SIZE = 10;
  DEFAULT_COLLIDER_SIZE = 0.1;
  // maxVelocityIterations
  DEFAULT_RAPIER_VELOCITY_ITERATIONS = 4;
  // maxVelocityFrictionIterations
  DEFAULT_RAPIER_FRICTION_ITERATIONS = 1;
  // maxStabilizationIterations
  DEFAULT_RAPIER_STABILIZATION_ITERATIONS = 1;
  // maxCcdSubsteps
  DEFAULT_RAPIER_CCD_STEPS = 1;
  // allowedLinearError
  _DEFAULT_RAPIER_LINEAR_ERROR = 1e-3;
  // erp
  _DEFAULT_RAPIER_ERR_REDUCTION_RATIO = 0.2;
  // predictionDistance
  _DEFAULT_RAPIER_PREDICTION_DISTANCE = 2e-3;
  // dt
  DEFAULT_RAPIER_SIMULATION_RATE = 1 / 80;
  DEFAULT_APG_RPR_VELOCITY_ITERATIONS = 4;
  DEFAULT_APG_RPR_FRICTION_ITERATIONS = 2;
  DEFAULT_APG_RPR_STABILIZATION_ITERATIONS = 2;
  DEFAULT_APG_RPR_ERR_REDUCTION_RATIO = 0.9;
  // collider size related factors
  DEFAULT_APG_RPR_LINEAR_ERROR_FACTOR = 1e-3;
  DEFAULT_APG_RPR_PREDICTION_DISTANCE_FACTOR = 0.01;
  MAX_SLOWDOWN = 20;
  LOCALSTORAGE_KEY__LAST_SIMULATION = "ApgRprLocalStorage_LastSimulation";
  LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS = "ApgRprLocalStorage_SimulationSettingsFor_";
  static RPR_SIMULATOR_NAME = "Rapier simulator";
  constructor(awindow, adocument, aguiElementId, aviewerElementId, asimulations, adefaultSim) {
    this._window = awindow;
    this._document = adocument;
    this._simulations = asimulations;
    this._defaultSimulationName = adefaultSim;
    this._logger = new ApgGui_Logger();
    this._logger.addLogger(ApgRpr_Simulator.RPR_SIMULATOR_NAME);
    this._gui = new ApgGui(
      this._document,
      aguiElementId,
      aviewerElementId,
      this._logger
    );
    this.#initStats();
    this.debugInfo = {
      stepId: 0
    };
    this.viewer = new ApgRpr_Viewer(
      this._window,
      this._document,
      this._gui.viewerElement,
      this._logger,
      this.DEFAULT_SCENE_SIZE
    );
    this.mouse = { x: 0, y: 0 };
    this._events = new RAPIER.EventQueue(true);
    this._window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.clientX / this._window.innerWidth * 2 - 1;
      this.mouse.y = 1 - event.clientY / this._window.innerHeight * 2;
    });
    this._logger.devLog("Rpr simulator created", ApgRpr_Simulator.RPR_SIMULATOR_NAME);
  }
  /**
   * Tries to get simulation parameters in the following order:
   * 1) querystring, 
   * 2) localstorage 
   * 3) defaults
   * @returns The current simulation parameters
   */
  getSimulationParams() {
    let settings = null;
    const querystringParams = new URLSearchParams(this._window.location.search);
    const b64EncodedSettings = querystringParams.get("p");
    if (b64EncodedSettings != null) {
      try {
        const stringifiedSettings = atob(b64EncodedSettings);
        alert(stringifiedSettings);
        settings = JSON.parse(stringifiedSettings);
      } catch (e) {
        alert("Invalid querystring params: " + e.message);
      }
    }
    if (settings == null) {
      const lastSimulation = this._window.localStorage.getItem(this.LOCALSTORAGE_KEY__LAST_SIMULATION);
      if (lastSimulation != void 0) {
        const localStorageSettings = this._window.localStorage.getItem(this.LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS + lastSimulation);
        if (localStorageSettings != void 0) {
          try {
            settings = JSON.parse(localStorageSettings);
          } catch (e) {
            alert("Invalid local storage settings: " + e.message);
          }
        }
      }
    }
    let params;
    if (settings === null) {
      params = {
        simulation: this._defaultSimulationName,
        settings: void 0
      };
    } else {
      params = {
        simulation: settings.simulation,
        settings
      };
    }
    return params;
  }
  #initStats() {
    const pixelRatio = this._window.devicePixelRatio;
    const statsPanelWidth = 80;
    this._stats = new ApgGui_Stats(this._document, pixelRatio, statsPanelWidth);
    this._stepStatsPanel = new ApgRpr_Step_StatsPanel(this._document, pixelRatio, statsPanelWidth);
    this._stepStatsPanel.updateInMainLoop = false;
    this._stats.addPanel(this._stepStatsPanel);
    this._collidersStatsPanel = new ApgRpr_Colliders_StatsPanel(this._document, pixelRatio, statsPanelWidth);
    this._collidersStatsPanel.updateInMainLoop = false;
    this._stats.addPanel(this._collidersStatsPanel);
  }
  /** 
   * Hook to attach a function that will execute before the simulation step
   */
  setPreStepAction(action) {
    this._preStepAction = action;
  }
  /** 
   * Hook to attach a function that will execute after the simulation step
   */
  setPostStepAction(action) {
    this._postStepAction = action;
  }
  /**
   * All the colliders and bodies must be already in place
   */
  addWorld(aworld) {
    this._preStepAction = null;
    this._postStepAction = null;
    this._world = aworld;
    this._stepStatsPanel.begin();
    this._collidersStatsPanel.begin();
    this.debugInfo.stepId = 0;
    this.debugInfo.integrationParams = this._world.integrationParameters;
    this._world.forEachCollider((coll) => {
      this.viewer.addCollider(coll);
    });
    this._logger.devLog("Rapier world added", ApgRpr_Simulator.RPR_SIMULATOR_NAME);
  }
  /** 
   * Called to allow the Settings DOM to refresh when is changed diamically.
   * It delays the event loop calling setTimeout
   */
  updateViewerSettings(ahtml) {
    this._gui.isRefreshing = true;
    this._gui.panelElement.innerHTML = ahtml;
    setTimeout(() => {
      this._gui.isRefreshing = false;
    }, 0);
  }
  /** 
   * Called to allow the HUD DOM to refresh when is changed dinamically.
   * It delays the event loop calling setTimeout
   */
  updateViewerHud(ahtml) {
    this._gui.isRefreshing = true;
    this._gui.hudElement.innerHTML = ahtml;
    setTimeout(() => {
      this._gui.isRefreshing = false;
    }, 0);
  }
  /** 
   * If we call this it means that the camera is locked
   */
  resetCamera(acameraPosition) {
    this.viewer.moveCamera(acameraPosition);
  }
  /**
   * Allows to restart the current simulation or to change another one
   * @param aparams
   */
  setSimulation(aparams) {
    const simulation = aparams.simulation;
    const simulationType = this._simulations.get(simulation);
    ApgGui.Assert(
      simulationType != void 0,
      `Simulation for (${simulation}) is not yet available`
    );
    this._gui.clearControls();
    this.viewer.reset();
    if (aparams.settings) {
      aparams.settings.doRestart = false;
    }
    const _newSimulation = new simulationType(this, aparams);
    this._window.localStorage.setItem(this.LOCALSTORAGE_KEY__LAST_SIMULATION, simulation);
    const settingsKey = this.LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS + simulation;
    const localStorageSettings = JSON.stringify(aparams.settings, void 0, "  ");
    this._window.localStorage.setItem(settingsKey, localStorageSettings);
    this._logger.devLog(simulation + " simulation changed", ApgRpr_Simulator.RPR_SIMULATOR_NAME);
  }
  run() {
    const procStartTime = performance.now();
    if (this._world) {
      this._stats.begin();
      if (this.#canRun()) {
        if (this._preStepAction) {
          this._preStepAction();
        }
        this._stepStatsPanel.begin();
        this._world.step(this._events);
        this._stepStatsPanel.end();
        this._collidersStatsPanel.update(this._world.colliders.len());
        this.debugInfo.stepId++;
        this.#collectDebugInfo();
        if (this._postStepAction) {
          this._postStepAction();
        }
      }
      this.viewer.updateAndRender(this._world, this._isInDebugMode);
      this._stats.end();
    }
    const procEndTime = performance.now();
    const timeOut = this.#timeoutMetering(procEndTime, procStartTime);
    this._window.setTimeout(() => {
      this.#focusDetection();
      this.run();
    }, timeOut);
  }
  #canRun() {
    this._runCall++;
    let r = false;
    if (this._runCall % this._slowdownFactor == 0) {
      this._runCall = 0;
      r = true;
    }
    if (this._slowdownFactor == this.MAX_SLOWDOWN) {
      r = false;
    }
    return r;
  }
  #timeoutMetering(aendTime, astartTime) {
    let r = this.DEFAULT_RAPIER_SIMULATION_RATE * 1e3;
    const deltaTime = aendTime - astartTime;
    if (this._lastFrameTime !== -1) {
      r -= deltaTime;
      if (r < 0) {
        r = 0;
        const framesPerSecExpected = 1 / this.DEFAULT_RAPIER_SIMULATION_RATE;
        const framesPerSec = 1 / (deltaTime / 1e3);
        this._logger.devLog(
          `Simulation rate is lower than expected ${framesPerSec.toFixed(1)} vs ${framesPerSecExpected}`,
          ApgRpr_Simulator.RPR_SIMULATOR_NAME
        );
      }
    }
    this._lastFrameTime = deltaTime;
    return r;
  }
  #focusDetection() {
    if (this._world) {
      if (!this._document.hasFocus()) {
        this._world.integrationParameters.dt = 0;
        if (this._documentHasFocus != false) {
          this._logger.devLog("Document lost focus: simulation paused", ApgRpr_Simulator.RPR_SIMULATOR_NAME);
          this._documentHasFocus = false;
        }
      } else {
        this._world.integrationParameters.dt = this.DEFAULT_RAPIER_SIMULATION_RATE;
        if (this._documentHasFocus != true) {
          this._logger.devLog("Document has focus: simulation active", ApgRpr_Simulator.RPR_SIMULATOR_NAME);
          this._documentHasFocus = true;
        }
      }
    }
  }
  #collectDebugInfo() {
    if (this._world && this._isInDebugMode) {
      if (
        /*this.settings.isTakingSnapshots*/
        true
      ) {
        this._snapshotStepId = this.debugInfo.stepId;
        let t0 = (performance || Date).now();
        const snapshot = this._world.takeSnapshot();
        let t1 = (performance || Date).now();
        const snapshotTime = t1 - t0;
        this.debugInfo.snapshotTime = snapshotTime;
        t0 = (performance || Date).now();
        const worldHash = md5(snapshot);
        t1 = (performance || Date).now();
        const worldHashTime = t1 - t0;
        this.debugInfo.worldHash = worldHash;
        this.debugInfo.worldHashTime = worldHashTime;
        this.debugInfo.snapshotStepId = this._snapshotStepId;
      }
    }
  }
  takeSnapshot() {
    if (this._world) {
      this.snapshot = this._world.takeSnapshot();
      this._snapshotStepId = this.debugInfo.stepId;
    }
  }
  restoreSnapshot() {
    if (this._world && this.snapshot) {
      this._world.free();
      this._world = RAPIER.World.restoreSnapshot(this.snapshot);
      this.debugInfo.stepId = this._snapshotStepId;
    }
  }
}
