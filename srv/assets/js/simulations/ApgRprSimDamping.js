import { RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSim_Damping extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, {
      simulation: eApgRpr_SimulationName.D_DAMPING,
      gravity: aparams != void 0 && aparams.gravity != void 0 ? aparams.gravity : new RAPIER.Vector3(0, 0, 9.81),
      restart: aparams != void 0 && aparams.restart != void 0 ? aparams.restart : false
    });
    this.buildGui(ApgRprSim_Damping_GuiBuilder);
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    asimulator.addWorld(this.world);
    if (!this.params.restart) {
      const cameraPosition = {
        eye: { x: 0, y: 2, z: 80 },
        target: { x: 0, y: 0, z: 0 }
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
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings()
    };
    return r;
  }
}
export class ApgRprSim_Damping_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  build() {
    const simControls = super.build();
    const r = this.buildPanelControl(
      "ApgRprSim_Damping_PanelControl",
      eApgRpr_SimulationName.D_DAMPING,
      [
        simControls
      ]
    );
    return r;
  }
}
