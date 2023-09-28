import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
var ApgRprSim_Fountain_eGroundType = /* @__PURE__ */ ((ApgRprSim_Fountain_eGroundType2) => {
  ApgRprSim_Fountain_eGroundType2["CYL"] = "Cylinder";
  ApgRprSim_Fountain_eGroundType2["CONE"] = "Cone";
  ApgRprSim_Fountain_eGroundType2["CUB"] = "Cuboid";
  ApgRprSim_Fountain_eGroundType2["SHF"] = "Sloped heightfield";
  ApgRprSim_Fountain_eGroundType2["RHF"] = "Random heightfield";
  return ApgRprSim_Fountain_eGroundType2;
})(ApgRprSim_Fountain_eGroundType || {});
export class ApgRprSim_Fountain extends ApgRprSim_Base {
  spawnCounter;
  SPAWN_EVERY_N_STEPS = 5;
  MAX_RIGID_BODIES = 400;
  bodiesPool = [];
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.spawnCounter = 0;
    this.buildGui(ApgRprSim_Fountain_GuiBuilder);
    const settings = this.params.guiSettings;
    this.#createWorld(settings);
    asimulator.addWorld(this.world);
    if (!this.params.restart) {
      asimulator.resetCamera(settings.cameraPosition);
    } else {
      this.params.restart = false;
    }
    asimulator.setPreStepAction(() => {
      this.#spawnRandomBody(asimulator);
      this.updateFromGui();
    });
  }
  #createWorld(asettings) {
    const rad = 40;
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    if (asettings.groundType == "Cuboid" /* CUB */) {
      const cuboidGroundColliderDesc = RAPIER.ColliderDesc.cuboid(rad, 1, rad).setTranslation(0, -0.5, 0);
      this.world.createCollider(cuboidGroundColliderDesc, groundBody);
    }
    if (asettings.groundType == "Cylinder" /* CYL */) {
      const cylGroundColliderDesc = RAPIER.ColliderDesc.cylinder(1, rad).setTranslation(0, -0.5, 0);
      this.world.createCollider(cylGroundColliderDesc, groundBody);
    }
    if (asettings.groundType == "Sloped heightfield" /* SHF */) {
      const numberOfColumns = 5;
      const numberOfRows = 5;
      const scalesVector = new RAPIER.Vector3(rad * 2, rad / 10, rad * 2);
      const field = this.generateSlopedHeightFieldArray(numberOfColumns, numberOfRows);
      const heightFieldGroundColliderDesc = RAPIER.ColliderDesc.heightfield(numberOfColumns, numberOfRows, field, scalesVector).setTranslation(0, -rad / 20, 0);
      this.world.createCollider(heightFieldGroundColliderDesc, groundBody);
    }
    if (asettings.groundType == "Random heightfield" /* RHF */) {
      const numberOfColumns = 20;
      const numberOfRows = 20;
      const scalesVector = new RAPIER.Vector3(rad * 2, rad / 10, rad * 2);
      const field = this.generateRandomHeightFieldArray("fountain", numberOfColumns, numberOfRows);
      const heightFieldGroundColliderDesc = RAPIER.ColliderDesc.heightfield(numberOfColumns, numberOfRows, field, scalesVector).setTranslation(0, -rad / 20, 0);
      this.world.createCollider(heightFieldGroundColliderDesc, groundBody);
    }
    const coneRad = asettings.groundType == "Cone" /* CONE */ ? rad : rad / 10;
    const coneGroundColliderDesc = RAPIER.ColliderDesc.cone(4, coneRad).setTranslation(0, 4, 0);
    this.world.createCollider(coneGroundColliderDesc, groundBody);
  }
  #spawnRandomBody(asimulator) {
    const settings = this.params.guiSettings;
    if (this.spawnCounter < this.SPAWN_EVERY_N_STEPS) {
      this.spawnCounter++;
      return;
    }
    this.spawnCounter = 0;
    const rad = 1;
    const j = this.rng.nextInt(0, 4);
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 10, 0).setLinvel(0, 15, 0).setCcdEnabled(false);
    const body = this.world.createRigidBody(bodyDesc);
    let colliderDesc;
    switch (j) {
      case 0:
        colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
        break;
      case 1:
        colliderDesc = RAPIER.ColliderDesc.ball(rad);
        break;
      case 2:
        colliderDesc = RAPIER.ColliderDesc.roundCylinder(rad, rad, rad / 10);
        break;
      case 3:
        colliderDesc = RAPIER.ColliderDesc.cone(rad, rad);
        break;
      case 4:
        colliderDesc = RAPIER.ColliderDesc.capsule(rad, rad);
        break;
    }
    if (j == 5) {
      alert("Value 5 is not allowed");
      return;
    }
    const collider = this.world.createCollider(colliderDesc, body);
    collider.setRestitution(settings.restitution);
    asimulator.viewer.addCollider(collider);
    this.bodiesPool.push(body);
    if (this.bodiesPool.length > this.MAX_RIGID_BODIES) {
      const rb = this.bodiesPool[0];
      this.world.removeRigidBody(rb);
      asimulator.viewer.removeRigidBody(rb);
      this.bodiesPool.shift();
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
      isBodiesGroupOpened: false,
      restitution: 0.25,
      restitutionMMS: {
        min: 0.05,
        max: 1,
        step: 0.05
      },
      isGroundGroupOpened: false,
      groundType: "Cuboid" /* CUB */,
      groundTypes: Object.values(ApgRprSim_Fountain_eGroundType)
    };
    return r;
  }
}
export class ApgRprSim_Fountain_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildHtml() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const bodiesGroupControl = this.#buildBodiesGroupControl();
    const groundGroupControl = this.#buildGroundGroupControl();
    const simControls = super.buildHtml();
    const r = this.buildPanelControl(
      `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
      [
        simulationChangeControl,
        restartSimulationButtonControl,
        bodiesGroupControl,
        groundGroupControl,
        simControls
      ]
    );
    return r;
  }
  #buildBodiesGroupControl() {
    const BODIES_REST_CNT = "restitutionControl";
    const bodiesRestitutionControl = this.buildRangeControl(
      BODIES_REST_CNT,
      "Restitution",
      this.guiSettings.restitution,
      this.guiSettings.restitutionMMS.min,
      this.guiSettings.restitutionMMS.max,
      this.guiSettings.restitutionMMS.step,
      () => {
        const range = this.gui.controls.get(BODIES_REST_CNT).element;
        this.guiSettings.restitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${BODIES_REST_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildGroupControl(
      "bodiesGroupControl",
      "Bodies:",
      [
        bodiesRestitutionControl
      ],
      this.guiSettings.isBodiesGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.guiSettings.isBodiesGroupOpened = !this.guiSettings.isBodiesGroupOpened;
          this.gui.logNoTime("Bodies group toggled");
        }
      }
    );
    return r;
  }
  #buildGroundGroupControl() {
    const keyValues = /* @__PURE__ */ new Map();
    for (const ground of this.guiSettings.groundTypes) {
      keyValues.set(ground, ground);
    }
    const GROUND_SELECT_CNT = "patternSelectControl";
    const groundSelectControl = this.buildSelectControl(
      GROUND_SELECT_CNT,
      "Type",
      this.guiSettings.groundType,
      keyValues,
      () => {
        const select = this.gui.controls.get(GROUND_SELECT_CNT).element;
        this.guiSettings.groundType = select.value;
        this.params.restart = true;
      }
    );
    const r = this.buildGroupControl(
      "hroundGroupControl",
      "Ground:",
      [
        groundSelectControl
      ],
      this.guiSettings.isGroundGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.guiSettings.isGroundGroupOpened = !this.guiSettings.isGroundGroupOpened;
          this.gui.logNoTime("Ground group toggled");
        }
      }
    );
    return r;
  }
}
