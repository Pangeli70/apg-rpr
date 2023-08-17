/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/15]
 * -----------------------------------------------------------------------
*/

import {
  IApgDomDocument,
  IApgDomElement,
  TApgDomEventCallback,
  eApgDomFormElementType,
  eApgDomInputType
} from "./ApgDom.ts";


export interface IApgGuiControl {
  element: (IApgDomElement | null);

  type: eApgDomFormElementType;

  inputType?: eApgDomInputType;

  callback?: TApgDomEventCallback;

  injected?: IApgDomElement;
}

export class ApgGui { 

  controls: Map<string, IApgGuiControl> = new Map();
  document: IApgDomDocument;

  constructor(
    adocument: IApgDomDocument
  ) {
    this.document = adocument;
  }

  clearControls() { 
    this.controls.clear();
  }

}