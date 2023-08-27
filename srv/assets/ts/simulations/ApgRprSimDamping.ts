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
    ApgRprSim_Base,
    ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";

export interface IApgRprSim_Damping_GuiSettings extends ApgRprSim_IGuiSettings {

}


export class ApgRprSim_Damping extends ApgRprSim_Base {

    constructor(asimulator: ApgRpr_Simulator, aparams: IApgRprSim_Params) {

        // Custom +Z gravity on this simulation
        super(asimulator, {
            simulation: aparams.simulation,
            gravity: (aparams != undefined && aparams.gravity != undefined) ? aparams.gravity : new RAPIER.Vector3(0, 0, +9.81),
            restart: (aparams != undefined && aparams.restart != undefined) ? aparams.restart : false
        });

        this.buildGui(ApgRprSim_Damping_GuiBuilder);

        const settings = this.params.guiSettings! as IApgRprSim_Damping_GuiSettings;
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


    private createWorld(asettings: IApgRprSim_Damping_GuiSettings) {
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

            // TODO implement Dumping groups settings 

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: IApgRprSim_Damping_GuiSettings = {

            ...super.defaultGuiSettings(),

        }

        r.cameraPosition.eye.x = 0;
        r.cameraPosition.eye.y = 2;
        r.cameraPosition.eye.z = 80;

        return r;
    }

}

export class ApgRprSim_Damping_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: IApgRprSim_Damping_GuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as IApgRprSim_Damping_GuiSettings;
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