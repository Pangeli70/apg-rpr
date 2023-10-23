/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/15]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomDocument,
    IApgDomElement,
    IApgDomRange,
    TApgDomEventCallback,
    eApgDomFormElementType,
    eApgDomInputType
} from "./ApgDom.ts";
import { ApgGui_Logger } from "./ApgGui_Logger.ts";

import { ApgUtils } from "./ApgUtils.ts";



export interface ApgGui_IMinMaxStep {
    min: number;
    max: number;
    step: number;
}

export type ApgGui_TSelectValuesMap = Map<string, string>;


export type ApgGui_TReactiveState = Record<string, string | number | boolean>


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
    element: (IApgDomElement | null);

    /** Dom Element type */
    type: eApgDomFormElementType;

    /** Input type */
    inputType?: eApgDomInputType;

    /** Function to call when the event handled is called. Now only one event handler is associated automatically for every input type  */
    callback?: TApgDomEventCallback;

    /** Used to manage two way automatic update of the controls */
    reactive?: ApgGui_IReactive;

    /** Allows to inject a prebuilt element in the control */
    injected?: IApgDomElement;
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
    document: IApgDomDocument;

    /** The destination element of the Gui */
    panelElement: IApgDomElement;

    /** The destination element of the canvas and so of the Hud */
    viewerElement: IApgDomElement;

    /** The Hud element to show controls to interact with the simulation*/
    hudElement: IApgDomElement;

    /** The multipurpose logger */
    logger: ApgGui_Logger;


    /** Name of the logger */
    private static readonly LOGGER_NAME = 'ApgGuiLogger';

    
    constructor(
        adocument: IApgDomDocument,
        apanelElementId: string,
        aviewerElementId: string,
    ) {

        this.document = adocument;

        this.panelElement = this.document.getElementById(apanelElementId);
        ApgUtils.Assert(
            this.panelElement != undefined,
            `The element for the GUI panel with id ${apanelElementId} was not found in the DOM. `
        );

        this.viewerElement = this.document.getElementById(aviewerElementId);
        ApgUtils.Assert(
            this.viewerElement != undefined,
            `The element for the Viewer canvas with id ${aviewerElementId} was not found in the DOM. `
        );

        this.hudElement = this.document.createElement("div");
        this.hudElement.style.cssText = "position: absolute; bottom: 2.5%; left: 22.5%; width: 75%; height:15%; background-color: #385167bd;";
        this.viewerElement.appendChild(this.hudElement);

        this.logger = new ApgGui_Logger(this.document, this.viewerElement);
        this.logger.addLogger(ApgGui.LOGGER_NAME);
        this.logger.log('ApgGui created', ApgGui.LOGGER_NAME)

    }


    log(aitem: string) {
        this.logger.log(aitem, ApgGui.LOGGER_NAME);
    }

    logDev(aitem: string) {
        this.logger.logDev(aitem, ApgGui.LOGGER_NAME);
    }

    logNoTime(aitem: string) {
        this.logger.logNoTime(aitem, ApgGui.LOGGER_NAME);
    }


    clearControls() {
        // TODO do we need to perfom some cleanup on DOM and especially on event Handlers? -- APG 20230927
        this.controls.clear();
    }


    /**
     * Refreshes the DOM elements that have reactive GUI controls
     */
    updateReactiveControls() {

        for (const [_key, control] of this.controls) {

            if (control.reactive != undefined) {

                const reactiveValue = control.reactive.state[control.reactive.prop];

                switch (control.type) {

                    case eApgDomFormElementType.INPUT: {

                        switch (control.inputType) {

                            case eApgDomInputType.RANGE: {
                                const range = control.element as IApgDomRange;
                                range.value = reactiveValue.toString();
                                break;
                            }

                        }
                        break;
                    }

                }
            }
        }
    }


}