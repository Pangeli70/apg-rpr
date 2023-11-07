import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
import {
  ApgRpr_Simulation_GuiBuilder
} from "../ApgRpr_Simulation_GuiBuilder.ts";
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
  defaultSettings() {
    const r = {
      ...super.defaultSettings(),
      isPyramidGroupOpened: false,
      pyramidSize: 8,
      pyramidSizeMMS: { min: 5, max: 12, step: 1 },
      fallHeightFactor: 1,
      fallHeightFactorMMS: { min: 0.1, max: 10, step: 0.1 },
      cubeSize: 0.05,
      cubeSizeMMS: { min: 0.01, max: 0.1, step: 0.01 },
      cubesRestitution: 0.5,
      cubesRestitutionMMS: { min: 0.02, max: 2, step: 0.02 },
      cubesFriction: 0.5,
      cubesFrictionMMS: { min: 0.02, max: 1, step: 0.02 }
    };
    r.frictionIterations = 8;
    return r;
  }
  createWorld(asettings) {
    this.createGround();
    this.createSimulationTable(
      asettings.table.width,
      asettings.table.depth,
      asettings.table.height,
      asettings.table.thickness
    );
    this.#makePyramid(asettings);
    this.logger.log(
      `World created for simulation ${this.params.simulation}`,
      ApgRpr_Simulation.RPR_SIMULATION_NAME
    );
  }
  #makePyramid(asettings) {
    const baseSize = asettings.pyramidSize;
    const cubeSize = asettings.cubeSize;
    const cubeRadious = cubeSize / 2;
    const cubeGap = cubeSize / 4;
    const distance = cubeSize + cubeGap;
    const fallHeight = cubeSize * asettings.fallHeightFactor;
    const initialXZDisplacement = -1 * (cubeSize * baseSize + cubeGap * (baseSize - 1)) / 2 + cubeRadious;
    for (let iy = 0; iy < baseSize; iy++) {
      const levelXZOrigin = initialXZDisplacement + iy * distance / 2;
      const levelHeight = asettings.table.height + fallHeight + cubeRadious;
      for (let ix = 0; ix < baseSize - iy; ix++) {
        for (let iz = 0; iz < baseSize - iy; iz++) {
          const y = levelHeight + iy * distance;
          const x = levelXZOrigin + ix * distance;
          const z = levelXZOrigin + iz * distance;
          const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
          const boxBody = this.world.createRigidBody(bodyDesc);
          const collDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, cubeRadious, cubeRadious).setRestitution(asettings.cubesRestitution).setFriction(asettings.cubesFriction);
          this.world.createCollider(collDesc, boxBody);
        }
      }
    }
  }
}
class ApgRpr_A0_Pyramid_GuiBuilder extends ApgRpr_Simulation_GuiBuilder {
  _guiSettings;
  constructor(asimulator, asettings) {
    super(asimulator, asettings);
    this._guiSettings = asettings;
  }
  buildControls() {
    const changeSimulationControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const pyramidSettingsGroupControl = this.#buildPyramidSettingsGroupControl();
    const simulationControls = super.buildControls();
    const r = this.buildPanelControl(
      `ApgRprSim_${this._guiSettings.simulation}_SettingsPanelId`,
      [
        changeSimulationControl,
        restartSimulationButtonControl,
        pyramidSettingsGroupControl,
        simulationControls
      ]
    );
    return r;
  }
  #buildPyramidSettingsGroupControl() {
    const controls = [];
    controls.push(this.#buildPyramidSizeControl("PyramidSizeControl"));
    controls.push(this.#buildCubeSizeControl("CubeSizeControl"));
    controls.push(this.#buildFallHeightFactorControl("FallHeightFactorControl"));
    controls.push(this.#buildCubesRestitutionControl("CubesRestitutionControl"));
    controls.push(this.#buildCubesFrictionControl("CubesFrictionControl"));
    const r = this.buildDetailsControl(
      "pyramidGroupControl",
      "Pyramid settings:",
      controls,
      this._guiSettings.isPyramidGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this._guiSettings.isPyramidGroupOpened = !this._guiSettings.isPyramidGroupOpened;
          this.gui.logNoTime("Pyramid group toggled");
        }
      }
    );
    return r;
  }
  #buildPyramidSizeControl(aId) {
    const r = this.buildRangeControl(
      aId,
      "Size",
      this._guiSettings.pyramidSize,
      this._guiSettings.pyramidSizeMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this._guiSettings.pyramidSize = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.logNoTime(`Size control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildFallHeightFactorControl(aId) {
    const r = this.buildRangeControl(
      aId,
      "Height factor",
      this._guiSettings.fallHeightFactor,
      this._guiSettings.fallHeightFactorMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this._guiSettings.fallHeightFactor = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.logNoTime(`Fall height control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildCubeSizeControl(aId) {
    const r = this.buildRangeControl(
      aId,
      "Cube size",
      this._guiSettings.cubeSize,
      this._guiSettings.cubeSizeMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this._guiSettings.cubeSize = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.logNoTime(`Cube size control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildCubesRestitutionControl(aId) {
    const r = this.buildRangeControl(
      aId,
      "Restitution",
      this._guiSettings.cubesRestitution,
      this._guiSettings.cubesRestitutionMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this._guiSettings.cubesRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.logNoTime(`Restitution control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildCubesFrictionControl(aId) {
    const r = this.buildRangeControl(
      aId,
      "Friction",
      this._guiSettings.cubesFriction,
      this._guiSettings.cubesFrictionMMS,
      () => {
        const range = this.gui.controls.get(aId).element;
        this._guiSettings.cubesFriction = parseFloat(range.value);
        const output = this.gui.controls.get(`${aId}Value`).element;
        output.innerHTML = range.value;
        this.gui.logNoTime(`Friction control change event: ${range.value}`);
      }
    );
    return r;
  }
}
