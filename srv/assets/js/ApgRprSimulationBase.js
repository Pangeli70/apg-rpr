import { RAPIER, PRANDO } from "./ApgRprDeps.ts";
export class ApgRprSim_Base {
  /** */
  world;
  /** */
  simulator;
  /** */
  params;
  /** */
  prevParams;
  constructor(asimulator, aparams) {
    this.simulator = asimulator;
    this.params = {
      gravity: aparams.gravity || new RAPIER.Vector3(0, -9.81, 0),
      restart: aparams.restart || false,
      simulation: aparams.simulation,
      simulations: Array.from(this.simulator.simulations.keys()),
      guiSettings: aparams.guiSettings || this.defaultGuiSettings(),
      stats: this.simulator.stats,
      debugInfo: this.simulator.debugInfo
    };
    this.savePrevParams();
    this.world = new RAPIER.World(this.params.gravity);
  }
  buildGui(aguiBuilderType) {
    const guiBuilder = new aguiBuilderType(
      this.simulator.gui,
      this.params
    );
    const html = guiBuilder.buildHtml();
    this.simulator.updateViewerPanel(html);
    guiBuilder.bindControls();
    this.simulator.gui.log("Sim Gui built", true);
  }
  updateFromGui() {
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
    if (this.prevParams.guiSettings.slowdown != this.params.guiSettings.slowdown) {
      this.simulator.slowdown = this.params.guiSettings.slowdown;
    }
    this.savePrevParams();
  }
  defaultGuiSettings() {
    const r = {
      isSimulationGroupOpened: false,
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
      slowdown: 1,
      slowdownMMS: {
        min: 1,
        max: this.simulator.MAX_SLOWDOWN,
        step: 1
      },
      isStatsGroupOpened: false,
      cameraPosition: {
        eye: { x: -80, y: 10, z: 80 },
        target: { x: 0, y: 0, z: 0 }
      }
    };
    return r;
  }
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
  savePrevParams() {
    if (!this.prevParams) {
      this.prevParams = {
        simulation: this.params.simulation
      };
    } else {
      this.prevParams.simulation = this.params.simulation;
    }
    this.prevParams.guiSettings = JSON.parse(JSON.stringify(this.params.guiSettings));
  }
  generateRandomHeightMap(arandomSeed, axNum, azNum, axScale, ayScale, azScale) {
    const rng = new PRANDO(arandomSeed);
    const randomHeights = [];
    for (let i = 0; i < axNum + 1; i++) {
      for (let j = 0; j < azNum + 1; j++) {
        randomHeights.push(rng.next());
      }
    }
    const r = this.generateHeightMap(
      axNum,
      azNum,
      axScale,
      ayScale,
      azScale,
      randomHeights
    );
    return r;
  }
  generateHeightMap(axNum, azNum, axScale, ayScale, azScale, aheights) {
    const xSize = axScale / axNum;
    const zSize = azScale / azNum;
    const xHalf = axScale / 2;
    const zHalf = azScale / 2;
    const vertices = [];
    for (let iz = 0; iz < azNum + 1; iz++) {
      for (let ix = 0; ix < axNum + 1; ix++) {
        const index = ix + iz * axNum;
        const x = ix * xSize - xHalf;
        const y = aheights[index] * ayScale;
        const z = iz * zSize - zHalf;
        vertices.push(x, y, z);
      }
    }
    const indices = [];
    for (let z = 0; z < azNum; z++) {
      for (let x = 0; x < axNum; x++) {
        const i1 = x + z * (axNum + 1);
        const i2 = x + (z + 1) * (axNum + 1);
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
