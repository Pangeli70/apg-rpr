/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgGui } from "../ApgGui.ts";
import { RAPIER, PRANDO } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSim_Base.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface ApgRprSim_ConvexPolyhedrons_IGuiSettings extends ApgRprSim_IGuiSettings {


}

export class ApgRprSim_ConvexPolyhedron extends ApgRprSim_Base {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {
        super(asimulator, aparams);

        this.buildGui(ApgRprSim_ConvexPolyhedrons_GuiBuilder);

        const settings = this.params.guiSettings! as ApgRprSim_ConvexPolyhedrons_IGuiSettings;
        this.#createWorld(settings);
        asimulator.addWorld(this.world);

        if (!this.params.restart) {
            this.simulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }


    #createWorld(asettings: ApgRprSim_ConvexPolyhedrons_IGuiSettings) {

        // Create ground
        const groudBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groudBodyDesc);

        const rad = 20;
        const numberOfColumns = 20;
        const numberOfRows = 20;
        const scalesVector = new RAPIER.Vector3(rad * 2, rad / 10, rad * 2)
        const field = this.generateRandomHeightFieldArray('fountain', numberOfColumns, numberOfRows);
        const heightFieldGroundColliderDesc = RAPIER.ColliderDesc
            .heightfield(numberOfColumns, numberOfRows, field, scalesVector)
            .setTranslation(0.0, -rad / 20, 0.0);
        this.world.createCollider(heightFieldGroundColliderDesc, groundBody);

        /*
         * Create the polyhedra
         */
        const num = 5;
        const scale = 2.0;
        const border_rad = 0.1;

        const shift = border_rad * 2.0 + scale;
        const centerx = shift * (num / 2);
        const centery = shift / 2.0;
        const centerz = shift * (num / 2);

        const rng = new PRANDO("Convex Polyhedron 2");
        let l;

        for (let j = 0; j < 15; ++j) {
            for (let i = 0; i < num; ++i) {
                for (let k = 0; k < num; ++k) {
                    const x = i * shift - centerx;
                    const y = j * shift + centery + 3.0;
                    const z = k * shift - centerz;

                    const randomVertices = [];
                    for (l = 0; l < 10; ++l) {
                        const x1 = rng.next() * scale;
                        const y1 = rng.next() * scale;
                        const z1 = rng.next() * scale;

                        randomVertices.push(x1, y1, z1);
                    }
                    const vertices = new Float32Array(randomVertices);

                    // Build the rigid body.
                    const polyhedronBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                        .setTranslation(x, y, z);
                    const polyhedronBody = this.world.createRigidBody(polyhedronBodyDesc);
                    const polyhedronColliderDesc = RAPIER.ColliderDesc.roundConvexHull(vertices, border_rad);
                    this.world.createCollider(polyhedronColliderDesc, polyhedronBody);
                }
            }
        }
    }


    override updateFromGui() {

        if (this.needsUpdate()) {

            // TODO implement Pyramid settings

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: ApgRprSim_ConvexPolyhedrons_IGuiSettings = {

            ...super.defaultGuiSettings(),
        }

        return r;
    }
}



export class ApgRprSim_ConvexPolyhedrons_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_ConvexPolyhedrons_IGuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_ConvexPolyhedrons_IGuiSettings;
    }


    override buildPanel() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const simControls = super.buildPanel();

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

