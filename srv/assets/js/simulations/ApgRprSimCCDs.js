import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSim_Base.ts";
export class ApgRprSim_CCDs extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_CCDs_GuiBuilder);
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
  updateFromGui() {
    if (this.needsUpdate()) {
      super.updateFromGui();
    }
  }
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings(),
      isProjectileGroupOpened: false,
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
      isWallsGroupOpened: false,
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
}
export class ApgRprSim_CCDs_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildPanel() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const projectileGroupControl = this.#buildProjectileGroupControl();
    const wallsGroupControl = this.#buildWallsGroupControl();
    const simControls = super.buildPanel();
    const r = this.buildPanelControl(
      `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
      [
        simulationChangeControl,
        restartSimulationButtonControl,
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
      this.guiSettings.wallsDensity,
      this.guiSettings.wallsDensityMMS,
      () => {
        const range = this.gui.controls.get(WALLS_DENS_CNT).element;
        this.guiSettings.wallsDensity = parseFloat(range.value);
        const output = this.gui.controls.get(`${WALLS_DENS_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const WALLS_HEIGHT_CNT = "wallsHeightControl";
    const wallsHeightControl = this.buildRangeControl(
      WALLS_HEIGHT_CNT,
      "Height",
      this.guiSettings.wallsHeight,
      this.guiSettings.wallsHeightMMS,
      () => {
        const range = this.gui.controls.get(WALLS_HEIGHT_CNT).element;
        this.guiSettings.wallsHeight = parseInt(range.value);
        const output = this.gui.controls.get(`${WALLS_HEIGHT_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const WALLS_NUMB_CNT = "wallsNumberControl";
    const wallsNumberControl = this.buildRangeControl(
      WALLS_NUMB_CNT,
      "Number",
      this.guiSettings.wallsNumber,
      this.guiSettings.wallsNumberMMS,
      () => {
        const range = this.gui.controls.get(WALLS_NUMB_CNT).element;
        this.guiSettings.wallsNumber = parseInt(range.value);
        const output = this.gui.controls.get(`${WALLS_NUMB_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const WALLS_CCD_CNT = "wallsCCDControl";
    const wallsCCDControl = this.buildCheckBoxControl(
      WALLS_CCD_CNT,
      "Enable CCD",
      this.guiSettings.wallsCcd,
      () => {
        const chkbox = this.gui.controls.get(WALLS_CCD_CNT).element;
        this.guiSettings.wallsCcd = chkbox.checked;
      }
    );
    const wallsGroupControl = this.buildDetailsControl(
      "wallsGroupControl",
      "Walls:",
      [
        wallsNumberControl,
        wallsHeightControl,
        wallsDensityControl,
        wallsCCDControl
      ],
      this.guiSettings.isWallsGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.guiSettings.isWallsGroupOpened = !this.guiSettings.isWallsGroupOpened;
          this.gui.logNoTime("Walls group toggled");
        }
      }
    );
    return wallsGroupControl;
  }
  #buildProjectileGroupControl() {
    const PROJ_RADIOUS_CNT = "projectileRadiousControl";
    const projectileRadiousControl = this.buildRangeControl(
      PROJ_RADIOUS_CNT,
      "Radious",
      this.guiSettings.projectileRadious,
      this.guiSettings.projectileRadiousMMS,
      () => {
        const range = this.gui.controls.get(PROJ_RADIOUS_CNT).element;
        this.guiSettings.projectileRadious = parseFloat(range.value);
        const output = this.gui.controls.get(`${PROJ_RADIOUS_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const PROJ_DENSITY_CNT = "projectileDensityControl";
    const projectileDensityControl = this.buildRangeControl(
      PROJ_DENSITY_CNT,
      "Density",
      this.guiSettings.projectileDensity,
      this.guiSettings.projectileDensityMMS,
      () => {
        const range = this.gui.controls.get(PROJ_DENSITY_CNT).element;
        this.guiSettings.projectileDensity = parseFloat(range.value);
        const output = this.gui.controls.get(`${PROJ_DENSITY_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const PROJ_SPEED_CNT = "projectileSpeedControl";
    const projectileSpeedControl = this.buildRangeControl(
      PROJ_SPEED_CNT,
      "Speed",
      this.guiSettings.projectileSpeed,
      this.guiSettings.projectileSpeedMMS,
      () => {
        const range = this.gui.controls.get(PROJ_SPEED_CNT).element;
        this.guiSettings.projectileSpeed = parseFloat(range.value);
        const output = this.gui.controls.get(`${PROJ_SPEED_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const PROJ_CCD_CNT = "projectileCCDControl";
    const projectileCCDControl = this.buildCheckBoxControl(
      PROJ_CCD_CNT,
      "Enable CCD",
      this.guiSettings.projectileCcd,
      () => {
        const chkbox = this.gui.controls.get(PROJ_CCD_CNT).element;
        this.guiSettings.projectileCcd = chkbox.checked;
      }
    );
    const r = this.buildDetailsControl(
      "projectileGroupControl",
      "Projectile:",
      [
        projectileSpeedControl,
        projectileRadiousControl,
        projectileDensityControl,
        projectileCCDControl
      ],
      this.guiSettings.isProjectileGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.guiSettings.isProjectileGroupOpened = !this.guiSettings.isProjectileGroupOpened;
          this.gui.logNoTime("Projectile group toggled");
        }
      }
    );
    return r;
  }
}
