import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulator_GuiBuilder
} from "../gui-builders/ApgRpr_Simulation_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
import {
  THREE
} from "../apg-wgl/deps.ts";
export class ApgRpr_A1_Column_Simulation extends ApgRpr_Simulation {
  _currentBlock = 0;
  _maxBlocks = 0;
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRpr_A1_Column_GuiBuilder);
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
      numBlocks: 20,
      numBlocksMMS: { min: 10, max: 30, step: 1 },
      blockHeight: 0.1,
      blockHeightMMS: { min: 5e-3, max: 0.1, step: 5e-3 },
      fallHeightFactor: 0.5,
      fallHeightFactorMMS: { min: 0.1, max: 1, step: 0.1 },
      blocksRestitution: 0.2,
      blocksRestitutionMMS: { min: 0.02, max: 0.4, step: 0.02 },
      blocksFriction: 0.5,
      blocksFrictionMMS: { min: 0.02, max: 1, step: 0.02 },
      addBlockPressed: false
    };
    r.frictionIterations = 8;
    return r;
  }
  createWorld(asettings) {
    this.createGround();
    this.createSimulationTable(
      asettings.playground.width,
      asettings.playground.depth,
      asettings.playground.height,
      asettings.playground.thickness
    );
    this._maxBlocks = asettings.numBlocks;
    this.logger.log(
      `World created for simulation ${this.params.simulation}`,
      ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME
    );
  }
  #spawnNextBlock(asettings) {
    if (this._currentBlock >= this._maxBlocks) {
      alert("Maximum height reached. If you want more change the parmeters and restart");
      this._currentBlock = this._maxBlocks;
      return;
    }
    const blockSize = asettings.blockHeightMMS.max;
    const fallHeight = asettings.blockHeight * asettings.fallHeightFactor;
    const x = 0;
    const y = asettings.playground.height + fallHeight + asettings.blockHeight * this._currentBlock;
    const z = 0;
    const a = this.rng.next() * (Math.PI / 2);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a);
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setRotation(q);
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(blockSize / 2, asettings.blockHeight / 2, blockSize / 2).setTranslation(x, y, z).setFriction(asettings.blocksFriction).setRestitution(asettings.blocksRestitution);
    const collider = this.world.createCollider(colliderDesc, body);
    this.simulator.viewer.addCollider(collider);
    this.logger.log(
      `Added block n\xB0:${this._currentBlock}`,
      ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME
    );
    this._currentBlock++;
  }
  updateFromGui() {
    const settings = this.params.settings;
    if (this.needsUpdate()) {
      if (settings.addBlockPressed) {
        this.#spawnNextBlock(settings);
        settings.addBlockPressed = false;
      }
      super.updateFromGui();
    }
  }
}
class ApgRpr_A1_Column_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {
  _guiSettings;
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
    controls.push(this.#buildCubesSettingsDetailsControl());
    controls.push(super.buildControls());
    const r = this.buildPanelControl(
      `ApgRpr_${this._guiSettings.simulation}_SettingsPanelControl`,
      controls
    );
    return r;
  }
  #buildCubesSettingsDetailsControl() {
    const controls = [];
    controls.push(this.#buildNumBlocksControl());
    controls.push(this.#buildBlockHeightControl());
    controls.push(this.#buildFallHeightFactorControl());
    controls.push(this.#buildBlocksRestitutionControl());
    controls.push(this.#buildBlocksFrictionControl());
    const id = "blocksSettingsDetailsControl";
    const r = this.buildDetailsControl(
      id,
      "Blocks settings:",
      controls,
      this._guiSettings.isCubesGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this._guiSettings.isCubesGroupOpened = !this._guiSettings.isCubesGroupOpened;
          this.gui.logNoTime("Blocks settings details toggled");
        }
      }
    );
    return r;
  }
  #buildNumBlocksControl() {
    const id = "numBlocksControl";
    const r = this.buildRangeControl(
      id,
      "Max number",
      this._guiSettings.numBlocks,
      this._guiSettings.numBlocksMMS,
      () => {
        const range = this.gui.controls.get(id).element;
        this._guiSettings.numBlocks = parseFloat(range.value);
        const output = this.gui.controls.get(`${id}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`Num blocks control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildBlockHeightControl() {
    const id = "blocksHeightControl";
    const r = this.buildRangeControl(
      id,
      "Height",
      this._guiSettings.blockHeight,
      this._guiSettings.blockHeightMMS,
      () => {
        const range = this.gui.controls.get(id).element;
        this._guiSettings.blockHeight = parseFloat(range.value);
        const output = this.gui.controls.get(`${id}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`Block height control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildFallHeightFactorControl() {
    const id = "fallHeightFactorControl";
    const r = this.buildRangeControl(
      id,
      "Height factor",
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
  #buildBlocksRestitutionControl() {
    const id = "blocksRestitutionControl";
    const r = this.buildRangeControl(
      id,
      "Restitution",
      this._guiSettings.blocksRestitution,
      this._guiSettings.blocksRestitutionMMS,
      () => {
        const range = this.gui.controls.get(id).element;
        this._guiSettings.blocksRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${id}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`Restitution control change event: ${range.value}`);
      }
    );
    return r;
  }
  #buildBlocksFrictionControl() {
    const id = "blocksFrictionControl";
    const r = this.buildRangeControl(
      id,
      "Friction",
      this._guiSettings.blocksFriction,
      this._guiSettings.blocksFrictionMMS,
      () => {
        const range = this.gui.controls.get(id).element;
        this._guiSettings.blocksFriction = parseFloat(range.value);
        const output = this.gui.controls.get(`${id}Value`).element;
        output.innerHTML = range.value;
        this.gui.devLogNoTime(`Friction control change event: ${range.value}`);
      }
    );
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  // #region Hud
  buildHudControls() {
    const controls = [];
    controls.push(this.#buildRestartControl());
    controls.push(this.#buildAddBlockHudControl());
    return controls.join("\n");
  }
  #buildAddBlockHudControl() {
    const id = "addBlockHudControl";
    const r = this.buildButtonControl(
      id,
      "Add block",
      () => {
        this._guiSettings.addBlockPressed = true;
      },
      true,
      "padding: 0.1rem; margin: 0.1rem; max-width:25%; font-size:1rem;display: inline-block; float:right;"
    );
    return r;
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
      "padding: 0.1rem; margin: 0.1rem; max-width:25%; font-size:1rem; display: inline-block; float:left;"
    );
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
}
