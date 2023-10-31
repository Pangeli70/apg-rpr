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
} from "../ApgRpr_Simulator_GuiBuilder.ts";

import {
    ApgRpr_ISimulationParams,
    ApgRpr_ISimulationSettings,
    ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";

import {
    ApgRpr_Simulator
} from "../ApgRpr_Simulator.ts";



export interface ApgRpr_E2_ConvexPolyhedrons_ISimulationSettings extends ApgRpr_ISimulationSettings {


}



export class ApgRpr_E2_ConvexPolyhedron_Simulation extends ApgRpr_Simulation {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {
        super(asimulator, aparams);

        this.buildGui(ApgRpr_E2_ConvexPolyhedrons_GuiBuilder);

        const settings = this.params.settings! as ApgRpr_E2_ConvexPolyhedrons_ISimulationSettings;
        this.createWorld(settings);
        asimulator.addWorld(this.world);

        if (!this.params.settings!.doRestart) {
            this.simulator.resetCamera(settings.cameraPosition);
        }

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }



    protected override createWorld(asettings: ApgRpr_E2_ConvexPolyhedrons_ISimulationSettings) {

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

        let l;

        for (let j = 0; j < 15; ++j) {
            for (let i = 0; i < num; ++i) {
                for (let k = 0; k < num; ++k) {
                    const x = i * shift - centerx;
                    const y = j * shift + centery + 3.0;
                    const z = k * shift - centerz;

                    const randomVertices = [];
                    for (l = 0; l < 10; ++l) {
                        const x1 = this.rng.next() * scale;
                        const y1 = this.rng.next() * scale;
                        const z1 = this.rng.next() * scale;

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

            // @TODO implement Pyramid settings

            super.updateFromGui();
        }

    }



    override defaultSettings() {

        const r: ApgRpr_E2_ConvexPolyhedrons_ISimulationSettings = {

            ...super.defaultSettings(),
        }

        return r;
    }

}



export class ApgRpr_E2_ConvexPolyhedrons_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {

    private _guiSettings: ApgRpr_E2_ConvexPolyhedrons_ISimulationSettings;


    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_E2_ConvexPolyhedrons_ISimulationSettings;
    }


    override buildPanel() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const simControls = super.buildPanel();

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

