/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/16]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomButton,
    IApgDomDialog,
    IApgDomElement,
    IApgDomRange,
    IApgDomSelect
} from "./ApgDom.ts";

import {
    ApgGui_Builder
} from "./ApgGui_Builder.ts";

import {
    ApgRpr_ISimulationSettings,
} from "./ApgRpr_Simulation.ts";

import {
    ApgRpr_Debug_GuiBuilder
} from "./ApgRpr_Debug_GuiBuilder.ts";

import {
    ApgGui_Logger_GuiBuilder
} from "./ApgGui_Logger_GuiBuilder.ts";

import {
    ApgRpr_Stats_GuiBuilder
} from "./ApgRpr_Stats_GuiBuilder.ts";

import {
    ApgRpr_eSimulationName
} from "./ApgRpr_Simulations.ts";

import {
    ApgWgl_GuiBuilder
} from "./ApgWgl_GuiBuilder.ts";

import {
    ApgRpr_Simulator
} from "./ApgRpr_Simulator.ts";
import { ApgGui_TReactiveState } from "./ApgGui.ts";



/**
 * This is the simulator gui Builder that contains the elements shared by
 * all the simulations. It prepares the controls that allows to change the simulation, 
 * to tweak the simulation settings, to create the stats panels and the the credits 
 * dialog
 */
export class ApgRpr_Simulator_GuiBuilder extends ApgGui_Builder {

    private simulator: ApgRpr_Simulator;
    private settings: ApgRpr_ISimulationSettings;

