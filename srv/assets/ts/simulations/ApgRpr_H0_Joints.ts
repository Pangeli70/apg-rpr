/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/23]
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


interface ApgRpr_H0_Joints_ISimulationSettings extends ApgRpr_ISimulationSettings {

}



export class ApgRpr_H0_Joints_Simulation extends ApgRpr_Simulation {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_H0_Joints_GuiBuilder);

        const settings = this.params.settings as ApgRpr_H0_Joints_ISimulationSettings;
        this.createWorld(settings);
        this.simulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => {
            this.updateFromGui();
        });
    }


    protected override createWorld(asettings: ApgRpr_H0_Joints_ISimulationSettings) {

        this.#createPrismaticJoints(new RAPIER.Vector3(20.0, 10.0, 0.0), 9);
        this.#createFixedJoints(new RAPIER.Vector3(0.0, 10.0, 0.0), 9);
        this.#createRevoluteJoints(new RAPIER.Vector3(20.0, 0.0, 0.0), 3);
        this.#createBallJoints(9);

    }


    override updateFromGui() {

        if (this.needsUpdate()) {

            // @TODO implement Pyramid settings

            super.updateFromGui();
        }

    }


    override defaultSettings() {

        const r: ApgRpr_H0_Joints_ISimulationSettings = {

            ...super.defaultSettings(),

        }

        r.cameraPosition.eye.x = 15;
        r.cameraPosition.eye.y = 5;
        r.cameraPosition.eye.z = 42;
        r.cameraPosition.target.x = 13;
        r.cameraPosition.target.y = 1;
        r.cameraPosition.target.z = 1;

        return r;
    }

    #createPrismaticJoints(
        origin: RAPIER.Vector3,
        num: number,
    ) {
        const rad = 0.4;
        const shift = 1.0;

        const groundDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
            origin.x,
            origin.y,
            origin.z,
        );

        let currParent = this.world.createRigidBody(groundDesc);
        const colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
        this.world.createCollider(colliderDesc, currParent);


        for (let i = 0; i < num; ++i) {
            let z = origin.z + (i + 1) * shift;
            const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
                origin.x,
                origin.y,
                z,
            );
            const currChild = this.world.createRigidBody(rigidBodyDesc);
            const colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
            this.world.createCollider(colliderDesc, currChild);

            let axis;

            if (i % 2 == 0) {
                axis = new RAPIER.Vector3(1.0, 1.0, 0.0);
            } else {
                axis = new RAPIER.Vector3(-1.0, 1.0, 0.0);
            }

            z = new RAPIER.Vector3(0.0, 0.0, 1.0);
            const prism = RAPIER.JointData.prismatic(
                new RAPIER.Vector3(0.0, 0.0, 0.0),
                new RAPIER.Vector3(0.0, 0.0, -shift),
                axis,
            );
            // @NOTE seems that the d.ts file is not updated
            prism.limitsEnabled = true;
            prism.limits = [-2.0, 2.0];
            this.world.createImpulseJoint(prism, currParent, currChild, true);

            currParent = currChild;
        }
    }

    #createRevoluteJoints(
        origin: RAPIER.Vector3,
        num: number,
    ) {
        const rad = 0.4;
        const shift = 2.0;

        const groundDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
            origin.x,
            origin.y,
            0.0,
        );
        let currParent = this.world.createRigidBody(groundDesc);
        const colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
        this.world.createCollider(colliderDesc, currParent);


        for (let i = 0; i < num; ++i) {
            // Create four bodies.
            let z = origin.z + i * shift * 2.0 + shift;

            const positions = [
                new RAPIER.Vector3(origin.x, origin.y, z),
                new RAPIER.Vector3(origin.x + shift, origin.y, z),
                new RAPIER.Vector3(origin.x + shift, origin.y, z + shift),
                new RAPIER.Vector3(origin.x, origin.y, z + shift),
            ];

            const parents = [currParent, currParent, currParent, currParent];

            for (let k = 0; k < 4; ++k) {
                const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
                    positions[k].x,
                    positions[k].y,
                    positions[k].z,
                );
                const rigidBody = this.world.createRigidBody(rigidBodyDesc);
                const colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
                this.world.createCollider(colliderDesc, rigidBody);

                parents[k] = rigidBody;
            }

            // Setup four joints.
            const o = new RAPIER.Vector3(0.0, 0.0, 0.0);
            const x = new RAPIER.Vector3(1.0, 0.0, 0.0);
            z = new RAPIER.Vector3(0.0, 0.0, 1.0);

            const revs = [
                RAPIER.JointData.revolute(
                    o,
                    new RAPIER.Vector3(0.0, 0.0, -shift),
                    z,
                ),
                RAPIER.JointData.revolute(
                    o,
                    new RAPIER.Vector3(-shift, 0.0, 0.0),
                    x,
                ),
                RAPIER.JointData.revolute(
                    o,
                    new RAPIER.Vector3(0.0, 0.0, -shift),
                    z,
                ),
                RAPIER.JointData.revolute(
                    o,
                    new RAPIER.Vector3(shift, 0.0, 0.0),
                    x,
                ),
            ];

            this.world.createImpulseJoint(revs[0], currParent, parents[0], true);
            this.world.createImpulseJoint(revs[1], parents[0], parents[1], true);
            this.world.createImpulseJoint(revs[2], parents[1], parents[2], true);
            this.world.createImpulseJoint(revs[3], parents[2], parents[3], true);

            currParent = parents[3];
        }
    }

    #createFixedJoints(
        origin: RAPIER.Vector3,
        num: number,
    ) {
        const rad = 0.4;
        const shift = 1.0;
        const parents = [];

        for (let k = 0; k < num; ++k) {
            for (let i = 0; i < num; ++i) {
                const fk = k;
                const fi = i;

                // NOTE: the num - 2 test is to avoid two consecutive
                // fixed bodies. Because physx will crash if we add
                // a joint between these.
                let bodyType: string;

                if (i == 0 && ((k % 4 == 0 && k != num - 2) || k == num - 1)) {
                    bodyType = RAPIER.RigidBodyType.Fixed;
                } else {
                    bodyType = RAPIER.RigidBodyType.Dynamic;
                }

                const rigidBody = new RAPIER.RigidBodyDesc(bodyType).setTranslation(
                    origin.x + fk * shift,
                    origin.y,
                    origin.z + fi * shift,
                );
                const child = this.world.createRigidBody(rigidBody);
                const colliderDesc = RAPIER.ColliderDesc.ball(rad);
                this.world.createCollider(colliderDesc, child);

                // Vertical joint.
                if (i > 0) {
                    const parent = parents[parents.length - 1];
                    const params = RAPIER.JointData.fixed(
                        new RAPIER.Vector3(0.0, 0.0, 0.0),
                        new RAPIER.Quaternion(0.0, 0.0, 0.0, 1.0),
                        new RAPIER.Vector3(0.0, 0.0, -shift),
                        new RAPIER.Quaternion(0.0, 0.0, 0.0, 1.0),
                    );

                    this.world.createImpulseJoint(params, parent, child, true);
                }

                // Horizontal joint.
                if (k > 0) {
                    const parent_index = parents.length - num;
                    const parent = parents[parent_index];
                    const params = RAPIER.JointData.fixed(
                        new RAPIER.Vector3(0.0, 0.0, 0.0),
                        new RAPIER.Quaternion(0.0, 0.0, 0.0, 1.0),
                        new RAPIER.Vector3(-shift, 0.0, 0.0),
                        new RAPIER.Quaternion(0.0, 0.0, 0.0, 1.0),
                    );

                    this.world.createImpulseJoint(params, parent, child, true);
                }

                parents.push(child);
            }
        }
    }


    #createBallJoints(
        num: number,
    ) {
        const rad = 0.4;
        const shift = 1.0;
        const parents = [];

        for (let k = 0; k < num; ++k) {
            for (let i = 0; i < num; ++i) {
                const fk = k;
                const fi = i;

                let bodyType: string;

                if (i == 0 && (k % 4 == 0 || k == num - 1)) {
                    bodyType = RAPIER.RigidBodyType.Fixed;
                } else {
                    bodyType = RAPIER.RigidBodyType.Dynamic;
                }

                const bodyDesc = new RAPIER.RigidBodyDesc(bodyType).setTranslation(
                    fk * shift,
                    0.0,
                    fi * shift,
                );
                const child = this.world.createRigidBody(bodyDesc);
                const colliderDesc = RAPIER.ColliderDesc.ball(rad);
                this.world.createCollider(colliderDesc, child);

                // Vertical joint.
                const o = new RAPIER.Vector3(0.0, 0.0, 0.0);

                if (i > 0) {
                    const parent = parents[parents.length - 1];
                    const params = RAPIER.JointData.spherical(
                        o,
                        new RAPIER.Vector3(0.0, 0.0, -shift),
                    );
                    this.world.createImpulseJoint(params, parent, child, true);
                }

                // Horizontal joint.
                if (k > 0) {
                    const parent_index = parents.length - num;
                    const parent = parents[parent_index];
                    const params = RAPIER.JointData.spherical(
                        o,
                        new RAPIER.Vector3(-shift, 0.0, 0.0),
                    );
                    this.world.createImpulseJoint(params, parent, child, true);
                }

                parents.push(child);
            }
        }
    }

}



class ApgRpr_H0_Joints_GuiBuilder extends ApgRpr_Simulation_GuiBuilder {

    private _guiSettings: ApgRpr_H0_Joints_ISimulationSettings;


    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_H0_Joints_ISimulationSettings;
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

