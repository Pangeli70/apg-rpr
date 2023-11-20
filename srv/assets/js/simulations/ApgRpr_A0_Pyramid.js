import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRrp_MaterialsTable,
  ApgRrp_eMaterial
} from "../ApgRpr_Materials.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
import {
  ApgRpr_Simulator_GuiBuilder
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
      cubeSize: 0.05,
      cubeSizeMMS: { min: 0.01, max: 0.1, step: 0.01 },
      fallHeightFactor: 1,
      fallHeightFactorMMS: { min: 0.1, max: 10, step: 0.1 },
      cubesMaterial: ApgRrp_eMaterial.HardWood,
      cubesRestitution: 0.5,
      cubesRestitutionMMS: { min: 5e-3, max: 1.1, step: 5e-3 },
      cubesFriction: 0.5,
      cubesFrictionMMS: { min: 5e-3, max: 1, step: 5e-3 }
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
      ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME
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
    const material = ApgRrp_MaterialsTable[asettings.cubesMaterial];
    const userData = {
      material
    };
    for (let iy = 0; iy < baseSize; iy++) {
      const levelXZOrigin = initialXZDisplacement + iy * distance / 2;
      const levelHeight = asettings.table.height + fallHeight + cubeRadious;
      for (let ix = 0; ix < baseSize - iy; ix++) {
        for (let iz = 0; iz < baseSize - iy; iz++) {
          const y = levelHeight + iy * distance;
          const x = levelXZOrigin + ix * distance;
          const z = levelXZOrigin + iz * distance;
          const cubeRBD = RAPIER.RigidBodyDesc.dynamic().setUserData(userData).setTranslation(x, y, z);
          this.applyMaterialToRigidBodyDesc(cubeRBD, material);
          const cubeRB = this.world.createRigidBody(cubeRBD);
          const cubeCD = RAPIER.ColliderDesc.cuboid(cubeRadious, cubeRadious, cubeRadious);
          this.applyMaterialToColliderDesc(cubeCD, material);
          this.world.createCollider(cubeCD, cubeRB);
        }
      }
    }
  }
}
class ApgRpr_A0_Pyramid_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {
  _guiSettings;
  _CUSTOM_RESTITUTION_RANGE_CONTROL_ID = "CubesCustomRestitutionRangeControl";
  _CUSTOM_FRICTION_RANGE_CONTROL_ID = "CubesCustomFrictionRangeControl";
  constructor(asimulator, asettings) {
    super(asimulator, asettings);
    this._guiSettings = asettings;
  }
  //--------------------------------------------------------------------------
  // #region GUI
  buildControls() {
    const controls = [];
    controls.push(this.buildSimulationChangeControl());
    controls.push(this.buildRestartButtonControl());
    controls.push(this.#buildPyramidSettingsDetailsControl());
    controls.push(super.buildControls());
    const r = this.buildPanelControl(
      `ApgRpr_${this._guiSettings.simulation}_SettingsPanelControl`,
      controls
    );
    return r;
  }
  #buildPyramidSettingsDetailsControl() {
    const controls = [];
    controls.push(this.#buildPyramidSizeControl());
    controls.push(this.#buildCubeSizeControl());
    controls.push(this.#buildFallHeightFactorControl());
    controls.push(this.#buildCubesMaterialSelectControl());
    controls.push(this.#buildCubesRestitutionControl());
    controls.push(this.#buildCubesFrictionControl());
    const id = "PyramidSettingsDetailsControl";
    const r = this.buildDetailsControl(
      id,
      "Pyramid settings:",
      controls,
      this._guiSettings.isPyramidGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this._guiSettings.isPyramidGroupOpened = !this._guiSettings.isPyramidGroupOpened;
          this.gui.devLogNoTime("Pyramid group toggled");
        }
      }
    );
    return r;
  }
  #buildPyramidSizeControl() {
    const id = "PyramidSizeControl";
    const r = this.buildRangeControl(
      id,
      "Size",
      this._guiSettings.pyramidSize,
      this._guiSettings.pyramidSizeMMS,
      () => {
        const range = this.gui.controls.get(id).element;
        this._guiSettings.pyramidSize = parseFloat(range.value);
        const output = this.gui.controls.get(`${id}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`Size control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildCubeSizeControl() {
    const id = "CubeSizeControl";
    const r = this.buildRangeControl(
      id,
      "Cube size [m]",
      this._guiSettings.cubeSize,
      this._guiSettings.cubeSizeMMS,
      () => {
        const range = this.gui.controls.get(id).element;
        this._guiSettings.cubeSize = parseFloat(range.value);
        const output = this.gui.controls.get(`${id}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`Cube size control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildFallHeightFactorControl() {
    const id = "FallHeightFactorControl";
    const r = this.buildRangeControl(
      id,
      "Fall height factor",
      this._guiSettings.fallHeightFactor,
      this._guiSettings.fallHeightFactorMMS,
      () => {
        const range = this.gui.controls.get(id).element;
        this._guiSettings.fallHeightFactor = parseFloat(range.value);
        const output = this.gui.controls.get(`${id}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`Fall height control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildCubesRestitutionControl() {
    const id = this._CUSTOM_RESTITUTION_RANGE_CONTROL_ID;
    const r = this.buildRangeControl(
      id,
      "Restitution",
      this._guiSettings.cubesRestitution,
      this._guiSettings.cubesRestitutionMMS,
      () => {
        const range = this.gui.controls.get(id).element;
        this._guiSettings.cubesRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${id}Value`).element;
        output.innerHTML = range.value;
        const material = ApgRrp_MaterialsTable[ApgRrp_eMaterial.Custom];
        material.restitution = this._guiSettings.cubesRestitution;
        this.gui.devLogNoTime(`Restitution control change event: ${range.value}`);
      },
      this._guiSettings.cubesMaterial == ApgRrp_eMaterial.Custom ? false : true
    );
    return r;
  }
  #buildCubesFrictionControl() {
    const id = this._CUSTOM_FRICTION_RANGE_CONTROL_ID;
    const r = this.buildRangeControl(
      id,
      "Friction",
      this._guiSettings.cubesFriction,
      this._guiSettings.cubesFrictionMMS,
      () => {
        const range = this.gui.controls.get(id).element;
        this._guiSettings.cubesFriction = parseFloat(range.value);
        const output = this.gui.controls.get(`${id}Value`).element;
        output.innerHTML = range.value;
        const material = ApgRrp_MaterialsTable[ApgRrp_eMaterial.Custom];
        material.friction = this._guiSettings.cubesFriction;
        this.gui.devLogNoTime(`Friction control change event: ${range.value}`);
      },
      this._guiSettings.cubesMaterial == ApgRrp_eMaterial.Custom ? false : true
    );
    return r;
  }
  #buildCubesMaterialSelectControl() {
    const keyValues = /* @__PURE__ */ new Map();
    for (const key of Object.keys(ApgRrp_MaterialsTable)) {
      keyValues.set(key, key);
    }
    const id = "CubesMaterialSelectControl";
    const r = this.buildSelectControl(
      id,
      "Material",
      this._guiSettings.cubesMaterial,
      keyValues,
      () => {
        const select = this.gui.controls.get(id).element;
        this._guiSettings.cubesMaterial = select.value;
        const material = ApgRrp_MaterialsTable[this._guiSettings.cubesMaterial];
        const restitutionRange = this.gui.controls.get(this._CUSTOM_RESTITUTION_RANGE_CONTROL_ID).element;
        restitutionRange.value = material.restitution.toString();
        restitutionRange.disabled = material.name == ApgRrp_eMaterial.Custom ? false : true;
        this._guiSettings.cubesRestitution = material.restitution;
        const frictionRange = this.gui.controls.get(this._CUSTOM_FRICTION_RANGE_CONTROL_ID).element;
        frictionRange.value = material.friction.toString();
        frictionRange.disabled = material.name == ApgRrp_eMaterial.Custom ? false : true;
        this._guiSettings.cubesFriction = material.friction;
        this._guiSettings.doRestart = true;
        this.gui.devLogNoTime(`Material select control change event: ${select.value}`);
      }
    );
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  // #region HUD
  buildHudControls() {
    const controls = [];
    controls.push(this.#buildRestartControl());
    return controls.join("\n");
  }
  #buildRestartControl() {
    const id = "restartHudControl";
    const r = this.buildButtonControl(
      id,
      "Restart",
      () => {
        this._guiSettings.doRestart = true;
      },
      true,
      "padding: 0.1rem; margin: 0.1rem; max-width:25%; font-size:1rem; display: inline-block; float:right;"
    );
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
}
