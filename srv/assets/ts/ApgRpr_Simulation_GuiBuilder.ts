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

import {
    ApgGui_TReactiveState
} from "./ApgGui.ts";



/**
 * This is the simulator gui Builder that contains the elements shared by
 * all the simulations. It prepares the controls that allows to change the simulation, 
 * to tweak the simulation settings, to create the stats panels and the the credits 
 * dialog
 */
export class ApgRpr_Simulation_GuiBuilder extends ApgGui_Builder {

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
        const id = 'simulationSelectControl';
        const r = this.buildSelectControl(
            id,
            '',
            this.settings.simulation,
            simulationsKVs,
            () => {
                const select = this.gui.controls.get(id)!.element as IApgDomSelect;
                this.settings.simulation = select.value as ApgRpr_eSimulationName;
                this.gui.logNoTime(`Simulation control change event: ${select.value}`);
            }
        );
        return r;
    }



    #buildSimulationGroupControl() {

        const controls: string[] = [];

        const state = this.settings as unknown as ApgGui_TReactiveState;

        controls.push(this.#buildSimulationVelocityIterationsControl(
            'simulationVelocityIterationsControl',
            state
        ));

        controls.push(this.#buildSimulationFrictionIterationsControl(
            'simulationFrictionIterationsControl',
            state
        ));

        controls.push(this.#buildSimulationStabilizationIterationsControl(
            'simulationStabilizationIterationsControl',
            state
        ));

        controls.push(this.#buildSimulationCcdStepsControl(
            'simulationCcdStepsIterationsControl',
            state
        ));

        controls.push(this.#buildSimulationLinearErrorControl(
            'simulationLinearErrorControl',
            state
        ));

        controls.push(this.#buildSimulationErrorReductionRatioControl(
            'simulationErrorReductionRatioControl',
            state
        ));

        controls.push(this.#buildSimulationPredictionDistanceControl(
            'simulationPredictionDistanceControl',
            state
        ));

        controls.push(this.#buildSimulationSpeedControl(
            'simulationSpeedControl',
            state
        ));

        controls.push(this.#buildSimulationGravityDetailsControl(
            'simulationGravityDetailsControl',
            state
        ))

        controls.push(this.#buildResetButtonControl(
            'resetButtonControl'
        ));

        controls.push(this.#buildResetCameraButtonControl(
            'resetCameraButtonControl'
        ));

        controls.push(this.#buildDebugModeButtonControl(
            'debugModeButtonControl'
        ));

        const caption = "Simulation settings";
        const r = this.buildDetailsControl(
            "simulatorDetailsControl",
            caption,
            controls,
            this.settings.isSimulatorDetailsOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.settings.isSimulatorDetailsOpened = !this.settings.isSimulatorDetailsOpened
                    this.gui.devLogNoTime(`${caption} details toggled`);
                }
            }
        );

        return r;
    }



    buildRestartButtonControl() {
        const r = this.buildButtonControl(
            'restartButtonControl',
            'Restart',
            () => {
                this.settings.doRestart = true;
                this.gui.devLogNoTime('Restart button pressed');
            }
        );

        return r;
    }



    #buildDebugModeButtonControl(
        aId: string
    ) {
        const initialTitle = `Debug mode ${(this.settings.isDebugMode) ? "Off" : "On"}`;
        const r = this.buildButtonControl(
            aId,
            initialTitle,
            () => {
                this.settings.isDebugMode = !this.settings.isDebugMode;
                const button = this.gui.controls.get(aId)!.element as IApgDomButton;
                const title = `Debug mode ${(this.settings.isDebugMode) ? "Off" : "On"}`;
                button.innerText = title;
                this.gui.devLogNoTime('Debug mode button pressed');
            }
        );
        return r;
    }


    // #region Simulation Settings Controls -------------------------------------



    #buildSimulationVelocityIterationsControl(
        aId: string,
        state: ApgGui_TReactiveState
    ) {
        const caption = 'Velocity precision';
        const r = this.buildRangeControl(
            aId,
            caption,
            this.settings.velocityIterations,
            this.settings.velocityIterationsMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.velocityIterations = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
            }
        );
        this.gui.setReactiveControl(aId, state, 'velocityIterations');
        this.gui.setReactiveControl(aId + "Value", state, 'velocityIterations');
        return r;
    }



    #buildSimulationFrictionIterationsControl(
        aId: string,
        state: ApgGui_TReactiveState
    ) {
        const caption = 'Friction precision';
        const r = this.buildRangeControl(
            aId,
            caption,
            this.settings.frictionIterations,
            this.settings.frictionIterationsMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.frictionIterations = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
            }
        );
        this.gui.setReactiveControl(aId, state, 'frictionIterations');
        this.gui.setReactiveControl(aId + "Value", state, 'frictionIterations');
        return r;
    }



    #buildSimulationStabilizationIterationsControl(
        aId: string,
        state: ApgGui_TReactiveState
    ) {
        const caption = 'Stabilization precision';
        const r = this.buildRangeControl(
            aId,
            caption,
            this.settings.stabilizationIterations,
            this.settings.stabilizationIterationsMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.stabilizationIterations = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
            }
        );
        this.gui.setReactiveControl(aId, state, 'stabilizationIterations');
        this.gui.setReactiveControl(aId + "Value", state, 'stabilizationIterations');
        return r;
    }



    #buildSimulationCcdStepsControl(
        aId: string,
        astate: ApgGui_TReactiveState
    ) {
        const caption = 'CCD steps';
        const r = this.buildRangeControl(
            aId,
            caption,
            this.settings.ccdSteps,
            this.settings.ccdStepsMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.ccdSteps = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
            }
        );
        this.gui.setReactiveControl(aId, astate, 'ccdSteps');
        this.gui.setReactiveControl(aId + "Value", astate, 'ccdSteps');
        return r;
    }



    #buildSimulationLinearErrorControl(
        aId: string,
        astate: ApgGui_TReactiveState
    ) {
        const caption = 'Linear error';
        const r = this.buildRangeControl(
            aId,
            caption,
            this.settings.linearError,
            this.settings.linearErrorMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.linearError = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
            }
        );
        this.gui.setReactiveControl(aId, astate, 'linearError');
        this.gui.setReactiveControl(aId + "Value", astate, 'linearError');
        return r;
    }



    #buildSimulationErrorReductionRatioControl(
        aId: string,
        astate: ApgGui_TReactiveState
    ) {
        const caption = 'Error reduction';
        const r = this.buildRangeControl(
            aId,
            caption,
            this.settings.errorReductionRatio,
            this.settings.errorReductionRatioMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.errorReductionRatio = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
            }
        );
        this.gui.setReactiveControl(aId, astate, 'errorReductionRatio');
        this.gui.setReactiveControl(aId + "Value", astate, 'errorReductionRatio');
        return r;
    }



    #buildSimulationPredictionDistanceControl(
        aId: string,
        astate: ApgGui_TReactiveState
    ) {
        const caption ='Prediction distance' ;
        const r = this.buildRangeControl(
            aId,
            caption,
            this.settings.predictionDistance,
            this.settings.predictionDistanceMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.predictionDistance = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
            }
        );
        this.gui.setReactiveControl(aId, astate, 'predictionDistance');
        this.gui.setReactiveControl(aId + "Value", astate, 'predictionDistance');
        return r;
    }



    #buildSimulationSpeedControl(
        aId: string,
        astate: ApgGui_TReactiveState
    ) {
        const caption = 'Slowdown';
        const r = this.buildRangeControl(
            aId,
            caption,
            this.settings.slowDownFactor,
            this.settings.slowdownMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.slowDownFactor = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                this.gui.devLogNoTime(`${caption} change event: ${range.value}`);
            }
        );
        this.gui.setReactiveControl(aId, astate, 'slowDownFactor');
        this.gui.setReactiveControl(aId + "Value", astate, 'slowDownFactor');
        return r;
    }



    #buildResetCameraButtonControl(
        aId: string
    ) {
        const resetCameraButtonControl = this.buildButtonControl(
            aId,
            'Reset camera',
            () => {
                this.settings.doResetCamera = true;
                this.gui.devLogNoTime('Reset camera button pressed');
            }
        );
        return resetCameraButtonControl;
    }



    #buildResetButtonControl(
        aId: string
    ) {
        const r = this.buildButtonControl(
            aId,
            'Reset',
            () => {
                this.settings.doResetToDefaults = true;
                this.gui.devLogNoTime('Reset settings button pressed');
            }
        );
        return r;
    }

    // #endregion

    #buildSimulationGravityDetailsControl(
        aId: string,
        astate: ApgGui_TReactiveState
    ) {

        const controls: string[] = [];

        controls.push(this.#buildGravityXControl(
            'simulationGravityXControl',
            astate
        ));
        controls.push(this.#buildGravityYControl(
            'simulationGravityYControl',
            astate
        ));
        controls.push(this.#buildGravityZControl(
            'simulationGravityZControl',
            astate
        ));

        const caption = "Gravity";
        const r = this.buildDetailsControl(
            aId,
            caption,
            controls,
        );

        return r;
    }



    #buildGravityXControl(
        aId: string,
        astate: ApgGui_TReactiveState
    ) {
        const r = this.buildRangeControl(
            aId,
            'X axis',
            this.settings.gravity.x,
            this.settings.gravityXMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.gravity.x = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
            }
        );
        this.gui.setReactiveControl(aId, astate, 'gravity.x');
        this.gui.setReactiveControl(aId + "Value", astate, 'gravity.x');
        return r;
    }



    #buildGravityYControl(
        aId: string,
        astate: ApgGui_TReactiveState
    ) {
        const r = this.buildRangeControl(
            aId,
            'Y axis',
            this.settings.gravity.y,
            this.settings.gravityYMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.gravity.y = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
            }
        );
        this.gui.setReactiveControl(aId, astate, 'gravity.y');
        this.gui.setReactiveControl(aId + "Value", astate, 'gravity.y');
        return r;
    }



    #buildGravityZControl(
        aId: string,
        astate: ApgGui_TReactiveState
    ) {
        const r = this.buildRangeControl(
            aId,
            'Z axis',
            this.settings.gravity.z,
            this.settings.gravityZMMS,
            () => {
                const range = this.gui.controls.get(aId)!.element as IApgDomRange;
                this.settings.gravity.z = parseFloat(range.value);
                const output = this.gui.controls.get(`${aId}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
            }
        );
        this.gui.setReactiveControl(aId, astate, 'gravity.z');
        this.gui.setReactiveControl(aId + "Value", astate, 'gravity.z');
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
