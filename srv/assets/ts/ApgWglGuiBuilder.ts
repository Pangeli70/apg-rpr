/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/16]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomDialog, IApgDomElement,
    IApgDomRange, IApgDomSelect
} from "./ApgDom.ts";
import { ApgGui } from "./ApgGui.ts";
import { ApgGui_Builder, ApgGui_IMinMaxStep, ApgGui_TSelectValuesMap } from "./ApgGuiBuilder.ts";
import { ApgRpr_eSimulationName } from "./ApgRpr_Simulations.ts";
import { IApgWglViewerOptions } from "./ApgWglViewer.ts";

export interface IApgWglViewerGuiSettings extends IApgWglViewerOptions {

    worldSize: number;
    worldSizeMMS: ApgGui_IMinMaxStep;

    fogColor: number;
    fogMinDistance: number;
    fogMaxDistance: number;

    toneMapping: THREE.ToneMapping;
    toneMappingValues: ApgGui_TSelectValuesMap;

    toneMappingExposure: number;

    outputColorSpace: THREE.ColorSpace;
    outputColorSpaceValues: ApgGui_TSelectValuesMap;

    shadowMapEnabled: boolean;
    shadowMapType: THREE.ShadowMapType;
    shadowMapTypeValues: ApgGui_TSelectValuesMap;
    shadowMapRadious: number;
    shadowMapSize: number;

    clearColor: number;

    perspCameraFov: number;
    //perspCameraFovMMS: ApgGui_IMinMaxStep;
    perspCameraNear: number;
    //perspCameraNearMMS: ApgGui_IMinMaxStep;
    perspCameraFar: number;
    //perspCameraFarMMS: ApgGui_IMinMaxStep;

    perspCameraPosition: THREE.Vector3;

    useEnvMapInsteadThanLights: boolean;

    ambLightEnabled: boolean;
    ambLightColor: THREE.Color;
    ambLightIntensity: number;
    //ambLightIntensityMMS: ApgGui_IMinMaxStep;

    sunLightEnabled: boolean;
    sunLightColor: THREE.Color;
    sunLightIntensity: number;
    //sunLightIntensityyMMS: ApgGui_IMinMaxStep;
    sunLightPosition: THREE.Vector3;
    sunLightShadowMapCameraSize: number,
    sunLightShadowMapCameraNear: number,
    sunLightShadowMapCameraFar: number,

    camLightEnabled: boolean;
    camLightColor: THREE.Color;
    camLightIntensity: number;
    //camLightIntensityMMS: ApgGui_IMinMaxStep;
    camLightDistance: number;
    //camLightDistanceMMS: ApgGui_IMinMaxStep;
    camLightPosition: THREE.Vector3;
    camLightIsDetachedFromCamera: boolean;

    orbControlsTarget: THREE.Vector3;
    orbControlsMinDistance: number;
    orbControlsMaxDistance: number;
    orbControlsMinPolarAngle: number;
    orbControlsMaxPolarAngle: number;
    orbControlsEnableDamping: boolean;
    orbControlsDampingFactor: number;

    layers: boolean[];

}

/**
 * This is the basic simulation gui Builder that contains the elements shared by
 * all the simulations. It prepares the controls that allows to change the simulation, 
 * to tweak the simulation settings, to create the stats panels and the the credits 
 * dialog
 */
export class ApgWgl_GuiBuilder extends ApgGui_Builder {

    params: IApgWglViewerGuiSettings;

    readonly VIEWER_SETTINGS_DIALOG_CNT = "ViewerSettingsDialogControl"

    constructor(
        agui: ApgGui,
        aname: string,
        aparams: IApgWglViewerOptions,
    ) {
        super(agui, aname);

        this.params = {
            ...aparams,
            worldSizeMMS: { min: 500, max: 2000, step: 500 },
            toneMappingValues: new Map([
                ['0', 'NoToneMapping'],
                ['1', 'LinearToneMapping'],
                ['2', 'ReinhardToneMapping'],
                ['3', 'CineonToneMapping'],
                ['5', 'ACESFilmicToneMapping'],
                ['6', 'CustomToneMapping']
            ]),
            outputColorSpaceValues: new Map([
                ['', 'NoColorSpace'],
                ['srgb', 'SRGBColorSpace'],
                ['srgb-linear', 'LinearSRGBColorSpace'],
                ['display-p3', 'DisplayP3ColorSpace'],
            ]),
            shadowMapTypeValues: new Map([
                ['0','BasicShadowMap '],
                ['1','PCFShadowMap'],
                ['2','PCFSoftShadowMap'],
                ['3','VSMShadowMap'],
            ])


        };
    }


