/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomElement,
    IApgDomRange,
    IApgDomSelect
} from "../ApgDom.ts";

import {
    ApgGui,
    ApgGui_IMinMaxStep
} from "../ApgGui.ts";

import {
    RAPIER
} from "../ApgRpr_Deps.ts";

import {
    ApgRprSim_GuiBuilder
} from "../ApgRprSim_GuiBuilder.ts";


import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSim_Base.ts";

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


interface ApgRprSim_Fountain_IGuiSettings extends ApgRprSim_IGuiSettings {

    isBodiesGroupOpened: boolean;

    restitution: number;
    restitutionMMS: ApgGui_IMinMaxStep;


    isGroundGroupOpened: boolean;
    groundType: ApgRprSim_Fountain_eGroundType;
    groundTypes: ApgRprSim_Fountain_eGroundType[];

}


export class ApgRprSim_Fountain extends ApgRprSim_Base {

    spawnCounter: number;

    readonly SPAWN_EVERY_N_STEPS = 5;
    readonly MAX_RIGID_BODIES = 400;

    bodiesPool: RAPIER.RigidBody[] = [];


    constructor(asimulator: ApgRpr_Simulator, aparams: IApgRprSim_Params) {

        super(asimulator, aparams);

        this.spawnCounter = 0;

        this.buildGui(ApgRprSim_Fountain_GuiBuilder);

        const settings = this.params.guiSettings as ApgRprSim_Fountain_IGuiSettings;
        this.#createWorld(settings);
        asimulator.addWorld(this.world);

        if (!this.params.restart) {
            asimulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        asimulator.setPreStepAction(() => {
            this.#spawnRandomBody(asimulator);
            this.updateFromGui();
        });
    }


    #createWorld(asettings: ApgRprSim_Fountain_IGuiSettings) {

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

        const settings = this.params.guiSettings as ApgRprSim_Fountain_IGuiSettings;

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

            // TODO implement Fountain settings

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: ApgRprSim_Fountain_IGuiSettings = {

            ...super.defaultGuiSettings(),

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


export class ApgRprSim_Fountain_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_Fountain_IGuiSettings;

    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_Fountain_IGuiSettings;
    }


    override buildPanel() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const bodiesGroupControl = this.#buildBodiesGroupControl();
        const groundGroupControl = this.#buildGroundGroupControl();

        const simControls = super.buildPanel();

        const r = this.buildPanelControl(
            `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
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
            this.guiSettings.restitution,
            this.guiSettings.restitutionMMS,
            () => {
                const range = this.gui.controls.get(BODIES_REST_CNT)!.element as IApgDomRange;
                this.guiSettings.restitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${BODIES_REST_CNT}Value`)!.element as IApgDomElement;
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
            this.guiSettings.isBodiesGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.guiSettings.isBodiesGroupOpened = !this.guiSettings.isBodiesGroupOpened;
                    this.gui.logNoTime('Bodies group toggled')
                }
            }
        );
        return r;
    }


    #buildGroundGroupControl() {
        const keyValues = new Map<string, string>();
        for (const ground of this.guiSettings.groundTypes) {
            keyValues.set(ground, ground);
        }
        const GROUND_SELECT_CNT = 'patternSelectControl';
        const groundSelectControl = this.buildSelectControl(
            GROUND_SELECT_CNT,
            'Type',
            this.guiSettings.groundType,
            keyValues,
            () => {
                const select = this.gui.controls.get(GROUND_SELECT_CNT)!.element as IApgDomSelect;
                this.guiSettings.groundType = select.value as ApgRprSim_Fountain_eGroundType;
                this.params.restart = true;
            }
        );

        const r = this.buildDetailsControl(
            "hroundGroupControl",
            "Ground:",
            [
                groundSelectControl,
            ],
            this.guiSettings.isGroundGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.guiSettings.isGroundGroupOpened = !this.guiSettings.isGroundGroupOpened;
                    this.gui.logNoTime('Ground group toggled')
                }
            }
        );
        return r;
    }


}
