import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRpr_eSimulationName } from "../ApgRprEnums.ts";
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
      asimulator.resetCamera(settings.cameraPosition);
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
    r.cameraPosition.eye.x = -10;
    r.cameraPosition.eye.y = 3;
    r.cameraPosition.eye.z = 0;
    r.cameraPosition.target.y = 3;
    return r;
  }
}
export class ApgRprSim_LockedRotations_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildHtml() {
    const simControls = super.buildHtml();
    const r = this.buildPanelControl(
      "ApgRprSim_LockedRotations_PanelControl",
      ApgRpr_eSimulationName.C_LOCKED_ROTATIONS,
      [
        simControls
      ]
    );
    return r;
  }
}
