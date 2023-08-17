import { RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSim_CCDs extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    const guiBuilder = new ApgRprSim_CCDs_GuiBuilder(
      this.simulator.gui,
      this.params
    );
    const gui = guiBuilder.build();
    this.simulator.viewer.panels.innerHTML = gui;
    guiBuilder.bindControls();
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
    if (!this.params.restart) {
      const cameraPosition = {
        eye: { x: -80, y: 50, z: -80 },
        target: { x: 0, y: 0, z: 0 }
      };
      this.simulator.resetCamera(cameraPosition);
    } else {
      this.params.restart = false;
    }
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    const groundHeight = 0.1;
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(80, 0.1, 0);
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100, 0.1, 100);
    this.world.createCollider(groundColliderDesc, groundBody);
    const shiftY = groundHeight + 0.5;
    for (let i = 0; i < asettings.wallsNumber; ++i) {
      const x = i * 6;
      const offsetPoint = { x, y: shiftY, z: 0 };
      this.#createWall(offsetPoint, asettings.wallsHeight, asettings.wallsCcd);
    }
    const projectileDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(-100, shiftY + 2, 0).setLinvel(asettings.projectileSpeed, 0, 0).setCcdEnabled(asettings.projectileCcd);
    const projectileBody = this.world.createRigidBody(projectileDesc);
    const projectileColliderDesc = RAPIER.ColliderDesc.ball(asettings.projectileRadious).setDensity(asettings.projectileDensity);
    this.world.createCollider(projectileColliderDesc, projectileBody);
  }
  updateFromGui() {
    if (this.needsUpdate()) {
      super.updateFromGui();
    }
  }
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings(),
      projectileRadious: 1.25,
      projectileRadiousMMS: {
        min: 0.5,
        max: 2.5,
        step: 0.25
      },
      projectileDensity: 1,
      projectileDensityMMS: {
        min: 0.5,
        max: 5,
        step: 0.25
      },
      projectileSpeed: 250,
      projectileSpeedMMS: {
        min: 50,
        max: 500,
        step: 50
      },
      projectileCcd: true,
      wallsNumber: 5,
      wallsNumberMMS: {
        min: 1,
        max: 10,
        step: 1
      },
      wallsHeight: 5,
      wallsHeightMMS: {
        min: 3,
        max: 10,
        step: 1
      },
      wallsDensity: 1,
      wallsDensityMMS: {
        min: 0.5,
        max: 2.5,
        step: 0.25
      },
      wallsCcd: false
    };
    return r;
  }
  #createWall(offset, stackHeight, aisCcdEnabled = false) {
    const shiftY = 1;
    const shiftZ = 2;
    for (let i = 0; i < stackHeight; ++i) {
      for (let j = i; j < stackHeight; ++j) {
        const x = offset.x;
        const y = i * shiftY + offset.y;
        const z = i * shiftZ / 2 + (j - i) * shiftZ + offset.z - stackHeight;
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
        if (aisCcdEnabled) {
          bodyDesc.setCcdEnabled(true);
        }
        const body = this.world.createRigidBody(bodyDesc);
        const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 1).setDensity(2);
        this.world.createCollider(colliderDesc, body);
      }
    }
  }
}
export class ApgRprSim_CCDs_GuiBuilder extends ApgRprSim_GuiBuilder {
  ccdSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.ccdSettings = this.params.guiSettings;
  }
  build() {
    const projectileGroupControl = this.#buildProjectileGroupControl();
    const wallsGroupControl = this.#buildWallsGroupControl();
    const simControls = super.build();
    const r = this.buildPanelControl(
      "ApgRprSimCcdSettingsPanel",
      eApgRpr_SimulationName.J_CCDs,
      [
        projectileGroupControl,
        wallsGroupControl,
        simControls
      ]
    );
    return r;
  }
  #buildWallsGroupControl() {
    const WALLS_DENS_CNT = "wallsDensityControl";
    const wallsDensityControl = this.buildRangeControl(
      WALLS_DENS_CNT,
      "Density",
      this.ccdSettings.wallsDensity,
      this.ccdSettings.wallsDensityMMS.min,
      this.ccdSettings.wallsDensityMMS.max,
      this.ccdSettings.wallsDensityMMS.step,
      () => {
        const range = this.gui.controls.get(WALLS_DENS_CNT).element;
        this.ccdSettings.wallsDensity = parseFloat(range.value);
        const output = this.gui.controls.get(`${WALLS_DENS_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const WALLS_HEIGHT_CNT = "wallsHeightControl";
    const wallsHeightControl = this.buildRangeControl(
      WALLS_HEIGHT_CNT,
      "Height",
      this.ccdSettings.wallsHeight,
      this.ccdSettings.wallsHeightMMS.min,
      this.ccdSettings.wallsHeightMMS.max,
      this.ccdSettings.wallsHeightMMS.step,
      () => {
        const range = this.gui.controls.get(WALLS_HEIGHT_CNT).element;
        this.ccdSettings.wallsHeight = parseInt(range.value);
        const output = this.gui.controls.get(`${WALLS_HEIGHT_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const WALLS_NUMB_CNT = "wallsNumberControl";
    const wallsNumberControl = this.buildRangeControl(
      WALLS_NUMB_CNT,
      "Number",
      this.ccdSettings.wallsNumber,
      this.ccdSettings.wallsNumberMMS.min,
      this.ccdSettings.wallsNumberMMS.max,
      this.ccdSettings.wallsNumberMMS.step,
      () => {
        const range = this.gui.controls.get(WALLS_NUMB_CNT).element;
        this.ccdSettings.wallsNumber = parseInt(range.value);
        const output = this.gui.controls.get(`${WALLS_NUMB_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const WALLS_CCD_CNT = "wallsCCDControl";
    const wallsCCDControl = this.buildCheckBoxControl(
      WALLS_CCD_CNT,
      "Enable CCD",
      this.ccdSettings.wallsCcd,
      () => {
        const chkbox = this.gui.controls.get(WALLS_CCD_CNT).element;
        this.ccdSettings.wallsCcd = chkbox.checked;
      }
    );
    const wallsGroupControl = this.buildGroupControl(
      "Walls:",
      [
        wallsNumberControl,
        wallsHeightControl,
        wallsDensityControl,
        wallsCCDControl
      ]
    );
    return wallsGroupControl;
  }
  #buildProjectileGroupControl() {
    const PROJ_RADIOUS_CNT = "projectileRadiousControl";
    const projectileRadiousControl = this.buildRangeControl(
      PROJ_RADIOUS_CNT,
      "Radious",
      this.ccdSettings.projectileRadious,
      this.ccdSettings.projectileRadiousMMS.min,
      this.ccdSettings.projectileRadiousMMS.max,
      this.ccdSettings.projectileRadiousMMS.step,
      () => {
        const range = this.gui.controls.get(PROJ_RADIOUS_CNT).element;
        this.ccdSettings.projectileRadious = parseFloat(range.value);
        const output = this.gui.controls.get(`${PROJ_RADIOUS_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const PROJ_DENSITY_CNT = "projectileDensityControl";
    const projectileDensityControl = this.buildRangeControl(
      PROJ_DENSITY_CNT,
      "Density",
      this.ccdSettings.projectileDensity,
      this.ccdSettings.projectileDensityMMS.min,
      this.ccdSettings.projectileDensityMMS.max,
      this.ccdSettings.projectileDensityMMS.step,
      () => {
        const range = this.gui.controls.get(PROJ_DENSITY_CNT).element;
        this.ccdSettings.projectileDensity = parseFloat(range.value);
        const output = this.gui.controls.get(`${PROJ_DENSITY_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const PROJ_SPEED_CNT = "projectileSpeedControl";
    const projectileSpeedControl = this.buildRangeControl(
      PROJ_SPEED_CNT,
      "Speed",
      this.ccdSettings.projectileSpeed,
      this.ccdSettings.projectileSpeedMMS.min,
      this.ccdSettings.projectileSpeedMMS.max,
      this.ccdSettings.projectileSpeedMMS.step,
      () => {
        const range = this.gui.controls.get(PROJ_SPEED_CNT).element;
        this.ccdSettings.projectileSpeed = parseFloat(range.value);
        const output = this.gui.controls.get(`${PROJ_SPEED_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const PROJ_CCD_CNT = "projectileCCDControl";
    const projectileCCDControl = this.buildCheckBoxControl(
      PROJ_CCD_CNT,
      "Enable CCD",
      this.ccdSettings.projectileCcd,
      () => {
        const chkbox = this.gui.controls.get(PROJ_CCD_CNT).element;
        this.ccdSettings.projectileCcd = chkbox.checked;
      }
    );
    const r = this.buildGroupControl(
      "Projectile:",
      [
        projectileSpeedControl,
        projectileRadiousControl,
        projectileDensityControl,
        projectileCCDControl
      ]
    );
    return r;
  }
}
