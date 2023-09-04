import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSim_Pyramid extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_Pyramid_GuiBuilder);
    const settings = this.params.guiSettings;
    this.#createWorld(settings);
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
  #createWorld(asettings) {
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(30, 0.1, 30);
    this.world.createCollider(groundColliderDesc, groundBody);
    const cubeRadious = 0.5;
    const baseSize = asettings.size;
    const shift = cubeRadious * 2.5;
    const center = baseSize * cubeRadious;
    const height = 8;
    for (let i = 0; i < baseSize; ++i) {
      for (let j = i; j < baseSize; ++j) {
        for (let k = i; k < baseSize; ++k) {
          const x = i * shift / 2 + (k - i) * shift - height * cubeRadious - center;
          const y = i * shift * 1.25 + height;
          const z = i * shift / 2 + (j - i) * shift - height * cubeRadious - center;
          const boxBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
          const boxBody = this.world.createRigidBody(boxBodyDesc);
          const boxColliderDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, cubeRadious, cubeRadious);
          this.world.createCollider(boxColliderDesc, boxBody).setRestitution(asettings.cubesRestitution);
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
    r.cameraPosition.eye.x = -30;
    r.cameraPosition.eye.y = 20;
    r.cameraPosition.eye.z = -30;
    return r;
  }
}
export class ApgRprSim_Pyramid_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildHtml() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const cubesGroupControl = this.#buildCubesGroupControl();
    const simControls = super.buildHtml();
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
      this.guiSettings.cubesRestitutionMMS.min,
      this.guiSettings.cubesRestitutionMMS.max,
      this.guiSettings.cubesRestitutionMMS.step,
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
      this.guiSettings.sizeMMS.min,
      this.guiSettings.sizeMMS.max,
      this.guiSettings.sizeMMS.step,
      () => {
        const range = this.gui.controls.get(PYR_SIZE_CNT).element;
        this.guiSettings.size = parseFloat(range.value);
        const output = this.gui.controls.get(`${PYR_SIZE_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildGroupControl(
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
          this.gui.log("Cubes group toggled");
        }
      }
    );
    return r;
  }
}
