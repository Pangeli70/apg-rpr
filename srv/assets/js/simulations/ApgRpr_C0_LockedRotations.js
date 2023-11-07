import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulation_GuiBuilder
} from "../ApgRpr_Simulation_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
export class ApgRpr_C0_LockedRotations_Simulation extends ApgRpr_Simulation {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRpr_C0_LockedRotations_GuiBuilder);
    const settings = this.params.settings;
    this.createWorld(settings);
    asimulator.addWorld(this.world);
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
  defaultSettings() {
    const r = {
      ...super.defaultSettings()
    };
    r.cameraPosition.eye.x = -10;
    r.cameraPosition.eye.y = 3;
    r.cameraPosition.eye.z = 0;
    r.cameraPosition.target.y = 3;
    return r;
  }
}
class ApgRpr_C0_LockedRotations_GuiBuilder extends ApgRpr_Simulation_GuiBuilder {
  _guiSettings;
  constructor(asimulator, asettings) {
    super(asimulator, asettings);
    this._guiSettings = asettings;
  }
  buildControls() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const simControls = super.buildControls();
    const r = this.buildPanelControl(
      `ApgRprSim_${this._guiSettings.simulation}_SettingsPanelId`,
      [
        simulationChangeControl,
        restartSimulationButtonControl,
        simControls
      ]
    );
    return r;
  }
}
