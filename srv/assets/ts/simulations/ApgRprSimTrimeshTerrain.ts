/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";
import { IApgRpr_CameraPosition } from "../ApgRprInterfaces.ts";
import { ApgRprSim_Base, IApgRprSim_Params } from "../ApgRprSimulationBase.ts";

export class ApgRprSimTrimeshTerrain extends ApgRprSim_Base {

    constructor(asimulator: ApgRpr_Simulator, aparams: IApgRprSim_Params) {
        super(asimulator, aparams);

        // Create Trimesh platform collider.
        const platformBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const platformBody = this.world.createRigidBody(platformBodyDesc);
        const heightMap = this.generateRandomHeightMap('Trimesh Height map', 20, 20, 70.0, 4.0, 70.0);
        const groundColliderDesc = RAPIER.ColliderDesc.trimesh(heightMap.vertices, heightMap.indices);
        this.world.createCollider(groundColliderDesc, platformBody);

        // Dynamic colliders.
        const num = 4;
        const numy = 10;
        const rad = 1.0;
        const shift = rad * 2.0 + rad;
        const centery = shift / 2.0;
        let offset = -num * (rad * 2.0 + rad) * 0.5;
        let i, j, k;
        for (j = 0; j < numy; ++j) {
            for (i = 0; i < num; ++i) {
                for (k = 0; k < num; ++k) {
                    const x = i * shift + offset;
                    const y = j * shift + centery + 3.0;
                    const z = k * shift + offset;
                    // Create dynamic collider body.
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
                            //colliderDesc = RAPIER.ColliderDesc.roundCylinder(rad, rad, rad / 10.0);
                            colliderDesc = RAPIER.ColliderDesc.cylinder(rad, rad);
                            break;
                        case 3:
                            colliderDesc = RAPIER.ColliderDesc.cone(rad, rad);
                            break;
                        case 4:
                            colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2.0, rad / 2.0, rad / 2.0);
                            this.world.createCollider(colliderDesc, body);
                            colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2.0, rad, rad / 2.0).setTranslation(rad, 0.0, 0.0);
                            this.world.createCollider(colliderDesc, body);
                            colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2.0, rad, rad / 2.0).setTranslation(-rad, 0.0, 0.0);
                            break;
                    }
                    this.world.createCollider(colliderDesc, body);
                }
            }
            offset -= 0.05 * rad * (num - 1.0);
        }

        asimulator.addWorld(this.world);

        // TODO create a property and a method for this. -- APG 20230815
        if (!this.params.restart) {
            const cameraPosition: IApgRpr_CameraPosition = {
                eye: { x: -80, y: 50, z: -80 },
                target: { x: 0, y: 0, z: 0 },
            };
            asimulator.resetCamera(cameraPosition);
        }
    }


}
