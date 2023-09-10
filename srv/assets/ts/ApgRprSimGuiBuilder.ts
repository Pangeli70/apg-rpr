/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/16]
 * -----------------------------------------------------------------------
*/

import { IApgRprSim_Params } from "./ApgRprSimulationBase.ts";
import {
IApgDomButton,
  IApgDomDialog, IApgDomElement,
  IApgDomRange, IApgDomSelect
} from "./ApgDom.ts";
import { ApgGui_Builder } from "./ApgGuiBuilder.ts";
import { ApgRprSimStatsGuiBuilder } from "./ApgRprSimStatsGuiBuilder.ts";
import { ApgRprSimDebugGuiBuilder } from "./ApgRprSimDebugGuiBuilder.ts";
import { ApgGui } from "./ApgGui.ts";
import { ApgRpr_eSimulationName } from "./ApgRpr_Simulations.ts";



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
  override buildHtml() {

    const simulationGroupControl = this.#buildSimulationGroupControl();

    const statsGroupControl = new ApgRprSimStatsGuiBuilder(this.gui, this.params)
      .buildHtml();
    const debugGroupControl = new ApgRprSimDebugGuiBuilder(this.gui, this.params.debugInfo!)
      .buildHtml();

    const creditsDialogControl = this.#buildCreditsDialogControl();

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

    const CREDITS_BTN_CNT = 'creditsButtonControl';
    const creditsButtonControl = this.buildButtonControl(
      CREDITS_BTN_CNT,
      'Credits',
      () => {
        const dialog = this.gui.controls.get(this.CREDITS_DIALOG_CNT)!.element as IApgDomDialog;
        dialog.showModal();

      }
    );

    const controls = [
      simulationGroupControl,
      statsGroupControl,
      debugGroupControl,
      creditsDialogControl,
      fullscreenButtonControl,
      creditsButtonControl
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
        this.gui.log('Restart button pressed');
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

    const r = this.buildGroupControl(
      "simulationGroupControl",
      "Simulation:",
      [
        simulationVelocityIterationsControl,
        simulationFrictionIterationsControl,
        simulationStabilizationIterationsControl,
        simulationLinearErrorControl,
        simulationErrorReductionRatioControl,
        simulationSpeedControl,
      ],
      this.params.guiSettings!.isSimulationGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.params.guiSettings!.isSimulationGroupOpened = !this.params.guiSettings!.isSimulationGroupOpened
          this.gui.log('Simulation group toggled');
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
