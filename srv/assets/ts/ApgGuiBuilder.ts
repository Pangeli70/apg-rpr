/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/15]
 * -----------------------------------------------------------------------
*/

import {
  IApgDomButton,
  IApgDomCheckBox,
  IApgDomElement,
  IApgDomInput,
  IApgDomRange,
  TApgDomEventCallback,
  eApgDomFormElementType,
  eApgDomInputType
} from "./ApgDom.ts";
import { ApgGui, IApgGuiControl } from "./ApgGui.ts";


export class ApgGuiBuilder {

  gui: ApgGui

  constructor(
    agui: ApgGui
  ) {
    this.gui = agui;
  }


  #addControl(aId: string, acontrol: IApgGuiControl) {

    if (this.gui.controls.has(aId)) {
      const message = `The control ${aId} is already in the map. Maybe you are adding a control with the same name!`;
      alert(message);
      throw new Error(message);
    }

    this.gui.controls.set(aId, acontrol);
  }


  build(acontainer: IApgDomElement) {

    const r = "Override the ApgGuiBuilder.build() method to get the GUI";

    acontainer.innerHTML = r;
  }


  buildParagraphControl(
    aId: string,
    acontent: string,
    astyle?: string
  ) {
    const paragraphControl: IApgGuiControl = {
      element: null,
      type: eApgDomFormElementType.PARAGRAPH,
    };
    this.#addControl(aId, paragraphControl);
    const r = `
        <p style="${astyle || ''}">
            ${acontent}
        </p>
        `;
    return r;
  }

  buildDivControl(
    aId: string,
    acontent: string,
    astyle = "",
    ainjected?: IApgDomElement
  ) {
    const paragraphControl: IApgGuiControl = {
      element: null,
      type: eApgDomFormElementType.DIV,
      injected: ainjected
    };
    this.#addControl(aId, paragraphControl);

    const r = `
        <div
          id="${aId}"
          style="${astyle}"
        >
            ${acontent}
        </div>
        `;
    return r;
  }

  buildRangeControl(
    aId: string,
    acaption: string,
    avalue: number,
    amin: number,
    amax: number,
    astep: number,
    acallback: TApgDomEventCallback
  ) {
    const rangeControl: IApgGuiControl = {
      element: null,
      type: eApgDomFormElementType.INPUT,
      inputType: eApgDomInputType.RANGE,
      callback: acallback
    };
    this.#addControl(aId, rangeControl);

    const outputControl: IApgGuiControl = {
      element: null,
      type: eApgDomFormElementType.OUTPUT,
    };

    this.#addControl(`${aId}Value`, outputControl);
    const r = `
        <p style="margin-bottom: 0.25rem">
            <label
                for="${aId}"
                style="font-size: 0.75rem"
            >
                ${acaption}: 
                <output
                    id="${aId}Value"
                    for="${aId}"
                >${avalue}</output>
            </label>
            <input
                id="${aId}"
                name="${aId}"
                type="range"
                min="${amin}"
                max="${amax}"
                step="${astep}"
                value="${avalue}"
                style="margin-bottom: 0.5rem"
            />
        </p>
        `;
    return r;
  }

  buildButtonControl(
    aId: string,
    acaption: string,
    acallback: TApgDomEventCallback
  ) {
    const buttonControl: IApgGuiControl = {
      element: null,
      type: eApgDomFormElementType.BUTTON,
      callback: acallback
    };
    this.#addControl(aId, buttonControl);

    const r = `
        <p style="margin-bottom: 0.25rem">
            <button
              id="${aId}"
              type="button"
              style="padding:0.25rem; margin:0px"
            >${acaption}</button>
        </p>
        `;
    return r;
  }

  buildCheckBoxControl(
    aId: string,
    acaption: string,
    avalue: boolean,
    acallback: TApgDomEventCallback
  ) {
    const checkBoxControl: IApgGuiControl = {
      element: null,
      type: eApgDomFormElementType.INPUT,
      inputType: eApgDomInputType.CHECK_BOX,
      callback: acallback
    };
    this.#addControl(aId, checkBoxControl);
    const r = `
        <p style="margin-bottom: 0.25rem">
            <input
              id="${aId}"
              name="${aId}"
              type="checkbox"
              ${avalue ? "checked" : ""}
            />
            <label
                for="${aId}"
                style="font-size: 0.75rem"
            >${acaption}</label>
        </p>
        `;
    return r;
  }

  buildFieldSetControl(
    acaption: string,
    acontrols: string[]
  ) {
    const r = `
        <fieldset>
            <legend>${acaption}</legend>
            ${acontrols.join("\n")}
        </fieldset>
        `;
    return r;
  }

  buildGroupControl(
    acaption: string,
    acontrols: string[]
  ) {
    const r = `
        <details style="padding: 0.5rem; margin-bottom: 0px">
            <summary>${acaption}</summary>
            ${acontrols.join("\n")}
        </details>
        `;
    return r;
  }

  buildPanelControl(
    aid: string,
    acaption: string,
    acontrols: string[]
  ) {
    const r = `
        <p 
            style="margin: 0.25rem; text-align: center;"
        >${acaption}</p>
        
        <div
            id="${aid}" 
            style="overflow-y: auto; margin:0.25rem; background-color: #fafafa" 
        >${acontrols.join("\n")}</div>
        
        `;
    return r;
  }

  buildSelectControl(
    aId: string,
    acaption: string,
    avalue: string,
    avalues: Map<string, string>,
    acallback: TApgDomEventCallback
  ) {

    const selectControl: IApgGuiControl = {
      element: null,
      type: eApgDomFormElementType.SELECT,
      callback: acallback
    };
    this.#addControl(aId, selectControl);

    const options: string[] = [];
    for (const [key, value] of avalues) {
      const selected = (key == avalue) ? " selected" : "";
      const row = `<option value="${key}" ${selected}>${value}</option>`;
      options.push(row);
    }

    const r = `
        <p style="margin-bottom: 0.25rem">

            <label
                for="${aId}"
                style="font-size: 0.75rem"
            >${acaption}:</label>

            <select 
                id="${aId}"
                style="font-size: 0.75rem; padding: 0.25rem"
            >${options.join()}</select>

        </p>
        `;
    return r;
  }

  buildDialogControl(
    aId: string,
    acaption: string,
    acontrols: string[]
  ) {
    const dialogControl: IApgGuiControl = {
      element: null,
      type: eApgDomFormElementType.DIALOG,
    };
    this.#addControl(aId, dialogControl);

    const r = `
        <dialog
            id="${aId}"
            style="padding: 1rem; margin: 0px"
        >
            <article
                style="padding: 1rem; margin: 0px"
            >
                <h3
                    style="text-align: center; margin-bottom: 1rem"
                >${acaption}</h3>
                ${acontrols.join("\n")}
            </article>
        </dialog>
        `;
    return r;
  }

  bindControls() {
    for (const id of this.gui.controls.keys()) {

      const control = this.gui.controls.get(id)!;
      const element = this.gui.document.getElementById(id);

      control.element = element;

      if (control.type == eApgDomFormElementType.DIV) { 
        if (control.injected) {
          element.appendChild(control.injected);
        }
      }

      if (control.callback) {
        if (control.type == eApgDomFormElementType.INPUT) {

          if (control.inputType == undefined) {
            alert(`Input type of control ${control.element.id} is not defined`);
          }

          switch (control.inputType) {

            case eApgDomInputType.RANGE: {
              (element as IApgDomRange).addEventListener('input', control.callback as TApgDomEventCallback);
              //alert(`${control.element.id} Range bound`);
              break;
            }
            case eApgDomInputType.CHECK_BOX: {
              (element as IApgDomCheckBox).addEventListener('change', control.callback as TApgDomEventCallback);
              //alert(`${control.element.id} Checkbox bound`);
              break;
            }
          }
        }
      }
      if (control.type == eApgDomFormElementType.BUTTON) {
        (element as IApgDomButton).addEventListener('click', control.callback as TApgDomEventCallback);
        //alert(`${control.element.id} Button bound`);
      }
      if (control.type == eApgDomFormElementType.SELECT) {
        (element as IApgDomInput).addEventListener('change', control.callback as TApgDomEventCallback);
        //alert(`${control.element.id} Select bound`);
      }
    }
  }
}


