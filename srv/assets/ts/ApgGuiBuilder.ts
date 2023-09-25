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
import { ApgGui, ApgGui_IControl } from "./ApgGui.ts";


export class ApgGui_Builder {

  gui: ApgGui;
  name: string;

  constructor(
    agui: ApgGui,
    aname: string
  ) {
    this.gui = agui;
    this.name = aname;
  }


  #addControl(aId: string, acontrol: ApgGui_IControl) {

    if (this.gui.controls.has(aId)) {
      const message = `The control ${aId} is already in the map. Maybe you are adding a control with the same name!`;
      alert(message);
      throw new Error(message);
    }

    this.gui.controls.set(aId, acontrol);
  }


  /**
   * 
   * @param acontainer 
   */
  buildHtml(acontainer: IApgDomElement) {

    const r = "Override the ApgGuiBuilder.build() method to get the GUI";

    acontainer.innerHTML = r;
  }


  buildParagraphControl(
    aId: string,
    acontent: string,
    astyle?: string
  ) {
    const paragraphControl: ApgGui_IControl = {
      element: null,
      type: eApgDomFormElementType.PARAGRAPH,
    };
    this.#addControl(aId, paragraphControl);
    const r = `
        <p
          id="${aId}"
          style="${astyle || ''}"
        >
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
    const paragraphControl: ApgGui_IControl = {
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
    ainputCallback: TApgDomEventCallback
  ) {

    const rangeControl: ApgGui_IControl = {
      element: null,
      type: eApgDomFormElementType.INPUT,
      inputType: eApgDomInputType.RANGE,
      callback: ainputCallback
    };
    this.#addControl(aId, rangeControl);

    const outputControl: ApgGui_IControl = {
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
    aclickCallback: TApgDomEventCallback
  ) {
    const buttonControl: ApgGui_IControl = {
      element: null,
      type: eApgDomFormElementType.BUTTON,
      callback: aclickCallback
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
    achangeCallback: TApgDomEventCallback
  ) {
    const checkBoxControl: ApgGui_IControl = {
      element: null,
      type: eApgDomFormElementType.INPUT,
      inputType: eApgDomInputType.CHECK_BOX,
      callback: achangeCallback
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
    aId: string,
    acaption: string,
    acontrols: string[],
    aopened = false,
    atoggleCallback?: TApgDomEventCallback
  ) {
    const groupControl: ApgGui_IControl = {
      element: null,
      type: eApgDomFormElementType.DETAILS,
      callback: atoggleCallback
    };
    this.#addControl(aId, groupControl);

    const r = `
        <details 
          id="${aId}"
          style="padding: 0.5rem; margin-bottom: 0px"
          ${aopened ? 'open' : ''}
        >
            <summary>${acaption}</summary>
            ${acontrols.join("\n")}
        </details>
        `;
    return r;
  }


  /**
   * Build a panel control
   * @param aid Identificator
   * @param acontrols List of other HTML controls inside the panel
   * @param acaption Optional title for the panel: if empty won't be rendered
   * @returns the full HTML of the panel ready to be injectend in the DOM with (element).appendChild
   */
  buildPanelControl(
    aid: string,
    acontrols: string[],
    acaption = "",
  ) {

    let caption = '';

    if (acaption != '') {
      caption = ` <p 
            style="margin: 0.25rem; text-align: center;"
        >${acaption}</p>
        `
    }

    const r = `
       ${caption}
        <div
            id="${aid}" 
            style="overflow-y: auto; margin:0.25rem; background-color: #fafafa" 
        >${acontrols.join("\n")}</div>
        
        `;
    return r;
  }


  /**
   * Build a select control
   * @param aId Identificator
   * @param acaption Optional title for the control, if empty won't be rendered
   * @param avalue current value of the select element
   * @param avalues Map of key/value pairs for the select options 
   * @param achangeCallback A callback to be executed when the value changes
   * @returns the full HTML of the control ready to be added to a list of other controls
   */
  buildSelectControl(
    aId: string,
    acaption: string,
    avalue: string,
    avalues: Map<string, string>,
    achangeCallback: TApgDomEventCallback
  ) {

    let caption = '';

    if (acaption != '') {
      caption = `
            <label
                for="${aId}"
                style="font-size: 0.75rem"
            >${acaption}:</label>
        `
    }

    const selectControl: ApgGui_IControl = {
      element: null,
      type: eApgDomFormElementType.SELECT,
      callback: achangeCallback
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
        ${caption}
            <select 
                id="${aId}"
                style="padding: 0.125rem; margin: 0px;"
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
    const dialogControl: ApgGui_IControl = {
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


  /**
   * After the dinamic insertion of the ApgGui controls in the DOM as elements 
   * this method binds each control with its element and if provided adds to the
   * element the appropriate event listeners.
   */
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
            const message = `Input type of control ${control.element.id} is not defined`
            alert(message);
            throw new Error(message);
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

        if (control.type == eApgDomFormElementType.DETAILS) {
          (element as IApgDomButton).addEventListener('toggle', control.callback as TApgDomEventCallback);
          //alert(`${control.element.id} Details group bound`);
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


