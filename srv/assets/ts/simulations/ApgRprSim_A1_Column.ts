/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/22]
 * -----------------------------------------------------------------------
*/

import { IApgDomElement, IApgDomKeyboardEvent, IApgDomRange } from "../ApgDom.ts";
import { ApgGui, ApgGui_IMinMaxStep } from "../ApgGui.ts";
import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSim_Base.ts";

import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface ApgRprSim_Column_IGuiSettings extends ApgRprSim_IGuiSettings {

    isCubesGroupOpened: boolean;

    blocksRestitution: number;
    blocksRestitutionMMS: ApgGui_IMinMaxStep;


    blocksFriction: number;
    blocksFrictionMMS: ApgGui_IMinMaxStep;

    numBlocks: number;
    numBlocksMMS: ApgGui_IMinMaxStep;

    blockHeight: number;
    blockHeightMMS: ApgGui_IMinMaxStep;

    addBlockPressed: boolean;


}


export class ApgRprSim_Column extends ApgRprSim_Base {


    private _currentRotation = -1;
    private _rotationDelta = 0;

    private _currentBlock = 0;
    private _maxBlocks = 0;


    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRprSim_Column_GuiBuilder);

        const settings = this.params.guiSettings as ApgRprSim_Column_IGuiSettings;
        this.#createWorld(settings);
        this.simulator.addWorld(this.world);

        if (!this.params.restart) {
            this.simulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.document.onkeyup = (event: IApgDomKeyboardEvent) => {
            if (event.key == " ") {
                this.#spawnNextBlock();
            }
        };

        this.simulator.setPreStepAction(() => {
            this.updateFromGui();
        });
    }


    #createWorld(asettings: ApgRprSim_Column_IGuiSettings) {

        this._rotationDelta = 2 / asettings.numBlocks;
        this._maxBlocks = asettings.numBlocks;

        // Create Ground.
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(30.0, 0.1, 30.0);
        this.world.createCollider(groundColliderDesc, groundBody);

        //this.#spawnNextBlock();
    }


    #spawnNextBlock() {
        const settings = this.params.guiSettings as ApgRprSim_Column_IGuiSettings;

        if (this._currentBlock >= this._maxBlocks) {
            alert('Maximum height reached. If you want more change the parmeters and restart')
            this._currentBlock = this._maxBlocks;
            return;
        }

        // Dynamic blocks layered on top of each other.
        const cubeRadious = 0.5;
        const initial = 4 * settings.blockHeight;

        const x = 0;
        const y = initial + (settings.blockHeight * this._currentBlock);
        const z = 0;
        const w = this.rng.next() - 0.5;
        // const w = ApgRprUtils.Round(this._currentRotation, -3);
        if (Math.abs(w) > 1) {
            const message = 'Rotation of quaternion greater than 1! In Rapier this is not allowed!';
            alert(message);
            throw new Error(message);
        }
        // this.simulator.gui.log(`Rot:${w.toFixed(3)}`);
        this.simulator.gui.log(`Added block n°:${this._currentBlock}`);

        // Create dynamic cube.
        const boxBodyDesc = RAPIER.RigidBodyDesc
            .dynamic()
            .setRotation({ x: 0, y: 1, z: 0, w })

        const boxBody = this.world.createRigidBody(boxBodyDesc);
        const boxColliderDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, settings.blockHeight / 2, cubeRadious)
            .setTranslation(x, y, z)
            .setFriction(settings.blocksFriction)


        const collider = this.world.createCollider(boxColliderDesc, boxBody)
        collider.setRestitution(settings.blocksRestitution);
        this.simulator.viewer.addCollider(collider);

        this._currentBlock++;
        this._currentRotation += this._rotationDelta;

    }


    override updateFromGui() {
        const settings = this.params.guiSettings as ApgRprSim_Column_IGuiSettings;

        if (this.needsUpdate()) {

            if (settings.addBlockPressed) { 
                this.#spawnNextBlock();
                settings.addBlockPressed = false;
            }

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: ApgRprSim_Column_IGuiSettings = {

            ...super.defaultGuiSettings(),

            isCubesGroupOpened: false,

            blocksRestitution: 0.05,
            blocksRestitutionMMS: {
                min: 0.025,
                max: 0.25,
                step: 0.025
            },

            blocksFriction: 1,
            blocksFrictionMMS: {
                min: 0.0,
                max: 2,
                step: 0.25
            },

            numBlocks: 20,
            numBlocksMMS: {
                min: 10,
                max: 100,
                step: 1
            },

            blockHeight: 0.1,
            blockHeightMMS: {
                min: 0.05,
                max: 2,
                step: 0.05
            },

            addBlockPressed: false,

        }

        r.cameraPosition.eye.x = -30;
        r.cameraPosition.eye.y = 20;
        r.cameraPosition.eye.z = -30;

        return r;
    }


}


