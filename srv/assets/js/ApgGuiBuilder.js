import {
  eApgDomFormElementType,
  eApgDomInputType
} from "./ApgDom.ts";
import { ApgUtils } from "./ApgUtils.ts";
export class ApgGui_Builder {
  gui;
  name;
  constructor(agui, aname) {
    this.gui = agui;
    this.name = aname;
  }
  #addControl(aId, acontrol) {
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
  buildHtml(acontainer) {
    const r = "Override the ApgGuiBuilder.build() method to get the GUI";
    acontainer.innerHTML = r;
  }
  buildParagraphControl(aId, acontent, astyle) {
    const paragraphControl = {
      element: null,
      type: eApgDomFormElementType.PARAGRAPH
    };
    this.#addControl(aId, paragraphControl);
    const r = `
        <p
          id="${aId}"
          style="${astyle || ""}"
        >
            ${acontent}
        </p>
        `;
    return r;
  }
  buildDivControl(aId, acontent, astyle = "", ainjected) {
    const paragraphControl = {
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
  buildRangeControl(aId, acaption, avalue, amin, amax, astep, ainputCallback) {
    const rangeControl = {
      element: null,
      type: eApgDomFormElementType.INPUT,
      inputType: eApgDomInputType.RANGE,
      callback: ainputCallback
    };
    this.#addControl(aId, rangeControl);
    const outputControl = {
      element: null,
      type: eApgDomFormElementType.OUTPUT
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
  buildColorControl(aId, acaption, avalue, ainputCallback) {
    const colorControl = {
      element: null,
      type: eApgDomFormElementType.INPUT,
      inputType: eApgDomInputType.COLOR,
      callback: ainputCallback
    };
    this.#addControl(aId, colorControl);
    const outputControl = {
      element: null,
      type: eApgDomFormElementType.OUTPUT
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
                type="color"
                value="${avalue}"
                style="margin-bottom: 0.5rem"
            />
        </p>
        `;
    return r;
  }
  buildButtonControl(aId, acaption, aclickCallback) {
    const buttonControl = {
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
  buildCheckBoxControl(aId, acaption, avalue, achangeCallback) {
    const checkBoxControl = {
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
  buildFieldSetControl(acaption, acontrols) {
    const r = `
        <fieldset>
            <legend>${acaption}</legend>
            ${acontrols.join("\n")}
        </fieldset>
        `;
    return r;
  }
  buildGroupControl(aId, acaption, acontrols, aopened = false, atoggleCallback) {
    const groupControl = {
      element: null,
      type: eApgDomFormElementType.DETAILS,
      callback: atoggleCallback
    };
    this.#addControl(aId, groupControl);
    const r = `
        <details 
          id="${aId}"
          style="padding: 0.5rem; margin-bottom: 0px"
          ${aopened ? "open" : ""}
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
  buildPanelControl(aid, acontrols, acaption = "") {
    let caption = "";
    if (acaption != "") {
      caption = ` <p 
            style="margin: 0.25rem; text-align: center;"
        >${acaption}</p>
        `;
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
  buildSelectControl(aId, acaption, avalue, avalues, achangeCallback) {
    let caption = "";
    if (acaption != "") {
      caption = `
            <label
                for="${aId}"
                style="font-size: 0.75rem"
            >${acaption}:</label>
        `;
    }
    const selectControl = {
      element: null,
      type: eApgDomFormElementType.SELECT,
      callback: achangeCallback
    };
    this.#addControl(aId, selectControl);
    const options = [];
    for (const [key, value] of avalues) {
      const selected = key == avalue ? " selected" : "";
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
  buildDialogControl(aId, acaption, acontrols) {
    const dialogControl = {
      element: null,
      type: eApgDomFormElementType.DIALOG
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
      const control = this.gui.controls.get(id);
      const element = this.gui.document.getElementById(id);
      control.element = element;
      if (control.type == eApgDomFormElementType.DIV) {
        if (control.injected) {
          element.appendChild(control.injected);
        }
      }
      if (control.callback) {
        if (control.type == eApgDomFormElementType.INPUT) {
          if (control.inputType == void 0) {
            const message = `Input type of control ${control.element.id} is not defined`;
            alert(message);
            throw new Error(message);
          }
          switch (control.inputType) {
            case eApgDomInputType.RANGE: {
              element.addEventListener("input", control.callback);
              break;
            }
            case eApgDomInputType.CHECK_BOX: {
              element.addEventListener("change", control.callback);
              break;
            }
          }
        }
        if (control.type == eApgDomFormElementType.DETAILS) {
          element.addEventListener("toggle", control.callback);
        }
      }
      if (control.type == eApgDomFormElementType.BUTTON) {
        element.addEventListener("click", control.callback);
      }
      if (control.type == eApgDomFormElementType.SELECT) {
        element.addEventListener("change", control.callback);
      }
    }
  }
  /**
   * Adds reactivity to a control
   * @param aid Identificator of the control that has to be reactive
   * @param astate State object that contains the property associated to the reactive control
   * @param aprop Name of the property associated to the reactive control
   */
  addReactivity(aid, astate, aprop) {
    const control = this.gui.controls.get(aid);
    ApgUtils.Assert(
      control != void 0,
      `$$451 the control with id (${aid}) is not registered in the GUI!`
    );
    ApgUtils.Assert(
      astate[aprop] != void 0,
      `$$456 The property (${aprop}), is undefined in state object passed for reactivity!`
    );
    const propType = typeof astate[aprop];
    ApgUtils.Assert(
      propType == "string" || propType == "number" || propType == "boolean",
      `$$462 The type (${propType}) of the property (${aprop}) in state object passed for reactivity is not a managed one!`
    );
    control.reactive = { state: astate, prop: aprop };
  }
}
