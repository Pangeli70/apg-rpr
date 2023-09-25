import { ApgGui } from "./ApgGui.ts";
import {
  ApgGui_Stats,
  ApgRpr_Colliders_StatsPanel,
  ApgRpr_Step_StatsPanel
} from "./ApgGuiStats.ts";
import { RAPIER, md5 } from "./ApgRprDeps.ts";
import { ApgRprViewer } from "./ApgRprThreeViewer.ts";
export class ApgRpr_Simulator {
  /** Used to interact with the browser we don't like global variables */
  window;
  /** Used to interact with the DOM we don't like global variables */
  document;
  /** The current set of simulations */
  simulations;
  /** Default simulation */
  defaultSim;
  /** Gui */
  gui;
  /** Stats objects */
  stats;
  stepStatsPanel;
  collidersStatsPanel;
  /** The THREE viewer attached to the simulation */
  viewer;
  /** Eventually used for picking objects with a raycaster */
  mouse;
  /** We don't know yet ??? */
  events;
  /** All the simulation is inside the world */
  world = null;
  /** Hook to interact with the simulation before each step*/
  preStepAction = null;
  /** This is used to count the number of times is called and to manage the slow down */
  runCall = 0;
  /** The simulation slowdown factor: 1 means run continuously. 
   * When set to MAX_SLOWDOWN the simulation is stopped */
  slowdown = 1;
  /** Used to keep track of requestAnimationFrame timings and 
   * make the simulation time indipendent */
  lastBrowserFrame = -1;
  /** We run the simulation only if the document has the focus */
  documentHasFocus = false;
  /** The simulation is in debug mode so we collect additional data */
  isInDebugMode = false;
  /** The current debug info contain the simulation step counter */
  debugInfo;
  /** The last snapshot collected to be eventually stored or transmitted */
  snapshot;
  /** The simulation step of the snapshot */
  snapshotStepId = 0;
  DEFAULT_GRAVITY = 9.81;
  DEFAULT_GRAVITY_X = 0;
  DEFAULT_GRAVITY_Y = -this.DEFAULT_GRAVITY;
  DEFAULT_GRAVITY_Z = 0;
  DEFAULT_VELOCITY_ITERATIONS = 4;
  DEFAULT_FRICTION_ITERATIONS = 7;
  DEFAULT_STABILIZATION_ITERATIONS = 1;
  DEFAULT_LINEAR_ERROR = 1e-3;
  DEFAULT_ERR_REDUCTION_RATIO = 0.8;
  DEFAULT_PREDICTION_DISTANCE = 2e-3;
  DEFAULT_SIMULATION_RATE = 1 / 60;
  MAX_SLOWDOWN = 20;
  LOCALSTORAGE_KEY__LAST_SIMULATION = "ApgRprLocalStorage_LastSimulation";
  LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS = "ApgRprLocalStorage_SimulationSettingsFor_";
  constructor(awindow, adocument, asimulations, adefaultSim) {
    this.window = awindow;
    this.document = adocument;
    this.simulations = asimulations;
    this.defaultSim = adefaultSim;
    this.gui = new ApgGui(this.document);
    this.#initStats();
    this.debugInfo = {
      stepId: 0
    };
    this.viewer = new ApgRprViewer(this.window, this.document);
    this.gui.log(`ApgRprThreeViewer created`, true);
    this.mouse = { x: 0, y: 0 };
    this.events = new RAPIER.EventQueue(true);
    this.window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.clientX / this.window.innerWidth * 2 - 1;
      this.mouse.y = 1 - event.clientY / this.window.innerHeight * 2;
    });
  }
  /**
   * Tries to get simulation parameters in the following order 1) querystring, 2) localstorage 3) revert to defaults
   * @returns The current simulation parameters
   */
  getSimulationParams() {
    let settings = null;
    const querystringParams = new URLSearchParams(this.window.location.search);
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
      const lastSimulation = this.window.localStorage.getItem(this.LOCALSTORAGE_KEY__LAST_SIMULATION);
      if (lastSimulation != void 0) {
        const localStorageSettings = this.window.localStorage.getItem(this.LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS + lastSimulation);
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
      params = { simulation: this.defaultSim };
    } else {
      params = { simulation: settings.name, guiSettings: settings };
    }
    return params;
  }
  #initStats() {
    const pixelRatio = this.window.devicePixelRatio;
    const statsPanelWidth = 80;
    this.stats = new ApgGui_Stats(this.document, pixelRatio, statsPanelWidth);
    this.stepStatsPanel = new ApgRpr_Step_StatsPanel(this.document, pixelRatio, statsPanelWidth);
    this.stepStatsPanel.updateInMainLoop = false;
    this.stats.addPanel(this.stepStatsPanel);
    this.collidersStatsPanel = new ApgRpr_Colliders_StatsPanel(this.document, pixelRatio, statsPanelWidth);
    this.collidersStatsPanel.updateInMainLoop = false;
    this.stats.addPanel(this.collidersStatsPanel);
  }
  /** 
   * Hook to attach a function that will execute before the simulation step
   */
  setPreStepAction(action) {
    this.preStepAction = action;
  }
  /**
   * All the colliders and bodies must be already in place
   */
  addWorld(aworld) {
    this.preStepAction = null;
    this.world = aworld;
    this.stepStatsPanel.begin();
    this.collidersStatsPanel.begin();
    this.debugInfo.stepId = 0;
    this.debugInfo.integrationParams = this.world.integrationParameters;
    this.world.forEachCollider((coll) => {
      this.viewer.addCollider(coll);
    });
    this.gui.log("RAPIER world added", true);
  }
  /** 
   * Called to allow the DOM to refresh when is changed diamically.
   * It delays the event loop calling setTimeout
   */
  updateViewerPanel(ahtml) {
    this.gui.isRefreshing = true;
    this.viewer.guiPanelElement.innerHTML = ahtml;
    setTimeout(() => {
      this.gui.isRefreshing = false;
    }, 0);
  }
  /** 
   * Called to allow the DOM to refresh when is changed diamically.
   * It delays the event loop calling setTimeout
   */
  updateViewerHud(ahtml) {
    setTimeout(() => {
      this.gui.isRefreshing = false;
    }, 0);
  }
  /** 
   * If we call this it means that the camera is locked
   */
  resetCamera(acameraPosition) {
    this.viewer.setOrbControlsParams(acameraPosition);
  }
  /**
   * Allows to restart the current simulation or to change another one
   * @param aparams
   */
  setSimulation(aparams) {
    const simulation = aparams.simulation;
    const simulationType = this.simulations.get(simulation);
    if (!simulationType) {
      const errorMessage = `Simulation for (${simulation}) is not yet available`;
      alert(errorMessage);
      throw new Error(errorMessage);
    }
    this.gui.clearControls();
    this.viewer.reset();
    const newSimulation = new simulationType(this, aparams);
    this.gui.log(`${aparams.simulation} simulation created`, true);
    this.window.localStorage.setItem(this.LOCALSTORAGE_KEY__LAST_SIMULATION, simulation);
    const settingsKey = this.LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS + simulation;
    const localStorageSettings = JSON.stringify(aparams.guiSettings, void 0, "  ");
    this.window.localStorage.setItem(settingsKey, localStorageSettings);
  }
  takeSnapshot() {
    if (this.world) {
      this.snapshot = this.world.takeSnapshot();
      this.snapshotStepId = this.debugInfo.stepId;
    }
  }
  restoreSnapshot() {
    if (this.world && this.snapshot) {
      this.world.free();
      this.world = RAPIER.World.restoreSnapshot(this.snapshot);
      this.debugInfo.stepId = this.snapshotStepId;
    }
  }
  run() {
    this.runCall++;
    let canRun = false;
    if (this.slowdown != this.MAX_SLOWDOWN) {
      if (this.runCall % this.slowdown == 0) {
        this.runCall = 0;
        canRun = true;
      }
    }
    if (this.world && canRun) {
      if (this.preStepAction) {
        this.preStepAction();
      }
      this.stepStatsPanel.begin();
      this.world.step(this.events);
      this.debugInfo.stepId++;
      this.stepStatsPanel.end();
      this.collidersStatsPanel.update(this.world.colliders.len());
      if (this.world) {
        this.stats.begin();
        this.viewer.render(this.world, this.isInDebugMode);
        this.stats.end();
      }
      this.#collectDebugInfo();
    }
    this.window.setTimeout(() => {
      const frameTime = performance.now();
      const deltaTime1 = (frameTime - this.lastBrowserFrame) / 1e3;
      if (this.world) {
        if (!this.document.hasFocus()) {
          this.world.integrationParameters.dt = 0;
          if (this.documentHasFocus != false) {
            this.gui.log("Document lost focus: sim. paused");
            this.documentHasFocus = false;
          }
        } else {
          this.world.integrationParameters.dt = this.DEFAULT_SIMULATION_RATE;
          if (this.documentHasFocus != true) {
            this.gui.log("Document has focus: sim. active");
            this.documentHasFocus = true;
          }
        }
      }
      if (this.lastBrowserFrame !== -1) {
        if (this.world) {
        }
      }
      this.lastBrowserFrame = frameTime;
      this.run();
    }, this.DEFAULT_SIMULATION_RATE);
  }
  #collectDebugInfo() {
    if (this.world && this.isInDebugMode) {
      if (
        /*this.settings.isTakingSnapshots*/
        true
      ) {
        this.snapshotStepId = this.debugInfo.stepId;
        let t0 = (performance || Date).now();
        const snapshot = this.world.takeSnapshot();
        let t1 = (performance || Date).now();
        const snapshotTime = t1 - t0;
        t0 = (performance || Date).now();
        const worldHash = md5(snapshot);
        t1 = (performance || Date).now();
        const worldHashTime = t1 - t0;
        this.debugInfo.snapshotTime = snapshotTime;
        this.debugInfo.worldHash = worldHash;
        this.debugInfo.worldHashTime = worldHashTime;
        this.debugInfo.snapshotStepId = this.snapshotStepId;
      }
    }
  }
}
