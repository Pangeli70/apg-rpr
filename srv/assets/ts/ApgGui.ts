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
    IApgDomUl,
    TApgDomEventCallback,
    eApgDomFormElementType,
    eApgDomInputType
} from "./ApgDom.ts";

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

    private _devMode = true;

    /** Inital timestamp for logging events */
    private _creation: number;

    /** Log Queue of Gui Messages */
    private _log: string[] = [];

    /** The maximum size of the log queue */
    private readonly LOG_QUEUE_SIZE = 250;

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

    /** The multipurpose log element */
    loggerElement: IApgDomElement;

    /** The map of the multipurpose logger UL elements */
    private _loggerUlMap: Map<string, IApgDomUl> = new Map();

    /**  */
    private static readonly LOGGER_NAME = 'ApgGuiLogger';

    constructor(
        adocument: IApgDomDocument,
        apanelElementId: string,
        aviewerElementId: string,
    ) {

        this._creation = (performance || Date).now();
        this.document = adocument;

        this.panelElement = this.document.getElementById(apanelElementId);
        ApgUtils.Assert(this.panelElement != undefined, `$$108 The element for the GUI panel with id ${apanelElementId} was not found in the DOM. `);

        this.viewerElement = this.document.getElementById(aviewerElementId);
        ApgUtils.Assert(this.viewerElement != undefined, `$$111 The element for the Viewer canvas with id ${aviewerElementId} was not found in the DOM. `);

        this.loggerElement = this.document.createElement('div');
        this.loggerElement.style.cssText = "position: absolute; top: 0; right: 0.5%; width: 20%; height:50%; overflow: auto; background-color: #385167bd;";
        this.viewerElement.appendChild(this.loggerElement);

        this.createLoggerUl(ApgGui.LOGGER_NAME);

        this.log('ApgGui created');
    }


    createLoggerUl(aname: string) {

        ApgUtils.AssertNot(
            this._loggerUlMap.has(aname),
            `$$132 Cannot create: the logger UL named (${aname}) is already present in the ApgGui logger UL map)`
        )

        const loggerUl = this.document.createElement('ul') as IApgDomUl;
        loggerUl.style.cssText = "font-family: 'Lucida console', 'Courier New', monospace; margin: 0.25rem; font-weight: 500; padding-left:0.4rem";
        this.loggerElement.appendChild(loggerUl);

        this._loggerUlMap.set(aname, loggerUl);

    }


    showLogger(aname: string) {

        ApgUtils.Assert(
            this._loggerUlMap.has(aname),
            `$$148 Cannot show: the requested logger UL named (${aname} is not present in the ApgGui logger UL map)`
        )

        this.loggerElement.style.display = "initial";

        for (const [key, ul] of this._loggerUlMap) {
            ul.style.display = (key == aname) ? "initial" : "none";
        }

    }


    hideLogger() {

        this.loggerElement.style.display = "none";

    }


    log(aitem: string, alogger = ApgGui.LOGGER_NAME) { 
        this.#log(true, aitem, alogger);
    }


    devLog(aitem: string, alogger = ApgGui.LOGGER_NAME) {
        if (this._devMode) { 
            this.#log(true, aitem, alogger);
        }
    }


    logNoTime(aitem: string, alogger = ApgGui.LOGGER_NAME) {
        this.#log(false, aitem, alogger);
    }


    devLogNoTime(aitem: string, alogger = ApgGui.LOGGER_NAME) {
        if (this._devMode) { 
            this.#log(false, aitem, alogger);
        }
    }


    #log(aprependTimeStamp: boolean, aitem: string, alogger: string ) {

        ApgUtils.Assert(
            this._loggerUlMap.has(alogger),
            `$$148 Cannot log: the requested logger UL named (${alogger} is not present in the ApgGui logger UL map)`
        )

        if (aprependTimeStamp) {
            const now = (performance || Date).now();
            const deltaTime = (now - this._creation) / 1000;
            const prepend = deltaTime.toFixed(3).padStart(8, '0') + 's ';
            aitem = prepend + aitem;
        }
        else {
            aitem = " ".padStart(10, ".") + aitem;
        }

        const ul = this._loggerUlMap.get(alogger)!;

        if (this._log.length >= this.LOG_QUEUE_SIZE) {
            this._log.shift();
            const lastLi = ul.children[ul.children.length - 1];
            ul.removeChild(lastLi);
        }

        this._log.push(aitem);

        this.#creatiLogLi(aitem, ul);

    }


    #creatiLogLi(aitem: string, ul: IApgDomUl) {
        const li = this.document.createElement('li');
        li.innerText = aitem;
        li.style.cssText = "font-size: 0.4rem; margin-top: 0.1rem; margin-bottom: 0.1rem; color: #ffe53edb;";

        const firstLi = ul.children[0];
        ul.insertBefore(li, firstLi);
    }


    updateLogger(aname: string, aitems: string[]) {

        ApgUtils.Assert(
            this._loggerUlMap.has(aname),
            `$$148 Cannot update: the requested logger UL named (${aname} is not present in the ApgGui logger UL map)`
        )

        const ul = this._loggerUlMap.get(aname)!;

        const liNum = ul.children.length;
        const deleteNum = liNum - aitems.length;
        const createNum = aitems.length - liNum;

        let i = 0;
        for (const child of ul.children) {
            child.innerText = aitems[i];
            i++;
        }
        if (createNum > 0) {
            for (; i < aitems.length; i++) {
                this.#creatiLogLi(aitems[i], ul);
            }
        }
        if (deleteNum > 0) {
            for (; i < liNum; i++) {
                const lastLi = ul.children[ul.children.length - 1];
                ul.removeChild(lastLi);
            }
        }

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