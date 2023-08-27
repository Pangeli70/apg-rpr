import { RAPIER, PRANDO } from "../ApgRprDeps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSim_ConvexPolyhedron extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    const settings = this.params.guiSettings;
    this.buildGui(ApgRprSim_ConvexPolyhedrons_GuiBuilder);
    this.#createWorld(settings);
    asimulator.addWorld(this.world);
    if (!this.params.restart) {
      this.simulator.resetCamera(settings.cameraPosition);
    } else {
      this.params.restart = false;
    }
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  #createWorld(asettings) {
    const groudBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groudBodyDesc);
    const rad = 20;
    const numberOfColumns = 20;
    const numberOfRows = 20;
    const scalesVector = new RAPIER.Vector3(rad * 2, rad / 10, rad * 2);
    const field = this.generateRandomField("fountain", numberOfColumns, numberOfRows);
    const heightFieldGroundColliderDesc = RAPIER.ColliderDesc.heightfield(numberOfColumns, numberOfRows, field, scalesVector).setTranslation(0, -rad / 20, 0);
    this.world.createCollider(heightFieldGroundColliderDesc, groundBody);
    const num = 5;
    const scale = 2;
    const border_rad = 0.1;
    const shift = border_rad * 2 + scale;
    const centerx = shift * (num / 2);
    const centery = shift / 2;
    const centerz = shift * (num / 2);
    const rng = new PRANDO("Convex Polyhedron 2");
    let l;
    for (let j = 0; j < 15; ++j) {
      for (let i = 0; i < num; ++i) {
        for (let k = 0; k < num; ++k) {
          const x = i * shift - centerx;
          const y = j * shift + centery + 3;
          const z = k * shift - centerz;
          const randomVertices = [];
          for (l = 0; l < 10; ++l) {
            const x1 = rng.next() * scale;
            const y1 = rng.next() * scale;
            const z1 = rng.next() * scale;
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
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings()
    };
    return r;
  }
}
export class ApgRprSim_ConvexPolyhedrons_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildHtml() {
    const simControls = super.buildHtml();
    const r = this.buildPanelControl(
      `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
      this.guiSettings.name,
      [
        simControls
      ]
    );
    return r;
  }
}
