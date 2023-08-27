/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgGui } from "../ApgGui.ts";
import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";




export interface IApgRprSim_CollisionGroups_GuiSettings extends ApgRprSim_IGuiSettings {

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
            asimulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
            this.simulator.gui.log("restarted");
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

        r.cameraPosition.eye.x = 5;
        r.cameraPosition.eye.y = 4;
        r.cameraPosition.eye.z = 5;

        r.cameraPosition.target.y = 2;

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


    override buildHtml() {

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