    /**
     * 
     * @returns 
     */
    override buildHtml() {

        const viewerSettingsDialogControl = this.#buildViewerSettingsDialogControl();

        const VIEWER_SETTINGS_BTN_CNT = 'ViewerSettingsButtonControl';
        const viewerSettingsButtonControl = this.buildButtonControl(
            VIEWER_SETTINGS_BTN_CNT,
            'Viewer',
            () => {
                const dialog = this.gui.controls.get(this.VIEWER_SETTINGS_DIALOG_CNT)!.element as IApgDomDialog;
                dialog.showModal();
            }
        );

        const controls = [
            viewerSettingsDialogControl,
            viewerSettingsButtonControl,
        ];
        const r = controls.join("\n");

        return r;

    }


    buildSimulationChangeControl() {
        const simulationsKVs = new Map<string, string>();
        for (const panel of this.params.simulations!) {
            simulationsKVs.set(panel, panel);
        }
        const SIM_SELECT_CNT = 'simulationSelectControl';
        const r = this.buildSelectControl(
            SIM_SELECT_CNT,
            '',
            this.params.simulation!,
            simulationsKVs,
            () => {
                const select = this.gui.controls.get(SIM_SELECT_CNT)!.element as IApgDomSelect;
                this.params.simulation = select.value as ApgRpr_eSimulationName;
                //alert(select.value);
            }
        );
        return r;
    }


    buildRestartButtonControl() {
        const RESTART_BTN_CNT = 'restartButtonControl';
        const r = this.buildButtonControl(
            RESTART_BTN_CNT,
            'Restart',
            () => {
                this.params.restart = true;
                this.gui.logNoTime('Restart button pressed');
            }
        );

        return r;
    }


    #buildSimulationGroupControl() {

