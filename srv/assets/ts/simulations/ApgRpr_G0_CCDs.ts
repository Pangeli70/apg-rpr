/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    ApgGui_ICheckBox,
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
    ApgRpr_IPoint3D
} from "../ApgRpr_Interfaces.ts";

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


export interface ApgRpr_G0_CCDs_ISimulationSettings extends ApgRpr_ISimulationSettings {

    isProjectileGroupOpened: boolean;
    projectileRadious: number;
    projectileRadiousMMS: ApgGui_IMinMaxStep;

    projectileDensity: number;
    projectileDensityMMS: ApgGui_IMinMaxStep;

    projectileSpeed: number;
    projectileSpeedMMS: ApgGui_IMinMaxStep;

    projectileCcd: boolean;


    isWallsGroupOpened: boolean;
    wallsNumber: number;
    wallsNumberMMS: ApgGui_IMinMaxStep;

    wallsHeight: number;
    wallsHeightMMS: ApgGui_IMinMaxStep;

    wallsDensity: number;
    wallsDensityMMS: ApgGui_IMinMaxStep;

    wallsCcd: boolean;

}


export class ApgRpr_G0_CCDs_Simulation extends ApgRpr_Simulation {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_G0_CCDs_GuiBuilder);

        const settings = this.params.settings! as ApgRpr_G0_CCDs_ISimulationSettings;
        this.createWorld(settings);
        this.simulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }


    protected override createWorld(asettings: ApgRpr_G0_CCDs_ISimulationSettings) {

        // Create Ground.
        const groundHeight = 0.1;
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed()
            .setTranslation(80.0, 0.1, 0);
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 0.1, 100.0);
        this.world.createCollider(groundColliderDesc, groundBody);

        // Create Walls 
        const shiftY = groundHeight + 0.5;
        for (let i = 0; i < asettings.wallsNumber; ++i) {
            const x = i * 6.0;
            const offsetPoint: ApgRpr_IPoint3D = { x: x, y: shiftY, z: 0.0 };
            this.#createWall(offsetPoint, asettings.wallsHeight, asettings.wallsCcd);
        }

        // A very fast rigid-body with CCD enabled.
        const projectileDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(-100.0, shiftY + 2.0, 0.0)
            .setLinvel(asettings.projectileSpeed, 0.0, 0.0)
            .setCcdEnabled(asettings.projectileCcd);
        const projectileBody = this.world.createRigidBody(projectileDesc);
        const projectileColliderDesc = RAPIER.ColliderDesc
            .ball(asettings.projectileRadious)
            .setDensity(asettings.projectileDensity);
        this.world.createCollider(projectileColliderDesc, projectileBody);
    }


    #createWall(offset: ApgRpr_IPoint3D, stackHeight: number, aisCcdEnabled = false) {

        const shiftY = 1.0;
        const shiftZ = 2.0;
        for (let i = 0; i < stackHeight; ++i) {
            for (let j = i; j < stackHeight; ++j) {
                const x = offset.x;
                const y = i * shiftY + offset.y;
                const z = (i * shiftZ) / 2.0 + (j - i) * shiftZ + offset.z - stackHeight;
                // Create dynamic cube.
                const bodyDesc = RAPIER.RigidBodyDesc
                    .dynamic()
                    .setTranslation(x, y, z)
                if (aisCcdEnabled) {
                    bodyDesc.setCcdEnabled(true);
                }
                const body = this.world.createRigidBody(bodyDesc);
                const colliderDesc = RAPIER.ColliderDesc
                    .cuboid(0.5, 0.5, 1.0)
                    .setDensity(2.0);
                this.world.createCollider(colliderDesc, body);
            }
        }
    }


    override updateFromGui() {

        if (this.needsUpdate()) {

            // @TODO implement CCD settings 

            super.updateFromGui();
        }

    }


    override defaultSettings() {

        const r: ApgRpr_G0_CCDs_ISimulationSettings = {

            ...super.defaultSettings(),

            isProjectileGroupOpened: false,

            projectileRadious: 1.25,
            projectileRadiousMMS: {
                min: 0.5,
                max: 2.5,
                step: 0.25
            },

            projectileDensity: 1.0,
            projectileDensityMMS: {
                min: 0.5,
                max: 5.0,
                step: 0.25
            },

            projectileSpeed: 250,
            projectileSpeedMMS: {
                min: 50,
                max: 500,
                step: 50
            },

            projectileCcd: true,

            isWallsGroupOpened: false,

            wallsNumber: 5,
            wallsNumberMMS: {
                min: 1,
                max: 10,
                step: 1
            },

            wallsHeight: 5,
            wallsHeightMMS: {
                min: 3,
                max: 10,
                step: 1
            },

            wallsDensity: 1,
            wallsDensityMMS: {
                min: 0.5,
                max: 2.5,
                step: 0.25
            },

            wallsCcd: false,
        }
        return r;
    }

}


export class ApgRpr_G0_CCDs_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {

