import {
  PRANDO,
  RAPIER
} from "./ApgRpr_Deps.ts";
import {
  ApgRrp_MaterialsTable,
  ApgRrp_eMaterial
} from "./ApgRpr_Materials.ts";
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
  static RPR_SIMULATION_LOGGER_NAME = "Rapier simulation";
  /**
   * Creates a new simulation and a new world for the RAPIER simulator
   */
  constructor(asimulator, aparams) {
    this.simulator = asimulator;
    this.logger = asimulator.logger;
    if (!this.logger.hasLogger(ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME)) {
      this.logger.addLogger(ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME);
    }
    this.params = aparams;
    if (this.params.settings == void 0) {
      this.params.settings = this.defaultSettings();
    }
    this.rng = new PRANDO(this.params.simulation);
    this.savePrevParams();
    this.world = new RAPIER.World(this.params.settings.gravity);
    this.#applySettingsToWorld();
    if (this.params.settings.doRestart) {
      this.simulator.resetCamera(this.params.settings.cameraPosition);
      this.params.settings.doRestart = false;
    }
    if (this.params.settings.doResetCamera) {
      this.simulator.resetCamera(this.params.settings.cameraPosition);
      this.params.settings.doResetCamera = false;
    }
  }
  /** 
   * Set up the default Gui settings for the simulator. This method can be overridden 
   * and extended by derived classes to add more settings each specific of every simulation. 
   */
  defaultSettings(acolliderSize = this.simulator.DEFAULT_COLLIDER_SIZE, asceneSize = this.simulator.DEFAULT_SCENE_SIZE) {
    const linearError = acolliderSize * this.simulator.DEFAULT_APG_RPR_LINEAR_ERROR_FACTOR;
    const preditionDistance = acolliderSize * this.simulator.DEFAULT_APG_RPR_PREDICTION_DISTANCE_FACTOR;
    const r = {
      simulation: this.params.simulation,
      scale: 1,
      // Not Yet Implemented
      colliderSize: acolliderSize,
      sceneSize: asceneSize,
      table: {
        width: 2,
        depth: 1,
        height: 1,
        thickness: 0.05
      },
      gravity: new RAPIER.Vector3(
        this.simulator.DEFAULT_GRAVITY_X,
        this.simulator.DEFAULT_GRAVITY_Y,
        this.simulator.DEFAULT_GRAVITY_Z
      ),
      gravityXMMS: {
        min: -20,
        max: 20,
        step: 0.2
      },
      gravityYMMS: {
        min: -20,
        max: 20,
        step: 0.2
      },
      gravityZMMS: {
        min: -20,
        max: 20,
        step: 0.2
      },
      velocityIterations: this.simulator.DEFAULT_APG_RPR_VELOCITY_ITERATIONS,
      velocityIterationsMMS: {
        min: 1,
        max: 20,
        step: 1
      },
      frictionIterations: this.simulator.DEFAULT_APG_RPR_FRICTION_ITERATIONS,
      frictionIterationsMMS: {
        min: 1,
        max: 20,
        step: 1
      },
      stabilizationIterations: this.simulator.DEFAULT_APG_RPR_STABILIZATION_ITERATIONS,
      stabilizationIterationsMMS: {
        min: 1,
        max: 20,
        step: 1
      },
      ccdSteps: this.simulator.DEFAULT_RAPIER_CCD_STEPS,
      ccdStepsMMS: {
        min: 1,
        max: 20,
        step: 1
      },
      linearError,
      linearErrorMMS: {
        min: linearError / 5,
        max: linearError * 5,
        step: linearError / 5
      },
      errorReductionRatio: this.simulator.DEFAULT_APG_RPR_ERR_REDUCTION_RATIO,
      errorReductionRatioMMS: {
        min: 0.05,
        max: 1,
        step: 0.05
      },
      predictionDistance: preditionDistance,
      predictionDistanceMMS: {
        min: preditionDistance / 5,
        max: preditionDistance * 5,
        step: preditionDistance / 5
      },
      slowDownFactor: 1,
      slowdownMMS: {
        min: 1,
        max: this.simulator.MAX_SLOWDOWN,
        step: 1
      },
      isDebugMode: false,
      cameraPosition: {
        eye: {
          x: asceneSize,
          y: this.simulator.viewer.defaultEyeHeight,
          z: -asceneSize
        },
        target: {
          x: 0,
          y: 1,
          z: 0
        }
      },
      doResetCamera: false,
      doResetToDefaults: false,
      doRestart: false,
      isSimulatorDetailsOpened: false,
      isStatsDetailsOpened: false
    };
    return r;
  }
  /**
   * Per frame updating of the RAPIER simulator settings
   */
  #applySettingsToWorld() {
    this.world.gravity = this.params.settings.gravity;
    this.world.maxVelocityIterations = this.params.settings.velocityIterations;
    this.world.maxVelocityFrictionIterations = this.params.settings.frictionIterations;
    this.world.maxStabilizationIterations = this.params.settings.stabilizationIterations;
    this.world.integrationParameters.allowedLinearError = this.params.settings.linearError;
    this.world.integrationParameters.erp = this.params.settings.errorReductionRatio;
    this.world.integrationParameters.predictionDistance = this.params.settings.predictionDistance;
  }
  /**
   * Applies the physic material properties to the rigid body descriptor
   */
  applyMaterialToRigidBodyDesc(arigidBodyDesc, material) {
    arigidBodyDesc.setLinearDamping(material.linearDamping || 0).setAngularDamping(material.angularDamping || 0);
  }
  /**
   * Applies the physic material properties to the collider descriptor
   */
  applyMaterialToColliderDesc(acolliderDesc, material) {
    acolliderDesc.setDensity(material.density).setFriction(material.friction).setRestitution(material.restitution);
  }
  /**
   * Overridable method to create a simulation
   */
  createWorld(_asettings) {
    this.createGround();
  }
  /**
   * Create the Gui for the current simulation
   */
  buildGui(aguiBuilderType) {
    const guiBuilder = new aguiBuilderType(
      this.simulator,
      this.params.settings
    );
    const settingsHtml = guiBuilder.buildControls();
    this.simulator.updateViewerSettings(settingsHtml);
    const hudHtml = guiBuilder.buildHudControls();
    this.simulator.updateViewerHud(hudHtml);
    guiBuilder.bindControls();
    this.logger.log(`Gui built for simulation ${this.params.simulation}`, ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME);
  }
  /** 
   * Update the simulation params accordingly with the Gui settings. 
   * This method can be overridden and extended by derived classes to manage 
   * the settings specific of the single simulation that need immediate 
   * per frame updating. 
   */
  updateFromGui() {
    if (this.needsUpdate()) {
      this.updateSimulatorFromGui();
      this.savePrevParams();
      this.simulator.gui.updateReactiveControls();
    }
  }
  /** 
   * Update the Rapier simulator params from the Gui setting. 
   * WARNING!! This method should not be overridden.
   */
  updateSimulatorFromGui() {
    this.params.simulation = this.params.settings.simulation;
    if (this.params.settings.doResetToDefaults) {
      const defaultSettings = this.defaultSettings();
      Object.assign(this.params.settings, defaultSettings);
    }
    if (this.params.settings.doResetCamera) {
      this.simulator.resetCamera(this.params.settings.cameraPosition);
      this.params.settings.doResetCamera = false;
    }
    if (this.params.settings?.doRestart) {
      this.simulator.setSimulation(this.params);
      return;
    }
    if (this.prevParams.simulation != this.params.simulation) {
      const params = {
        simulation: this.params.simulation,
        settings: null
      };
      this.simulator.setSimulation(params);
      return;
    }
    this.#applySettingsToWorld();
    if (this.prevParams.settings.slowDownFactor != this.params.settings.slowDownFactor) {
      this.simulator.slowDownFactor = this.params.settings.slowDownFactor;
    }
    if (this.prevParams.settings.isDebugMode != this.params.settings.isDebugMode) {
      this.simulator.debugMode = this.params.settings.isDebugMode;
    }
  }
  /** 
   * Detects it the current params and gui settings are changed from the 
   * previous saved data or if a restart command was issued
   */
  needsUpdate() {
    const r = false;
    const currSettings = this.params.settings;
    const prevSettings = this.prevParams.settings;
    if (this.params.simulation != this.prevParams.simulation) {
      return true;
    }
    if (currSettings.isDebugMode != prevSettings.isDebugMode) {
      return true;
    }
    if (currSettings.doRestart) {
      return true;
    }
    if (currSettings.doResetToDefaults) {
      return true;
    }
    if (currSettings.doResetCamera) {
      return true;
    }
    if (currSettings.velocityIterations != prevSettings.velocityIterations) {
      return true;
    }
    if (currSettings.frictionIterations != prevSettings.frictionIterations) {
      return true;
    }
    if (currSettings.stabilizationIterations != prevSettings.stabilizationIterations) {
      return true;
    }
    if (currSettings.linearError != prevSettings.linearError) {
      return true;
    }
    if (currSettings.errorReductionRatio != prevSettings.errorReductionRatio) {
      return true;
    }
    if (currSettings.predictionDistance != prevSettings.predictionDistance) {
      return true;
    }
    if (currSettings.slowDownFactor != prevSettings.slowDownFactor) {
      return true;
    }
    if (currSettings.slowDownFactor != prevSettings.slowDownFactor) {
      return true;
    }
    if (currSettings.gravity.toString() != prevSettings.gravity.toString()) {
      return true;
    }
    const currFullSettings = JSON.stringify(this.params.settings);
    const prevFullSettings = JSON.stringify(this.prevParams.settings);
    if (currFullSettings != prevFullSettings) {
      return true;
    }
    return r;
  }
  /**
   * Save the params for later comparison in order to detect changes due
   * to the user's interaction
   */
  savePrevParams() {
    this.prevParams = JSON.parse(JSON.stringify(this.params));
  }
  /**
   * Creates a ground for the simulation
   */
  createGround(amaterialName = ApgRrp_eMaterial.Stone) {
    const groundRadious = this.simulator.viewer.metrics.worldSize;
    const GROUND_HEIGHT = 1;
    const material = ApgRrp_MaterialsTable[amaterialName];
    const userData = {
      material
    };
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setUserData(userData);
    this.applyMaterialToRigidBodyDesc(bodyDesc, material);
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cylinder(GROUND_HEIGHT / 2, groundRadious).setTranslation(0, -GROUND_HEIGHT / 2, 0);
    this.applyMaterialToColliderDesc(colliderDesc, material);
    this.world.createCollider(colliderDesc, body);
  }
  /**
   * Creates a playground table for the simulation
   */
  createSimulationTable(atableWidth = 2, atableDepth = 1, atableHeight = 1, atableThickness = 0.05, amaterialName = ApgRrp_eMaterial.HardWood) {
    const material = ApgRrp_MaterialsTable[amaterialName];
    const userData = {
      material
    };
    const tableRBD = RAPIER.RigidBodyDesc.fixed().setUserData(userData);
    this.applyMaterialToRigidBodyDesc(tableRBD, material);
    const tableBody = this.world.createRigidBody(tableRBD);
    const tableCD = RAPIER.ColliderDesc.cuboid(atableWidth / 2, atableThickness / 2, atableDepth / 2).setTranslation(0, atableHeight - atableThickness / 2, 0);
    this.applyMaterialToColliderDesc(tableCD, material);
    this.world.createCollider(tableCD, tableBody);
    const tableSupportSize = 0.2;
    const tableSupportHeight = atableHeight - atableThickness;
    const tableSupportRBD = RAPIER.RigidBodyDesc.fixed().setUserData(userData);
    this.applyMaterialToRigidBodyDesc(tableSupportRBD, material);
    const tableSupportBody = this.world.createRigidBody(tableSupportRBD);
    const tableSupportCD = RAPIER.ColliderDesc.cuboid(tableSupportSize / 2, tableSupportHeight / 2, tableSupportSize / 2).setTranslation(0, tableSupportHeight / 2, 0);
    this.applyMaterialToColliderDesc(tableSupportCD, material);
    this.world.createCollider(tableSupportCD, tableSupportBody);
  }
  /**
   * WARNING: The number of columns and rows generates a list of vertices
   * of the size ( (number of columns + 1 ) * ( number of rows + 1) )
   * @returns An Float32Array of heights one per vertex
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
