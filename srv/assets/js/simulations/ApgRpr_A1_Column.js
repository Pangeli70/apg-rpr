import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulation_GuiBuilder
} from "../ApgRpr_Simulation_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
import { THREE } from "../ApgWgl_Deps.ts";
export class ApgRpr_A1_Column_Simulation extends ApgRpr_Simulation {
  _currentRotation = -1;
  _rotationDelta = 0;
  _currentBlock = 0;
  _maxBlocks = 0;
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRpr_A1_Column_GuiBuilder);
    const settings = this.params.settings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
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
    const settings = this.params.settings;
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
    const w = this.rng.next() * (Math.PI / 2);
    this.logger.log(`Added block n\xB0:${this._currentBlock}`, ApgRpr_Simulation.RPR_SIMULATION_NAME);
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), w);
    const boxBodyDesc = RAPIER.RigidBodyDesc.dynamic().setRotation(q);
    const boxBody = this.world.createRigidBody(boxBodyDesc);
    const boxColliderDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, settings.blockHeight / 2, cubeRadious).setTranslation(x, y, z).setFriction(settings.blocksFriction).setRestitution(settings.blocksRestitution);
    const collider = this.world.createCollider(boxColliderDesc, boxBody);
    this.simulator.viewer.addCollider(collider);
    this._currentBlock++;
    this._currentRotation += this._rotationDelta;
  }
  updateFromGui() {
    const settings = this.params.settings;
    if (this.needsUpdate()) {
      if (settings.addBlockPressed) {
        this.#spawnNextBlock();
        settings.addBlockPressed = false;
      }
      super.updateFromGui();
    }
  }
  defaultSettings() {
    const r = {
      ...super.defaultSettings(),
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
class ApgRpr_A1_Column_GuiBuilder extends ApgRpr_Simulation_GuiBuilder {
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
    const ADD_BLOCK_BTN = "addBlockControl";
    const addBlockControl = this.buildButtonControl(
      ADD_BLOCK_BTN,
      "Add block",
      () => {
        this._guiSettings.addBlockPressed = true;
      }
    );
    const BLOCKS_REST_CNT = "cubesRestitutionControl";
    const blocksRestitutionControl = this.buildRangeControl(
      BLOCKS_REST_CNT,
      "Restitution",
      this._guiSettings.blocksRestitution,
      this._guiSettings.blocksRestitutionMMS,
      () => {
        const range = this.gui.controls.get(BLOCKS_REST_CNT).element;
        this._guiSettings.blocksRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${BLOCKS_REST_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const BLOCKS_FRIC_CNT = "blocksFrictionControl";
    const blocksFrictionControl = this.buildRangeControl(
      BLOCKS_FRIC_CNT,
      "Friction",
      this._guiSettings.blocksFriction,
      this._guiSettings.blocksFrictionMMS,
      () => {
        const range = this.gui.controls.get(BLOCKS_FRIC_CNT).element;
        this._guiSettings.blocksFriction = parseFloat(range.value);
        const output = this.gui.controls.get(`${BLOCKS_FRIC_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const COL_NUM_BLKS_CNT = "columnNumBlocksControl";
    const columnNumBlocksControl = this.buildRangeControl(
      COL_NUM_BLKS_CNT,
      "Number",
      this._guiSettings.numBlocks,
      this._guiSettings.numBlocksMMS,
      () => {
        const range = this.gui.controls.get(COL_NUM_BLKS_CNT).element;
        this._guiSettings.numBlocks = parseFloat(range.value);
        const output = this.gui.controls.get(`${COL_NUM_BLKS_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const COL_BLK_HGT_CNT = "columnCubeHeightControl";
    const columnBlockHeightControl = this.buildRangeControl(
      COL_BLK_HGT_CNT,
      "Height",
      this._guiSettings.blockHeight,
      this._guiSettings.blockHeightMMS,
      () => {
        const range = this.gui.controls.get(COL_BLK_HGT_CNT).element;
        this._guiSettings.blockHeight = parseFloat(range.value);
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
