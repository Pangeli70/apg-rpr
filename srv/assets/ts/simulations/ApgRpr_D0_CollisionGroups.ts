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




interface ApgRpr_D0_CollisionGroups_ISimulationSettings extends ApgRpr_ISimulationSettings {

}



export class ApgRpr_D0_CollisionGroups_Simulation extends ApgRpr_Simulation {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_D0_CollisionGroups_GuiBuilder);

        const settings = this.params.settings! as ApgRpr_D0_CollisionGroups_ISimulationSettings;
        this.createWorld(settings);
        asimulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }



    protected override createWorld(asettings: ApgRpr_D0_CollisionGroups_ISimulationSettings) {

        const fixedBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const fixedBody = this.world.createRigidBody(fixedBodyDesc);

        // Create Ground.
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(5.0, 0.1, 5.0);
        this.world.createCollider(groundColliderDesc, fixedBody);

        // Add one floor that collides with the first group only.
        const collisionGroup1 = 0x00010001;
        const firstFloorColliderDesc = RAPIER.ColliderDesc.cuboid(1.0, 0.1, 1.0)
            .setTranslation(0.0, 1.5, 0.0)
            .setCollisionGroups(collisionGroup1);
        this.world.createCollider(firstFloorColliderDesc, fixedBody);

        // Add one floor that collides with the second group only.
        const collisionGroup2 = 0x00020002;
        const secondFloorColliderDesc = RAPIER.ColliderDesc.cuboid(1.0, 0.1, 1.0)
            .setTranslation(0.0, 3.0, 0.0)
            .setCollisionGroups(collisionGroup2);
        this.world.createCollider(secondFloorColliderDesc, fixedBody);

        // Dynamic cubes.
        const num = 8;
        const rad = 0.1;

        const shift = rad * 2.0;
        const centerx = shift * (num / 2);
        const centery = 3.5;
        const centerz = shift * (num / 2);

        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < num; i++) {
                for (let k = 0; k < num; k++) {
                    const x = i * shift - centerx;
                    const y = j * shift + centery;
                    const z = k * shift - centerz;

                    // Alternate between the collision groups.
                    const group = k % 2 == 0 ? collisionGroup1 : collisionGroup2;

                    const cubeBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                        .setTranslation(x, y, z);
                    const cubeBody = this.world.createRigidBody(cubeBodyDesc);

                    const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad)
                        .setCollisionGroups(group);
                    this.world.createCollider(cubeColliderDesc, cubeBody);
                }
            }
        }
    }



    override updateFromGui() {

        if (this.needsUpdate()) {

            // @TODO implement collision groups settings 

            super.updateFromGui();
        }

    }



    override defaultSettings() {

        const r: ApgRpr_D0_CollisionGroups_ISimulationSettings = {

            ...super.defaultSettings(),

        }

        r.cameraPosition.eye.x = 5;
        r.cameraPosition.eye.y = 4;
        r.cameraPosition.eye.z = 5;

        r.cameraPosition.target.y = 2;

        return r;
    }

}



class ApgRpr_D0_CollisionGroups_GuiBuilder extends ApgRpr_Simulation_GuiBuilder {

    private _guiSettings: ApgRpr_D0_CollisionGroups_ISimulationSettings;


    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as  ApgRpr_D0_CollisionGroups_ISimulationSettings;
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