    private _guiSettings: ApgRpr_G0_CCDs_ISimulationSettings;


    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as  ApgRpr_G0_CCDs_ISimulationSettings;
    }



    override buildControls() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const projectileGroupControl = this.#buildProjectileGroupControl();

        const wallsGroupControl = this.#buildWallsGroupControl();

        const simControls = super.buildControls();

        const r = this.buildPanelControl(
            `ApgRprSim_${this._guiSettings.simulation}_SettingsPanelId`,
            [
                simulationChangeControl,
                restartSimulationButtonControl,
                projectileGroupControl,
                wallsGroupControl,
                simControls
            ]
        );

        return r;

    }



    #buildWallsGroupControl() {

        const WALLS_DENS_CNT = 'wallsDensityControl';
        const wallsDensityControl = this.buildRangeControl(
            WALLS_DENS_CNT,
            'Density',
            this._guiSettings.wallsDensity,
            this._guiSettings.wallsDensityMMS,
            () => {
                const range = this.gui.controls.get(WALLS_DENS_CNT)!.element as ApgGui_IRange;
                this._guiSettings.wallsDensity = parseFloat(range.value);
                const output = this.gui.controls.get(`${WALLS_DENS_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const WALLS_HEIGHT_CNT = 'wallsHeightControl';
        const wallsHeightControl = this.buildRangeControl(
            WALLS_HEIGHT_CNT,
            'Height',
            this._guiSettings.wallsHeight,
            this._guiSettings.wallsHeightMMS,
            () => {
                const range = this.gui.controls.get(WALLS_HEIGHT_CNT)!.element as ApgGui_IRange;
                this._guiSettings.wallsHeight = parseInt(range.value);
                const output = this.gui.controls.get(`${WALLS_HEIGHT_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const WALLS_NUMB_CNT = 'wallsNumberControl';
        const wallsNumberControl = this.buildRangeControl(
            WALLS_NUMB_CNT,
            'Number',
            this._guiSettings.wallsNumber,
            this._guiSettings.wallsNumberMMS,
            () => {
                const range = this.gui.controls.get(WALLS_NUMB_CNT)!.element as ApgGui_IRange;
                this._guiSettings.wallsNumber = parseInt(range.value);
                const output = this.gui.controls.get(`${WALLS_NUMB_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const WALLS_CCD_CNT = 'wallsCCDControl';
        const wallsCCDControl = this.buildCheckBoxControl(
            WALLS_CCD_CNT,
            'Enable CCD',
            this._guiSettings.wallsCcd,
            () => {
                const chkbox = this.gui.controls.get(WALLS_CCD_CNT)!.element as ApgGui_ICheckBox;
                this._guiSettings.wallsCcd = chkbox.checked;
                // alert(chkbox.checked.toString());
            }
        );

        const wallsGroupControl = this.buildDetailsControl(
            "wallsGroupControl",
            "Walls:",
            [
                wallsNumberControl,
                wallsHeightControl,
                wallsDensityControl,
                wallsCCDControl
            ],
            this._guiSettings.isWallsGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this._guiSettings.isWallsGroupOpened = !this._guiSettings.isWallsGroupOpened;
                    this.gui.logNoTime('Walls group toggled')
                }
            }
        );
        return wallsGroupControl;
    }



    #buildProjectileGroupControl() {

        const PROJ_RADIOUS_CNT = 'projectileRadiousControl';
        const projectileRadiousControl = this.buildRangeControl(
            PROJ_RADIOUS_CNT,
            'Radious',
            this._guiSettings.projectileRadious,
            this._guiSettings.projectileRadiousMMS,
            () => {
                const range = this.gui.controls.get(PROJ_RADIOUS_CNT)!.element as ApgGui_IRange;
                this._guiSettings.projectileRadious = parseFloat(range.value);
                const output = this.gui.controls.get(`${PROJ_RADIOUS_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PROJ_DENSITY_CNT = 'projectileDensityControl';
        const projectileDensityControl = this.buildRangeControl(
            PROJ_DENSITY_CNT,
            'Density',
            this._guiSettings.projectileDensity,
            this._guiSettings.projectileDensityMMS,
            () => {
                const range = this.gui.controls.get(PROJ_DENSITY_CNT)!.element as ApgGui_IRange;
                this._guiSettings.projectileDensity = parseFloat(range.value);
                const output = this.gui.controls.get(`${PROJ_DENSITY_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PROJ_SPEED_CNT = 'projectileSpeedControl';
        const projectileSpeedControl = this.buildRangeControl(
            PROJ_SPEED_CNT,
            'Speed',
            this._guiSettings.projectileSpeed,
            this._guiSettings.projectileSpeedMMS,
            () => {
                const range = this.gui.controls.get(PROJ_SPEED_CNT)!.element as ApgGui_IRange;
                this._guiSettings.projectileSpeed = parseFloat(range.value);
                const output = this.gui.controls.get(`${PROJ_SPEED_CNT}Value`)!.element as ApgGui_IElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PROJ_CCD_CNT = 'projectileCCDControl';
        const projectileCCDControl = this.buildCheckBoxControl(
            PROJ_CCD_CNT,
            'Enable CCD',
            this._guiSettings.projectileCcd,
            () => {
                const chkbox = this.gui.controls.get(PROJ_CCD_CNT)!.element as ApgGui_ICheckBox;
                this._guiSettings.projectileCcd = chkbox.checked;
                // alert(chkbox.checked.toString());
            }
        );

        const r = this.buildDetailsControl(
            "projectileGroupControl",
            "Projectile:",
            [
                projectileSpeedControl,
                projectileRadiousControl,
                projectileDensityControl,
                projectileCCDControl
            ],
            this._guiSettings.isProjectileGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this._guiSettings.isProjectileGroupOpened = !this._guiSettings.isProjectileGroupOpened;
                    this.gui.logNoTime('Projectile group toggled')
                }
            }

        );
        return r;
    }


}


