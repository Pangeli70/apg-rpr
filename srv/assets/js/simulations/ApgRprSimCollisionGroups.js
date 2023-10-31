import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
  ApgRprSimulation
} from "../ApgRpr_Simulation.ts";
export class ApgRprSim_CollisionGroups extends ApgRprSimulation {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_CollisionGroups_GuiBuilder);
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    asimulator.addWorld(this.world);
    if (!this.params.restart) {
      asimulator.resetCamera(settings.cameraPosition);
    } else {
      this.params.restart = false;
      this.simulator.gui.log("restarted");
    }
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    const fixedBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const fixedBody = this.world.createRigidBody(fixedBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(5, 0.1, 5);
    this.world.createCollider(groundColliderDesc, fixedBody);
    const collisionGroup1 = 65537;
    const firstFloorColliderDesc = RAPIER.ColliderDesc.cuboid(1, 0.1, 1).setTranslation(0, 1.5, 0).setCollisionGroups(collisionGroup1);
    this.world.createCollider(firstFloorColliderDesc, fixedBody);
    const collisionGroup2 = 131074;
    const secondFloorColliderDesc = RAPIER.ColliderDesc.cuboid(1, 0.1, 1).setTranslation(0, 3, 0).setCollisionGroups(collisionGroup2);
    this.world.createCollider(secondFloorColliderDesc, fixedBody);
    const num = 8;
    const rad = 0.1;
    const shift = rad * 2;
    const centerx = shift * (num / 2);
    const centery = 3.5;
    const centerz = shift * (num / 2);
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < num; i++) {
        for (let k = 0; k < num; k++) {
          const x = i * shift - centerx;
          const y = j * shift + centery;
          const z = k * shift - centerz;
          const group = k % 2 == 0 ? collisionGroup1 : collisionGroup2;
          const cubeBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
          const cubeBody = this.world.createRigidBody(cubeBodyDesc);
          const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad).setCollisionGroups(group);
          this.world.createCollider(cubeColliderDesc, cubeBody);
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
      ...super.defaultGuiSettings()
    };
    r.cameraPosition.eye.x = 5;
    r.cameraPosition.eye.y = 4;
    r.cameraPosition.eye.z = 5;
    r.cameraPosition.target.y = 2;
    return r;
  }
}
export class ApgRprSim_CollisionGroups_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildPanel() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const simControls = super.buildPanel();
    const r = this.buildPanelControl(
      `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
      [
        simulationChangeControl,
        restartSimulationButtonControl,
        simControls
      ]
    );
    return r;
  }
}
