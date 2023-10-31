import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
  ApgRprSimulation
} from "../ApgRpr_Simulation.ts";
export class ApgRprSim_Column extends ApgRprSimulation {
  _currentRotation = -1;
  _rotationDelta = 0;
  _currentBlock = 0;
  _maxBlocks = 0;
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_Column_GuiBuilder);
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
    if (!this.params.restart) {
      this.simulator.resetCamera(settings.cameraPosition);
    } else {
      this.params.restart = false;
    }
    this.simulator.document.onkeyup = (event) => {
      if (event.key == " ") {
        this.#spawnNextBlock();
      }
    };
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    this._rotationDelta = 2 / asettings.numBlocks;
    this._maxBlocks = asettings.numBlocks;
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(30, 0.1, 30);
    this.world.createCollider(groundColliderDesc, groundBody);
  }
  #spawnNextBlock() {
    const settings = this.params.guiSettings;
    if (this._currentBlock >= this._maxBlocks) {
      alert("Maximum height reached. If you want more change the parmeters and restart");
      this._currentBlock = this._maxBlocks;
      return;
    }
    const cubeRadious = 0.5;
    const initial = 4 * settings.blockHeight;
    const x = 0;
    const y = initial + settings.blockHeight * this._currentBlock;
    const z = 0;
    const w = this.rng.next() - 0.5;
    if (Math.abs(w) > 1) {
      const message = "Rotation of quaternion greater than 1! In Rapier this is not allowed!";
      alert(message);
      throw new Error(message);
    }
    this.simulator.gui.log(`Added block n\xB0:${this._currentBlock}`);
    const boxBodyDesc = RAPIER.RigidBodyDesc.dynamic().setRotation({ x: 0, y: 1, z: 0, w });
    const boxBody = this.world.createRigidBody(boxBodyDesc);
    const boxColliderDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, settings.blockHeight / 2, cubeRadious).setTranslation(x, y, z).setFriction(settings.blocksFriction);
    const collider = this.world.createCollider(boxColliderDesc, boxBody);
    collider.setRestitution(settings.blocksRestitution);
    this.simulator.viewer.addCollider(collider);
    this._currentBlock++;
    this._currentRotation += this._rotationDelta;
  }
  updateFromGui() {
    const settings = this.params.guiSettings;
    if (this.needsUpdate()) {
      if (settings.addBlockPressed) {
        this.#spawnNextBlock();
        settings.addBlockPressed = false;
      }
      super.updateFromGui();
    }
  }
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings(),
      isCubesGroupOpened: false,
      blocksRestitution: 0.05,
      blocksRestitutionMMS: {
        min: 0.025,
        max: 0.25,
        step: 0.025
      },
      blocksFriction: 1,
      blocksFrictionMMS: {
        min: 0,
        max: 2,
        step: 0.25
      },
      numBlocks: 20,
      numBlocksMMS: {
        min: 10,
        max: 100,
        step: 1
      },
      blockHeight: 0.1,
      blockHeightMMS: {
        min: 0.05,
        max: 2,
        step: 0.05
      },
      addBlockPressed: false
    };
    r.cameraPosition.eye.x = -30;
    r.cameraPosition.eye.y = 20;
    r.cameraPosition.eye.z = -30;
    return r;
  }
}
class ApgRprSim_Column_GuiBuilder extends ApgRprSim_GuiBuilder {
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
    const ADD_BLOCK_BTN = "addBlockControl";
    const addBlockControl = this.buildButtonControl(
      ADD_BLOCK_BTN,
      "Add block",
      () => {
        this.guiSettings.addBlockPressed = true;
      }
    );
    const BLOCKS_REST_CNT = "blocksRestitutionControl";
    const blocksRestitutionControl = this.buildRangeControl(
      BLOCKS_REST_CNT,
      "Restitution",
      this.guiSettings.blocksRestitution,
      this.guiSettings.blocksRestitutionMMS,
      () => {
        const range = this.gui.controls.get(BLOCKS_REST_CNT).element;
        this.guiSettings.blocksRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${BLOCKS_REST_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const BLOCKS_FRIC_CNT = "blocksFrictionControl";
    const blocksFrictionControl = this.buildRangeControl(
      BLOCKS_FRIC_CNT,
      "Friction",
      this.guiSettings.blocksFriction,
      this.guiSettings.blocksFrictionMMS,
      () => {
        const range = this.gui.controls.get(BLOCKS_FRIC_CNT).element;
        this.guiSettings.blocksFriction = parseFloat(range.value);
        const output = this.gui.controls.get(`${BLOCKS_FRIC_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const COL_NUM_BLKS_CNT = "columnNumBlocksControl";
    const columnNumBlocksControl = this.buildRangeControl(
      COL_NUM_BLKS_CNT,
      "Number",
      this.guiSettings.numBlocks,
      this.guiSettings.numBlocksMMS,
      () => {
        const range = this.gui.controls.get(COL_NUM_BLKS_CNT).element;
        this.guiSettings.numBlocks = parseFloat(range.value);
        const output = this.gui.controls.get(`${COL_NUM_BLKS_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const COL_BLK_HGT_CNT = "columnCubeHeightControl";
    const columnBlockHeightControl = this.buildRangeControl(
      COL_BLK_HGT_CNT,
      "Height",
      this.guiSettings.blockHeight,
      this.guiSettings.blockHeightMMS,
      () => {
        const range = this.gui.controls.get(COL_BLK_HGT_CNT).element;
        this.guiSettings.blockHeight = parseFloat(range.value);
        const output = this.gui.controls.get(`${COL_BLK_HGT_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildDetailsControl(
      "blocksGroupControl",
      "Blocks:",
      [
        addBlockControl,
        blocksRestitutionControl,
        blocksFrictionControl,
        columnNumBlocksControl,
        columnBlockHeightControl
      ],
      this.guiSettings.isCubesGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.guiSettings.isCubesGroupOpened = !this.guiSettings.isCubesGroupOpened;
          this.gui.logNoTime("Blocks group toggled");
        }
      }
    );
    return r;
  }
}
