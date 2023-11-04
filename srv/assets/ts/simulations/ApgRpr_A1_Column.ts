/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/22]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomElement,
    IApgDomKeyboardEvent,
    IApgDomRange
} from "../ApgDom.ts";

import {
    ApgGui_IMinMaxStep
} from "../ApgGui.ts";

import {
    RAPIER
} from "../ApgRpr_Deps.ts";

import {
    ApgRpr_Simulator_GuiBuilder
} from "../ApgRpr_Simulator_GuiBuilder.ts";

import {
    ApgRpr_ISimulationParams,
    ApgRpr_ISimulationSettings,
    ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";

import {
    ApgRpr_Simulator
} from "../ApgRpr_Simulator.ts";
import { ApgUts } from "../ApgUts.ts";
import { THREE } from "../ApgWgl_Deps.ts";


interface ApgRpr_A1_Column_ISimulationSettings extends ApgRpr_ISimulationSettings {

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


export class ApgRpr_A1_Column_Simulation extends ApgRpr_Simulation {

    private _currentRotation = -1;
    private _rotationDelta = 0;

    private _currentBlock = 0;
    private _maxBlocks = 0;



    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_A1_Column_GuiBuilder);

        const settings = this.params.settings as ApgRpr_A1_Column_ISimulationSettings;
        this.createWorld(settings);
        this.simulator.addWorld(this.world);

        this.simulator.document.onkeyup = (event: IApgDomKeyboardEvent) => {
            if (event.key == " ") {
                this.#spawnNextBlock();
            }
        };

        this.simulator.setPreStepAction(() => {
            this.updateFromGui();
        });
    }



    protected override createWorld(asettings: ApgRpr_A1_Column_ISimulationSettings) {

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

        const settings = this.params.settings as ApgRpr_A1_Column_ISimulationSettings;

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
        const w = this.rng.next() * (Math.PI / 2);
        // const w = ApgRprUtils.Round(this._currentRotation, -3);
        // ApgUts.Assert(
        //     Math.abs(w) <= 1,
        //     'Rotation of quaternion greater than 1! In Rapier this is not allowed!'
        // );

        this.logger.log(`Added block n°:${this._currentBlock}`, ApgRpr_Simulation.RPR_SIMULATION_NAME);


        const q = new THREE.Quaternion();
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), w);
        // Create dynamic cube.
        const boxBodyDesc = RAPIER.RigidBodyDesc
            .dynamic()
            .setRotation(q)
        const boxBody = this.world
            .createRigidBody(boxBodyDesc);

        const boxColliderDesc = RAPIER.ColliderDesc.cuboid(cubeRadious, settings.blockHeight / 2, cubeRadious)
            .setTranslation(x, y, z)
            .setFriction(settings.blocksFriction)
            .setRestitution(settings.blocksRestitution);
        const collider = this.world
            .createCollider(boxColliderDesc, boxBody);

        this.simulator.viewer.addCollider(collider);

        this._currentBlock++;
        this._currentRotation += this._rotationDelta;

    }



    override updateFromGui() {

        const settings = this.params.settings as ApgRpr_A1_Column_ISimulationSettings;

        if (this.needsUpdate()) {

            if (settings.addBlockPressed) {
                this.#spawnNextBlock();
                settings.addBlockPressed = false;
            }

            super.updateFromGui();
        }

    }



    override defaultSettings() {

        const r: ApgRpr_A1_Column_ISimulationSettings = {

            ...super.defaultSettings(),

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



class ApgRpr_A1_Column_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {

    private _guiSettings: ApgRpr_A1_Column_ISimulationSettings;

    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_A1_Column_ISimulationSettings;
    }



    override buildControls() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const cubesGroupControl = this.#buildCubesGroupControl();

        const simControls = super.buildControls();

        const r = this.buildPanelControl(
            `ApgRprSim_${this._guiSettings.simulation}_SettingsPanelId`,
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
                this._guiSettings.addBlockPressed = true;
            }
        )


        const BLOCKS_REST_CNT = 'blocksRestitutionControl';
        const blocksRestitutionControl = this.buildRangeControl(
            BLOCKS_REST_CNT,
            'Restitution',
            this._guiSettings.blocksRestitution,
            this._guiSettings.blocksRestitutionMMS,
            () => {
                const range = this.gui.controls.get(BLOCKS_REST_CNT)!.element as IApgDomRange;
                this._guiSettings.blocksRestitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${BLOCKS_REST_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const BLOCKS_FRIC_CNT = 'blocksFrictionControl';
        const blocksFrictionControl = this.buildRangeControl(
            BLOCKS_FRIC_CNT,
            'Friction',
            this._guiSettings.blocksFriction,
            this._guiSettings.blocksFrictionMMS,
            () => {
                const range = this.gui.controls.get(BLOCKS_FRIC_CNT)!.element as IApgDomRange;
                this._guiSettings.blocksFriction = parseFloat(range.value);
                const output = this.gui.controls.get(`${BLOCKS_FRIC_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const COL_NUM_BLKS_CNT = 'columnNumBlocksControl';
        const columnNumBlocksControl = this.buildRangeControl(
            COL_NUM_BLKS_CNT,
            'Number',
            this._guiSettings.numBlocks,
            this._guiSettings.numBlocksMMS,
            () => {
                const range = this.gui.controls.get(COL_NUM_BLKS_CNT)!.element as IApgDomRange;
                this._guiSettings.numBlocks = parseFloat(range.value);
                const output = this.gui.controls.get(`${COL_NUM_BLKS_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const COL_BLK_HGT_CNT = 'columnCubeHeightControl';
        const columnBlockHeightControl = this.buildRangeControl(
            COL_BLK_HGT_CNT,
            'Height',
            this._guiSettings.blockHeight,
            this._guiSettings.blockHeightMMS,
            () => {
                const range = this.gui.controls.get(COL_BLK_HGT_CNT)!.element as IApgDomRange;
                this._guiSettings.blockHeight = parseFloat(range.value);
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
            this._guiSettings.isCubesGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this._guiSettings.isCubesGroupOpened = !this._guiSettings.isCubesGroupOpened;
                    this.gui.logNoTime('Blocks group toggled')
                }
            }

        );
        return r;
    }


}

