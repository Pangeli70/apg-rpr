import { RAPIER, PRANDO } from "../ApgRprDeps.ts";
import { ApgRpr_eSimulationName } from "../ApgRprEnums.ts";
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
    const heightMap = this.generateRandomHeightMap("Convex Polyhedron 1", 20, 20, 40, 4, 40);
    const groundColliderDesc = RAPIER.ColliderDesc.trimesh(
      heightMap.vertices,
      heightMap.indices
    );
    this.world.createCollider(groundColliderDesc, groundBody);
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
  #pipo(nsubdivs, wx, wy, wz) {
    let vertices = [];
    let indices = [];
    let elementWidth = 1 / nsubdivs;
    let rng = new PRANDO("trimesh");
    let i, j;
    for (i = 0; i <= nsubdivs; ++i) {
      for (j = 0; j <= nsubdivs; ++j) {
        let x = (j * elementWidth - 0.5) * wx;
        let y = rng.next() * wy;
        let z = (i * elementWidth - 0.5) * wz;
        vertices.push(x, y, z);
      }
    }
    for (i = 0; i < nsubdivs; ++i) {
      for (j = 0; j < nsubdivs; ++j) {
        let i1 = (i + 0) * (nsubdivs + 1) + (j + 0);
        let i2 = (i + 0) * (nsubdivs + 1) + (j + 1);
        let i3 = (i + 1) * (nsubdivs + 1) + (j + 0);
        let i4 = (i + 1) * (nsubdivs + 1) + (j + 1);
        indices.push(i1, i3, i2);
        indices.push(i3, i4, i2);
      }
    }
    return {
      vertices: new Float32Array(vertices),
      indices: new Uint32Array(indices)
    };
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
      "ApgRprSim_ConvexPolyHedron_SettingsPanel",
      ApgRpr_eSimulationName.A_PYRAMID,
      [
        simControls
      ]
    );
    return r;
  }
}
