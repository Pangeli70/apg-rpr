/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/24]
 * -----------------------------------------------------------------------
*/

import {
    ApgGui_IElement,
    ApgGui_IRange
} from "../apg-gui/lib/interfaces/ApgGui_Dom.ts";

import { ApgGui_IMinMaxStep } from "../apg-gui/lib/interfaces/ApgGui_IMinMaxStep.ts";

import {
    RAPIER
} from "../ApgRpr_Deps.ts";

import {
    ApgRpr_Simulator_GuiBuilder
} from "../gui-builders/ApgRpr_Simulation_GuiBuilder.ts";

import {
    ApgRpr_ISimulationParams,
    ApgRpr_ISimulationSettings,
    ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";

import {
    ApgRpr_Simulator
} from "../ApgRpr_Simulator.ts";



interface ApgRpr_A3_Jenga_ISimulationSettings extends ApgRpr_ISimulationSettings {

    isCubesGroupOpened: boolean;

    cubesRestitution: number;
    cubesRestitutionMMS: ApgGui_IMinMaxStep;

    blockWidth: number;
    blockWidthMMS: ApgGui_IMinMaxStep;

    blockLevels: number;
    blockLevelsMMS: ApgGui_IMinMaxStep;

}



export class ApgRpr_A3_Jenga_Simulation extends ApgRpr_Simulation {

    currentCube = 0;

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_A3_Jenga_GuiBuilder);

        const settings = this.params.settings as ApgRpr_A3_Jenga_ISimulationSettings;
        this.createWorld(settings);
        this.simulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => {
            this.updateFromGui();
        });
    }



    override defaultSettings() {

        const r: ApgRpr_A3_Jenga_ISimulationSettings = {

            ...super.defaultSettings(),

            isCubesGroupOpened: false,

            cubesRestitution: 0,
            cubesRestitutionMMS: {
                min: 0.0,
                max: 1.0,
                step: 0.05
            },

            blockWidth: 0.1,
            blockWidthMMS: {
                min: 0.02,
                max: 0.10,
                step: 0.01
            },

            blockLevels: 8,
            blockLevelsMMS: {
                min: 2,
                max: 12,
                step: 1
            },

        }

        return r;
    }

    protected override createWorld(asettings: ApgRpr_A3_Jenga_ISimulationSettings) {

        this.createGround();

        this.createSimulationTable(
            asettings.playground.width,
            asettings.playground.depth,
            asettings.playground.height,
            asettings.playground.thickness
        );

        this.#buildTiles(asettings);
    }



    #buildTiles(asettings: ApgRpr_A3_Jenga_ISimulationSettings) {
        const piecesPerRow = 4;
        const levels = asettings.blockLevels;
        const shift = asettings.playground.height;

        // In THREE world units
        const pieceWidth = asettings.blockWidth;
        const pieceHeight = pieceWidth / 2;
        const pieceDepth = pieceWidth * piecesPerRow;
        const pieceGap = pieceWidth / 10;
        const pieceTolerance = pieceHeight / 5;

        const totalRowWidth = (pieceWidth * piecesPerRow) + (pieceGap * (piecesPerRow - 1));
        const halfRowCenter = (totalRowWidth - pieceWidth) / 2;

        for (let j = 0; j < levels; j++) {

            const y = shift + (j * (pieceHeight + pieceGap * 2));

            for (let i = 0; i < piecesPerRow; i++) {

                const delta = -halfRowCenter + ((pieceWidth + pieceGap) * i);
                let x, z, w, d;
                if (j % 2 == 0) {
                    x = delta;
                    z = 0;
                    w = pieceWidth;
                    d = pieceDepth;
                }
                else {
                    x = 0;
                    z = delta;
                    w = pieceDepth;
                    d = pieceWidth;
                }


                // Create dynamic cube.
                const boxBodyDesc = RAPIER.RigidBodyDesc
                    .dynamic()
                    .setTranslation(x, y, z);
                const boxBody = this.world.createRigidBody(boxBodyDesc);

                const pW = w;
                const pH = pieceHeight + this.rng.next() * pieceTolerance;
                const pD = d;

                const boxColliderDesc = RAPIER.ColliderDesc
                    .cuboid(pW / 2, pH / 2, pD / 2)
                    .setFriction(0.9);
                this.world.createCollider(boxColliderDesc, boxBody)
                    .setRestitution(asettings.cubesRestitution);

            }
        }
    }


}



class ApgRpr_A3_Jenga_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {

    private _guiSettings: ApgRpr_A3_Jenga_ISimulationSettings;



    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_A3_Jenga_ISimulationSettings;
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
        const CUBES_REST_CNT = 'cubesRestitutionControl';
        const cubesRestitutionControl = this.buildRangeControl(
            CUBES_REST_CNT,
            'Restitution',
            this._guiSettings.cubesRestitution,
            this._guiSettings.cubesRestitutionMMS,
            () => {
                const range = this.gui.controls.get(CUBES_REST_CNT)!.element as ApgGui_IRange;
                this._guiSettings.cubesRestitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${CUBES_REST_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const JEN_BLK_WID_CNT = 'jengaBlockWidthControl';
        const jengaBlockWidthControl = this.buildRangeControl(
            JEN_BLK_WID_CNT,
            'Block width',
            this._guiSettings.blockWidth,
            this._guiSettings.blockWidthMMS,
            () => {
                const range = this.gui.controls.get(JEN_BLK_WID_CNT)!.element as ApgGui_IRange;
                this._guiSettings.blockWidth = parseFloat(range.value);
                const output = this.gui.controls.get(`${JEN_BLK_WID_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const JEN_BLK_LEVELS_CNT = 'jengaBlockLevelsControl';
        const jengaBlockLevelsControl = this.buildRangeControl(
            JEN_BLK_LEVELS_CNT,
            'Levels',
            this._guiSettings.blockLevels,
            this._guiSettings.blockLevelsMMS,
            () => {
                const range = this.gui.controls.get(JEN_BLK_LEVELS_CNT)!.element as ApgGui_IRange;
                this._guiSettings.blockLevels = parseFloat(range.value);
                const output = this.gui.controls.get(`${JEN_BLK_LEVELS_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const r = this.buildDetailsControl(
            "cubesGroupControl",
            "Blocks:",
            [
                cubesRestitutionControl,
                jengaBlockWidthControl,
                jengaBlockLevelsControl,
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

