/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/
import {
    IApgDomDialog,
    IApgDomElement
} from "./ApgDom.ts";

import {
    ApgGui
} from "./ApgGui.ts";

import {
    ApgGui_Builder
} from "./ApgGui_Builder.ts";

import {
    ApgRpr_IDebugInfo
} from "./ApgRprInterfaces.ts";

import {
    RAPIER
} from "./ApgRpr_Deps.ts";


export class ApgRprSim_DebugGuiBuilder extends ApgGui_Builder {

    debugInfo: ApgRpr_IDebugInfo;

    readonly DEBUG_INFO_DIALOG_CNT = 'debugInfoDialogControl';
    readonly DEBUG_INFO_PAR_CNT = 'debugInfoParagraphControl';


    constructor(
        agui: ApgGui,
        ainfo: ApgRpr_IDebugInfo
    ) {
        super(agui, "Pippo debug");

        this.debugInfo = ainfo;
    }


    override buildPanel() {

        const debugInfoDialogControl = this.#buildDebugInfoDialogControl();


        const DEBUG_INFO_OPEN_BTN_CNT = 'debugInfoOpenButtonControl';
        const debugInfoOpenButtonControl = this.buildButtonControl(
            DEBUG_INFO_OPEN_BTN_CNT,
            'Show info',
            () => {
                const dialog = this.gui.controls.get(this.DEBUG_INFO_DIALOG_CNT)!.element as IApgDomDialog;
                dialog.showModal();

                const paragraph = this.gui.controls.get(this.DEBUG_INFO_PAR_CNT)!.element as IApgDomElement;
                paragraph.innerHTML = this.#buildDebugInfos();
            }
        );

        const r = this.buildDetailsControl(
            "debugInfoGroupControl",
            "Debug:",
            [
                debugInfoDialogControl,
                debugInfoOpenButtonControl,
            ]

        );
        return r;

    }


    #buildDebugInfoDialogControl() {

        const debugInfoParagraphControl = this.buildParagraphControl(
            this.DEBUG_INFO_PAR_CNT,
            'Not yet aquired',
            'margin-bottom:0.5rem',
        )

        const DEBUG_INFO_CLOSE_BTN_CNT = 'debugInfoCloseButtonControl';
        const debugInfoCloseButtonControl = this.buildButtonControl(
            DEBUG_INFO_CLOSE_BTN_CNT,
            'Close',
            () => {
                const dialog = this.gui.controls.get(this.DEBUG_INFO_DIALOG_CNT)!.element as IApgDomDialog;
                dialog.close();
            }
        );

        const r = this.buildDialogControl(
            this.DEBUG_INFO_DIALOG_CNT,
            "Debug info:",
            [
                debugInfoParagraphControl,
                debugInfoCloseButtonControl
            ]
        );
        return r;
    }


    #buildDebugInfos() {

        let hashInfo = "";
        if (this.debugInfo.worldHash) {
            hashInfo += "<br/>Snapshot step: " + this.debugInfo.snapshotStepId;
            hashInfo += "<br/>Snapshot time: " + this.debugInfo.snapshotTime + "ms";
            hashInfo += "<br/>World hash (MD5): " + this.debugInfo.worldHash.toString();
            hashInfo += "<br/>World hash time (MD5): " + this.debugInfo.worldHashTime + "ms";
        }

        const r = `
            <p>
                RAPIER engine<br/>
                Version: ${RAPIER.version()}<br/>
                Current step: ${this.debugInfo.stepId}<br/>
                Delta time: ${this.debugInfo.integrationParams!.dt.toFixed(5) }<br/>
                Max velocity iter.: ${this.debugInfo.integrationParams!.maxVelocityIterations}<br/>
                Max friction iter.: ${this.debugInfo.integrationParams!.maxVelocityFrictionIterations}<br/>
                Max stabil. iter.: ${this.debugInfo.integrationParams!.maxStabilizationIterations}<br/>
                Linear error: ${this.debugInfo.integrationParams!.allowedLinearError.toFixed(5) }<br/>
                Err. reduc. param.: ${this.debugInfo.integrationParams!.erp.toFixed(5)}<br/>
                Predict.distance: ${this.debugInfo.integrationParams!.predictionDistance.toFixed(5)}<br/>
                ${hashInfo}
            </p>
        `

        return r;

    }

}
