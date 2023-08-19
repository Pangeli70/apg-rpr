/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomCanvas, IApgDomElement,
    IApgDomImage, IApgDomRange,
    IApgDomSelect
} from "../ApgDom.ts";
import { ApgGui_IMinMaxStep, ApgGui } from "../ApgGui.ts";
import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRpr_eSimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";



export interface ApgRprSim_PngTerrain_IGuiSettings extends ApgRprSim_IGuiSettings {

    heightMap: string;
    heightMaps: string[];


    sampleSize: number;
    sampleSizeMMS: ApgGui_IMinMaxStep;


    mapHeight: number;
    mapHeightMMS: ApgGui_IMinMaxStep;

}

export class ApgRprSim_PngTerrain extends ApgRprSim_Base {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {

        super(asimulator, aparams);

        const settings = this.params.guiSettings! as ApgRprSim_PngTerrain_IGuiSettings;

        this.buildGui(ApgRprSim_PngTerrain_GuiBuilder);

        this.#createWorld(settings);

        // @NOTE from this point we are asyncronous since we depend from load image
        // TODO Manage asyncronicity from the beginning using async -- APG 20230819
    }


    #createWorld(asettings: ApgRprSim_PngTerrain_IGuiSettings) {

        const pngResourceUrl = './assets/img/png/' + asettings.heightMap + '.png';

        const image = this.simulator.document.createElement('img') as IApgDomImage;
        image.src = pngResourceUrl;

        image.onload = () => {

            const pixels = this.#sampleImagePixels(image, asettings.sampleSize, asettings.sampleSize);

            const heightMap = this.generateHeightMap(
                asettings.sampleSize, asettings.sampleSize,
                100, asettings.mapHeight, 100,
                pixels
            );

            const heightMap1 = this.generateRandomHeightMap(
                'Pippo',
                asettings.sampleSize, asettings.sampleSize,
                100, asettings.mapHeight, 100,
            )

            // Create Trimesh ground
            const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
            const groundBody = this.world.createRigidBody(groundBodyDesc);
            const groundColliderDesc = RAPIER.ColliderDesc
                .trimesh(heightMap.vertices, heightMap.indices);
            this.world.createCollider(groundColliderDesc, groundBody);

            this.#buildDynamicColliders();


            // @NOTE From here is the usual syncronous flow 
            this.simulator.addWorld(this.world);


            if (!this.params.restart) {
                this.simulator.resetCamera(asettings.cameraPosition);
            }
            else {
                this.params.restart = false;
            }

            this.simulator.setPreStepAction(() => { this.updateFromGui(); });

        };

    }


    #sampleImagePixels(image: IApgDomImage, awidthXDivisions: number, adepthZDivisions: number) {

        const pixels: number[] = [];
        const canvas = this.simulator.document.createElement('canvas') as IApgDomCanvas;
        this.simulator.document.body.appendChild(canvas);

        canvas.width = awidthXDivisions + 1;
        canvas.height = adepthZDivisions + 1;

        const context = canvas.getContext('2d');
        context.drawImage(image as unknown as IApgDomCanvas,
            0, 0, +canvas.width, +canvas.height,
   //         0, 0, +image.width, +image.height,
        );

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

        for (let y = 0; y < canvas.height; y++) {

            for (let x = 0; x < canvas.width; x++) {

                const i = x + (y * canvas.width) * 4;

                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const _a = imageData[i + 3];

                const white = (r + g + b) / 3;
                const height = white / 255

                pixels.push(height);
            }

        }
        return pixels;
    }


    #buildDynamicColliders() {
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

            // TODO implement Png terrain settings

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: ApgRprSim_PngTerrain_IGuiSettings = {

            ...super.defaultGuiSettings(),

            heightMap: 'HeigthMap1',
            heightMaps: ['HeigthMap1', 'HeigthMap2'],

            sampleSize: 50,
            sampleSizeMMS: {
                min: 10,
                max: 100,
                step: 5
            },

            mapHeight: 5,
            mapHeightMMS: {
                min: 1,
                max: 25,
                step: 1
            },
        }
        return r;
    }


}


export class ApgRprSim_PngTerrain_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_PngTerrain_IGuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_PngTerrain_IGuiSettings;
    }


    override buildHtml() {

        const latticeGroupControl = this.#buildLatticeGroupControl();

        const simControls = super.buildHtml();

        const r = this.buildPanelControl(
            "ApgRprSimPngTerrainSettingsPanel",
            ApgRpr_eSimulationName.G_PNG_MESH_TERRAIN,
            [
                latticeGroupControl,
                simControls
            ]
        );

        return r;

    }


    #buildLatticeGroupControl() {
        const keyValues = new Map<string, string>();
        for (const map of this.guiSettings.heightMaps) {
            keyValues.set(map, map);
        }

        const MAP_SELECT_CNT = 'mapSelectControl';
        const simulationSelectControl = this.buildSelectControl(
            MAP_SELECT_CNT,
            'Map',
            this.guiSettings.heightMap,
            keyValues,
            () => {
                const select = this.gui.controls.get(MAP_SELECT_CNT)!.element as IApgDomSelect;
                this.guiSettings.heightMap = select.value
                this.params.restart = true;
                //alert(select.value);
            }
        );

        const SAMPLES_SIZE_CNT = 'samplesSizeControl';
        const samplesSizeControl = this.buildRangeControl(
            SAMPLES_SIZE_CNT,
            'Samples',
            this.guiSettings.sampleSize,
            this.guiSettings.sampleSizeMMS.min,
            this.guiSettings.sampleSizeMMS.max,
            this.guiSettings.sampleSizeMMS.step,
            () => {
                const range = this.gui.controls.get(SAMPLES_SIZE_CNT)!.element as IApgDomRange;
                this.guiSettings.sampleSize = parseFloat(range.value);
                const output = this.gui.controls.get(`${SAMPLES_SIZE_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const MAP_HEIGHT_CNT = 'mapHeightControl';
        const mapHeightControl = this.buildRangeControl(
            MAP_HEIGHT_CNT,
            'Height',
            this.guiSettings.mapHeight,
            this.guiSettings.mapHeightMMS.min,
            this.guiSettings.mapHeightMMS.max,
            this.guiSettings.mapHeightMMS.step,
            () => {
                const range = this.gui.controls.get(MAP_HEIGHT_CNT)!.element as IApgDomRange;
                this.guiSettings.mapHeight = parseFloat(range.value);
                const output = this.gui.controls.get(`${MAP_HEIGHT_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const r = this.buildGroupControl(
            "samplingGroupControl",
            "Sampling:",
            [
                simulationSelectControl,
                samplesSizeControl,
                mapHeightControl,
            ]

        );
        return r;
    }


}





