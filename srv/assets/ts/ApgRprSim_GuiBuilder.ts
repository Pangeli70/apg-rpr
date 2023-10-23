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
    ApgGui
} from "./ApgGui.ts";

import {
    ApgGui_Builder
} from "./ApgGui_Builder.ts";

import {
    IApgRprSim_Params
} from "./ApgRprSim_Base.ts";

import {
    ApgRprSim_DebugGuiBuilder
} from "./ApgRprSim_DebugGuiBuilder.ts";

import {
    ApgRprSim_StatsGuiBuilder
} from "./ApgRprSim_StatsGuiBuilder.ts";

import {
    ApgRpr_eSimulationName
} from "./ApgRpr_Simulations.ts";

import {
    ApgWgl_GuiBuilder
} from "./ApgWgl_GuiBuilder.ts";



/**
 * This is the basic simulation gui Builder that contains the elements shared by
 * all the simulations. It prepares the controls that allows to change the simulation, 
 * to tweak the simulation settings, to create the stats panels and the the credits 
 * dialog
 */
export class ApgRprSim_GuiBuilder extends ApgGui_Builder {

    params: IApgRprSim_Params;


    readonly CREDITS_DIALOG_CNT = 'creditsDialogControl';

    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params,
    ) {
        super(agui, aparams.simulation);

        this.params = aparams;
    }


    /**
     * 
     * @returns 
     */
    override buildPanel() {

        const simulationGroupControl = this.#buildSimulationGroupControl();

        const statsGroupControl = new ApgRprSim_StatsGuiBuilder(this.gui, this.params)
            .buildPanel();
        const debugGroupControl = new ApgRprSim_DebugGuiBuilder(this.gui, this.params.debugInfo!)
            .buildPanel();


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

                const stringifiedSettings = JSON.stringify(this.params.guiSettings!);
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

        const viewerSettingsControls = new ApgWgl_GuiBuilder(this.gui, this.name, this.params.viewer!)
            .buildPanel();

        const controls = [
            simulationGroupControl,
            statsGroupControl,
            debugGroupControl,
            fullscreenButtonControl,
            getUrlButtonControl,
            creditsDialogControl,
            creditsButtonControl,
            viewerSettingsControls
        ];
        const r = controls.join("\n");

        return r;

    }


    override buildHud() {
        return "";
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
            this.params.guiSettings!.velocityIterationsMMS,
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
            this.params.guiSettings!.frictionIterationsMMS,
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
            this.params.guiSettings!.stabilizationIterationsMMS,
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
            this.params.guiSettings!.linearErrorMMS,
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
            this.params.guiSettings!.errorReductionRatioMMS,
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
            this.params.guiSettings!.predictionDistanceMMS,
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
            this.params.guiSettings!.slowdownMMS,
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

        const r = this.buildDetailsControl(
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
