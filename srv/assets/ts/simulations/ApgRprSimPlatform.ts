/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomCheckBox,
    IApgDomElement, IApgDomRange
} from "../ApgDom.ts";
import { ApgGui } from "../ApgGui.ts";
import { RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { IApgRpr_CameraPosition } from "../ApgRprInterfaces.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base,
    IApgRprSim_GuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";



export interface IApgRprSim_Platform_GuiSettings extends IApgRprSim_GuiSettings {

}


export class ApgRprSimPlatform extends ApgRprSim_Base {

    platformBody!: RAPIER.RigidBody;
    t = 0;

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {
        super(asimulator, aparams);

        this.buildGui(ApgRprSim_Platform_GuiBuilder);

        const settings = this.params.guiSettings! as IApgRprSim_Platform_GuiSettings;
        this.createWorld(settings);


        asimulator.addWorld(this.world);

        if (!this.params.restart) {
            const cameraPosition: IApgRpr_CameraPosition = {
                eye: { x: -80, y: 50, z: -80 },
                target: { x: 0, y: 0, z: 0 },
            };
            asimulator.resetCamera(cameraPosition);
        } else {
            this.params.restart = false;
        }

        asimulator.setPreStepAction(() => {
            this.updateFromGui();
            this.movePlatform();
        });
    }


    private createWorld(asettings: IApgRprSim_Platform_GuiSettings) {

        // Create Trimesh  collider as platform
        const platformBodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
        this.platformBody = this.world.createRigidBody(platformBodyDesc);
        const randomHeightMap = this.generateRandomHeightMap('Platform', 10, 10, 50.0, 5, 50.0);
        const groundColliderDesc = RAPIER.ColliderDesc.trimesh(randomHeightMap.vertices, randomHeightMap.indices);
        this.world.createCollider(groundColliderDesc, this.platformBody);

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
    }

    movePlatform() {
        if (this && this.platformBody) {

            this.t += (2 * Math.PI) / 360;
            const deltaY = Math.sin(this.t) * 12.5;
            const deltaAngle = Math.sin(this.t) * 0.25;
            this.platformBody.setLinvel({ x: 0.0, y: deltaY, z: 0.0 }, true);
            this.platformBody.setAngvel({ x: 0.0, y: deltaAngle, z: 0.0 }, true);
        }
    }


    override updateFromGui() {

        if (this.needsUpdate()) {

            // TODO implement collision groups settings 

            super.updateFromGui();
        }

    }

    override defaultGuiSettings() {

        const r: IApgRprSim_Platform_GuiSettings = {

            ...super.defaultGuiSettings(),


        }
        return r;
    }
}


export class ApgRprSim_Platform_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: IApgRprSim_Platform_GuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as IApgRprSim_Platform_GuiSettings;
    }


    override build() {

        const simControls = super.build();

        const r = this.buildPanelControl(
            "ApgRprSim_Platform_PanelControl",
            eApgRpr_SimulationName.I_PLATFORM,
            [
                simControls
            ]
        );

        return r;

    }

}

