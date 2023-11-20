/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.01 [APG 2023/08/15]
 * @version 0.0.15 [APG 2023/11/12]
 * -----------------------------------------------------------------------
*/

import {
    ApgGui_IDocument,
    ApgGui_IElement,
    ApgGui_IRange,
    ApgGui_TEventCallback,
    ApgGui_eFormElementType,
    ApgGui_eInputType
} from "../interfaces/ApgGui_Dom.ts";

import {
    ApgGui_Logger
} from "./ApgGui_Logger.ts";



export interface ApgGui_IMinMaxStep {
    min: number;
    max: number;
    step: number;
}



export type ApgGui_TSelectValuesMap = Map<string, string>;



export type ApgGui_TReactiveState = Record<string, string | number | boolean | Record<string, string | number | boolean>>;




export interface ApgGui_IReactive {

    /** The object that holds the property that need reactivity in one of the GUI controls */
    state: ApgGui_TReactiveState;

    /** The name of the property that will be associated to the GUI state */
    prop: string;
}



/**
 * Data structure to collect data for a Gui Controls
 */
export interface ApgGui_IControl {

    /** Dom element */
    element: (ApgGui_IElement | null);

    /** Dom Element type */
    type: ApgGui_eFormElementType;

    /** Input type */
    inputType?: ApgGui_eInputType;

    /** Function to call when the event handled is called. Now only one event handler is associated automatically for every input type  */
    callback?: ApgGui_TEventCallback;

    /** Used to manage two way automatic update of the controls */
    reactive?: ApgGui_IReactive;

    /** Allows to inject a prebuilt element in the control */
    injected?: ApgGui_IElement;
}



/**
 * Simple gui similar to LilGui or DatGui
 */
export class ApgGui {

    /** A status flag that is used to pause some other stuff while the Gui is refreshing */
    isRefreshing = false;

    /** Map of the controls, is used for binding events and reactivity */
    controls: Map<string, ApgGui_IControl> = new Map();

    /** We don't like global objects */
    document: ApgGui_IDocument;

    /** The destination element of the Gui */
    panelElement: ApgGui_IElement;

    /** The destination element of the canvas and so of the Hud */
    viewerElement: ApgGui_IElement;

    /** The Hud element to show controls to interact with the simulation*/
    hudElement: ApgGui_IElement;

    /** The multipurpose logger */
    logger: ApgGui_Logger;


    /** Name of the logger */
    private static readonly LOGGER_NAME = 'Gui';


    /**
     * If the condition is false alerts and throws an error
     * @param acondition condition that has to be true
     * @param aerrorMessage message to display
     */
    static Assert(acondition: boolean, aerrorMessage: string) {
        if (!acondition) {
            alert(aerrorMessage);
            throw new Error(aerrorMessage);
        }
    }

    /**
     * If the condition is true alerts and throws an error
     * @param acondition condition that has to be false
     * @param aerrorMessage message to display
     */
    static AssertNot(acondition: boolean, aerrorMessage: string) {
        this.Assert(!acondition, aerrorMessage)
    }



    constructor(
        adocument: ApgGui_IDocument,
        apanelElementId: string,
        aviewerElementId: string,
        alogger: ApgGui_Logger
    ) {

        this.document = adocument;
        this.logger = alogger;

        this.panelElement = this.document.getElementById(apanelElementId);
        ApgGui.Assert(
            this.panelElement != undefined,
            `The element for the GUI panel with id ${apanelElementId} was not found in the DOM. `
        );

        this.viewerElement = this.document.getElementById(aviewerElementId);
        ApgGui.Assert(
            this.viewerElement != undefined,
            `The element for the Viewer canvas with id ${aviewerElementId} was not found in the DOM. `
        );

        this.hudElement = this.document.createElement("div");
        this.hudElement.style.cssText = "position: absolute; bottom: 2.5%; left: 22.5%; width: 75%; min-height:0%; background-color: #38516740;";
        this.viewerElement.appendChild(this.hudElement);

        this.logger.addLogger(ApgGui.LOGGER_NAME);
        this.logger.log('ApgGui created', ApgGui.LOGGER_NAME)

    }


    log(aitem: string) {
        this.logger.log(aitem, ApgGui.LOGGER_NAME);
    }

    devLog(aitem: string) {
        this.logger.devLog(aitem, ApgGui.LOGGER_NAME);
    }

    logNoTime(aitem: string) {
        this.logger.logNoTime(aitem, ApgGui.LOGGER_NAME);
    }

    devLogNoTime(aitem: string) {
        this.logger.logDevNoTime(aitem, ApgGui.LOGGER_NAME);
    }


    clearControls() {
        // @TODO do we need to perfom some cleanup on DOM and especially on event Handlers? -- APG 20230927
        this.controls.clear();
    }


    setReactiveControl(
        acontrolId: string,
        astate: ApgGui_TReactiveState,
        aprop: string
    ) {
        const control = this.controls.get(acontrolId);
        ApgGui.Assert(
            control != undefined,
            `$$164 Trying to set reactivity to control ${acontrolId} but it does not exist in the map.`
        )

        ApgGui.Assert(
            control!.reactive == undefined,
            `$$169 The control ${acontrolId} is already reactive`
        )

        control!.reactive = {
            state: astate,
            prop: aprop
        }
    }

    /**
     * Refreshes the DOM elements that have reactive GUI controls
     */
    updateReactiveControls() {

        for (const [key, control] of this.controls) {

            if (control.reactive != undefined) {

                const nestedProps = control.reactive.prop.split(".");
                let i = 0;
                let reactiveValue = control.reactive.state;
                do {
                    reactiveValue = reactiveValue[nestedProps[i]] as unknown as ApgGui_TReactiveState;
                    const typeOfValue = typeof reactiveValue;
                    if (i == (nestedProps.length - 1)) {
                        ApgGui.Assert(
                            typeOfValue != 'object',
                            `Last property ${control.reactive.prop} in state of reactive control ${key} can't have an object value.`
                        )
                    }
                    else {
                        ApgGui.Assert(
                            typeOfValue == 'object',
                            `Itermediate property ${nestedProps[i]} of ${control.reactive.prop} in state of reactive control ${key} must be an object value.`
                        )
                    }
                    i++;
                } while (i < nestedProps.length)

                switch (control.type) {

                    case ApgGui_eFormElementType.INPUT: {

                        switch (control.inputType) {

                            case ApgGui_eInputType.RANGE: {
                                const range = control.element as ApgGui_IRange;
                                range.value = reactiveValue.toString();
                                break;
                            }

                        }
                        break;
                    }
                    case ApgGui_eFormElementType.OUTPUT: {
                        const output = control.element as ApgGui_IElement;
                        output.innerHTML = reactiveValue.toString();
                        break;
                    }

                }
            }

        }

    }
}