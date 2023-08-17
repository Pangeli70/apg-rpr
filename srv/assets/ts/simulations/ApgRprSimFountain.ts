/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { IApgDomElement, IApgDomRange } from "../ApgDom.ts";
import { ApgGui } from "../ApgGui.ts";
import { PRANDO, RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { IApgRpr_CameraPosition } from "../ApgRprInterfaces.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, IApgRprSim_GuiSettings,
    IApgRprSim_Params, IApgRprSim_MinMaxStep
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";



export interface IApgRprSimFountainGuiSettings extends IApgRprSim_GuiSettings{
    
    restitutionMMS: IApgRprSim_MinMaxStep;
    restitution: number;

}


export class ApgRprSimFountain extends ApgRprSim_Base {


    rng: PRANDO;
    spawnCounter: number;

    readonly SPAWN_EVERY_N_STEPS = 5;
    readonly MAX_RIGID_BODIES = 400;

    bodiesPool: RAPIER.RigidBody[] = [];

    constructor(asimulator: ApgRpr_Simulator, aparams: IApgRprSim_Params) {
        super(asimulator, aparams);

        this.rng = new PRANDO('Fountain');
        this.spawnCounter = 0;

        const settings = this.params.guiSettings! as IApgRprSimFountainGuiSettings;

        const guiBuilder = new ApgRprSimFountainGuiBuilder(this.simulator.gui, this.params);
        const gui = guiBuilder.build();
        this.simulator.viewer.panels.innerHTML = gui;
        guiBuilder.bindControls();


        // Create Ground.
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(40.0, 0.1, 40.0);
        this.world.createCollider(groundColliderDesc, groundBody);

        // This will be called every simulation step

        asimulator.addWorld(this.world);

        if (!this.params.restart) {
            const cameraPosition: IApgRpr_CameraPosition = {
                eye: { x: -90, y: 50, z: 80, },
                target: { x: 0.0, y: 10.0, z: 0.0 },
            };
            asimulator.resetCamera(cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        asimulator.setPreStepAction(() => {
            this.spawnRandomBody(asimulator);
            this.updateFromGui();
        });
    }

    spawnRandomBody(asimulator: ApgRpr_Simulator) {

        const settings = this.params.guiSettings! as IApgRprSimFountainGuiSettings;

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
            .setLinvel(0.0, 15.0, 0.0);
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

    override defaultGuiSettings() {

        const r: IApgRprSimFountainGuiSettings = {

            ...super.defaultGuiSettings(),

            restitution: 0.25,
            restitutionMMS: {
                min: 0.05,
                max: 1.0,
                step: 0.05
            }

        }
        return r;
    }
}


export class ApgRprSimFountainGuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: IApgRprSimFountainGuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as IApgRprSimFountainGuiSettings;
    }


    override build() {

        const bodiesGroupControl = this.#buildBodiesGroupControl();

        const simControls = super.build();

        const r = this.buildPanelControl(
            "ApgRprSimFountainSettingsPanel",
            eApgRpr_SimulationName.B_FOUNTAIN,
            [
                bodiesGroupControl,
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
            this.guiSettings.restitutionMMS.min,
            this.guiSettings.restitutionMMS.max,
            this.guiSettings.restitutionMMS.step,
            () => {
                const range = this.gui.controls.get(BODIES_REST_CNT)!.element as IApgDomRange;
                this.guiSettings.restitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${BODIES_REST_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const r = this.buildGroupControl(
            "Bodies:",
            [
                bodiesRestitutionControl,
            ]

        );
        return r;
    }


}
