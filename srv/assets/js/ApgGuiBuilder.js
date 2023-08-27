import {
  eApgDomFormElementType,
  eApgDomInputType
} from "./ApgDom.ts";
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
        <p style="${astyle || ""}">
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
  buildPanelControl(aid, acaption, acontrols) {
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
  buildSelectControl(aId, acaption, avalue, avalues, achangeCallback) {
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
}
