/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/22]
 * -----------------------------------------------------------------------
*/

import { IApgDomElement, IApgDomRange } from "../ApgDom.ts";
import { ApgGui, ApgGui_IMinMaxStep } from "../ApgGui.ts";
import { RAPIER, PRANDO } from "../ApgRprDeps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface ApgRprSim_Column_IGuiSettings extends ApgRprSim_IGuiSettings {

    isCubesGroupOpened: boolean;

    cubesRestitution: number;
    cubesRestitutionMMS: ApgGui_IMinMaxStep;

    blockHeight: number;
    blockHeightMMS: ApgGui_IMinMaxStep;

}


export class ApgRprSim_Column extends ApgRprSim_Base {

    currentCube = 0;
    rng: PRANDO;

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {

        super(asimulator, aparams);

        this.rng = new PRANDO(this.params.simulation);

        const settings = this.params.guiSettings as ApgRprSim_Column_IGuiSettings;

        this.buildGui(ApgRprSim_Column_GuiBuilder);

        this.#createWorld(settings);
        this.simulator.addWorld(this.world);

        if (!this.params.restart) {
            this.simulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => {
            this.#spawnNextCube();
            this.updateFromGui();
        });
    }


    #createWorld(asettings: ApgRprSim_Column_IGuiSettings) {

        // Create Ground.
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(30.0, 0.1, 30.0);
        this.world.createCollider(groundColliderDesc, groundBody);

    }


    #spawnNextCube() {


        const maxHeight = 800.0;
        if (this.currentCube >= maxHeight) {
            this.currentCube = maxHeight;
            return;
        }

        if (this.currentCube % 10 != 0) {
            this.currentCube++;
            return;
        }

        const settings = this.params.guiSettings as ApgRprSim_Column_IGuiSettings;

        // Dynamic cubes layered on top of each other.
        const cubeRadious = 1
        const initial = 4 * settings.blockHeight;

        const x = 0;
        const y = initial + ((this.currentCube / 10) * 2 * settings.blockHeight)
        const z = 0;
        const w = this.rng.next() - 0.5;

        // Create dynamic cube.
        const boxBodyDesc = RAPIER.RigidBodyDesc
            .dynamic()

        const boxBody = this.world.createRigidBody(boxBodyDesc);
        const boxColliderDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, settings.blockHeight, cubeRadious)
            .setTranslation(x, y, z)
            .setRotation({ x: 0, y: 1, z: 0, w })

        const collider = this.world.createCollider(boxColliderDesc, boxBody);
        collider.setRestitution(settings.cubesRestitution);
        collider.setFriction(10);


        this.simulator.viewer.addCollider(collider);
        this.currentCube++;

    }



    override defaultGuiSettings() {

        const r: ApgRprSim_Column_IGuiSettings = {

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


export class ApgRprSim_Column_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_Column_IGuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_Column_IGuiSettings;
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

