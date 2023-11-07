/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    RAPIER
} from "../ApgRpr_Deps.ts";

import {
    ApgRpr_Simulation_GuiBuilder
} from "../ApgRpr_Simulation_GuiBuilder.ts";

import {
    ApgRpr_ISimulationParams,
    ApgRpr_ISimulationSettings,
    ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";

import {
    ApgRpr_Simulator
} from "../ApgRpr_Simulator.ts";


interface ApgRpr_C0_LockedRotations_ISimulationSettings extends ApgRpr_ISimulationSettings {

}



export class ApgRpr_C0_LockedRotations_Simulation extends ApgRpr_Simulation {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_C0_LockedRotations_GuiBuilder);

        const settings = this.params.settings! as ApgRpr_C0_LockedRotations_ISimulationSettings;
        this.createWorld(settings);
        asimulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });

    }



    protected override createWorld(asettings: ApgRpr_C0_LockedRotations_ISimulationSettings) {

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

            // @TODO implement collision groups settings 

            super.updateFromGui();
        }

    }
    


    override defaultSettings() {

        const r: ApgRpr_C0_LockedRotations_ISimulationSettings = {

            ...super.defaultSettings(),

        }

        r.cameraPosition.eye.x = -10;
        r.cameraPosition.eye.y = 3;
        r.cameraPosition.eye.z = 0;

        r.cameraPosition.target.y = 3;

        return r;
    }
}



class ApgRpr_C0_LockedRotations_GuiBuilder extends ApgRpr_Simulation_GuiBuilder {

    private _guiSettings: ApgRpr_C0_LockedRotations_ISimulationSettings;


    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_C0_LockedRotations_ISimulationSettings;
    }


    override buildControls() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const simControls = super.buildControls();

        const r = this.buildPanelControl(
            `ApgRprSim_${this._guiSettings.simulation}_SettingsPanelId`,
            [
                simulationChangeControl,
                restartSimulationButtonControl,
                simControls
            ]
        );

        return r;

    }

}