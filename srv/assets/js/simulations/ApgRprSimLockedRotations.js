import { RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSim_LockedRotations extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_LockedRotations_GuiBuilder);
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    asimulator.addWorld(this.world);
    if (!this.params.restart) {
      const cameraPosition = {
        eye: { x: -10, y: 3, z: 0 },
        target: { x: 0, y: 3, z: 0 }
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
    const groundSize = 1.7;
    const groundHeight = 0.1;
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, -groundHeight, 0);
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(groundSize, groundHeight, groundSize);
    this.world.createCollider(groundColliderDesc, groundBody);
    const rectBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 3, 0).lockTranslations().restrictRotations(true, false, false);
    const rectColliderDesc = this.world.createRigidBody(rectBodyDesc);
    const rectCollider = RAPIER.ColliderDesc.cuboid(0.2, 0.6, 2);
    this.world.createCollider(rectCollider, rectColliderDesc);
    const cylBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.2, 5, 0.4).lockRotations();
    const cylBody = this.world.createRigidBody(cylBodyDesc);
    const cylColliderDesc = RAPIER.ColliderDesc.cylinder(0.6, 0.4);
    this.world.createCollider(cylColliderDesc, cylBody);
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
export class ApgRprSim_LockedRotations_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  build() {
    const simControls = super.build();
    const r = this.buildPanelControl(
      "ApgRprSim_LockedRotations_PanelControl",
      eApgRpr_SimulationName.C_LOCKED_ROTATIONS,
      [
        simControls
      ]
    );
    return r;
  }
}
