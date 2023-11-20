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
    ApgRpr_Simulator_GuiBuilder
} from "../ApgRpr_Simulation_GuiBuilder.ts";

import {
    ApgRpr_ISimulationParams,
    ApgRpr_ISimulationSettings,
    ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";

import {
    ApgRpr_Simulator
} from "../ApgRpr_Simulator.ts";



export interface ApgRpr_C1_Damping_ISimulationSettings extends ApgRpr_ISimulationSettings {

}



export class ApgRpr_C1_Damping_Simulation extends ApgRpr_Simulation {



    constructor(asimulator: ApgRpr_Simulator, aparams: ApgRpr_ISimulationParams) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_C1_Damping_GuiBuilder);

        const settings = this.params.settings! as ApgRpr_C1_Damping_ISimulationSettings;
        this.createWorld(settings);
        asimulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });

    }



    protected override createWorld(asettings: ApgRpr_C1_Damping_ISimulationSettings) {
        const size = 0.5;

        const radious = 5;
        const numBodies = 20;
        const sliceAngle = 360 / numBodies;

        const MAX_LINEAR_DUMPING = size * 50 / numBodies;
        const MAX_ANGULAR_DUMPING = 1;

        for (let i = 0; i < numBodies; ++i) {

            const angleInRadians = (sliceAngle * i) / 360 * 2 * Math.PI;
            const x = Math.cos(angleInRadians);
            const y = Math.sin(angleInRadians);

            // Build the rigid body.
            const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(x * radious, y * radious, 0.0)
                .setLinvel(x * (size * 100), y * (size * 100), 0.0)
                .setLinearDamping((numBodies - i) * MAX_LINEAR_DUMPING)
                .setAngvel(new RAPIER.Vector3(0.0, 0.0, size * 100.0))
                .setAngularDamping((1 + i) * MAX_ANGULAR_DUMPING);
            const body = this.world.createRigidBody(bodyDesc);

            // Build the collider.
            const colliderDesc = RAPIER.ColliderDesc.cuboid(size, size, size);
            this.world.createCollider(colliderDesc, body);
        }
    }



    override updateFromGui() {

        if (this.needsUpdate()) {

            // @TODO implement Dumping groups settings 

            super.updateFromGui();
        }

    }



    override defaultSettings() {

        const r: ApgRpr_C1_Damping_ISimulationSettings = {

            ...super.defaultSettings(),

        }

        r.cameraPosition.eye.x = 0;
        r.cameraPosition.eye.y = 2;
        r.cameraPosition.eye.z = 80;


        return r;
    }

}



export class ApgRpr_C1_Damping_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {

    private _guiSettings: ApgRpr_C1_Damping_ISimulationSettings;


    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_C1_Damping_ISimulationSettings;
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