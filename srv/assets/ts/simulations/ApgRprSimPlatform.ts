/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgGui } from "../ApgGui.ts";
import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSim_Base.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface ApgRprSim_Platform_IGuiSettings extends ApgRprSim_IGuiSettings {

}


export class ApgRprSim_Platform extends ApgRprSim_Base {

    platformBody!: RAPIER.RigidBody;
    t = 0;

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {
        super(asimulator, aparams);

        // TODO Implement this pattern in the other simulations -- APG 20230819
        this.buildGui(ApgRprSim_Platform_GuiBuilder);

        const settings = this.params.guiSettings! as ApgRprSim_Platform_IGuiSettings;
        this.#createWorld(settings);
        this.simulator.addWorld(this.world);

        if (!this.params.restart) {
            asimulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        asimulator.setPreStepAction(() => {
            this.updateFromGui();
            this.#movePlatform();
        });
    }


    #createWorld(asettings: ApgRprSim_Platform_IGuiSettings) {

        //>> Begin_Relevant_Code
        const numberOfColumns = 10;
        const numberOfRows = 10;
        const scales = new RAPIER.Vector3(40, 4, 40);

        // Create Heigtfield kinematic collider as platform
        const kinematicBodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
        this.platformBody = this.world.createRigidBody(kinematicBodyDesc);
        const randomHeightField = this.generateRandomHeightFieldArray('Platform', numberOfColumns, numberOfRows);
        const groundColliderDesc = RAPIER.ColliderDesc.heightfield(numberOfRows, numberOfRows, randomHeightField, scales);
        this.world.createCollider(groundColliderDesc, this.platformBody);
        //<< End_Relevant_Code

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
                            colliderDesc = RAPIER.ColliderDesc
                                .cuboid(rad / 2.0, rad / 2.0, rad / 2.0);
                            this.world.createCollider(colliderDesc, body);
                            colliderDesc = RAPIER.ColliderDesc
                                .cuboid(rad / 2.0, rad, rad / 2.0)
                                .setTranslation(rad, 0.0, 0.0);
                            this.world.createCollider(colliderDesc, body);
                            colliderDesc = RAPIER.ColliderDesc
                                .cuboid(rad / 2.0, rad, rad / 2.0)
                                .setTranslation(-rad, 0.0, 0.0);
                            break;
                    }
                    this.world.createCollider(colliderDesc, body);
                }
            }
            offset -= 0.05 * rad * (num - 1.0);
        }
    }


    #movePlatform() {
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

            // TODO implement Platform settings 

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: ApgRprSim_Platform_IGuiSettings = {

            ...super.defaultGuiSettings(),


        }
        return r;
    }
}


 class ApgRprSim_Platform_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_Platform_IGuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_Platform_IGuiSettings;
    }


    override buildHtml() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const simControls = super.buildHtml();

        const r = this.buildPanelControl(
            `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
            [
                simulationChangeControl,
                restartSimulationButtonControl,
                simControls
            ]
        );

        return r;

    }

}

