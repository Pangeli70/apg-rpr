import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulator_GuiBuilder
} from "../ApgRpr_Simulator_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
export class ApgRpr_E2_ConvexPolyhedron_Simulation extends ApgRpr_Simulation {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRpr_E2_ConvexPolyhedrons_GuiBuilder);
    const settings = this.params.settings;
    this.createWorld(settings);
    asimulator.addWorld(this.world);
    if (!this.params.settings.doRestart) {
      this.simulator.resetCamera(settings.cameraPosition);
    }
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    const groudBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groudBodyDesc);
    const rad = 20;
    const numberOfColumns = 20;
    const numberOfRows = 20;
    const scalesVector = new RAPIER.Vector3(rad * 2, rad / 10, rad * 2);
    const field = this.generateRandomHeightFieldArray("fountain", numberOfColumns, numberOfRows);
    const heightFieldGroundColliderDesc = RAPIER.ColliderDesc.heightfield(numberOfColumns, numberOfRows, field, scalesVector).setTranslation(0, -rad / 20, 0);
    this.world.createCollider(heightFieldGroundColliderDesc, groundBody);
    const num = 5;
    const scale = 2;
    const border_rad = 0.1;
    const shift = border_rad * 2 + scale;
    const centerx = shift * (num / 2);
    const centery = shift / 2;
    const centerz = shift * (num / 2);
    let l;
    for (let j = 0; j < 15; ++j) {
      for (let i = 0; i < num; ++i) {
        for (let k = 0; k < num; ++k) {
          const x = i * shift - centerx;
          const y = j * shift + centery + 3;
          const z = k * shift - centerz;
          const randomVertices = [];
          for (l = 0; l < 10; ++l) {
            const x1 = this.rng.next() * scale;
            const y1 = this.rng.next() * scale;
            const z1 = this.rng.next() * scale;
            randomVertices.push(x1, y1, z1);
          }
          const vertices = new Float32Array(randomVertices);
          const polyhedronBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
          const polyhedronBody = this.world.createRigidBody(polyhedronBodyDesc);
          const polyhedronColliderDesc = RAPIER.ColliderDesc.roundConvexHull(vertices, border_rad);
          this.world.createCollider(polyhedronColliderDesc, polyhedronBody);
        }
      }
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
    return r;
  }
}
export class ApgRpr_E2_ConvexPolyhedrons_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {
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
