import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulator_GuiBuilder
} from "../ApgRpr_Simulation_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
export class ApgRpr_A4_Keva_Simulation extends ApgRpr_Simulation {
  currentCube = 0;
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRpr_A4_Keva_GuiBuilder);
    const settings = this.params.settings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  defaultSettings() {
    const r = {
      ...super.defaultSettings(),
      isCubesGroupOpened: false,
      cubesRestitution: 0,
      cubesRestitutionMMS: {
        min: 0,
        max: 1,
        step: 0.05
      },
      blockWidth: 0.1,
      blockWidthMMS: {
        min: 0.02,
        max: 0.1,
        step: 0.01
      },
      blockLevels: 8,
      blockLevelsMMS: {
        min: 2,
        max: 12,
        step: 1
      }
    };
    return r;
  }
  createWorld(asettings) {
    this.#initWorld();
  }
  #buildBlock(halfExtents, shift, numx, numy, numz) {
    const half_extents_zyx = {
      x: halfExtents.z,
      y: halfExtents.y,
      z: halfExtents.x
    };
    const dimensions = [halfExtents, half_extents_zyx];
    const blockWidth = 2 * halfExtents.z * numx;
    const blockHeight = 2 * halfExtents.y * numy;
    const spacing = (halfExtents.z * numx - halfExtents.x) / (numz - 1);
    for (let i = 0; i < numy; ++i) {
      [numx, numz] = [numz, numx];
      const dim2 = dimensions[i % 2];
      const y = dim2.y * i * 2;
      for (let j = 0; j < numx; ++j) {
        const x = i % 2 == 0 ? spacing * j * 2 : dim2.x * j * 2;
        for (let k = 0; k < numz; ++k) {
          const z = i % 2 == 0 ? dim2.z * k * 2 : spacing * k * 2;
          const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
            x + dim2.x + shift.x,
            y + dim2.y + shift.y,
            z + dim2.z + shift.z
          );
          const body = this.world.createRigidBody(bodyDesc);
          const colliderDesc = RAPIER.ColliderDesc.cuboid(
            dim2.x,
            dim2.y,
            dim2.z
          );
          this.world.createCollider(colliderDesc, body);
        }
      }
    }
    const dim = { x: halfExtents.z, y: halfExtents.x, z: halfExtents.y };
    for (let i = 0; i < blockWidth / (dim.x * 2); ++i) {
      const x = i * dim.x * 2 + dim.x + shift.x;
      for (let j = 0; j < blockWidth / (dim.z * 2); ++j) {
        const y = dim.y + shift.y + blockHeight;
        const z = j * dim.z * 2 + dim.z + shift.z;
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
        const body = this.world.createRigidBody(bodyDesc);
        const colliderDesc = RAPIER.ColliderDesc.cuboid(dim.x, dim.y, dim.z);
        this.world.createCollider(colliderDesc, body);
      }
    }
  }
  #initWorld() {
    const groundSize = 50;
    const groundHeight = 0.1;
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, -groundHeight, 0);
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      groundSize,
      groundHeight,
      groundSize
    );
    this.world.createCollider(colliderDesc, body);
    const halfExtents = new RAPIER.Vector3(0.1, 0.5, 2);
    let blockHeight = 0;
    const numyArr = [0, 3, 5, 5, 7, 9];
    let numBlocksBuilt = 0;
    for (let i = 5; i >= 1; --i) {
      const numx = i;
      const numy = numyArr[i];
      const numz = numx * 3 + 1;
      const blockWidth = numx * halfExtents.z * 2;
      this.#buildBlock(
        halfExtents,
        new RAPIER.Vector3(
          -blockWidth / 2,
          blockHeight,
          -blockWidth / 2
        ),
        numx,
        numy,
        numz
      );
      blockHeight += numy * halfExtents.y * 2 + halfExtents.x * 2;
      numBlocksBuilt += numx * numy * numz;
    }
  }
  updateFromGui() {
    if (this.needsUpdate()) {
      super.updateFromGui();
    }
  }
}
class ApgRpr_A4_Keva_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {
  _guiSettings;
  constructor(asimulator, asettings) {
    super(asimulator, asettings);
    this._guiSettings = asettings;
  }
  buildControls() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const cubesGroupControl = this.#buildCubesGroupControl();
    const simControls = super.buildControls();
    const r = this.buildPanelControl(
      `ApgRprSim_${this._guiSettings.simulation}_SettingsPanelId`,
      [
        simulationChangeControl,
        restartSimulationButtonControl,
        cubesGroupControl,
        simControls
      ]
    );
    return r;
  }
  #buildCubesGroupControl() {
    const CUBES_REST_CNT = "cubesRestitutionControl";
    const cubesRestitutionControl = this.buildRangeControl(
      CUBES_REST_CNT,
      "Restitution",
      this._guiSettings.cubesRestitution,
      this._guiSettings.cubesRestitutionMMS,
      () => {
        const range = this.gui.controls.get(CUBES_REST_CNT).element;
        this._guiSettings.cubesRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${CUBES_REST_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const JEN_BLK_WID_CNT = "jengaBlockWidthControl";
    const jengaBlockWidthControl = this.buildRangeControl(
      JEN_BLK_WID_CNT,
      "Block width",
      this._guiSettings.blockWidth,
      this._guiSettings.blockWidthMMS,
      () => {
        const range = this.gui.controls.get(JEN_BLK_WID_CNT).element;
        this._guiSettings.blockWidth = parseFloat(range.value);
        const output = this.gui.controls.get(`${JEN_BLK_WID_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const JEN_BLK_LEVELS_CNT = "jengaBlockLevelsControl";
    const jengaBlockLevelsControl = this.buildRangeControl(
      JEN_BLK_LEVELS_CNT,
      "Levels",
      this._guiSettings.blockLevels,
      this._guiSettings.blockLevelsMMS,
      () => {
        const range = this.gui.controls.get(JEN_BLK_LEVELS_CNT).element;
        this._guiSettings.blockLevels = parseFloat(range.value);
        const output = this.gui.controls.get(`${JEN_BLK_LEVELS_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildDetailsControl(
      "cubesGroupControl",
      "Blocks:",
      [
        cubesRestitutionControl,
        jengaBlockWidthControl,
        jengaBlockLevelsControl
      ],
      this._guiSettings.isCubesGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this._guiSettings.isCubesGroupOpened = !this._guiSettings.isCubesGroupOpened;
          this.gui.logNoTime("Blocks group toggled");
        }
      }
    );
    return r;
  }
}