    readonly CREDITS_DIALOG_CNT = 'creditsDialogControl';

    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator.gui, asettings.simulation);

        this.simulator = asimulator;
        this.settings = asettings;
    }



    /**
     * 
     * @returns 
     */
    override buildControls() {

        const simulationGroupControl = this.#buildSimulationGroupControl();

        const statsControls = new ApgRpr_Stats_GuiBuilder(this.gui, this.simulator.stats!)
            .buildControls();

        const debugControls = new ApgRpr_Debug_GuiBuilder(this.gui, this.simulator.debugInfo)
            .buildControls();

        const loggerControls = new ApgGui_Logger_GuiBuilder(this.gui, this.simulator.logger)
            .buildControls();

        const FULLSCREEN_BTN_CNT = 'fullscreenButtonControl';
        const fullscreenButtonControl = this.buildButtonControl(
            FULLSCREEN_BTN_CNT,
            'Go full screen',
            () => {
                const button = this.gui.controls.get(FULLSCREEN_BTN_CNT)!.element as IApgDomButton;
                const docElement = this.gui.document.documentElement;
                if (docElement.requestFullscreen) {
                    if (!this.gui.document.fullscreenElement) {
                        docElement.requestFullscreen();
                        button.innerText = 'Exit full screen';
                    }
                    else {
                        this.gui.document.exitFullscreen();
                        button.innerText = 'Go full screen';
                    }
                }
                else {
                    alert('Full screen not supported');
                }
            }
        );


        const GET_URL_BTN_CNT = 'getUrlButtonControl';
        const getUrlButtonControl = this.buildButtonControl(
            GET_URL_BTN_CNT,
            'Get url',
            () => {

                const stringifiedSettings = JSON.stringify(this.settings);
                const b64EncodedSettings = btoa(stringifiedSettings);
                alert(stringifiedSettings);
                alert(b64EncodedSettings);
                alert('length: ' + b64EncodedSettings.length);
                prompt('Copy url', "p=" + b64EncodedSettings)
            }
        );

        const creditsDialogControl = this.#buildCreditsDialogControl();

        const CREDITS_BTN_CNT = 'creditsButtonControl';
        const creditsButtonControl = this.buildButtonControl(
            CREDITS_BTN_CNT,
            'Credits',
            () => {
                const dialog = this.gui.controls.get(this.CREDITS_DIALOG_CNT)!.element as IApgDomDialog;
                dialog.showModal();

            }
        );

        const viewerSettingsControls = new ApgWgl_GuiBuilder(this.gui, this.name, this.simulator.viewer!)
            .buildControls();

        const controls = [
            simulationGroupControl,
            statsControls,
            debugControls,
            loggerControls,
            fullscreenButtonControl,
            getUrlButtonControl,
            creditsDialogControl,
            creditsButtonControl,
            viewerSettingsControls
        ];
        const r = controls.join("\n");

        return r;

    }



    override buildControlsToContainer() {
        return "";
    }



    buildSimulationChangeControl() {
        const simulationsKVs = new Map<string, string>();
        for (const simulation of this.simulator.simulationsNames) {
            simulationsKVs.set(simulation, simulation);
        }
        const SIM_SELECT_CNT = 'simulationSelectControl';
        const r = this.buildSelectControl(
            SIM_SELECT_CNT,
            '',
            this.settings.simulation,
            simulationsKVs,
            () => {
                const select = this.gui.controls.get(SIM_SELECT_CNT)!.element as IApgDomSelect;
                this.settings.simulation = select.value as ApgRpr_eSimulationName;
                //this.settings.doRestart;
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
                this.settings.doRestart = true;
                this.gui.logNoTime('Restart button pressed');
            }
        );

        return r;
    }



    #buildSimulationGroupControl() {
        const state = this.settings as unknown as ApgGui_TReactiveState;

        const SIM_VEL_ITER_CNT = 'simulationVelocityIterationsControl';
        const simulationVelocityIterationsControl = this.buildRangeControl(
            SIM_VEL_ITER_CNT,
            'Velocity precision',
            this.settings.velocityIterations,
            this.settings.velocityIterationsMMS,
            () => {
                const range = this.gui.controls.get(SIM_VEL_ITER_CNT)!.element as IApgDomRange;
                this.settings.velocityIterations = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_VEL_ITER_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );
        this.gui.setReactiveControl(SIM_VEL_ITER_CNT, state, 'velocityIterations');
        this.gui.setReactiveControl(SIM_VEL_ITER_CNT + "Value", state, 'velocityIterations');

        const SIM_FRIC_ITER_CNT = 'simulationFrictionIterationsControl';
        const simulationFrictionIterationsControl = this.buildRangeControl(
            SIM_FRIC_ITER_CNT,
            'Friction precision',
            this.settings.frictionIterations,
            this.settings.frictionIterationsMMS,
            () => {
                const range = this.gui.controls.get(SIM_FRIC_ITER_CNT)!.element as IApgDomRange;
                this.settings.frictionIterations = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_FRIC_ITER_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );
        this.gui.setReactiveControl(SIM_FRIC_ITER_CNT, state, 'frictionIterations');
        this.gui.setReactiveControl(SIM_FRIC_ITER_CNT + "Value", state, 'frictionIterations');

        const SIM_STAB_ITER_CNT = 'simulationStabilizationIterationsControl';
        const simulationStabilizationIterationsControl = this.buildRangeControl(
            SIM_STAB_ITER_CNT,
            'Stabilization precision',
            this.settings.stabilizationIterations,
            this.settings.stabilizationIterationsMMS,
            () => {
                const range = this.gui.controls.get(SIM_STAB_ITER_CNT)!.element as IApgDomRange;
                this.settings.stabilizationIterations = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_STAB_ITER_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );
        this.gui.setReactiveControl(SIM_STAB_ITER_CNT, state, 'stabilizationIterations');
        this.gui.setReactiveControl(SIM_STAB_ITER_CNT + "Value", state, 'stabilizationIterations');

        const SIM_LIN_ERR_CNT = 'simulationLinearErrorControl';
        const simulationLinearErrorControl = this.buildRangeControl(
            SIM_LIN_ERR_CNT,
            'Linear error',
            this.settings.linearError,
            this.settings.linearErrorMMS,
            () => {
                const range = this.gui.controls.get(SIM_LIN_ERR_CNT)!.element as IApgDomRange;
                this.settings.linearError = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_LIN_ERR_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );
        this.gui.setReactiveControl(SIM_LIN_ERR_CNT, state, 'linearError');
        this.gui.setReactiveControl(SIM_LIN_ERR_CNT + "Value", state, 'linearError');

        const SIM_ERR_REDUC_RATIO_CNT = 'simulationErrorReductionRatioControl';
        const simulationErrorReductionRatioControl = this.buildRangeControl(
            SIM_ERR_REDUC_RATIO_CNT,
            'Error reduction',
            this.settings.errorReductionRatio,
            this.settings.errorReductionRatioMMS,
            () => {
                const range = this.gui.controls.get(SIM_ERR_REDUC_RATIO_CNT)!.element as IApgDomRange;
                this.settings.errorReductionRatio = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_ERR_REDUC_RATIO_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );
        this.gui.setReactiveControl(SIM_ERR_REDUC_RATIO_CNT, state, 'errorReductionRatio');
        this.gui.setReactiveControl(SIM_ERR_REDUC_RATIO_CNT + "Value", state, 'errorReductionRatio');

        const SIM_PREDICTION_DISTANCE_CNT = 'simulationPredictionDistanceControl';
        const simulationPredictionDistanceControl = this.buildRangeControl(
            SIM_PREDICTION_DISTANCE_CNT,
            'Prediction distance',
            this.settings.predictionDistance,
            this.settings.predictionDistanceMMS,
            () => {
                const range = this.gui.controls.get(SIM_PREDICTION_DISTANCE_CNT)!.element as IApgDomRange;
                this.settings.predictionDistance = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_PREDICTION_DISTANCE_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );
        this.gui.setReactiveControl(SIM_PREDICTION_DISTANCE_CNT, state, 'predictionDistance');
        this.gui.setReactiveControl(SIM_PREDICTION_DISTANCE_CNT + "Value", state, 'predictionDistance');

        const SIM_SPEED_CNT = 'simulationSpeedControl';
        const simulationSpeedControl = this.buildRangeControl(
            SIM_SPEED_CNT,
            'Slowdown',
            this.settings.slowDownFactor,
            this.settings.slowdownMMS,
            () => {
                const range = this.gui.controls.get(SIM_SPEED_CNT)!.element as IApgDomRange;
                this.settings.slowDownFactor = parseFloat(range.value);
                const output = this.gui.controls.get(`${SIM_SPEED_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );
        this.gui.setReactiveControl(SIM_SPEED_CNT, state, 'slowDownFactor');
        this.gui.setReactiveControl(SIM_SPEED_CNT + "Value", state, 'slowDownFactor');

        const RESET_BTN_CNT = 'resetButtonControl';
        const resetButtonControl = this.buildButtonControl(
            RESET_BTN_CNT,
            'Reset',
            () => {
                this.settings.doResetToDefaults = true;
                this.gui.devLogNoTime('Reset button pressed');
            }
        );

        const RESET_CAMERA_BTN_CNT = 'resetCameraButtonControl';
        const resetCameraButtonControl = this.buildButtonControl(
            RESET_CAMERA_BTN_CNT,
            'Reset camera',
            () => {
                this.settings.doResetCamera = true;
                this.gui.devLogNoTime('Reset camera button pressed');
            }
        );

        const initialTitle = `Debug mode ${(this.settings.isDebugMode) ? "Off" : "On"}`;
        const DEBUG_MODE_BTN_CNT = 'debugModeButtonControl';
        const debugModeButtonControl = this.buildButtonControl(
            DEBUG_MODE_BTN_CNT,
            initialTitle,
            () => {
                this.settings.isDebugMode = !this.settings.isDebugMode;
                const button = this.gui.controls.get(DEBUG_MODE_BTN_CNT)!.element as IApgDomButton;
                const title = `Debug mode ${(this.settings.isDebugMode) ? "Off" : "On"}`;
                button.innerText = title;
                this.gui.devLogNoTime('Debug mode button pressed');
            }
        );

        const r = this.buildDetailsControl(
            "simulatorDetailsControl",
            "Simulator params:",
            [
                simulationVelocityIterationsControl,
                simulationFrictionIterationsControl,
                simulationStabilizationIterationsControl,
                simulationLinearErrorControl,
                simulationErrorReductionRatioControl,
                simulationPredictionDistanceControl,
                simulationSpeedControl,
                debugModeButtonControl,
                resetCameraButtonControl,
                resetButtonControl,
            ],
            this.settings.isSimulatorDetailsOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.settings.isSimulatorDetailsOpened = !this.settings.isSimulatorDetailsOpened
                    this.gui.devLogNoTime('Simultor details toggled');
                }
            }
        );

        return r;
    }



    #buildCreditsDialogControl() {
        const footer = this.gui.document.getElementById('footer');
        footer.innerHTML;

        const CREDITS_CLOSE_BTN_CNT = 'creditsCloseButtonControl';
        const creditsCloseButtonControl = this.buildButtonControl(
            CREDITS_CLOSE_BTN_CNT,
            'Close',
            () => {
                const dialog = this.gui.controls.get(this.CREDITS_DIALOG_CNT)!.element as IApgDomDialog;
                dialog.close();
            }
        );


        const r = this.buildDialogControl(
            this.CREDITS_DIALOG_CNT,
            "Credits:",
            [
                footer.innerHTML,
                creditsCloseButtonControl
            ]
        );
        return r;
    }

}
