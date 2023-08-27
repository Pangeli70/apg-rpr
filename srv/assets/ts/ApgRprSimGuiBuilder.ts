/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/16]
 * -----------------------------------------------------------------------
*/

import { IApgRprSim_Params } from "./ApgRprSimulationBase.ts";
import {
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

    const statsGroupControl = new ApgRprSimStatsGuiBuilder(this.gui, this.params)
      .buildHtml();
    const debugGroupControl = new ApgRprSimDebugGuiBuilder(this.gui, this.params.debugInfo!)
      .buildHtml();

    const simulationGroupControl = this.#buildSimulationGroupControl();

    const creditsDialogControl = this.#buildCreditsDialogControl();

    const RESTART_BTN_CNT = 'restartButtonControl';
    const restartSimulationButtonControl = this.buildButtonControl(
      RESTART_BTN_CNT,
      'Restart',
      () => {
        this.params.restart = true;
        this.gui.log('Restart button pressed');
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
      restartSimulationButtonControl,
      simulationGroupControl,
      statsGroupControl,
      debugGroupControl,
      creditsDialogControl,
      creditsButtonControl
    ];
    const r = controls.join("\n");

    return r;

  }


  #buildSimulationGroupControl() {

    const keyValues = new Map<string, string>();
    for (const panel of this.params.simulations!) {
      keyValues.set(panel, panel);
    }
    const SIM_SELECT_CNT = 'simulationSelectControl';
    const simulationSelectControl = this.buildSelectControl(
      SIM_SELECT_CNT,
      'Change',
      this.params.simulation!,
      keyValues,
      () => {
        const select = this.gui.controls.get(SIM_SELECT_CNT)!.element as IApgDomSelect;
        this.params.simulation = select.value as ApgRpr_eSimulationName;
        //alert(select.value);
      }
    );

    const SIM_VEL_ITER_CNT = 'simulationVelocityIterationControl';
    const simulationVelocityIterationControl = this.buildRangeControl(
      SIM_VEL_ITER_CNT,
      'Precision',
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
        simulationSelectControl,
        simulationVelocityIterationControl,
        simulationSpeedControl,
      ],
      this.params.guiSettings!.isSimulationGroupOpened,
      () => {
        if (!this.gui.isRefreshing){ 
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
