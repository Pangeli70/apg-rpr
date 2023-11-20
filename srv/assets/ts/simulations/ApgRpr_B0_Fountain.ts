/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    ApgGui_IElement,
    ApgGui_IRange,
    ApgGui_ISelect
} from "../apg-gui/lib/interfaces/ApgGui_Dom.ts";

import {
    ApgGui_IMinMaxStep
} from "../apg-gui/lib/classes/ApgGui.ts";

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



enum ApgRprSim_Fountain_eGroundType {
    CYL = 'Cylinder',
    CONE = 'Cone',
    CUB = 'Cuboid',
    SHF = 'Sloped heightfield',
    RHF = 'Random heightfield',
}



interface ApgRpr_B0_Fountain_ISimulationSettings extends ApgRpr_ISimulationSettings {

    isBodiesGroupOpened: boolean;

    restitution: number;
    restitutionMMS: ApgGui_IMinMaxStep;

    isGroundGroupOpened: boolean;
    groundType: ApgRprSim_Fountain_eGroundType;
    groundTypes: ApgRprSim_Fountain_eGroundType[];

}



export class ApgRpr_B0_Fountain_Simulation extends ApgRpr_Simulation {

    spawnCounter: number;

    readonly SPAWN_EVERY_N_STEPS = 5;
    readonly MAX_RIGID_BODIES = 400;

    bodiesPool: RAPIER.RigidBody[] = [];


    constructor(asimulator: ApgRpr_Simulator, aparams: ApgRpr_ISimulationParams) {

        super(asimulator, aparams);

        this.spawnCounter = 0;

        this.buildGui(ApgRpr_B0_Fountain_GuiBuilder);

        const settings = this.params.settings as ApgRpr_B0_Fountain_ISimulationSettings;
        this.createWorld(settings);
        asimulator.addWorld(this.world);

        asimulator.setPreStepAction(() => {
            this.#spawnRandomBody(asimulator);
            this.updateFromGui();
        });
    }



    protected override createWorld(asettings: ApgRpr_B0_Fountain_ISimulationSettings) {

        const rad = 40;

        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundBodyDesc);

        if (asettings.groundType == ApgRprSim_Fountain_eGroundType.CUB) {
            const cuboidGroundColliderDesc = RAPIER.ColliderDesc
                .cuboid(rad, 1, rad)
                .setTranslation(0.0, -0.5, 0.0);
            this.world.createCollider(cuboidGroundColliderDesc, groundBody);
        }

        if (asettings.groundType == ApgRprSim_Fountain_eGroundType.CYL) {
            const cylGroundColliderDesc = RAPIER.ColliderDesc
                .cylinder(1, rad)
                .setTranslation(0.0, -0.5, 0.0);
            this.world.createCollider(cylGroundColliderDesc, groundBody);
        }

        if (asettings.groundType == ApgRprSim_Fountain_eGroundType.SHF) {
            const numberOfColumns = 5;
            const numberOfRows = 5;
            const scalesVector = new RAPIER.Vector3(rad * 2, rad / 10, rad * 2)
            const field = this.generateSlopedHeightFieldArray(numberOfColumns, numberOfRows);
            const heightFieldGroundColliderDesc = RAPIER.ColliderDesc
                .heightfield(numberOfColumns, numberOfRows, field, scalesVector)
                .setTranslation(0.0, -rad / 20, 0.0);
            this.world.createCollider(heightFieldGroundColliderDesc, groundBody);
        }

        if (asettings.groundType == ApgRprSim_Fountain_eGroundType.RHF) {
            const numberOfColumns = 20;
            const numberOfRows = 20;
            const scalesVector = new RAPIER.Vector3(rad * 2, rad / 10, rad * 2)
            const field = this.generateRandomHeightFieldArray('fountain', numberOfColumns, numberOfRows);
            const heightFieldGroundColliderDesc = RAPIER.ColliderDesc
                .heightfield(numberOfColumns, numberOfRows, field, scalesVector)
                .setTranslation(0.0, -rad / 20, 0.0);
            this.world.createCollider(heightFieldGroundColliderDesc, groundBody);
        }

