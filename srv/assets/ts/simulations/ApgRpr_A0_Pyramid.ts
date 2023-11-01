/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomElement, IApgDomRange
} from "../ApgDom.ts";

import {
    ApgGui_IMinMaxStep
} from "../ApgGui.ts";

import {
    RAPIER
} from "../ApgRpr_Deps.ts";

import {
    ApgRpr_ISimulationParams,
    ApgRpr_ISimulationSettings,
    ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";

import {
    ApgRpr_Simulator_GuiBuilder
} from "../ApgRpr_Simulator_GuiBuilder.ts";

import {
    ApgRpr_Simulator
} from "../ApgRpr_Simulator.ts";


interface ApgRpr_A0_Pyramid_ISimulationSettings extends ApgRpr_ISimulationSettings {

    isCubesGroupOpened: boolean;

    cubesRestitution: number;
    cubesRestitutionMMS: ApgGui_IMinMaxStep;

    size: number;
    sizeMMS: ApgGui_IMinMaxStep;

}



export class ApgRpr_A0_Pyramid_Simulation extends ApgRpr_Simulation {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_A0_Pyramid_GuiBuilder);

        const settings = this.params.settings! as ApgRpr_A0_Pyramid_ISimulationSettings;
        this.createWorld(settings);
        this.simulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => {
            this.updateFromGui();
        });
    }



    protected override createWorld(asettings: ApgRpr_A0_Pyramid_ISimulationSettings) {

        this.createGround();

        // Create table.
        const tableThickness = 0.05;
        const tableWidth = 2;
        const tableDepth = 1;
        const tableHeight = 1;

        const tableBodyDesc = RAPIER.RigidBodyDesc
            .fixed();
        const tableBody = this.world.createRigidBody(tableBodyDesc);
        const tableColliderDesc = RAPIER.ColliderDesc
            .cuboid(tableWidth / 2, tableThickness / 2, tableDepth / 2)
            .setTranslation(0, tableHeight - tableThickness / 2, 0)
        this.world.createCollider(tableColliderDesc, tableBody);


        const tableSupportSize = 0.2;
        const tableSupportHeight = (tableHeight - tableThickness);

        const tableSupportBodyDesc = RAPIER.RigidBodyDesc
            .fixed();
        const tableSupportBody = this.world.createRigidBody(tableSupportBodyDesc);
        const tableSupportColliderDesc = RAPIER.ColliderDesc
            .cuboid(tableSupportSize / 2, tableSupportHeight / 2, tableSupportSize / 2)
            .setTranslation(0, tableSupportHeight / 2, 0)
        this.world.createCollider(tableSupportColliderDesc, tableSupportBody);

        // Dynamic cubes layered in a pyramid shape.
        const baseSize = asettings.size;

        const cubeSize = 0.05; // 5cm
        const cubeRadious = cubeSize / 2;
        const cubeGap = cubeSize / 4;
        const distance = cubeSize + cubeGap;
        const fallLevel = cubeSize * 5;
        const initialXYDisplacement = -1 * ((cubeSize * baseSize) + (cubeGap * (baseSize - 1))) / 2;

        for (let iy = 0; iy < baseSize; iy++) {

            const levelXZOrigin = initialXYDisplacement + (iy * distance / 2);
            const levelHeight = tableHeight + fallLevel + cubeRadious;

            for (let ix = 0; ix < (baseSize - iy); ix++) {
                for (let iz = 0; iz < (baseSize - iy); iz++) {

                    const y = levelHeight + (iy * distance);
                    const x = levelXZOrigin + (ix * distance);
                    const z = levelXZOrigin + (iz * distance);

                    // Create dynamic cube.

                    const boxBodyDesc = RAPIER.RigidBodyDesc
                        .dynamic()
                        .setTranslation(x, y, z)
                    const boxBody = this.world.createRigidBody(boxBodyDesc);

                    const boxColliderDesc = RAPIER.ColliderDesc
                        .cuboid(cubeRadious, cubeRadious, cubeRadious)
                        .setRestitution(asettings.cubesRestitution);
                    this.world.createCollider(boxColliderDesc, boxBody);
                }
            }
        }
    }



    override updateFromGui() {

        if (this.needsUpdate()) {

            // @TODO implement Pyramid settings
            super.updateFromGui();
        }

    }



    override defaultSettings() {

        const r: ApgRpr_A0_Pyramid_ISimulationSettings = {

            ...super.defaultSettings(),

            isCubesGroupOpened: false,

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

        r.cameraPosition.eye.x = -5;
        r.cameraPosition.eye.y = 1.65;
        r.cameraPosition.eye.z = -5;
        r.cameraPosition.target.y = 1;

        return r;
    }

}



class ApgRpr_A0_Pyramid_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {

    private _guiSettings: ApgRpr_A0_Pyramid_ISimulationSettings;


    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_A0_Pyramid_ISimulationSettings;
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

        const CUBES_REST_CNT = 'blocksRestitutionControl';
        const cubesRestitutionControl = this.buildRangeControl(
            CUBES_REST_CNT,
            'Restitution',
            this._guiSettings.cubesRestitution,
            this._guiSettings.cubesRestitutionMMS,
            () => {
                const range = this.gui.controls.get(CUBES_REST_CNT)!.element as IApgDomRange;
                this._guiSettings.cubesRestitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${CUBES_REST_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PYR_SIZE_CNT = 'pyramidSizeControl';
        const pyramidSizeControl = this.buildRangeControl(
            PYR_SIZE_CNT,
            'Size',
            this._guiSettings.size,
            this._guiSettings.sizeMMS,
            () => {
                const range = this.gui.controls.get(PYR_SIZE_CNT)!.element as IApgDomRange;
                this._guiSettings.size = parseFloat(range.value);
                const output = this.gui.controls.get(`${PYR_SIZE_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const r = this.buildDetailsControl(
            "cubesGroupControl",
            "Cubes:",
            [
                cubesRestitutionControl,
                pyramidSizeControl,
            ],
            this._guiSettings.isCubesGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this._guiSettings.isCubesGroupOpened = !this._guiSettings.isCubesGroupOpened;
                    this.gui.logNoTime('Cubes group toggled')
                }
            }

        );
        return r;
    }


}

