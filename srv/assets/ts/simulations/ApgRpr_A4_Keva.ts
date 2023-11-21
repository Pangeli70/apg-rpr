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

import {
    ApgGui_IMinMaxStep
} from "../apg-gui/lib/classes/ApgGui.ts";

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



interface ApgRpr_A4_Keva_ISimulationSettings extends ApgRpr_ISimulationSettings {

    isCubesGroupOpened: boolean;

    cubesRestitution: number;
    cubesRestitutionMMS: ApgGui_IMinMaxStep;

    blockWidth: number;
    blockWidthMMS: ApgGui_IMinMaxStep;

    blockLevels: number;
    blockLevelsMMS: ApgGui_IMinMaxStep;

}



export class ApgRpr_A4_Keva_Simulation extends ApgRpr_Simulation {

    currentCube = 0;

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_A4_Keva_GuiBuilder);

        const settings = this.params.settings as ApgRpr_A4_Keva_ISimulationSettings;
        this.createWorld(settings);
        this.simulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => {
            this.updateFromGui();
        });
    }

    override defaultSettings() {

        const r: ApgRpr_A4_Keva_ISimulationSettings = {

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

    protected override createWorld(asettings: ApgRpr_A4_Keva_ISimulationSettings) {

        this.#initWorld();
    }




    #buildBlock(
        halfExtents: RAPIER.Vector3,
        shift: RAPIER.Vector3,
        numx: number,
        numy: number,
        numz: number,
    ) {
        const half_extents_zyx = {
            x: halfExtents.z,
            y: halfExtents.y,
            z: halfExtents.x,
        };
        const dimensions = [halfExtents, half_extents_zyx];
        const blockWidth = 2.0 * halfExtents.z * numx;
        const blockHeight = 2.0 * halfExtents.y * numy;
        const spacing = (halfExtents.z * numx - halfExtents.x) / (numz - 1.0);


        for (let i = 0; i < numy; ++i) {
            [numx, numz] = [numz, numx];
            const dim = dimensions[i % 2];

            const y = dim.y * i * 2.0;

            for (let j = 0; j < numx; ++j) {

                const x = i % 2 == 0 ? spacing * j * 2.0 : dim.x * j * 2.0;

                for (let k = 0; k < numz; ++k) {
                    const z = i % 2 == 0 ? dim.z * k * 2.0 : spacing * k * 2.0;
                    // Build the rigid body.
                    const bodyDesc = RAPIER.RigidBodyDesc
                        .dynamic()
                        .setTranslation(
                            x + dim.x + shift.x,
                            y + dim.y + shift.y,
                            z + dim.z + shift.z,
                        );
                    const body = this.world.createRigidBody(bodyDesc);
                    const colliderDesc = RAPIER.ColliderDesc
                        .cuboid(
                            dim.x,
                            dim.y,
                            dim.z,
                        );
                    this.world.createCollider(colliderDesc, body);
                }
            }
        }

        // Close the top.
        const dim = { x: halfExtents.z, y: halfExtents.x, z: halfExtents.y };

        for (let i = 0; i < blockWidth / (dim.x * 2.0); ++i) {

            const x = i * dim.x * 2.0 + dim.x + shift.x;

            for (let j = 0; j < blockWidth / (dim.z * 2.0); ++j) {
                // Build the rigid body.
                const y = dim.y + shift.y + blockHeight;
                const z = j * dim.z * 2.0 + dim.z + shift.z;
                const bodyDesc = RAPIER.RigidBodyDesc
                    .dynamic()
                    .setTranslation(x, y, z);
                const body = this.world.createRigidBody(bodyDesc);
                const colliderDesc = RAPIER.ColliderDesc
                    .cuboid(dim.x, dim.y, dim.z);
                this.world.createCollider(colliderDesc, body);
            }
        }
    }

    #initWorld() {


        // Create Ground.
        const groundSize = 50.0;
        const groundHeight = 0.1;
        const bodyDesc = RAPIER.RigidBodyDesc
            .fixed()
            .setTranslation(0.0, -groundHeight, 0.0);
        const body = this.world
            .createRigidBody(bodyDesc);
        const colliderDesc = RAPIER.ColliderDesc
            .cuboid(
                groundSize,
                groundHeight,
                groundSize,
            );
        this.world.createCollider(colliderDesc, body);

        // Keva tower.
        const halfExtents = new RAPIER.Vector3(0.1, 0.5, 2.0);
        let blockHeight = 0.0;
        // These should only be set to odd values otherwise
        // the blocks won't align in the nicest way.
        const numyArr = [0, 3, 5, 5, 7, 9];
        let numBlocksBuilt = 0;

        for (let i = 5; i >= 1; --i) {
            const numx = i;
            const numy = numyArr[i];
            const numz = numx * 3 + 1;
            const blockWidth = numx * halfExtents.z * 2.0;
            this.#buildBlock(
                halfExtents,
                new RAPIER.Vector3(
                    -blockWidth / 2.0,
                    blockHeight,
                    -blockWidth / 2.0,
                ),
                numx,
                numy,
                numz,
            );
            blockHeight += numy * halfExtents.y * 2.0 + halfExtents.x * 2.0;
            numBlocksBuilt += numx * numy * numz;
        }
    }

    override updateFromGui() {

        if (this.needsUpdate()) {

            // @TODO implement Pyramid settings

            super.updateFromGui();
        }

    }




}



class ApgRpr_A4_Keva_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {

    private _guiSettings: ApgRpr_A4_Keva_ISimulationSettings;



    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_A4_Keva_ISimulationSettings;
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

