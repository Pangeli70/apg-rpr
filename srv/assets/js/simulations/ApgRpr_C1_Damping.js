import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulator_GuiBuilder
} from "../ApgRpr_Simulator_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
export class ApgRpr_C1_Damping_Simulation extends ApgRpr_Simulation {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRpr_C1_Damping_GuiBuilder);
    const settings = this.params.settings;
    this.createWorld(settings);
    asimulator.addWorld(this.world);
    if (!this.params.settings.doRestart) {
      asimulator.resetCamera(settings.cameraPosition);
    }
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    const size = 0.5;
    const radious = 5;
    const numBodies = 20;
    const sliceAngle = 360 / numBodies;
    const MAX_LINEAR_DUMPING = size * 50 / numBodies;
    const MAX_ANGULAR_DUMPING = 1;
    for (let i = 0; i < numBodies; ++i) {
      const angleInRadians = sliceAngle * i / 360 * 2 * Math.PI;
      const x = Math.cos(angleInRadians);
      const y = Math.sin(angleInRadians);
      const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x * radious, y * radious, 0).setLinvel(x * (size * 100), y * (size * 100), 0).setLinearDamping((numBodies - i) * MAX_LINEAR_DUMPING).setAngvel(new RAPIER.Vector3(0, 0, size * 100)).setAngularDamping((1 + i) * MAX_ANGULAR_DUMPING);
      const body = this.world.createRigidBody(bodyDesc);
      const colliderDesc = RAPIER.ColliderDesc.cuboid(size, size, size);
      this.world.createCollider(colliderDesc, body);
    }
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
    r.cameraPosition.eye.x = 0;
    r.cameraPosition.eye.y = 2;
    r.cameraPosition.eye.z = 80;
    r.gravity = new RAPIER.Vector3(0, 0, 9.81);
    return r;
  }
}
export class ApgRpr_C1_Damping_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {
  _guiSettings;
  constructor(asimulator, asettings) {
    super(asimulator, asettings);
    this._guiSettings = asettings;
  }
  buildPanel() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const simControls = super.buildPanel();
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
