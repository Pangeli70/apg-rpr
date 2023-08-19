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
import { ApgGui } from "./ApgGui.ts";
import { ApgGui_Builder } from "./ApgGuiBuilder.ts";
import { RAPIER } from "./ApgRprDeps.ts";
import { IApgRprDebugInfo } from "./ApgRprInterfaces.ts";


export class ApgRprSimDebugGuiBuilder extends ApgGui_Builder {

    debugInfo: IApgRprDebugInfo;

    readonly DEBUG_INFO_DIALOG_CNT = 'debugInfoDialogControl';
    readonly DEBUG_INFO_PAR_CNT = 'debugInfoParagraphControl';


    constructor(
        agui: ApgGui,
        ainfo: IApgRprDebugInfo
    ) {
        super(agui);

        this.debugInfo = ainfo;
    }


    override buildHtml() {

        const debugInfoDialogControl = this.#buildDebugInfoDialogControl();

        const DEBUG_INFO_OPEN_BTN_CNT = 'debugInfoOpenButtonControl';
        const debugInfoOpenButtonControl = this.buildButtonControl(
            DEBUG_INFO_OPEN_BTN_CNT,
            'Show debug info',
            () => {
                const dialog = this.gui.controls.get(this.DEBUG_INFO_DIALOG_CNT)!.element as IApgDomDialog;
                dialog.showModal();

                const paragraph = this.gui.controls.get(this.DEBUG_INFO_PAR_CNT)!.element as IApgDomElement;
                paragraph.innerHTML = this.#buildDebugInfos();
            }
        );

        const r = this.buildGroupControl(
            "debugInfoGroupControl",
            "Debug:",
            [
                debugInfoDialogControl,
                debugInfoOpenButtonControl
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
                RAPIER Version: ${RAPIER.version()}
                <br/>Current step: ${this.debugInfo.stepId}
                ${hashInfo}
            </p>
        `

        return r;

    }

}
