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



export interface IApgRprSim_LockedRotations_GuiSettings extends IApgRprSim_GuiSettings {

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
            const cameraPosition: IApgRpr_CameraPosition = {
                eye: { x: -10.0, y: 3.0, z: 0.0 },
                target: { x: 0.0, y: 3.0, z: 0.0 },
            };
            asimulator.resetCamera(cameraPosition);
        } else {
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


    override build() {

        const simControls = super.build();

        const r = this.buildPanelControl(
            "ApgRprSim_LockedRotations_PanelControl",
            eApgRpr_SimulationName.C_LOCKED_ROTATIONS,
            [
                simControls
            ]
        );

        return r;

    }

}