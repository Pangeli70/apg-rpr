/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/15]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomButton,
    IApgDomCheckBox,
    IApgDomColorPicker,
    IApgDomElement,
    IApgDomInput,
    IApgDomRange,
    IApgDomSelect,
    TApgDomEventCallback,
    eApgDomFormElementType,
    eApgDomInputType
} from "./ApgDom.ts";

import {
    ApgGui,
    ApgGui_IControl,
    ApgGui_IMinMaxStep,
    ApgGui_TReactiveState,
    ApgGui_TSelectValuesMap
} from "./ApgGui.ts";

import {
    ApgUts
} from "./ApgUts.ts";



/**
 * Base class for building dynamic GUIs directly at runtime in the browser
 */
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

    // #region Controls Management --------------------------------------------


    /**
     * Adds safely a control checking if it is already in the map of controls
     * @param acontrolId 
     * @param acontrol 
     */
    #addControl(acontrolId: string, acontrol: ApgGui_IControl) {

        ApgUts.AssertNot(
            this.gui.controls.has(acontrolId),
            `$$0063 The control ${acontrolId} is already in the map. Maybe you are adding a control with the same name!`
        )

        this.gui.controls.set(acontrolId, acontrol);

    }


    /**
     * Adds reactivity to a control
     * @param acontrolId Identifier of the control that has to become reactive
     * @param astate State object that contains the property associated to the reactive control
     * @param aprop Name of the property associated to the reactive control
     */
    protected addReactivityToControl(
        acontrolId: string,
        astate: ApgGui_TReactiveState,
        aprop: string
    ): void {

        const control = this.gui.controls.get(acontrolId);
        ApgUts.Assert(
            control != undefined,
            `$$0087 The control with id (${acontrolId}) is not registered in the GUI!`
        );

        ApgUts.Assert(
            astate[aprop] != undefined,
            `$$092 The property (${aprop}), is undefined in state object passed for reactivity!`
        );

        const propType = typeof astate[aprop];
        ApgUts.Assert(
            (propType == "string" || propType == "number" || propType == "boolean"),
            `$$0098 The type (${propType}) of the property (${aprop}) in state object passed for reactivity is not a managed one!`);

        control!.reactive = { state: astate, prop: aprop };

    }



    /**
     * After the dinamic insertion of the ApgGui controls in the DOM as elements 
     * this method binds each control with its element and if provided adds to the
     * element the appropriate event listeners.
     */
    bindControls(): void {

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

                    ApgUts.AssertNot(
                        control.inputType == undefined,
                        `$$0132 Input type of control ${control.element.id} is not defined`
                    )

                    switch (control.inputType) {

                        case eApgDomInputType.RANGE: {
                            (element as IApgDomRange).addEventListener('input', control.callback as TApgDomEventCallback);
                            this.gui.devLog(`${control.element.id} Range input event bound`);
                            break;
                        }
                        case eApgDomInputType.CHECK_BOX: {
                            (element as IApgDomCheckBox).addEventListener('change', control.callback as TApgDomEventCallback);
                            this.gui.devLog(`${control.element.id} Checkbox change event bound`);
                            break;
                        }
                        case eApgDomInputType.COLOR: {
                            (element as IApgDomColorPicker).addEventListener('change', control.callback as TApgDomEventCallback);
                            this.gui.devLog(`${control.element.id} Color picker change event bound`);
                            break;
                        }
                    }

                }

                if (control.type == eApgDomFormElementType.DETAILS) {
                    (element as IApgDomButton).addEventListener('toggle', control.callback as TApgDomEventCallback);
                    this.gui.devLog(`${control.element.id} Details toggle event bound`);
                }

            }

            if (control.type == eApgDomFormElementType.BUTTON) {
                (element as IApgDomButton).addEventListener('click', control.callback as TApgDomEventCallback);
                this.gui.devLog(`${control.element.id} Button click event bound`);
            }

            if (control.type == eApgDomFormElementType.SELECT) {
                (element as IApgDomInput).addEventListener('change', control.callback as TApgDomEventCallback);
                this.gui.devLog(`${control.element.id} Select change event bound`);
            }

        }
    }



    /**
     * Virtual method that has to be overriden by the descendants of this class
     * to get a chunk of Html made of several GUI controls
     */
    buildControls() {

        const r = "<p>Override the ApgGui_Builder.buildHetml() method to get some controls</p>";

        return r;
    }



    /**
     * Virtual method that has to be overriden by the descendants of this class
     * to get some controls to be added to a container
     */
    buildControlsToContainer(acontainer: IApgDomElement) {

        const r = "<p>Override the ApgGui_Builder.buildHtmlToContainer() method to inject controls to a container</p>";

        return r;
    }

    // #endregion

    // #region Basic controls -----------------------------------------------



    protected buildParagraphControl(
        acontrolId: string,
        acontent: string,
        astyle?: string
    ): string {

        const paragraphControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.PARAGRAPH,
        };
        this.#addControl(acontrolId, paragraphControl);
        const r = `
        <p
          id="${acontrolId}"
          style="${astyle || ''}"
        >
            ${acontent}
        </p>
        `;

        return r;
    }


    protected buildDivControl(
        acontrolId: string,
        acontent: string,
        astyle = "",
        ainjected?: IApgDomElement
    ) {
        const paragraphControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.DIV,
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



    protected buildButtonControl(
        acontrolId: string,
        acaption: string,
        aclickCallback: TApgDomEventCallback
    ) {

        const buttonControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.BUTTON,
            callback: aclickCallback
        };
        this.#addControl(acontrolId, buttonControl);

        const r = `
        <p style="margin-bottom: 0.25rem">
            <button
              id="${acontrolId}"
              type="button"
              style="padding:0.25rem; margin:0px"
            >${acaption}</button>
        </p>
        `;

        return r;
    }

    // #endregion

    // #region Data controls -----------------------------------------------



    protected buildRangeControl(
        acontrolId: string,
        acaption: string,
        avalue: number,
        aminMaxStep: ApgGui_IMinMaxStep,
        ainputCallback: TApgDomEventCallback
    ) {

        const rangeControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.INPUT,
            inputType: eApgDomInputType.RANGE,
            callback: ainputCallback
        };
        this.#addControl(acontrolId, rangeControl);

        const outputControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.OUTPUT,
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
                style="margin-bottom: 0.5rem"
            />
        </p>
        `;

        return r;
    }



    protected readRangeControl(
        acontrolId: string,
    ): number {

        const range = this.gui.controls.get(acontrolId)!.element as IApgDomRange;
        const output = this.gui.controls.get(`${acontrolId}Value`)!.element as IApgDomElement;
        output.innerHTML = range.value;
        this.gui.devLog(`Read ${acontrolId} value = ${range.value}`);

        return parseFloat(range.value);
    }



    protected buildColorPickerControl(
        acontrolId: string,
        acaption: string,
        avalue: number,
        ainputCallback: TApgDomEventCallback
    ) {

        const colorControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.INPUT,
            inputType: eApgDomInputType.COLOR,
            callback: ainputCallback
        };
        this.#addControl(acontrolId, colorControl);
        const outputControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.OUTPUT,
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



    protected readColorPickerControl(
        acontrolId: string,
    ) {

        const colorPicker = this.gui.controls.get(acontrolId)!.element as IApgDomColorPicker;
        const output = this.gui.controls.get(`${acontrolId}Value`)!.element as IApgDomElement;
        output.innerHTML = colorPicker.value;
        this.gui.devLog(`Read ${acontrolId} value = ${colorPicker.value}`);

        return parseInt(colorPicker.value.replace("#", "0x"), 16);

    }



    protected buildCheckBoxControl(
        acontrolId: string,
        acaption: string,
        avalue: boolean,
        achangeCallback: TApgDomEventCallback
    ): string {

        const checkBoxControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.INPUT,
            inputType: eApgDomInputType.CHECK_BOX,
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



    protected readCheckBoxControl(
        acontrolId: string,
    ) {

        const checkBox = this.gui.controls.get(acontrolId)!.element as IApgDomCheckBox;
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
    protected buildSelectControl(
        acontrolId: string,
        acaption: string,
        avalue: string,
        avalues: ApgGui_TSelectValuesMap,
        achangeCallback: TApgDomEventCallback
    ): string {

        let caption = '';

        if (acaption != '') {
            caption = `
            <label
                for="${acontrolId}"
                style="font-size: 0.75rem"
            >${acaption}:</label>
        `
        }

        const selectControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.SELECT,
            callback: achangeCallback
        };
        this.#addControl(acontrolId, selectControl);

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
                id="${acontrolId}"
                style="padding: 0.125rem; margin: 0px;"
            >
            ${options.join('\n')}
            </select>

        </p>
        `;

        return r;
    }



    protected readSelectControl(
        acontrolId: string,
    ): string {

        const select = this.gui.controls.get(acontrolId)!.element as IApgDomSelect;
        this.gui.devLog(`Read ${acontrolId} value = ${select.value}`);

        return select.value;
    }

    // #endregion

    // #region Grouping controls -----------------------------------------------


    /**
     * Chains the passed controls without a container element
     * @param acontrols List of other HTML controls
     * @returns the full HTML of the controls joined together
     */
    protected joinControls(
        acontrols: string[],
    ): string {

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
    protected buildFieldSetControl(
        acontrolId: string,
        acaption: string,
        acontrols: string[]
    ): string {

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
    protected buildDetailsControl(
        acontrolId: string,
        acaption: string,
        acontrols: string[],
        aopened = false,
        atoggleCallback?: TApgDomEventCallback
    ): string {

        const groupControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.DETAILS,
            callback: atoggleCallback
        };
        this.#addControl(acontrolId, groupControl);

        const r = `
        <details 
          id="${acontrolId}"
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
     * Build a panel control (<p> as title a <div> after it)
     * @param acontrolId Identifier
     * @param acontrols List of other HTML controls inside the panel
     * @param acaption Optional title for the panel: if empty won't be rendered
     * @returns the full HTML of the panel ready to be injectend in the DOM with (element).appendChild
     */
    protected buildPanelControl(
        acontrolId: string,
        acontrols: string[],
        acaption = "",
    ): string {

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
    protected buildDialogControl(
        acontrolId: string,
        acaption: string,
        acontrols: string[]
    ): string {

        const dialogControl: ApgGui_IControl = {
            element: null,
            type: eApgDomFormElementType.DIALOG,
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

}


