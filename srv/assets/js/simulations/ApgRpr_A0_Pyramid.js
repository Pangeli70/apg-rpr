import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
import {
  ApgRpr_Simulator_GuiBuilder
} from "../ApgRpr_Simulator_GuiBuilder.ts";
export class ApgRpr_A0_Pyramid_Simulation extends ApgRpr_Simulation {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRpr_A0_Pyramid_GuiBuilder);
    const settings = this.params.settings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    this.createGround();
    this.createSimulationTable(
      asettings.table.width,
      asettings.table.depth,
      asettings.table.height,
      asettings.table.thickness
    );
    const baseSize = asettings.size;
    const cubeSize = 0.05;
    const cubeRadious = cubeSize / 2;
    const cubeGap = cubeSize / 4;
    const distance = cubeSize + cubeGap;
    const fallLevel = cubeSize * 5;
    const initialXYDisplacement = -1 * (cubeSize * baseSize + cubeGap * (baseSize - 1)) / 2;
    for (let iy = 0; iy < baseSize; iy++) {
      const levelXZOrigin = initialXYDisplacement + iy * distance / 2;
      const levelHeight = asettings.table.height + fallLevel + cubeRadious;
      for (let ix = 0; ix < baseSize - iy; ix++) {
        for (let iz = 0; iz < baseSize - iy; iz++) {
          const y = levelHeight + iy * distance;
          const x = levelXZOrigin + ix * distance;
          const z = levelXZOrigin + iz * distance;
          const boxBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
          const boxBody = this.world.createRigidBody(boxBodyDesc);
          const boxColliderDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, cubeRadious, cubeRadious).setRestitution(asettings.cubesRestitution).setFriction(1);
          this.world.createCollider(boxColliderDesc, boxBody);
        }
      }
    }
  }
  updateFromGui() {
    if (this.needsUpdate()) {
      super.updateFromGui();
    }
  }
  defaultSettings() {
    const r = {
      ...super.defaultSettings(),
      isCubesGroupOpened: false,
      cubesRestitution: 0.5,
      cubesRestitutionMMS: {
        min: 0.05,
        max: 1,
        step: 0.05
      },
      size: 8,
      sizeMMS: {
        min: 5,
        max: 12,
        step: 1
      }
    };
    return r;
  }
}
class ApgRpr_A0_Pyramid_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {
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
    const CUBES_REST_CNT = "blocksRestitutionControl";
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
    const PYR_SIZE_CNT = "pyramidSizeControl";
    const pyramidSizeControl = this.buildRangeControl(
      PYR_SIZE_CNT,
      "Size",
      this._guiSettings.size,
      this._guiSettings.sizeMMS,
      () => {
        const range = this.gui.controls.get(PYR_SIZE_CNT).element;
        this._guiSettings.size = parseFloat(range.value);
        const output = this.gui.controls.get(`${PYR_SIZE_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildDetailsControl(
      "cubesGroupControl",
      "Cubes:",
      [
        cubesRestitutionControl,
        pyramidSizeControl
      ],
      this._guiSettings.isCubesGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this._guiSettings.isCubesGroupOpened = !this._guiSettings.isCubesGroupOpened;
          this.gui.logNoTime("Cubes group toggled");
        }
      }
    );
    return r;
  }
}
