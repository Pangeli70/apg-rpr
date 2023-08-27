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
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";



export interface ApgRprSim_PngTerrain_IGuiSettings extends ApgRprSim_IGuiSettings {

    isSamplingGroupOpened: boolean;

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

            const numberOfColumns = asettings.sampleSize;
            const numberOfRows = asettings.sampleSize;
            const scale = new RAPIER.Vector3(200, asettings.mapHeight, 200);

            const heightsPixels = this.#sampleImagePixels(
                image, numberOfColumns, numberOfRows
            );

            const heightsRandom = this.generateRandomField(
                'PNG Terrain', numberOfColumns, numberOfRows
            );

            const heightsSlope = this.generateSlopedField(
                numberOfColumns, numberOfRows
            )

            // Create heightfield ground
            const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
            const groundBody = this.world.createRigidBody(groundBodyDesc);
            const groundColliderDesc = RAPIER.ColliderDesc
                .heightfield(numberOfColumns, numberOfRows, heightsSlope, scale)
                .setTranslation(0, -asettings.mapHeight / 2, 0)
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


    #sampleImagePixels(image: IApgDomImage, anumberOfComumns: number, anumberOfRows: number) {

        const pixels: number[] = [];
        const canvas = this.simulator.document.createElement('canvas') as IApgDomCanvas;
        this.simulator.document.body.appendChild(canvas);

        canvas.width = anumberOfComumns + 1;
        canvas.height = anumberOfRows + 1;

        const context = canvas.getContext('2d');
        context.drawImage(image as unknown as IApgDomCanvas,
            0, 0, canvas.width, canvas.height,

        );

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

        for (let column = 0; column < canvas.width; column++) {

            for (let row = 0; row < canvas.height; row++) {

                const i = ((column * canvas.height) + row) * 4;

                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const _a = imageData[i + 3];

                const white = (r + g + b) / 3;
                const height = white / 255

                pixels.push(height);
            }

        }
        return new Float32Array(pixels);
    }


    #buildDynamicColliders() {
        const num = 4;
        const numy = 10;
        const rad = 1.0;
        const shift = rad * 4.0 + rad;
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

                    const colliderDesc = RAPIER.ColliderDesc.ball(rad);
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

            isSamplingGroupOpened: false,

            heightMap: 'HeigthMap4',
            heightMaps: ['HeigthMap1', 'HeigthMap2', 'HeigthMap3', 'HeigthMap4'],

            sampleSize: 100,
            sampleSizeMMS: {
                min: 10,
                max: 200,
                step: 5
            },

            mapHeight: 10,
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

        const latticeGroupControl = this.#buildSampligGroupControl();

        const simControls = super.buildHtml();

        const r = this.buildPanelControl(
            `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
            this.guiSettings.name,
            [
                latticeGroupControl,
                simControls
            ]
        );

        return r;

    }


    #buildSampligGroupControl() {
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
            ],
            this.guiSettings.isSamplingGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.guiSettings.isSamplingGroupOpened = !this.guiSettings.isSamplingGroupOpened;
                    this.gui.log('Sampling group toggled')
                }
            }

        );
        return r;
    }


}





