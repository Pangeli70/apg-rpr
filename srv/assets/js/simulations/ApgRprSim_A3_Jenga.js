import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
  ApgRprSimulation
} from "../ApgRpr_Simulation.ts";
export class ApgRprSim_Jenga extends ApgRprSimulation {
  currentCube = 0;
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_Jenga_GuiBuilder);
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
    if (!this.params.restart) {
      this.simulator.resetCamera(settings.cameraPosition);
    } else {
      this.params.restart = false;
    }
    this.simulator.setPreStepAction(() => {
      this.#spawnBall();
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(30, 0.1, 30);
    this.world.createCollider(groundColliderDesc, groundBody);
    const piecesPerRow = 4;
    const levels = 16;
    const shift = 1;
    const pieceWidth = 1;
    const pieceHeight = pieceWidth / 2;
    const pieceDepth = piecesPerRow;
    const pieceGap = pieceWidth / 20;
    const pieceTolerance = pieceHeight / 40;
    const totalRowWidth = pieceWidth * piecesPerRow + pieceGap * (piecesPerRow - 1);
    const halfRowCenter = (totalRowWidth - pieceWidth) / 2;
    for (let j = 0; j < levels; j++) {
      const y = shift + j * (pieceHeight + pieceGap);
      for (let i = 0; i < piecesPerRow; i++) {
        const delta = -halfRowCenter + (pieceWidth + pieceGap) * i;
        let x, z, w;
        if (j % 2 == 0) {
          x = delta;
          z = 0;
          w = 0;
        } else {
          x = 0;
          z = delta;
          w = 1;
        }
        const boxBodyDesc = RAPIER.RigidBodyDesc.dynamic().setRotation({ x: 0, y: 1, z: 0, w }).setTranslation(x, y, z);
        const boxBody = this.world.createRigidBody(boxBodyDesc);
        const pW = pieceWidth + this.rng.next() * pieceTolerance;
        const pH = pieceHeight + this.rng.next() * pieceTolerance;
        const pD = pieceDepth + this.rng.next() * pieceTolerance;
        const boxColliderDesc = RAPIER.ColliderDesc.cuboid(pW / 2, pH / 2, pD / 2);
        this.world.createCollider(boxColliderDesc, boxBody).setRestitution(asettings.cubesRestitution);
      }
    }
  }
  #spawnBall() {
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
      cubesRestitution: 0,
      cubesRestitutionMMS: {
        min: 0,
        max: 0.25,
        step: 0.05
      },
      blockHeight: 0.1,
      blockHeightMMS: {
        min: 0.05,
        max: 2,
        step: 0.05
      }
    };
    r.cameraPosition.eye.x = -30;
    r.cameraPosition.eye.y = 20;
    r.cameraPosition.eye.z = -30;
    return r;
  }
}
export class ApgRprSim_Jenga_GuiBuilder extends ApgRprSim_GuiBuilder {
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
    const COL_BLK_HGT_CNT = "columnCubeHeightControl";
    const columnBlockHeightControl = this.buildRangeControl(
      COL_BLK_HGT_CNT,
      "Block height",
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
      "cubesGroupControl",
      "Cubes:",
      [
        cubesRestitutionControl,
        columnBlockHeightControl
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
