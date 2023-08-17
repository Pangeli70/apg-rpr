import { RAPIER, PRANDO } from "../ApgRprDeps.ts";
import { ApgRprSim_Base } from "../ApgRprSimulationBase.ts";
export class ApgRprSimConvexPolyhedron extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
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
    asimulator.addWorld(this.world);
    if (!this.params.restart) {
      const cameraPosition = {
        eye: { x: -80, y: 50, z: -80 },
        target: { x: 0, y: 0, z: 0 }
      };
      asimulator.resetCamera(cameraPosition);
    }
  }
  pipo(nsubdivs, wx, wy, wz) {
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
}