        const coneRad = (asettings.groundType == ApgRprSim_Fountain_eGroundType.CONE) ?
            rad : rad / 10;
        const coneGroundColliderDesc = RAPIER.ColliderDesc
            .cone(4, coneRad)
            .setTranslation(0.0, 4, 0.0);
        this.world.createCollider(coneGroundColliderDesc, groundBody);


    }



    #spawnRandomBody(asimulator: ApgRpr_Simulator) {

        const settings = this.params.settings as ApgRpr_B0_Fountain_ISimulationSettings;

        if (this.spawnCounter < this.SPAWN_EVERY_N_STEPS) {
            this.spawnCounter++;
            return;
        }

        this.spawnCounter = 0;
        const rad = 1.0;

        const j = this.rng.nextInt(0, 4);

        const bodyDesc = RAPIER.RigidBodyDesc
            .dynamic()
            .setTranslation(0.0, 10.0, 0.0)
            .setLinvel(0.0, 15.0, 0.0)
            .setCcdEnabled(false)
        const body = this.world.createRigidBody(bodyDesc);

        let colliderDesc;
        switch (j) {
            case 0:
                colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
                break;
            case 1:
                colliderDesc = RAPIER.ColliderDesc.ball(rad);
                break;
            case 2:
                colliderDesc = RAPIER.ColliderDesc.roundCylinder(rad, rad, rad / 10.0);
                break;
            case 3:
                colliderDesc = RAPIER.ColliderDesc.cone(rad, rad);
                break;
            case 4:
                colliderDesc = RAPIER.ColliderDesc.capsule(rad, rad);
                break;
        }

        if (j == 5) {
            alert('Value 5 is not allowed');
            return;
        }
        const collider = this.world.createCollider(colliderDesc, body);
        collider.setRestitution(settings.restitution);

        asimulator.viewer.addCollider(collider);

        this.bodiesPool.push(body);

        // We reached the max number, delete the oldest rigid-body.
        // The collider remains in the world!!
        if (this.bodiesPool.length > this.MAX_RIGID_BODIES) {
            const rb = this.bodiesPool[0];
            this.world.removeRigidBody(rb);
            asimulator.viewer.removeRigidBody(rb);
            this.bodiesPool.shift();
        }
    }



    override updateFromGui() {

        if (this.needsUpdate()) {

            // @TODO implement Fountain settings

            super.updateFromGui();
        }

    }



    override defaultSettings() {

        const r: ApgRpr_B0_Fountain_ISimulationSettings = {

            ...super.defaultSettings(),

            isBodiesGroupOpened: false,

            restitution: 0.25,
            restitutionMMS: {
                min: 0.05,
                max: 1.0,
                step: 0.05
            },

            isGroundGroupOpened: false,

            groundType: ApgRprSim_Fountain_eGroundType.CUB,
            groundTypes: Object.values(ApgRprSim_Fountain_eGroundType),

        }
        return r;
    }

}



class ApgRpr_B0_Fountain_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {

    private _guiSettings: ApgRpr_B0_Fountain_ISimulationSettings;

    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_B0_Fountain_ISimulationSettings;
    }


    override buildControls() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const bodiesGroupControl = this.#buildBodiesGroupControl();
        const groundGroupControl = this.#buildGroundGroupControl();

        const simControls = super.buildControls();

        const r = this.buildPanelControl(
            `ApgRprSim_${this._guiSettings.simulation}_SettingsPanelId`,
            [
                simulationChangeControl,
                restartSimulationButtonControl,
                bodiesGroupControl,
                groundGroupControl,
                simControls
            ]
        );

        return r;

    }


    #buildBodiesGroupControl() {
        const BODIES_REST_CNT = 'restitutionControl';
        const bodiesRestitutionControl = this.buildRangeControl(
            BODIES_REST_CNT,
            'Restitution',
            this._guiSettings.restitution,
            this._guiSettings.restitutionMMS,
            () => {
                const range = this.gui.controls.get(BODIES_REST_CNT)!.element as ApgGui_IRange;
                this._guiSettings.restitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${BODIES_REST_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const r = this.buildDetailsControl(
            "bodiesGroupControl",
            "Bodies:",
            [
                bodiesRestitutionControl,
            ],
            this._guiSettings.isBodiesGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this._guiSettings.isBodiesGroupOpened = !this._guiSettings.isBodiesGroupOpened;
                    this.gui.logNoTime('Bodies group toggled')
                }
            }
        );
        return r;
    }



    #buildGroundGroupControl() {

        const keyValues = new Map<string, string>();
        for (const ground of this._guiSettings.groundTypes) {
            keyValues.set(ground, ground);
        }
        const GROUND_SELECT_CNT = 'patternSelectControl';
        const groundSelectControl = this.buildSelectControl(
            GROUND_SELECT_CNT,
            'Type',
            this._guiSettings.groundType,
            keyValues,
            () => {
                const select = this.gui.controls.get(GROUND_SELECT_CNT)!.element as ApgGui_ISelect;
                this._guiSettings.groundType = select.value as ApgRprSim_Fountain_eGroundType;
                this._guiSettings.doRestart = true;
            }
        );

        const r = this.buildDetailsControl(
            "hroundGroupControl",
            "Ground:",
            [
                groundSelectControl,
            ],
            this._guiSettings.isGroundGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this._guiSettings.isGroundGroupOpened = !this._guiSettings.isGroundGroupOpened;
                    this.gui.logNoTime('Ground group toggled')
                }
            }
        );
        return r;
    }


}
