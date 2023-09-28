import { RAPIER, PRANDO } from "./ApgRprDeps.ts";
export class ApgRprSim_Base {
  /** The Rapier world*/
  world;
  /** The Apg Rapier simulator */
  simulator;
  /** Current simulation params and settings */
  params;
  /** Copy of params and settings stored for comparison*/
  prevParams;
  /** General purpose pseudorandom negerator */
  rng;
  /**
   * Creates a new simulation and a new world for the Rapier simulator
   * @param asimulator 
   * @param aparams 
   */
  constructor(asimulator, aparams) {
    this.simulator = asimulator;
    this.params = {
      restart: aparams.restart || false,
      simulation: aparams.simulation,
      simulations: Array.from(this.simulator.simulations.keys()),
      guiSettings: aparams.guiSettings,
      stats: this.simulator.stats,
      debugInfo: this.simulator.debugInfo
    };
    if (this.params.guiSettings == void 0) {
      this.params.guiSettings = this.defaultGuiSettings();
    }
    this.rng = new PRANDO(this.params.simulation);
    this.saveParams();
    this.world = new RAPIER.World(this.params.guiSettings.gravity);
    this.#applyGuiSettingsToWorld();
  }
  #applyGuiSettingsToWorld() {
    this.world.maxVelocityIterations = this.params.guiSettings.velocityIterations;
    this.world.maxVelocityFrictionIterations = this.params.guiSettings.frictionIterations;
    this.world.maxStabilizationIterations = this.params.guiSettings.stabilizationIterations;
    this.world.integrationParameters.allowedLinearError = this.params.guiSettings.linearError;
    this.world.integrationParameters.erp = this.params.guiSettings.errorReductionRatio;
    this.world.integrationParameters.predictionDistance = this.params.guiSettings.predictionDistance;
  }
  /**
   * Create the Gui for the current simulation
   * @param aguiBuilderType The class derived from the standard GuiBuilder
   */
  buildGui(aguiBuilderType) {
    const guiBuilder = new aguiBuilderType(
      this.simulator.gui,
      this.params
    );
    const html = guiBuilder.buildHtml();
    this.simulator.updateViewerPanel(html);
    guiBuilder.bindControls();
    this.simulator.gui.log("Sim Gui built");
  }
  /** 
   * Set up the default Gui settings for the simulator. This method can be overridden 
   * and extended by derived classes to add more settings specific of the single simulation. 
   */
  defaultGuiSettings() {
    const r = {
      name: this.params.simulation,
      isSimulationGroupOpened: false,
      gravity: new RAPIER.Vector3(0, -9.81, 0),
      gravityXMMS: {
        min: -5,
        max: 5,
        step: 0.1
      },
      gravityYMMS: {
        min: -5,
        max: 5,
        step: 0.1
      },
      gravityZMMS: {
        min: -5,
        max: 5,
        step: 0.1
      },
      velocityIterations: this.simulator.DEFAULT_VELOCITY_ITERATIONS,
      velocityIterationsMMS: {
        min: 1,
        max: 16,
        step: 3
      },
      frictionIterations: this.simulator.DEFAULT_FRICTION_ITERATIONS,
      frictionIterationsMMS: {
        min: 1,
        max: 16,
        step: 3
      },
      stabilizationIterations: this.simulator.DEFAULT_STABILIZATION_ITERATIONS,
      stabilizationIterationsMMS: {
        min: 1,
        max: 16,
        step: 3
      },
      linearError: this.simulator.DEFAULT_LINEAR_ERROR,
      linearErrorMMS: {
        min: 1e-4,
        max: 0.01,
        step: 1e-4
      },
      errorReductionRatio: this.simulator.DEFAULT_ERR_REDUCTION_RATIO,
      errorReductionRatioMMS: {
        min: 0.05,
        max: 1,
        step: 0.05
      },
      predictionDistance: this.simulator.DEFAULT_PREDICTION_DISTANCE,
      predictionDistanceMMS: {
        min: 2e-3,
        max: 0.1,
        step: 2e-3
      },
      slowdown: 1,
      slowdownMMS: {
        min: 1,
        max: this.simulator.MAX_SLOWDOWN,
        step: 1
      },
      doResetToDefaults: false,
      isStatsGroupOpened: false,
      cameraPosition: {
        eye: { x: -80, y: 10, z: 80 },
        target: { x: 0, y: 0, z: 0 }
      },
      doResetCamera: false
    };
    return r;
  }
  /** 
   * Update the simulation params accordingly with the Gui settings. This method 
   * can be overridden and extended by derived classes to manage the settings 
   * specific of the single simulation that need immediate and not restar updating. 
   */
  updateFromGui() {
    if (this.needsUpdate()) {
      this.updateSimulatorFromGui();
      this.saveParams();
    }
  }
  /** 
   * Update the Rapier simulator params from the Gui setting. This function should
   * not be overridden.
   */
  updateSimulatorFromGui() {
    if (this.prevParams.guiSettings.doResetToDefaults != this.params.guiSettings.doResetToDefaults) {
      this.params.guiSettings.doResetToDefaults = this.prevParams.guiSettings.doResetToDefaults;
      this.params.guiSettings = this.defaultGuiSettings();
      this.#applyGuiSettingsToWorld();
      this.params.restart = true;
    }
    if (this.params.restart) {
      this.simulator.setSimulation(this.params);
    }
    if (this.prevParams.simulation != this.params.simulation) {
      this.simulator.setSimulation({ simulation: this.params.simulation });
    }
    if (this.prevParams.guiSettings.velocityIterations != this.params.guiSettings.velocityIterations) {
      this.simulator.world.maxVelocityIterations = this.params.guiSettings.velocityIterations;
    }
    if (this.prevParams.guiSettings.frictionIterations != this.params.guiSettings.frictionIterations) {
      this.simulator.world.maxVelocityFrictionIterations = this.params.guiSettings.frictionIterations;
    }
    if (this.prevParams.guiSettings.stabilizationIterations != this.params.guiSettings.stabilizationIterations) {
      this.simulator.world.maxStabilizationIterations = this.params.guiSettings.stabilizationIterations;
    }
    if (this.prevParams.guiSettings.linearError != this.params.guiSettings.linearError) {
      this.world.integrationParameters.allowedLinearError = this.params.guiSettings.linearError;
    }
    if (this.prevParams.guiSettings.errorReductionRatio != this.params.guiSettings.errorReductionRatio) {
      this.world.integrationParameters.erp = this.params.guiSettings.errorReductionRatio;
    }
    if (this.prevParams.guiSettings.predictionDistance != this.params.guiSettings.predictionDistance) {
      this.world.integrationParameters.predictionDistance = this.params.guiSettings.predictionDistance;
    }
    if (this.prevParams.guiSettings.slowdown != this.params.guiSettings.slowdown) {
      this.simulator.slowdown = this.params.guiSettings.slowdown;
    }
  }
  /** 
   * Raw verification of the current params and gui settings. If something was changed 
   * from the previous saved data or if a restart command was issued the result is true. 
   * False otherwise
   */
  needsUpdate() {
    const r = false;
    if (this.params.restart) {
      return true;
    }
    if (this.params.simulation != this.prevParams.simulation) {
      return true;
    }
    const currsettings = JSON.stringify(this.params.guiSettings);
    const prevSettings = JSON.stringify(this.prevParams.guiSettings);
    if (currsettings != prevSettings) {
      return true;
    }
    return r;
  }
  /**
   * Save the params for later comparison in order to detect changes due
   * to the user's interaction
   */
  saveParams() {
    if (!this.prevParams) {
      this.prevParams = {
        simulation: this.params.simulation
      };
    } else {
      this.prevParams.simulation = this.params.simulation;
    }
    this.prevParams.guiSettings = JSON.parse(JSON.stringify(this.params.guiSettings));
  }
  /**
   * WARNING: The number of columns and rows generates a list of vertices
   * of the size ( (number of columns + 1 ) * ( number of rows + 1) )
   * @param anumberOfColumns 
   * @param anumberOfRows 
   * @returns An array of Float32Array heights one per vertex
   */
  generateSlopedHeightFieldArray(anumberOfColumns, anumberOfRows) {
    const heights = [];
    const deltaSlope = 1 / anumberOfRows;
    for (let column = 0; column < anumberOfColumns + 1; column++) {
      const h = column * deltaSlope;
      for (let row = 0; row < anumberOfRows + 1; row++) {
        heights.push(h);
      }
    }
    return new Float32Array(heights);
  }
  /**
   * WARNING: The number of columns and rows generates a list of vertices
   * of the size ( (number of columns + 1 ) * ( number of rows + 1) )
   * @param aseed 
   * @param anumberOfColumns 
   * @param anumberOfRows 
   * @returns An array of Float32Array heights one per vertex
   */
  generateRandomHeightFieldArray(aseed, anumberOfColumns, anumberOfRows) {
    const rng = new PRANDO(aseed);
    const heights = [];
    for (let column = 0; column < anumberOfColumns + 1; column++) {
      for (let row = 0; row < anumberOfRows + 1; row++) {
        const h = rng.next();
        heights.push(h);
      }
    }
    return new Float32Array(heights);
  }
  generateRandomTrimshHeightMap(arandomSeed, axNumVertices, azNumVertices, axScale, ayScale, azScale) {
    const rng = new PRANDO(arandomSeed);
    const randomHeights = [];
    for (let i = 0; i < axNumVertices + 1; i++) {
      for (let j = 0; j < azNumVertices + 1; j++) {
        randomHeights.push(rng.next());
      }
    }
    const r = this.generateTrimeshHeightMap(
      axNumVertices,
      azNumVertices,
      axScale,
      ayScale,
      azScale,
      randomHeights
    );
    return r;
  }
  generateTrimeshHeightMap(axVertexesNum, azVertexesNum, axScale, ayScale, azScale, aheights) {
    const xSize = axScale / axVertexesNum;
    const zSize = azScale / azVertexesNum;
    const xHalf = axScale / 2;
    const zHalf = azScale / 2;
    const vertices = [];
    for (let iz = 0; iz < azVertexesNum; iz++) {
      for (let ix = 0; ix < axVertexesNum; ix++) {
        const index = ix + iz * axVertexesNum;
        const x = ix * xSize - xHalf;
        const y = aheights[index] * ayScale;
        const z = iz * zSize - zHalf;
        vertices.push(x, y, z);
      }
    }
    const indices = [];
    for (let z = 0; z < azVertexesNum - 1; z++) {
      for (let x = 0; x < axVertexesNum; x++) {
        const i1 = x + z * axVertexesNum;
        const i2 = x + (z + 1) * axVertexesNum;
        const i3 = i1 + 1;
        const i4 = i2 + 1;
        indices.push(i1, i2, i3);
        indices.push(i3, i2, i4);
      }
    }
    return {
      vertices: new Float32Array(vertices),
      indices: new Uint32Array(indices)
    };
  }
}
