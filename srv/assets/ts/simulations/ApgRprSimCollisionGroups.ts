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




export interface IApgRprSim_CollisionGroups_GuiSettings extends IApgRprSim_GuiSettings {

}


export class ApgRprSim_CollisionGroups extends ApgRprSim_Base {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {
        
        super(asimulator, aparams);

        this.buildGui(ApgRprSim_CollisionGroups_GuiBuilder);

        const settings = this.params.guiSettings! as IApgRprSim_CollisionGroups_GuiSettings;
        this.createWorld(settings);

        asimulator.addWorld(this.world);

        if (!this.params.restart) {
            const cameraPosition: IApgRpr_CameraPosition = {
                eye: { x: 5.0, y: 4.0, z: 5.0 },
                target: { x: 0, y: 2, z: 0 },
            };
            asimulator.resetCamera(cameraPosition);
        } else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }



    private createWorld(asettings: IApgRprSim_CollisionGroups_GuiSettings) {
        const fixedBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const fixedBody = this.world.createRigidBody(fixedBodyDesc);

        // Create Ground.
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(5.0, 0.1, 5.0);
        this.world.createCollider(groundColliderDesc, fixedBody);

        // Add one floor that collides with the first group only.
        const collisionGroup1 = 0x00010001;
        const firstFloorColliderDesc = RAPIER.ColliderDesc.cuboid(1.0, 0.1, 1.0)
            .setTranslation(0.0, 1.5, 0.0)
            .setCollisionGroups(collisionGroup1);
        this.world.createCollider(firstFloorColliderDesc, fixedBody);

        // Add one floor that collides with the second group only.
        const collisionGroup2 = 0x00020002;
        const secondFloorColliderDesc = RAPIER.ColliderDesc.cuboid(1.0, 0.1, 1.0)
            .setTranslation(0.0, 3.0, 0.0)
            .setCollisionGroups(collisionGroup2);
        this.world.createCollider(secondFloorColliderDesc, fixedBody);

        // Dynamic cubes.
        const num = 8;
        const rad = 0.1;

        const shift = rad * 2.0;
        const centerx = shift * (num / 2);
        const centery = 3.5;
        const centerz = shift * (num / 2);

        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < num; i++) {
                for (let k = 0; k < num; k++) {
                    const x = i * shift - centerx;
                    const y = j * shift + centery;
                    const z = k * shift - centerz;

                    // Alternate between the collision groups.
                    const group = k % 2 == 0 ? collisionGroup1 : collisionGroup2;

                    const cubeBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                        .setTranslation(x, y, z);
                    const cubeBody = this.world.createRigidBody(cubeBodyDesc);

                    const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad)
                        .setCollisionGroups(group);
                    this.world.createCollider(cubeColliderDesc, cubeBody);
                }
            }
        }
    }

    
    override updateFromGui() {

        if (this.needsUpdate()) {

            // TODO implement collision groups settings 

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: IApgRprSim_CollisionGroups_GuiSettings = {

            ...super.defaultGuiSettings(),


        }
        return r;
    }

}


export class ApgRprSim_CollisionGroups_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: IApgRprSim_CollisionGroups_GuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as IApgRprSim_CollisionGroups_GuiSettings;
    }


    override build() {

        const simControls = super.build();

        const r = this.buildPanelControl(
            "ApgRprSim_CollisionGroups_PanelControl",
            eApgRpr_SimulationName.E_COLLISION_GROUPS,
            [
                simControls
            ]
        );

        return r;

    }

}
