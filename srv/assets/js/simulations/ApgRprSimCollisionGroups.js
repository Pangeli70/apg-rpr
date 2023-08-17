import { RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSim_CollisionGroups extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_CollisionGroups_GuiBuilder);
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    asimulator.addWorld(this.world);
    if (!this.params.restart) {
      const cameraPosition = {
        eye: { x: 5, y: 4, z: 5 },
        target: { x: 0, y: 2, z: 0 }
      };
      asimulator.resetCamera(cameraPosition);
    } else {
      this.params.restart = false;
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
    return r;
  }
}
export class ApgRprSim_CollisionGroups_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  build() {
    const simControls = super.build();
    const r = this.buildPanelControl(
      "ApgRprSim_CollisionGroups_PanelControl",
      eApgRpr_SimulationName.E_COLLISION_GROUPS,
      [
        simControls
      ]
    );
    return r;
  }
}
