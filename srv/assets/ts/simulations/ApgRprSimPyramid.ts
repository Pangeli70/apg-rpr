/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomElement,
    IApgDomRange
} from "../ApgDom.ts";
import { ApgGui } from "../ApgGui.ts";
import { RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { IApgRpr_CameraPosition } from "../ApgRprInterfaces.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, IApgRprSim_GuiSettings,
    IApgRprSim_Params, IApgRprSim_MinMaxStep
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface IApgRprSimPyramidGuiSettings extends IApgRprSim_GuiSettings {

    cubesRestitution: number;
    cubesRestitutionMMS: IApgRprSim_MinMaxStep;

    size: number;
    sizeMMS: IApgRprSim_MinMaxStep;

}


export class ApgRprSimPyramid extends ApgRprSim_Base {

    constructor(asimulator: ApgRpr_Simulator, aparams: IApgRprSim_Params) {

        super(asimulator, aparams);

        const settings = this.params.guiSettings! as IApgRprSimPyramidGuiSettings;

        const guiBuilder = new ApgRprSimPyramidGuiBuilder(this.simulator.gui, this.params);
        const gui = guiBuilder.build();
        this.simulator.viewer.panels.innerHTML = gui;
        guiBuilder.bindControls();

        this.createWorld(settings);
        this.simulator.addWorld(this.world);

        if (!this.params.restart) {
            const cameraPosition: IApgRpr_CameraPosition = {
                eye: { x: -30, y: 20, z: -30 },
                target: { x: 0, y: 0, z: 0 },
            };
            this.simulator.resetCamera(cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }

    private createWorld(asettings: IApgRprSimPyramidGuiSettings) {

        // Create Ground.
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(30.0, 0.1, 30.0);
        this.world.createCollider(groundColliderDesc, groundBody);

        // Dynamic cubes layered in a pyramid shape.
        const cubeRadious = 0.5;
        const baseSize = asettings.size;

        const shift = cubeRadious * 2.5;
        const center = baseSize * cubeRadious;
        const height = 8.0;

        for (let i = 0; i < baseSize; ++i) {
            for (let j = i; j < baseSize; ++j) {
                for (let k = i; k < baseSize; ++k) {
                    const x = (i * shift) / 2.0 + (k - i) * shift - height * cubeRadious - center;
                    const y = (i * shift * 1.25) + height;
                    const z = (i * shift) / 2.0 + (j - i) * shift - height * cubeRadious - center;
                    // Create dynamic cube.
                    const boxBodyDesc = RAPIER.RigidBodyDesc
                        .dynamic()
                        .setTranslation(x, y, z);
                    const boxBody = this.world.createRigidBody(boxBodyDesc);
                    const boxColliderDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, cubeRadious, cubeRadious);
                    this.world.createCollider(boxColliderDesc, boxBody)
                        .setRestitution(asettings.cubesRestitution);
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

        const r: IApgRprSimPyramidGuiSettings = {

            ...super.defaultGuiSettings(),

            cubesRestitution: 0.5,
            cubesRestitutionMMS: {
                min: 0.05,
                max: 1,
                step: 0.05
            },

            size: 8,
            sizeMMS: {
                min: 5,
                max: 12,
                step: 1
            },

        }
        return r;
    }

}


export class ApgRprSimPyramidGuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: IApgRprSimPyramidGuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as IApgRprSimPyramidGuiSettings;
    }

    override build() {

        const cubesGroupControl = this.#buildCubesGroupControl();

        const simControls = super.build();

        const r = this.buildPanelControl(
            "ApgRprSimPyramidSettingsPanel",
            eApgRpr_SimulationName.A_PYRAMID,
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

        const PYR_SIZE_CNT = 'pyramidSizeControl';
        const pyramidSizeControl = this.buildRangeControl(
            PYR_SIZE_CNT,
            'Size',
            this.guiSettings.size,
            this.guiSettings.sizeMMS.min,
            this.guiSettings.sizeMMS.max,
            this.guiSettings.sizeMMS.step,
            () => {
                const range = this.gui.controls.get(PYR_SIZE_CNT)!.element as IApgDomRange;
                this.guiSettings.size = parseFloat(range.value);
                const output = this.gui.controls.get(`${PYR_SIZE_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const r = this.buildGroupControl(
            "Cubes:",
            [
                cubesRestitutionControl,
                pyramidSizeControl,
            ]

        );
        return r;
    }


}

