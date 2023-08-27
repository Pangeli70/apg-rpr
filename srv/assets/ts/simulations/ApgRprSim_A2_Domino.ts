/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/22]
 * -----------------------------------------------------------------------
*/

import { IApgDomElement, IApgDomKeyboardEvent, IApgDomRange } from "../ApgDom.ts";
import { ApgGui, ApgGui_IMinMaxStep } from "../ApgGui.ts";
import { RAPIER, PRANDO } from "../ApgRprDeps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface ApgRprSim_Domino_IGuiSettings extends ApgRprSim_IGuiSettings {

    isCubesGroupOpened: boolean;

    cubesRestitution: number;
    cubesRestitutionMMS: ApgGui_IMinMaxStep;

    blockHeight: number;
    blockHeightMMS: ApgGui_IMinMaxStep;

}


export class ApgRprSim_Domino extends ApgRprSim_Base {

    currentCube = 0;

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {

        super(asimulator, aparams);

        const settings = this.params.guiSettings as ApgRprSim_Domino_IGuiSettings;

        this.buildGui(ApgRprSim_Domino_GuiBuilder);

        this.#createWorld(settings);
        this.simulator.addWorld(this.world);

        if (!this.params.restart) {
            this.simulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => {
            this.updateFromGui();
        });
    }


    #createWorld(asettings: ApgRprSim_Domino_IGuiSettings) {

        const rng = new PRANDO('Domino');

        // Create Ground.
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(30.0, 0.1, 30.0);
        this.world.createCollider(groundColliderDesc, groundBody);

        this.simulator.document.onkeyup = (event: IApgDomKeyboardEvent) => {
            if (event.key == " ") {
                this.#throwBall();
            }
        };

        const shift = 2;
        const width = 1;
        const depth = 0.5;
        const height = 2.0;
        const blocks = 40;

        for (let i = 0; i < blocks; ++i) {

            const x = rng.next() * 40 - 40 / 2;
            const y = shift + height / 2
            const z = rng.next() * 40 - 40 / 2;
            const w = rng.next() - 1;
            // Create dynamic cube.
            const boxBodyDesc = RAPIER.RigidBodyDesc
                .dynamic()
                .setTranslation(x, y, z)
                .setRotation({ x: 0, y: 1, z: 0, w })
            const boxBody = this.world.createRigidBody(boxBodyDesc);
            const boxColliderDesc = RAPIER.ColliderDesc.cuboid(width, height, depth);
            this.world.createCollider(boxColliderDesc, boxBody)
                .setRestitution(asettings.cubesRestitution);

        }
    }


    #throwBall() {

        const target = this.simulator.viewer.controls.target.clone();
        target.x = Math.round(target.x * 100) / 100;
        target.y = Math.round(target.y * 100) / 100;
        target.z = Math.round(target.z * 100) / 100;

        const source = target.clone();
        this.simulator.viewer.controls.object.getWorldPosition(source);
        source.x = Math.round(source.x * 100) / 100;
        source.y = Math.round(source.y * 100) / 100;
        source.z = Math.round(source.z * 100) / 100;

        const dist = source.clone();
        dist.sub(target).normalize().negate().multiplyScalar(100);
        dist.x = Math.round(dist.x * 100) / 100;
        dist.y = Math.round(dist.y * 100) / 100;
        dist.z = Math.round(dist.z * 100) / 100;

        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(source.x, source.y, source.z)
            .setLinvel(dist.x, dist.y, dist.z)
            .setLinearDamping(0.5)
        const body = this.world.createRigidBody(bodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.ball(1).setDensity(2.0);
        const collider = this.world.createCollider(colliderDesc, body);
        this.simulator.viewer.addCollider(collider);
        this.simulator.gui.log(`Ball spawn s:${source.x},${source.y},${source.z} / t: ${target.x},${target.y},${target.z} / d:${dist.x},${dist.y},${dist.z}`);

    }



    override defaultGuiSettings() {

        const r: ApgRprSim_Domino_IGuiSettings = {

            ...super.defaultGuiSettings(),

            isCubesGroupOpened: false,

            cubesRestitution: 0,
            cubesRestitutionMMS: {
                min: 0.0,
                max: 0.25,
                step: 0.05
            },

            blockHeight: 0.1,
            blockHeightMMS: {
                min: 0.05,
                max: 2,
                step: 0.05
            },

        }

        r.cameraPosition.eye.x = -30;
        r.cameraPosition.eye.y = 20;
        r.cameraPosition.eye.z = -30;

        return r;
    }

}


export class ApgRprSim_Domino_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_Domino_IGuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_Domino_IGuiSettings;
    }


    override buildHtml() {

        const cubesGroupControl = this.#buildCubesGroupControl();

        const simControls = super.buildHtml();

        const r = this.buildPanelControl(
            `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
            this.guiSettings.name,
            [
                cubesGroupControl,
                simControls
            ]
        );

        return r;

    }


    #buildCubesGroupControl() {
        const CUBES_REST_CNT = 'cubesRestitutionControl';
        const cubesRestitutionControl = this.buildRangeControl(
            CUBES_REST_CNT,
            'Restitution',
            this.guiSettings.cubesRestitution,
            this.guiSettings.cubesRestitutionMMS.min,
            this.guiSettings.cubesRestitutionMMS.max,
            this.guiSettings.cubesRestitutionMMS.step,
            () => {
                const range = this.gui.controls.get(CUBES_REST_CNT)!.element as IApgDomRange;
                this.guiSettings.cubesRestitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${CUBES_REST_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const COL_BLK_HGT_CNT = 'columnCubeHeightControl';
        const columnBlockHeightControl = this.buildRangeControl(
            COL_BLK_HGT_CNT,
            'Block height',
            this.guiSettings.blockHeight,
            this.guiSettings.blockHeightMMS.min,
            this.guiSettings.blockHeightMMS.max,
            this.guiSettings.blockHeightMMS.step,
            () => {
                const range = this.gui.controls.get(COL_BLK_HGT_CNT)!.element as IApgDomRange;
                this.guiSettings.blockHeight = parseFloat(range.value);
                const output = this.gui.controls.get(`${COL_BLK_HGT_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const r = this.buildGroupControl(
            "cubesGroupControl",
            "Cubes:",
            [
                cubesRestitutionControl,
                columnBlockHeightControl,
            ],
            this.guiSettings.isCubesGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.guiSettings.isCubesGroupOpened = !this.guiSettings.isCubesGroupOpened;
                    this.gui.log('Cubes group toggled')
                }
            }

        );
        return r;
    }


}

