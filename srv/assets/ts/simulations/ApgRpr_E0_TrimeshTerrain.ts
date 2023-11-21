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
} from "../gui-builders/ApgRpr_Simulation_GuiBuilder.ts";

import {
    ApgRpr_ISimulationParams,
    ApgRpr_ISimulationSettings,
    ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";

import {
    ApgRpr_Simulator
} from "../ApgRpr_Simulator.ts";


interface ApgRpr_E0_TrimeshTerrain_ISimulationSettings extends ApgRpr_ISimulationSettings {

}



export class ApgRpr_E0_TrimeshTerrain_Simulation extends ApgRpr_Simulation {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_E0_TrimeshTerrain_GuiBuilder);

        const settings = this.params.settings! as ApgRpr_E0_TrimeshTerrain_ISimulationSettings;
        this.createWorld(settings);
        asimulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }



    protected override createWorld(asettings: ApgRpr_E0_TrimeshTerrain_ISimulationSettings) {
        
        // Create Trimesh platform collider.
        const platformBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const platformBody = this.world.createRigidBody(platformBodyDesc);
        const heightMap = this.generateRandomTrimshHeightMap('Trimesh Height map', 21, 21, 70.0, 4.0, 70.0);
        const groundColliderDesc = RAPIER.ColliderDesc.trimesh(heightMap.vertices, heightMap.indices);
        this.world.createCollider(groundColliderDesc, platformBody);

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
                            colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2.0, rad / 2.0, rad / 2.0);
                            this.world.createCollider(colliderDesc, body);
                            colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2.0, rad, rad / 2.0).setTranslation(rad, 0.0, 0.0);
                            this.world.createCollider(colliderDesc, body);
                            colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2.0, rad, rad / 2.0).setTranslation(-rad, 0.0, 0.0);
                            break;
                    }
                    this.world.createCollider(colliderDesc, body);
                }
            }
            offset -= 0.05 * rad * (num - 1.0);
        }
    }



    override updateFromGui() {

        if (this.needsUpdate()) {

            // @TODO implement Pyramid settings

            super.updateFromGui();
        }

    }



    override defaultSettings() {

        const r: ApgRpr_E0_TrimeshTerrain_ISimulationSettings = {

            ...super.defaultSettings(),

        }

        return r;
    }

}



class ApgRpr_E0_TrimeshTerrain_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {

    private _guiSettings: ApgRpr_E0_TrimeshTerrain_ISimulationSettings;


    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_E0_TrimeshTerrain_ISimulationSettings;
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

