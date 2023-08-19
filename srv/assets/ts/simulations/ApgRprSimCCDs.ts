/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomCheckBox, IApgDomElement,
    IApgDomRange
} from "../ApgDom.ts";
import { ApgGui, ApgGui_IMinMaxStep } from "../ApgGui.ts";
import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRpr_eSimulationName } from "../ApgRprEnums.ts";
import { IApgRpr_Point3D } from "../ApgRprInterfaces.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface ApgRprSim_CCDs_IGuiSettings extends ApgRprSim_IGuiSettings {

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


export class ApgRprSim_CCDs extends ApgRprSim_Base {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {

        super(asimulator, aparams);

        const settings = this.params.guiSettings! as ApgRprSim_CCDs_IGuiSettings;
        
        const guiBuilder = new ApgRprSim_CCDs_GuiBuilder(
            this.simulator.gui,
            this.params
        );
        const html = guiBuilder.buildHtml();
        this.simulator.updateViewerPanel(html);
        guiBuilder.bindControls();

        this.#createWorld(settings);
        this.simulator.addWorld(this.world);

        if (!this.params.restart) {
            this.simulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }


    #createWorld(asettings: ApgRprSim_CCDs_IGuiSettings) {

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


    override updateFromGui() {

        if (this.needsUpdate()) {

            // TODO implement CCD settings 

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: ApgRprSim_CCDs_IGuiSettings = {

            ...super.defaultGuiSettings(),

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


export class ApgRprSim_CCDs_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_CCDs_IGuiSettings;

    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_CCDs_IGuiSettings;
    }

    
    override buildHtml() {

        const projectileGroupControl = this.#buildProjectileGroupControl();

        const wallsGroupControl = this.#buildWallsGroupControl();

        const simControls = super.buildHtml();

        const r = this.buildPanelControl(
            "ApgRprSimCcdSettingsPanel",
            ApgRpr_eSimulationName.J_CCDs,
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
            this.guiSettings.wallsDensity,
            this.guiSettings.wallsDensityMMS.min,
            this.guiSettings.wallsDensityMMS.max,
            this.guiSettings.wallsDensityMMS.step,
            () => {
                const range = this.gui.controls.get(WALLS_DENS_CNT)!.element as IApgDomRange;
                this.guiSettings.wallsDensity = parseFloat(range.value);
                const output = this.gui.controls.get(`${WALLS_DENS_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const WALLS_HEIGHT_CNT = 'wallsHeightControl';
        const wallsHeightControl = this.buildRangeControl(
            WALLS_HEIGHT_CNT,
            'Height',
            this.guiSettings.wallsHeight,
            this.guiSettings.wallsHeightMMS.min,
            this.guiSettings.wallsHeightMMS.max,
            this.guiSettings.wallsHeightMMS.step,
            () => {
                const range = this.gui.controls.get(WALLS_HEIGHT_CNT)!.element as IApgDomRange;
                this.guiSettings.wallsHeight = parseInt(range.value);
                const output = this.gui.controls.get(`${WALLS_HEIGHT_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const WALLS_NUMB_CNT = 'wallsNumberControl';
        const wallsNumberControl = this.buildRangeControl(
            WALLS_NUMB_CNT,
            'Number',
            this.guiSettings.wallsNumber,
            this.guiSettings.wallsNumberMMS.min,
            this.guiSettings.wallsNumberMMS.max,
            this.guiSettings.wallsNumberMMS.step,
            () => {
                const range = this.gui.controls.get(WALLS_NUMB_CNT)!.element as IApgDomRange;
                this.guiSettings.wallsNumber = parseInt(range.value);
                const output = this.gui.controls.get(`${WALLS_NUMB_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const WALLS_CCD_CNT = 'wallsCCDControl';
        const wallsCCDControl = this.buildCheckBoxControl(
            WALLS_CCD_CNT,
            'Enable CCD',
            this.guiSettings.wallsCcd,
            () => {
                const chkbox = this.gui.controls.get(WALLS_CCD_CNT)!.element as IApgDomCheckBox;
                this.guiSettings.wallsCcd = chkbox.checked;
                // alert(chkbox.checked.toString());
            }
        );

        const wallsGroupControl = this.buildGroupControl(
            "wallsGroupControl",
            "Walls:",
            [
                wallsNumberControl,
                wallsHeightControl,
                wallsDensityControl,
                wallsCCDControl
            ],
            this.guiSettings.isWallsGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.guiSettings.isWallsGroupOpened = !this.guiSettings.isWallsGroupOpened;
                    this.gui.log('Walls group toggled')
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
            this.guiSettings.projectileRadious,
            this.guiSettings.projectileRadiousMMS.min,
            this.guiSettings.projectileRadiousMMS.max,
            this.guiSettings.projectileRadiousMMS.step,
            () => {
                const range = this.gui.controls.get(PROJ_RADIOUS_CNT)!.element as IApgDomRange;
                this.guiSettings.projectileRadious = parseFloat(range.value);
                const output = this.gui.controls.get(`${PROJ_RADIOUS_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PROJ_DENSITY_CNT = 'projectileDensityControl';
        const projectileDensityControl = this.buildRangeControl(
            PROJ_DENSITY_CNT,
            'Density',
            this.guiSettings.projectileDensity,
            this.guiSettings.projectileDensityMMS.min,
            this.guiSettings.projectileDensityMMS.max,
            this.guiSettings.projectileDensityMMS.step,
            () => {
                const range = this.gui.controls.get(PROJ_DENSITY_CNT)!.element as IApgDomRange;
                this.guiSettings.projectileDensity = parseFloat(range.value);
                const output = this.gui.controls.get(`${PROJ_DENSITY_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PROJ_SPEED_CNT = 'projectileSpeedControl';
        const projectileSpeedControl = this.buildRangeControl(
            PROJ_SPEED_CNT,
            'Speed',
            this.guiSettings.projectileSpeed,
            this.guiSettings.projectileSpeedMMS.min,
            this.guiSettings.projectileSpeedMMS.max,
            this.guiSettings.projectileSpeedMMS.step,
            () => {
                const range = this.gui.controls.get(PROJ_SPEED_CNT)!.element as IApgDomRange;
                this.guiSettings.projectileSpeed = parseFloat(range.value);
                const output = this.gui.controls.get(`${PROJ_SPEED_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PROJ_CCD_CNT = 'projectileCCDControl';
        const projectileCCDControl = this.buildCheckBoxControl(
            PROJ_CCD_CNT,
            'Enable CCD',
            this.guiSettings.projectileCcd,
            () => {
                const chkbox = this.gui.controls.get(PROJ_CCD_CNT)!.element as IApgDomCheckBox;
                this.guiSettings.projectileCcd = chkbox.checked;
                // alert(chkbox.checked.toString());
            }
        );

        const r = this.buildGroupControl(
            "projectileGroupControl",
            "Projectile:",
            [
                projectileSpeedControl,
                projectileRadiousControl,
                projectileDensityControl,
                projectileCCDControl
            ],
            this.guiSettings.isProjectileGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.guiSettings.isProjectileGroupOpened = !this.guiSettings.isProjectileGroupOpened;
                    this.gui.log('Projectile group toggled')
                }
            }

        );
        return r;
    }


}