class ApgRprSim_Column_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_Column_IGuiSettings;

    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_Column_IGuiSettings;
    }


    override buildPanel() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const cubesGroupControl = this.#buildCubesGroupControl();

        const simControls = super.buildPanel();

        const r = this.buildPanelControl(
            `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
            [
                simulationChangeControl,
                restartSimulationButtonControl,
                cubesGroupControl,
                simControls
            ]
        );

        return r;

    }


    #buildCubesGroupControl() {

        const ADD_BLOCK_BTN = 'addBlockControl';
        const addBlockControl = this.buildButtonControl(
            ADD_BLOCK_BTN,
            'Add block',
            () => { 
                this.guiSettings.addBlockPressed = true;
            }
        )


        const BLOCKS_REST_CNT = 'blocksRestitutionControl';
        const blocksRestitutionControl = this.buildRangeControl(
            BLOCKS_REST_CNT,
            'Restitution',
            this.guiSettings.blocksRestitution,
            this.guiSettings.blocksRestitutionMMS,
            () => {
                const range = this.gui.controls.get(BLOCKS_REST_CNT)!.element as IApgDomRange;
                this.guiSettings.blocksRestitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${BLOCKS_REST_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const BLOCKS_FRIC_CNT = 'blocksFrictionControl';
        const blocksFrictionControl = this.buildRangeControl(
            BLOCKS_FRIC_CNT,
            'Friction',
            this.guiSettings.blocksFriction,
            this.guiSettings.blocksFrictionMMS,
            () => {
                const range = this.gui.controls.get(BLOCKS_FRIC_CNT)!.element as IApgDomRange;
                this.guiSettings.blocksFriction = parseFloat(range.value);
                const output = this.gui.controls.get(`${BLOCKS_FRIC_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const COL_NUM_BLKS_CNT = 'columnNumBlocksControl';
        const columnNumBlocksControl = this.buildRangeControl(
            COL_NUM_BLKS_CNT,
            'Number',
            this.guiSettings.numBlocks,
            this.guiSettings.numBlocksMMS,
            () => {
                const range = this.gui.controls.get(COL_NUM_BLKS_CNT)!.element as IApgDomRange;
                this.guiSettings.numBlocks = parseFloat(range.value);
                const output = this.gui.controls.get(`${COL_NUM_BLKS_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const COL_BLK_HGT_CNT = 'columnCubeHeightControl';
        const columnBlockHeightControl = this.buildRangeControl(
            COL_BLK_HGT_CNT,
            'Height',
            this.guiSettings.blockHeight,
            this.guiSettings.blockHeightMMS,
            () => {
                const range = this.gui.controls.get(COL_BLK_HGT_CNT)!.element as IApgDomRange;
                this.guiSettings.blockHeight = parseFloat(range.value);
                const output = this.gui.controls.get(`${COL_BLK_HGT_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const r = this.buildDetailsControl(
            "blocksGroupControl",
            "Blocks:",
            [
                addBlockControl,
                blocksRestitutionControl,
                blocksFrictionControl,
                columnNumBlocksControl,
                columnBlockHeightControl
            ],
            this.guiSettings.isCubesGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.guiSettings.isCubesGroupOpened = !this.guiSettings.isCubesGroupOpened;
                    this.gui.logNoTime('Blocks group toggled')
                }
            }

        );
        return r;
    }


}

