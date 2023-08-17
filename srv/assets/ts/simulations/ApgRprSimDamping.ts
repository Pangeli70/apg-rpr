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

export interface IApgRprSim_Damping_GuiSettings extends IApgRprSim_GuiSettings {

}


export class ApgRprSim_Damping extends ApgRprSim_Base {

    constructor(asimulator: ApgRpr_Simulator, aparams: IApgRprSim_Params) {

        // Custom +Z gravity on this simulation
        super(asimulator, {
            simulation: eApgRpr_SimulationName.D_DAMPING,
            gravity: (aparams != undefined && aparams.gravity != undefined) ? aparams.gravity : new RAPIER.Vector3(0, 0, +9.81),
            restart: (aparams != undefined && aparams.restart != undefined) ? aparams.restart : false
        });

        this.buildGui(ApgRprSim_Damping_GuiBuilder);

        const settings = this.params.guiSettings! as IApgRprSim_Damping_GuiSettings;
        this.createWorld(settings);

        asimulator.addWorld(this.world);

        if (!this.params.restart) {
            const cameraPosition: IApgRpr_CameraPosition = {
                eye: { x: 0, y: 2.0, z: 80 },
                target: { x: 0, y: 0, z: 0 },
            };
            asimulator.resetCamera(cameraPosition);
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


    override build() {

        const simControls = super.build();

        const r = this.buildPanelControl(
            "ApgRprSim_Damping_PanelControl",
            eApgRpr_SimulationName.D_DAMPING,
            [
                simControls
            ]
        );

        return r;

    }

}