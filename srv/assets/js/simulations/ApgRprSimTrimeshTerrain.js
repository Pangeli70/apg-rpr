import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRprSim_Base } from "../ApgRprSimulationBase.ts";
export class ApgRprSimTrimeshTerrain extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    const platformBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const platformBody = this.world.createRigidBody(platformBodyDesc);
    const heightMap = this.generateRandomHeightMap("Trimesh Height map", 20, 20, 70, 4, 70);
    const groundColliderDesc = RAPIER.ColliderDesc.trimesh(heightMap.vertices, heightMap.indices);
    this.world.createCollider(groundColliderDesc, platformBody);
    const num = 4;
    const numy = 10;
    const rad = 1;
    const shift = rad * 2 + rad;
    const centery = shift / 2;
    let offset = -num * (rad * 2 + rad) * 0.5;
    let i, j, k;
    for (j = 0; j < numy; ++j) {
      for (i = 0; i < num; ++i) {
        for (k = 0; k < num; ++k) {
          const x = i * shift + offset;
          const y = j * shift + centery + 3;
          const z = k * shift + offset;
          const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
          const body = this.world.createRigidBody(bodyDesc);
          let colliderDesc;
          switch (j % 5) {
            case 0:
              colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
              break;
            case 1:
              colliderDesc = RAPIER.ColliderDesc.ball(rad);
              break;
            case 2:
              colliderDesc = RAPIER.ColliderDesc.cylinder(rad, rad);
              break;
            case 3:
              colliderDesc = RAPIER.ColliderDesc.cone(rad, rad);
              break;
            case 4:
              colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2, rad / 2, rad / 2);
              this.world.createCollider(colliderDesc, body);
              colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2, rad, rad / 2).setTranslation(rad, 0, 0);
              this.world.createCollider(colliderDesc, body);
              colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2, rad, rad / 2).setTranslation(-rad, 0, 0);
              break;
          }
          this.world.createCollider(colliderDesc, body);
        }
      }
      offset -= 0.05 * rad * (num - 1);
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
}
