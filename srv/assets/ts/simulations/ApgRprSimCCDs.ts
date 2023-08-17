/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomCheckBox,
    IApgDomElement, IApgDomRange
} from "../ApgDom.ts";
import { ApgGui } from "../ApgGui.ts";
import { RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { IApgRpr_CameraPosition, IApgRpr_Point3D } from "../ApgRprInterfaces.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base,
    IApgRprSim_GuiSettings,
    IApgRprSim_MinMaxStep,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface IApgRprSim_CCDs_GuiSettings extends IApgRprSim_GuiSettings{


    projectileRadious: number;
    projectileRadiousMMS: IApgRprSim_MinMaxStep;

    projectileDensity: number;
    projectileDensityMMS: IApgRprSim_MinMaxStep;

    projectileSpeed: number;
    projectileSpeedMMS: IApgRprSim_MinMaxStep;

    projectileCcd: boolean;

    
    wallsNumber: number;
    wallsNumberMMS: IApgRprSim_MinMaxStep;

    wallsHeight: number;
    wallsHeightMMS: IApgRprSim_MinMaxStep;

    wallsDensity: number;
    wallsDensityMMS: IApgRprSim_MinMaxStep;


    wallsCcd: boolean;

}


export class ApgRprSim_CCDs extends ApgRprSim_Base {

    constructor(asimulator: ApgRpr_Simulator, aparams: IApgRprSim_Params) {

        super(asimulator, aparams);

        const guiBuilder = new ApgRprSim_CCDs_GuiBuilder(
            this.simulator.gui,
            this.params
        );
        const gui = guiBuilder.build();
        this.simulator.viewer.panels.innerHTML = gui;
        guiBuilder.bindControls();

        const settings = this.params.guiSettings! as IApgRprSim_CCDs_GuiSettings;
        this.createWorld(settings);
        this.simulator.addWorld(this.world);

        if (!this.params.restart) {
            const cameraPosition: IApgRpr_CameraPosition = {
                eye: { x: -80, y: 50, z: -80 },
                target: { x: 0, y: 0, z: 0 },
            };
            this.simulator.resetCamera(cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }

    private createWorld(asettings: IApgRprSim_CCDs_GuiSettings) {

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
            const offsetPoint: IApgRpr_Point3D = { x: x, y: shiftY, z: 0.0 };
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


    override updateFromGui() {

        if (this.needsUpdate()) {

            // TODO implement CCD settings 

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: IApgRprSim_CCDs_GuiSettings = {

            ...super.defaultGuiSettings(),

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

    #createWall(offset: IApgRpr_Point3D, stackHeight: number, aisCcdEnabled = false) {

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
}

export class ApgRprSim_CCDs_GuiBuilder extends ApgRprSim_GuiBuilder {

    ccdSettings: IApgRprSim_CCDs_GuiSettings;

    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.ccdSettings = this.params.guiSettings as IApgRprSim_CCDs_GuiSettings;
    }

    override build() {

        const projectileGroupControl = this.#buildProjectileGroupControl();

        const wallsGroupControl = this.#buildWallsGroupControl();

        const simControls = super.build();

        const r = this.buildPanelControl(
            "ApgRprSimCcdSettingsPanel",
            eApgRpr_SimulationName.J_CCDs,
            [
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
            this.ccdSettings.wallsDensity,
            this.ccdSettings.wallsDensityMMS.min,
            this.ccdSettings.wallsDensityMMS.max,
            this.ccdSettings.wallsDensityMMS.step,
            () => {
                const range = this.gui.controls.get(WALLS_DENS_CNT)!.element as IApgDomRange;
                this.ccdSettings.wallsDensity = parseFloat(range.value);
                const output = this.gui.controls.get(`${WALLS_DENS_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const WALLS_HEIGHT_CNT = 'wallsHeightControl';
        const wallsHeightControl = this.buildRangeControl(
            WALLS_HEIGHT_CNT,
            'Height',
            this.ccdSettings.wallsHeight,
            this.ccdSettings.wallsHeightMMS.min,
            this.ccdSettings.wallsHeightMMS.max,
            this.ccdSettings.wallsHeightMMS.step,
            () => {
                const range = this.gui.controls.get(WALLS_HEIGHT_CNT)!.element as IApgDomRange;
                this.ccdSettings.wallsHeight = parseInt(range.value);
                const output = this.gui.controls.get(`${WALLS_HEIGHT_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const WALLS_NUMB_CNT = 'wallsNumberControl';
        const wallsNumberControl = this.buildRangeControl(
            WALLS_NUMB_CNT,
            'Number',
            this.ccdSettings.wallsNumber,
            this.ccdSettings.wallsNumberMMS.min,
            this.ccdSettings.wallsNumberMMS.max,
            this.ccdSettings.wallsNumberMMS.step,
            () => {
                const range = this.gui.controls.get(WALLS_NUMB_CNT)!.element as IApgDomRange;
                this.ccdSettings.wallsNumber = parseInt(range.value);
                const output = this.gui.controls.get(`${WALLS_NUMB_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const WALLS_CCD_CNT = 'wallsCCDControl';
        const wallsCCDControl = this.buildCheckBoxControl(
            WALLS_CCD_CNT,
            'Enable CCD',
            this.ccdSettings.wallsCcd,
            () => {
                const chkbox = this.gui.controls.get(WALLS_CCD_CNT)!.element as IApgDomCheckBox;
                this.ccdSettings.wallsCcd = chkbox.checked;
                // alert(chkbox.checked.toString());
            }
        );

        const wallsGroupControl = this.buildGroupControl(
            "Walls:",
            [
                wallsNumberControl,
                wallsHeightControl,
                wallsDensityControl,
                wallsCCDControl
            ]

        );
        return wallsGroupControl;
    }

    #buildProjectileGroupControl() {
        const PROJ_RADIOUS_CNT = 'projectileRadiousControl';
        const projectileRadiousControl = this.buildRangeControl(
            PROJ_RADIOUS_CNT,
            'Radious',
            this.ccdSettings.projectileRadious,
            this.ccdSettings.projectileRadiousMMS.min,
            this.ccdSettings.projectileRadiousMMS.max,
            this.ccdSettings.projectileRadiousMMS.step,
            () => {
                const range = this.gui.controls.get(PROJ_RADIOUS_CNT)!.element as IApgDomRange;
                this.ccdSettings.projectileRadious = parseFloat(range.value);
                const output = this.gui.controls.get(`${PROJ_RADIOUS_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PROJ_DENSITY_CNT = 'projectileDensityControl';
        const projectileDensityControl = this.buildRangeControl(
            PROJ_DENSITY_CNT,
            'Density',
            this.ccdSettings.projectileDensity,
            this.ccdSettings.projectileDensityMMS.min,
            this.ccdSettings.projectileDensityMMS.max,
            this.ccdSettings.projectileDensityMMS.step,
            () => {
                const range = this.gui.controls.get(PROJ_DENSITY_CNT)!.element as IApgDomRange;
                this.ccdSettings.projectileDensity = parseFloat(range.value);
                const output = this.gui.controls.get(`${PROJ_DENSITY_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PROJ_SPEED_CNT = 'projectileSpeedControl';
        const projectileSpeedControl = this.buildRangeControl(
            PROJ_SPEED_CNT,
            'Speed',
            this.ccdSettings.projectileSpeed,
            this.ccdSettings.projectileSpeedMMS.min,
            this.ccdSettings.projectileSpeedMMS.max,
            this.ccdSettings.projectileSpeedMMS.step,
            () => {
                const range = this.gui.controls.get(PROJ_SPEED_CNT)!.element as IApgDomRange;
                this.ccdSettings.projectileSpeed = parseFloat(range.value);
                const output = this.gui.controls.get(`${PROJ_SPEED_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PROJ_CCD_CNT = 'projectileCCDControl';
        const projectileCCDControl = this.buildCheckBoxControl(
            PROJ_CCD_CNT,
            'Enable CCD',
            this.ccdSettings.projectileCcd,
            () => {
                const chkbox = this.gui.controls.get(PROJ_CCD_CNT)!.element as IApgDomCheckBox;
                this.ccdSettings.projectileCcd = chkbox.checked;
                // alert(chkbox.checked.toString());
            }
        );

        const r = this.buildGroupControl(
            "Projectile:",
            [
                projectileSpeedControl,
                projectileRadiousControl,
                projectileDensityControl,
                projectileCCDControl
            ]

        );
        return r;
    }


}


