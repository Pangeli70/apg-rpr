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


export interface IApgRprSim_LockedRotations_GuiSettings extends ApgRprSim_IGuiSettings {

}


export class ApgRprSim_LockedRotations extends ApgRprSim_Base {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRprSim_LockedRotations_GuiBuilder);

        const settings = this.params.guiSettings! as IApgRprSim_LockedRotations_GuiSettings;
        this.createWorld(settings);

        asimulator.addWorld(this.world);

        if (!this.params.restart) {
            asimulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });

    }

    private createWorld(asettings: IApgRprSim_LockedRotations_GuiSettings) {
        const groundSize = 1.7;
        const groundHeight = 0.1;
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed()
            .setTranslation(0.0, -groundHeight, 0.0);
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(groundSize, groundHeight, groundSize);
        this.world.createCollider(groundColliderDesc, groundBody);

        /*
         * A rectangle that only rotates along the `x` axis.
         */
        const rectBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0.0, 3.0, 0.0)
            .lockTranslations()
            .restrictRotations(true, false, false);
        const rectColliderDesc = this.world.createRigidBody(rectBodyDesc);
        const rectCollider = RAPIER.ColliderDesc.cuboid(0.2, 0.6, 2.0);
        this.world.createCollider(rectCollider, rectColliderDesc);


        /*
         * A cylinder that cannot rotate.
         */
        const cylBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0.2, 5.0, 0.4)
            .lockRotations();
        const cylBody = this.world.createRigidBody(cylBodyDesc);
        const cylColliderDesc = RAPIER.ColliderDesc.cylinder(0.6, 0.4);
        this.world.createCollider(cylColliderDesc, cylBody);
    }

    override updateFromGui() {

        if (this.needsUpdate()) {

            // TODO implement collision groups settings 

            super.updateFromGui();
        }

    }

    override defaultGuiSettings() {

        const r: IApgRprSim_LockedRotations_GuiSettings = {

            ...super.defaultGuiSettings(),

        }

        r.cameraPosition.eye.x = -10;
        r.cameraPosition.eye.y = 3;
        r.cameraPosition.eye.z = 0;

        r.cameraPosition.target.y = 3;

        return r;
    }
}


export class ApgRprSim_LockedRotations_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: IApgRprSim_LockedRotations_GuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as IApgRprSim_LockedRotations_GuiSettings;
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