        const SIM_VEL_ITER_CNT = 'simulationVelocityIterationsControl';
        const simulationVelocityIterationsControl = this.buildRangeControl(
            SIM_VEL_ITER_CNT,
            'Velocity precision',
            this.params.guiSettings!.velocityIterations,
            this.params.guiSettings!.velocityIterationsMMS.min,
            this.params.guiSettings!.velocityIterationsMMS.max,
            this.params.guiSettings!.velocityIterationsMMS.step,
            () => {
                const range = this.gui.controls.get(SIM_VEL_ITER_CNT)!.element as IApgDomRange;
                this.params.guiSettings!.velocityIterations = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_VEL_ITER_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const SIM_FRIC_ITER_CNT = 'simulationFrictionIterationsControl';
        const simulationFrictionIterationsControl = this.buildRangeControl(
            SIM_FRIC_ITER_CNT,
            'Friction precision',
            this.params.guiSettings!.frictionIterations,
            this.params.guiSettings!.frictionIterationsMMS.min,
            this.params.guiSettings!.frictionIterationsMMS.max,
            this.params.guiSettings!.frictionIterationsMMS.step,
            () => {
                const range = this.gui.controls.get(SIM_FRIC_ITER_CNT)!.element as IApgDomRange;
                this.params.guiSettings!.frictionIterations = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_FRIC_ITER_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const SIM_STAB_ITER_CNT = 'simulationStabilizationIterationsControl';
        const simulationStabilizationIterationsControl = this.buildRangeControl(
            SIM_STAB_ITER_CNT,
            'Stabilization precision',
            this.params.guiSettings!.stabilizationIterations,
            this.params.guiSettings!.stabilizationIterationsMMS.min,
            this.params.guiSettings!.stabilizationIterationsMMS.max,
            this.params.guiSettings!.stabilizationIterationsMMS.step,
            () => {
                const range = this.gui.controls.get(SIM_STAB_ITER_CNT)!.element as IApgDomRange;
                this.params.guiSettings!.stabilizationIterations = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_STAB_ITER_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const SIM_LIN_ERR_CNT = 'simulationLinearErrorControl';
        const simulationLinearErrorControl = this.buildRangeControl(
            SIM_LIN_ERR_CNT,
            'Linear error',
            this.params.guiSettings!.linearError,
            this.params.guiSettings!.linearErrorMMS.min,
            this.params.guiSettings!.linearErrorMMS.max,
            this.params.guiSettings!.linearErrorMMS.step,
            () => {
                const range = this.gui.controls.get(SIM_LIN_ERR_CNT)!.element as IApgDomRange;
                this.params.guiSettings!.linearError = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_LIN_ERR_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const SIM_ERR_REDUC_RATIO_CNT = 'simulationErrorReductionRatioControl';
        const simulationErrorReductionRatioControl = this.buildRangeControl(
            SIM_ERR_REDUC_RATIO_CNT,
            'Error reduction',
            this.params.guiSettings!.errorReductionRatio,
            this.params.guiSettings!.errorReductionRatioMMS.min,
            this.params.guiSettings!.errorReductionRatioMMS.max,
            this.params.guiSettings!.errorReductionRatioMMS.step,
            () => {
                const range = this.gui.controls.get(SIM_ERR_REDUC_RATIO_CNT)!.element as IApgDomRange;
                this.params.guiSettings!.errorReductionRatio = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_ERR_REDUC_RATIO_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const SIM_PREDICTION_DISTANCE_CNT = 'simulationPredictionDistanceControl';
        const simulationPredictionDistanceControl = this.buildRangeControl(
            SIM_PREDICTION_DISTANCE_CNT,
            'Prediction distance',
            this.params.guiSettings!.predictionDistance,
            this.params.guiSettings!.predictionDistanceMMS.min,
            this.params.guiSettings!.predictionDistanceMMS.max,
            this.params.guiSettings!.predictionDistanceMMS.step,
            () => {
                const range = this.gui.controls.get(SIM_PREDICTION_DISTANCE_CNT)!.element as IApgDomRange;
                this.params.guiSettings!.predictionDistance = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_PREDICTION_DISTANCE_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const SIM_SPEED_CNT = 'simulationSpeedControl';
        const simulationSpeedControl = this.buildRangeControl(
            SIM_SPEED_CNT,
            'Slowdown',
            this.params.guiSettings!.slowdown,
            this.params.guiSettings!.slowdownMMS.min,
            this.params.guiSettings!.slowdownMMS.max,
            this.params.guiSettings!.slowdownMMS.step,
            () => {
                const range = this.gui.controls.get(SIM_SPEED_CNT)!.element as IApgDomRange;
                this.params.guiSettings!.slowdown = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_SPEED_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const RESET_BTN_CNT = 'resetButtonControl';
        const resetButtonControl = this.buildButtonControl(
            RESET_BTN_CNT,
            'Reset',
            () => {
                this.params.guiSettings!.doResetToDefaults = true;
                this.gui.logNoTime('Reset button pressed');
            }
        );

        const r = this.buildGroupControl(
            "simulationGroupControl",
            "Simulation:",
            [
                simulationVelocityIterationsControl,
                simulationFrictionIterationsControl,
                simulationStabilizationIterationsControl,
                simulationLinearErrorControl,
                simulationErrorReductionRatioControl,
                simulationPredictionDistanceControl,
                simulationSpeedControl,
                resetButtonControl,
            ],
            this.params.guiSettings!.isSimulationGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.params.guiSettings!.isSimulationGroupOpened = !this.params.guiSettings!.isSimulationGroupOpened
                    this.gui.logNoTime('Simulation group toggled');
                }
            }
        );

        return r;
    }


    #buildViewerSettingsDialogControl() {


        const VIEWER_SETTINGS_CLOSE_BTN_CNT = 'viewerSettingsDialogCloseButtonControl';
        const viewerSettingsDialogCloseButtonControl = this.buildButtonControl(
            VIEWER_SETTINGS_CLOSE_BTN_CNT,
            'Close',
            () => {
                const dialog = this.gui.controls.get(this.VIEWER_SETTINGS_DIALOG_CNT)!.element as IApgDomDialog;
                dialog.close();
            }
        );


        const r = this.buildDialogControl(
            this.VIEWER_SETTINGS_DIALOG_CNT,
            "Credits:",
            [

                viewerSettingsDialogCloseButtonControl
            ]
        );
        return r;
    }

}
