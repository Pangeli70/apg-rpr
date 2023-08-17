import { PRANDO, RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSimFountain extends ApgRprSim_Base {
  rng;
  spawnCounter;
  SPAWN_EVERY_N_STEPS = 5;
  MAX_RIGID_BODIES = 400;
  bodiesPool = [];
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.rng = new PRANDO("Fountain");
    this.spawnCounter = 0;
    const settings = this.params.guiSettings;
    const guiBuilder = new ApgRprSimFountainGuiBuilder(this.simulator.gui, this.params);
    const gui = guiBuilder.build();
    this.simulator.viewer.panels.innerHTML = gui;
    guiBuilder.bindControls();
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(40, 0.1, 40);
    this.world.createCollider(groundColliderDesc, groundBody);
    asimulator.addWorld(this.world);
    if (!this.params.restart) {
      const cameraPosition = {
        eye: { x: -90, y: 50, z: 80 },
        target: { x: 0, y: 10, z: 0 }
      };
      asimulator.resetCamera(cameraPosition);
    } else {
      this.params.restart = false;
    }
    asimulator.setPreStepAction(() => {
      this.spawnRandomBody(asimulator);
      this.updateFromGui();
    });
  }
  spawnRandomBody(asimulator) {
    const settings = this.params.guiSettings;
    if (this.spawnCounter < this.SPAWN_EVERY_N_STEPS) {
      this.spawnCounter++;
      return;
    }
    this.spawnCounter = 0;
    const rad = 1;
    const j = this.rng.nextInt(0, 4);
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 10, 0).setLinvel(0, 15, 0);
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
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings(),
      restitution: 0.25,
      restitutionMMS: {
        min: 0.05,
        max: 1,
        step: 0.05
      }
    };
    return r;
  }
}
export class ApgRprSimFountainGuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  build() {
    const bodiesGroupControl = this.#buildBodiesGroupControl();
    const simControls = super.build();
    const r = this.buildPanelControl(
      "ApgRprSimFountainSettingsPanel",
      eApgRpr_SimulationName.B_FOUNTAIN,
      [
        bodiesGroupControl,
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
      "Bodies:",
      [
        bodiesRestitutionControl
      ]
    );
    return r;
  }
}
