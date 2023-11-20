import {
  ApgGui_eFormElementType,
  ApgGui_eInputType
} from "../interfaces/ApgGui_Dom.ts";
import {
  ApgGui
} from "./ApgGui.ts";
export class ApgGui_Builder {
  gui;
  name;
  constructor(agui, aname) {
    this.gui = agui;
    this.name = aname;
  }
  //--------------------------------------------------------------------------
  // #region Controls Management
  /**
   * Adds safely a control checking if it is already in the map of controls
   * @param acontrolId 
   * @param acontrol 
   */
  #addControl(acontrolId, acontrol) {
    ApgGui.AssertNot(
      this.gui.controls.has(acontrolId),
      `$$0063 The control ${acontrolId} is already in the map. Maybe you are adding a control with the same name!`
    );
    this.gui.controls.set(acontrolId, acontrol);
  }
  /**
   * Adds reactivity to a control
   * @param acontrolId Identifier of the control that has to become reactive
   * @param astate State object that contains the property associated to the reactive control
   * @param aprop Name of the property associated to the reactive control
   */
  addReactivityToControl(acontrolId, astate, aprop) {
    const control = this.gui.controls.get(acontrolId);
    ApgGui.Assert(
      control != void 0,
      `$$0087 The control with id (${acontrolId}) is not registered in the GUI!`
    );
    ApgGui.Assert(
      astate[aprop] != void 0,
      `$$092 The property (${aprop}), is undefined in state object passed for reactivity!`
    );
    const propType = typeof astate[aprop];
    ApgGui.Assert(
      propType == "string" || propType == "number" || propType == "boolean",
      `$$0098 The type (${propType}) of the property (${aprop}) in state object passed for reactivity is not a managed one!`
    );
    control.reactive = { state: astate, prop: aprop };
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
      if (control.type == ApgGui_eFormElementType.DIV) {
        if (control.injected) {
          element.appendChild(control.injected);
        }
      }
      if (control.callback) {
        if (control.type == ApgGui_eFormElementType.INPUT) {
          ApgGui.AssertNot(
            control.inputType == void 0,
            `$$0132 Input type of control ${control.element.id} is not defined`
          );
          switch (control.inputType) {
            case ApgGui_eInputType.RANGE: {
              element.addEventListener("input", control.callback);
              this.gui.devLog(`${control.element.id} Range input event bound`);
              break;
            }
            case ApgGui_eInputType.CHECK_BOX: {
              element.addEventListener("change", control.callback);
              this.gui.devLog(`${control.element.id} Checkbox change event bound`);
              break;
            }
            case ApgGui_eInputType.COLOR: {
              element.addEventListener("change", control.callback);
              this.gui.devLog(`${control.element.id} Color picker change event bound`);
              break;
            }
          }
        }
        if (control.type == ApgGui_eFormElementType.DETAILS) {
          element.addEventListener("toggle", control.callback);
          this.gui.devLog(`${control.element.id} Details toggle event bound`);
        }
      }
      if (control.type == ApgGui_eFormElementType.BUTTON) {
        element.addEventListener("click", control.callback);
        this.gui.devLog(`${control.element.id} Button click event bound`);
      }
      if (control.type == ApgGui_eFormElementType.SELECT) {
        element.addEventListener("change", control.callback);
        this.gui.devLog(`${control.element.id} Select change event bound`);
      }
    }
  }
  /**
   * Virtual method that has to be overriden by the descendants of this class
   * to get a chunk of Html made of several controls ready for the GUI
   */
  buildControls() {
    const r = "<p>Override the ApgGui_Builder.buildControlsForGui() method to create controls for the GUI</p>";
    return r;
  }
  /**
   * Virtual method that has to be overriden by the descendants of this class
   * to get a chunk of Html made of several controls ready for the HUD
   */
  buildHudControls() {
    const r = "<p>Override the ApgGui_Builder.buildControlsForHud() method to create controls for the HUD</p>";
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  // #region Basic controls
  buildParagraphControl(acontrolId, acontent, astyle) {
    const paragraphControl = {
      element: null,
      type: ApgGui_eFormElementType.PARAGRAPH
    };
    this.#addControl(acontrolId, paragraphControl);
    const r = `
        <p
          id="${acontrolId}"
          style="${astyle || ""}"
        >
            ${acontent}
        </p>
        `;
    return r;
  }
  buildDivControl(acontrolId, acontent, astyle = "", ainjected) {
    const paragraphControl = {
      element: null,
      type: ApgGui_eFormElementType.DIV,
      injected: ainjected
    };
    this.#addControl(acontrolId, paragraphControl);
    const r = `
        <div
          id="${acontrolId}"
          style="${astyle}"
        >
            ${acontent}
        </div>
        `;
    return r;
  }
  buildButtonControl(acontrolId, acaption, aclickCallback, aisHud = false, astyle) {
    const buttonControl = {
      element: null,
      type: ApgGui_eFormElementType.BUTTON,
      callback: aclickCallback
    };
    this.#addControl(acontrolId, buttonControl);
    const style = astyle != void 0 ? astyle : "padding:0.25rem; margin:0px";
    const pstart = !aisHud ? '<p style="margin-bottom: 0.25rem">' : "";
    const pend = !aisHud ? "</p>" : "";
    const r = `
        ${pstart}
            <button
              id="${acontrolId}"
              type="button"
              style="${style}"
            >${acaption}</button>
        ${pend}
        `;
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  // #region Data controls 
  buildRangeControl(acontrolId, acaption, avalue, aminMaxStep, ainputCallback, adisabled = false) {
    const rangeControl = {
      element: null,
      type: ApgGui_eFormElementType.INPUT,
      inputType: ApgGui_eInputType.RANGE,
      callback: ainputCallback
    };
    this.#addControl(acontrolId, rangeControl);
    const outputControl = {
      element: null,
      type: ApgGui_eFormElementType.OUTPUT
    };
    this.#addControl(`${acontrolId}Value`, outputControl);
    const r = `
        <p style="margin-bottom: 0.25rem">
            <label
                for="${acontrolId}"
                style="font-size: 0.75rem"
            >
                ${acaption}: 
                <output
                    id="${acontrolId}Value"
                    for="${acontrolId}"
                >${avalue}</output>
            </label>
            <input
                id="${acontrolId}"
                name="${acontrolId}"
                type="range"
                min="${aminMaxStep.min}"
                max="${aminMaxStep.max}"
                step="${aminMaxStep.step}"
                value="${avalue}"
                ${adisabled ? "disabled" : ""}
                style="margin-bottom: 0.5rem"
            />
        </p>
        `;
    return r;
  }
  readRangeControl(acontrolId) {
    const range = this.gui.controls.get(acontrolId).element;
    const output = this.gui.controls.get(`${acontrolId}Value`).element;
    output.innerHTML = range.value;
    this.gui.devLog(`Read ${acontrolId} value = ${range.value}`);
    return parseFloat(range.value);
  }
  buildColorPickerControl(acontrolId, acaption, avalue, ainputCallback) {
    const colorControl = {
      element: null,
      type: ApgGui_eFormElementType.INPUT,
      inputType: ApgGui_eInputType.COLOR,
      callback: ainputCallback
    };
    this.#addControl(acontrolId, colorControl);
    const outputControl = {
      element: null,
      type: ApgGui_eFormElementType.OUTPUT
    };
    this.#addControl(`${acontrolId}Value`, outputControl);
    const r = `
        <p style="margin-bottom: 0.25rem">
            <label
                for="${acontrolId}"
                style="font-size: 0.75rem"
            >
                ${acaption}: 
                <output
                    id="${acontrolId}Value"
                    for="${acontrolId}"
                >#${avalue.toString(16)}</output>
            </label>
            <input
                id="${acontrolId}"
                name="${acontrolId}"
                type="color"
                value="#${avalue.toString(16)}"
                style="margin-bottom: 0.5rem"
            />
        </p>
        `;
    return r;
  }
  readColorPickerControl(acontrolId) {
    const colorPicker = this.gui.controls.get(acontrolId).element;
    const output = this.gui.controls.get(`${acontrolId}Value`).element;
    output.innerHTML = colorPicker.value;
    this.gui.devLog(`Read ${acontrolId} value = ${colorPicker.value}`);
    return parseInt(colorPicker.value.replace("#", "0x"), 16);
  }
  buildCheckBoxControl(acontrolId, acaption, avalue, achangeCallback) {
    const checkBoxControl = {
      element: null,
      type: ApgGui_eFormElementType.INPUT,
      inputType: ApgGui_eInputType.CHECK_BOX,
      callback: achangeCallback
    };
    this.#addControl(acontrolId, checkBoxControl);
    const r = `
        <p style="margin-bottom: 0.25rem">
            <input
              id="${acontrolId}"
              name="${acontrolId}"
              type="checkbox"
              ${avalue ? "checked" : ""}
            />
            <label
                for="${acontrolId}"
                style="font-size: 0.75rem"
            >${acaption}</label>
        </p>
        `;
    return r;
  }
  readCheckBoxControl(acontrolId) {
    const checkBox = this.gui.controls.get(acontrolId).element;
    this.gui.devLog(`Read ${acontrolId} value = ${checkBox.checked}`);
    return checkBox.checked;
  }
  /**
   * Build a select control (<p> with <label> and <select> inside)
   * @param acontrolId Identifier
   * @param acaption Optional title for the control, if empty won't be rendered
   * @param avalue current value of the select element
   * @param avalues Map of key/value pairs for the select options 
   * @param achangeCallback A callback to be executed when the value changes
   * @returns the full HTML of the control ready to be added to a list of other controls
   */
  buildSelectControl(acontrolId, acaption, avalue, avalues, achangeCallback) {
    let caption = "";
    if (acaption != "") {
      caption = `
            <label
                for="${acontrolId}"
                style="font-size: 0.75rem"
            >${acaption}:</label>
        `;
    }
    const selectControl = {
      element: null,
      type: ApgGui_eFormElementType.SELECT,
      callback: achangeCallback
    };
    this.#addControl(acontrolId, selectControl);
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
                id="${acontrolId}"
                style="padding: 0.125rem; margin: 0px;"
            >
            ${options.join("\n")}
            </select>

        </p>
        `;
    return r;
  }
  readSelectControl(acontrolId) {
    const select = this.gui.controls.get(acontrolId).element;
    this.gui.devLog(`Read ${acontrolId} value = ${select.value}`);
    return select.value;
  }
  // #endregion
  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  // #region Grouping controls 
  /**
   * Chains the passed controls without a container element
   * @param acontrols List of other HTML controls
   * @returns the full HTML of the controls joined together
   */
  joinControls(acontrols) {
    const r = `
        ${acontrols.join("\n")}
        `;
    return r;
  }
  /**
   *  Build a FieldSet control (<fieldset> and <legend> + other controls)
   * @param acontrolId 
   * @param acaption 
   * @param acontrols 
   * @returns 
   */
  buildFieldSetControl(acontrolId, acaption, acontrols) {
    const r = `
        <fieldset id="${acontrolId}">
            <legend>${acaption}</legend>
            ${acontrols.join("\n")}
        </fieldset>
        `;
    return r;
  }
  /**
   * Build a Group control (<details> and <summary> + other controls)
   * @param acontrolId Element identifier
   * @param acaption Summary text
   * @param acontrols array of other contained elements as controls
   * @param aopened the details element is opened. Default false
   * @param atoggleCallback a callback for the toggle event
   * @returns the HTML string of all the components wrapped by the details element
   */
  buildDetailsControl(acontrolId, acaption, acontrols, aopened = false, atoggleCallback) {
    const groupControl = {
      element: null,
      type: ApgGui_eFormElementType.DETAILS,
      callback: atoggleCallback
    };
    this.#addControl(acontrolId, groupControl);
    const r = `
        <details 
          id="${acontrolId}"
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
   * Build a panel control (<p> as title a <div> after it)
   * @param acontrolId Identifier
   * @param acontrols List of other HTML controls inside the panel
   * @param acaption Optional title for the panel: if empty won't be rendered
   * @returns the full HTML of the panel ready to be injectend in the DOM with (element).appendChild
   */
  buildPanelControl(acontrolId, acontrols, acaption = "") {
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
            id="${acontrolId}" 
            style="overflow-y: auto; margin:0.25rem; background-color: #fafafa" 
        >${acontrols.join("\n")}</div>
        
        `;
    return r;
  }
  /**
   * Build a dialog control (<dialog> with <article> inside)
   * @param acontrolId 
   * @param acaption 
   * @param acontrols 
   * @returns 
   */
  buildDialogControl(acontrolId, acaption, acontrols) {
    const dialogControl = {
      element: null,
      type: ApgGui_eFormElementType.DIALOG
    };
    this.#addControl(acontrolId, dialogControl);
    const r = `
        <dialog
            id="${acontrolId}"
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
  // #endregion
  //--------------------------------------------------------------------------
}
