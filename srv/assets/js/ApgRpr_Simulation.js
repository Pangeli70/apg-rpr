import {
  PRANDO,
  RAPIER
} from "./ApgRpr_Deps.ts";
export class ApgRpr_Simulation {
  /** The Rapier world*/
  world;
  /** The Apg Rapier simulator */
  simulator;
  /** Current simulation params and settings */
  params;
  /** Copy of params and settings stored for comparison*/
  prevParams;
  /** General purpose pseudorandom generator */
  rng;
  /** Logger for the various simulations */
  logger;
  static RPR_SIMULATION_NAME = "Rapier simulation";
  /**
   * Creates a new simulation and a new world for the Rapier simulator
   * @param asimulator 
   * @param aparams 
   */
  constructor(asimulator, aparams) {
    this.simulator = asimulator;
    this.logger = asimulator.logger;
    this.logger.addLogger(ApgRpr_Simulation.RPR_SIMULATION_NAME);
    this.params = aparams;
    if (this.params.settings == void 0) {
      this.params.settings = this.defaultSettings();
    }
    this.rng = new PRANDO(this.params.simulation);
    this.saveParams();
    this.world = new RAPIER.World(this.params.settings.gravity);
    this.#applyGuiSettingsToWorld();
  }
  #applyGuiSettingsToWorld() {
    this.world.maxVelocityIterations = this.params.settings.velocityIterations;
    this.world.maxVelocityFrictionIterations = this.params.settings.frictionIterations;
    this.world.maxStabilizationIterations = this.params.settings.stabilizationIterations;
    this.world.integrationParameters.allowedLinearError = this.params.settings.linearError;
    this.world.integrationParameters.erp = this.params.settings.errorReductionRatio;
    this.world.integrationParameters.predictionDistance = this.params.settings.predictionDistance;
  }
  createGround() {
    const groundRadious = this.simulator.viewer.metrics.worldSize;
    const GROUND_HEIGHT = 1;
    const userData = {
      color: 48127
    };
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setUserData(userData);
    const body = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cylinder(GROUND_HEIGHT / 2, groundRadious).setTranslation(0, -GROUND_HEIGHT / 2, 0);
    this.world.createCollider(groundColliderDesc, body);
  }
  createWorld(_asettings) {
    this.createGround();
  }
  /**
   * Create the Gui for the current simulation
   * @param aguiBuilderType The class derived from the standard GuiBuilder
   */
  buildGui(aguiBuilderType) {
    const guiBuilder = new aguiBuilderType(
      this.simulator,
      this.params.settings
    );
    const panelHtml = guiBuilder.buildPanel();
    this.simulator.updateViewerPanel(panelHtml);
    const hudHtml = guiBuilder.buildHud();
    this.simulator.updateViewerHud(hudHtml);
    guiBuilder.bindControls();
    this.logger.log("Simulation Gui built", ApgRpr_Simulation.RPR_SIMULATION_NAME);
  }
  /** 
   * Set up the default Gui settings for the simulator. This method can be overridden 
   * and extended by derived classes to add more settings specific of the single simulation. 
   */
  defaultSettings() {
    return ApgRpr_Simulation.DefaultSettings(this.params.simulation, this.simulator);
  }
  static DefaultSettings(asimulation, asimulator) {
    const r = {
      simulation: asimulation,
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
      velocityIterations: asimulator.DEFAULT_VELOCITY_ITERATIONS,
      velocityIterationsMMS: {
        min: 1,
        max: 16,
        step: 3
      },
      frictionIterations: asimulator.DEFAULT_FRICTION_ITERATIONS,
      frictionIterationsMMS: {
        min: 1,
        max: 16,
        step: 3
      },
      stabilizationIterations: asimulator.DEFAULT_STABILIZATION_ITERATIONS,
      stabilizationIterationsMMS: {
        min: 1,
        max: 16,
        step: 3
      },
      linearError: asimulator.DEFAULT_LINEAR_ERROR,
      linearErrorMMS: {
        min: 1e-4,
        max: 0.01,
        step: 1e-4
      },
      errorReductionRatio: asimulator.DEFAULT_ERR_REDUCTION_RATIO,
      errorReductionRatioMMS: {
        min: 0.05,
        max: 1,
        step: 0.05
      },
      predictionDistance: asimulator.DEFAULT_PREDICTION_DISTANCE,
      predictionDistanceMMS: {
        min: 2e-3,
        max: 0.1,
        step: 2e-3
      },
      slowDownFactor: 1,
      slowdownMMS: {
        min: 1,
        max: asimulator.MAX_SLOWDOWN,
        step: 1
      },
      debugMode: false,
      doResetToDefaults: false,
      isStatsGroupOpened: false,
      cameraPosition: {
        eye: { x: -80, y: 10, z: 80 },
        target: { x: 0, y: 0, z: 0 }
      },
      doResetCamera: false,
      doRestart: true
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
    this.params.simulation = this.params.settings.simulation;
    if (this.prevParams.settings.doResetToDefaults != this.params.settings.doResetToDefaults) {
      this.params.settings.doResetToDefaults = this.prevParams.settings.doResetToDefaults;
      this.params.settings = this.defaultSettings();
      this.#applyGuiSettingsToWorld();
    }
    if (this.params.settings?.doRestart) {
      this.simulator.setSimulation(this.params);
    }
    if (this.prevParams.simulation != this.params.simulation) {
      const params = {
        simulation: this.params.simulation,
        settings: null
      };
      this.simulator.setSimulation(params);
    }
    if (this.prevParams.settings.velocityIterations != this.params.settings.velocityIterations) {
      this.world.maxVelocityIterations = this.params.settings.velocityIterations;
    }
    if (this.prevParams.settings.frictionIterations != this.params.settings.frictionIterations) {
      this.world.maxVelocityFrictionIterations = this.params.settings.frictionIterations;
    }
    if (this.prevParams.settings.stabilizationIterations != this.params.settings.stabilizationIterations) {
      this.world.maxStabilizationIterations = this.params.settings.stabilizationIterations;
    }
    if (this.prevParams.settings.linearError != this.params.settings.linearError) {
      this.world.integrationParameters.allowedLinearError = this.params.settings.linearError;
    }
    if (this.prevParams.settings.errorReductionRatio != this.params.settings.errorReductionRatio) {
      this.world.integrationParameters.erp = this.params.settings.errorReductionRatio;
    }
    if (this.prevParams.settings.predictionDistance != this.params.settings.predictionDistance) {
      this.world.integrationParameters.predictionDistance = this.params.settings.predictionDistance;
    }
    if (this.prevParams.settings.slowDownFactor != this.params.settings.slowDownFactor) {
      this.simulator.slowDownFactor = this.params.settings.slowDownFactor;
    }
    if (this.prevParams.settings.debugMode != this.params.settings.debugMode) {
      this.simulator.debugMode = this.params.settings.debugMode;
    }
  }
  /** 
   * Raw verification of the current params and gui settings. If something was changed 
   * from the previous saved data or if a restart command was issued the result is true. 
   * False otherwise
   */
  needsUpdate() {
    const r = false;
    if (this.params.settings?.doRestart) {
      return true;
    }
    if (this.params.simulation != this.prevParams.simulation) {
      return true;
    }
    const currsettings = JSON.stringify(this.params.settings);
    const prevSettings = JSON.stringify(this.prevParams.settings);
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
        simulation: this.params.simulation,
        settings: null
      };
    } else {
      this.prevParams.simulation = this.params.simulation;
    }
    this.prevParams.settings = JSON.parse(JSON.stringify(this.params.settings));
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
