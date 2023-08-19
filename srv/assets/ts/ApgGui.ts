/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/15]
 * -----------------------------------------------------------------------
*/

import {
  IApgDomDocument,
  IApgDomElement,
  IApgDomUl,
  TApgDomEventCallback,
  eApgDomFormElementType,
  eApgDomInputType
} from "./ApgDom.ts";

export interface ApgGui_IMinMaxStep {
  min: number;
  max: number;
  step: number;
}

export interface ApgGui_IControl {
  element: (IApgDomElement | null);

  type: eApgDomFormElementType;

  inputType?: eApgDomInputType;

  callback?: TApgDomEventCallback;

  injected?: IApgDomElement;
}

export class ApgGui {

  private _creation: number;
  private _log: string[] = [];
  private readonly LOG_SIZE = 100;
  private _logUl: IApgDomUl;

  isRefreshing = false;
  controls: Map<string, ApgGui_IControl> = new Map();
  document: IApgDomDocument;

  constructor(
    adocument: IApgDomDocument
  ) {
    this._creation = (performance || Date).now();
    this.document = adocument;
    
    const d = this.document.createElement('div');
    d.style.cssText = "position: absolute; top: 0; right: 0.5%; width: 20%; height:50%; overflow: auto; background-color: #385167bd;";
    this.document.body.appendChild(d);

    this._logUl = this.document.createElement('ul') as IApgDomUl;
    this._logUl.style.cssText = "font-family: 'Lucida console', 'Courier New', monospace; margin: 0.25rem; font-weight: 500; padding-left:0.4rem";
    d.appendChild(this._logUl);

    this.log('ApgGui created', true);
  }


  clearControls() {
    this.controls.clear();
  }


  log(aitem: string, aprependTimeStamp = true) {

    if (aprependTimeStamp) {
      const now = (performance || Date).now();
      const deltaTime = (now - this._creation) / 1000;
      const prepend = deltaTime.toFixed(3).padStart(8, '0') + 's ';
      aitem = prepend + aitem;
    }
    else { 
      aitem = " ".padStart(10, ".") + aitem ;
    }

    if (this._log.length >= this.LOG_SIZE) {
      this._log.shift();
      if (this._logUl) {
        const lastLi = this._logUl.children[this._logUl.children.length - 1];
        this._logUl.removeChild(lastLi);
      }
    }
    this._log.push(aitem);
    if (this._logUl) {
      const li = this.document.createElement('li');
      li.innerText = aitem;
      li.style.cssText = "font-size: 0.4rem; margin-top: 0.1rem; margin-bottom: 0.1rem; color: #ffe53edb;";
      const firstLi = this._logUl.children[0];
      this._logUl.insertBefore(li, firstLi);
    }
  }

}