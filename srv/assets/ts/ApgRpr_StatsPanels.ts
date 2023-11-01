/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
  IApgDomDocument
} from "./ApgDom.ts";

import {
  ApgGui_StatsPanel
} from "./ApgGui_StatsPanel.ts";




export class ApgRpr_Step_StatsPanel extends ApgGui_StatsPanel {

  constructor(
    adocument: IApgDomDocument,
    adevicePixelRatio: number,
    awidth: number,
    aname = 'Simulation time',
    ameasureUnit = 'ms (step)',
    aprecision = -1,
    aforeGroundFillStyle = '#ff8',
    abackGroundFillStyle = '#221'
  ) {
    super(
      adocument, adevicePixelRatio, awidth,
      aname, ameasureUnit, aprecision,
      aforeGroundFillStyle, abackGroundFillStyle
    );
  }


  override end(aendTime?: number) {
    super.end(aendTime);
    const ms = this.endTime - this.beginTime;
    this.update(ms);
  }

}



export class ApgRpr_Colliders_StatsPanel extends ApgGui_StatsPanel {

  constructor(
    adocument: IApgDomDocument,
    adevicePixelRatio: number,
    awidth: number,
    aname = 'Num. of colliders',
    ameasureUnit = 'pcs',
    aprecision = 0,
    aforeGroundFillStyle = '#f08',
    abackGroundFillStyle = '#921'
  ) {
    super(
      adocument, adevicePixelRatio, awidth,
      aname, ameasureUnit, aprecision,
      aforeGroundFillStyle, abackGroundFillStyle
    );
  }

}
