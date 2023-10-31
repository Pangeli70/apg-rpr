import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSimulation } from "../ApgRpr_Simulation.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
export class ApgRprSim_Pyramid extends ApgRprSimulation {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_Pyramid_GuiBuilder);
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
    if (!this.params.restart) {
      this.simulator.resetCamera(settings.cameraPosition);
    } else {
      this.params.restart = false;
    }
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    this.createGround();
    const tableThickness = 0.05;
    const tableWidth = 2;
    const tableDepth = 1;
    const tableHeight = 1;
    const tableBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const tableBody = this.world.createRigidBody(tableBodyDesc);
    const tableColliderDesc = RAPIER.ColliderDesc.cuboid(tableWidth / 2, tableThickness / 2, tableDepth / 2).setTranslation(0, tableHeight - tableThickness / 2, 0);
    this.world.createCollider(tableColliderDesc, tableBody);
    const tableSupportSize = 0.2;
    const tableSupportHeight = tableHeight - tableThickness;
    const tableSupportBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const tableSupportBody = this.world.createRigidBody(tableSupportBodyDesc);
    const tableSupportColliderDesc = RAPIER.ColliderDesc.cuboid(tableSupportSize / 2, tableSupportHeight / 2, tableSupportSize / 2).setTranslation(0, tableSupportHeight / 2, 0);
    this.world.createCollider(tableSupportColliderDesc, tableSupportBody);
    const baseSize = asettings.size;
    const cubeSize = 0.05;
    const cubeRadious = cubeSize / 2;
    const cubeGap = cubeSize / 4;
    const distance = cubeSize + cubeGap;
    const fallLevel = cubeSize * 5;
    const initialXYDisplacement = -1 * (cubeSize * baseSize + cubeGap * (baseSize - 1)) / 2;
    for (let iy = 0; iy < baseSize; iy++) {
      const levelXZOrigin = initialXYDisplacement + iy * distance / 2;
      const levelHeight = tableHeight + fallLevel + cubeRadious;
      for (let ix = 0; ix < baseSize - iy; ix++) {
        for (let iz = 0; iz < baseSize - iy; iz++) {
          const y = levelHeight + iy * distance;
          const x = levelXZOrigin + ix * distance;
          const z = levelXZOrigin + iz * distance;
          const boxBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
          const boxBody = this.world.createRigidBody(boxBodyDesc);
          const boxColliderDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, cubeRadious, cubeRadious).setRestitution(asettings.cubesRestitution);
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
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings(),
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
    r.cameraPosition.eye.x = -5;
    r.cameraPosition.eye.y = 1.65;
    r.cameraPosition.eye.z = -5;
    r.cameraPosition.target.y = 1;
    return r;
  }
}
export class ApgRprSim_Pyramid_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildPanel() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const cubesGroupControl = this.#buildCubesGroupControl();
    const simControls = super.buildPanel();
    const r = this.buildPanelControl(
      `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
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
      this.guiSettings.cubesRestitution,
      this.guiSettings.cubesRestitutionMMS,
      () => {
        const range = this.gui.controls.get(CUBES_REST_CNT).element;
        this.guiSettings.cubesRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${CUBES_REST_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const PYR_SIZE_CNT = "pyramidSizeControl";
    const pyramidSizeControl = this.buildRangeControl(
      PYR_SIZE_CNT,
      "Size",
      this.guiSettings.size,
      this.guiSettings.sizeMMS,
      () => {
        const range = this.gui.controls.get(PYR_SIZE_CNT).element;
        this.guiSettings.size = parseFloat(range.value);
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
      this.guiSettings.isCubesGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.guiSettings.isCubesGroupOpened = !this.guiSettings.isCubesGroupOpened;
          this.gui.logNoTime("Cubes group toggled");
        }
      }
    );
    return r;
  }
}
