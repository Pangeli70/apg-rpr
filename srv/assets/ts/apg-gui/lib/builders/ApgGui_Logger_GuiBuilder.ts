/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.1 [APG 2023/08/11]
 * @version 0.0.8 [APG 2023/11/12]
 * -----------------------------------------------------------------------
*/
import {
    ApgGui_IDialog,
    ApgGui_IElement,
    ApgGui_ISelect
} from "../interfaces/ApgGui_Dom.ts";

import {
    ApgGui,
    ApgGui_TSelectValuesMap
} from "../classes/ApgGui.ts";

import {
    ApgGui_Builder
} from "../classes/ApgGui_Builder.ts";

import {
    ApgGui_Logger
} from "../classes/ApgGui_Logger.ts";



export class ApgGui_Logger_GuiBuilder extends ApgGui_Builder {

    private _logger: ApgGui_Logger;

    readonly LOGGER_DIALOG_CNT = 'loggerDialogControl';
    readonly LOGGER_SELECTOR_CNT = 'loggerSelectorControl';
    readonly LOGGER_PARAGRAPH_CNT = 'loggerParagraphControl';


    constructor(
        agui: ApgGui,
        alogger: ApgGui_Logger
    ) {
        super(agui, "Logger Dialog");

        this._logger = alogger;
    }


    
    override buildControls() {

        const loggerDialogControl = this.#buildLoggerDialogControl();

        const LOGGER_OPEN_BTN_CNT = 'loggerOpenButtonControl';
        const loggerOpenButtonControl = this.buildButtonControl(
            LOGGER_OPEN_BTN_CNT,
            'Show logger',
            () => {
                const dialog = this.gui.controls.get(this.LOGGER_DIALOG_CNT)!.element as ApgGui_IDialog;
                dialog.showModal();

                const selector = this.gui.controls.get(this.LOGGER_SELECTOR_CNT)!.element as ApgGui_ISelect;

                const paragraph = this.gui.controls.get(this.LOGGER_PARAGRAPH_CNT)!.element as ApgGui_IElement;
                paragraph.innerHTML = this.#buildLoggerInfo(selector.value);
            }
        );

        const r = this.joinControls(
            [
                loggerDialogControl,
                loggerOpenButtonControl,
            ]
        );
        return r;

    }



    #buildLoggerDialogControl() {

        const controls: string[] = [];

        const loggers = Array.from(this._logger.loggers());
        const loggersValues: ApgGui_TSelectValuesMap = new Map();
        for (const logger of loggers) {
            loggersValues.set(logger, logger);
        }
        const LOGGER_SELECTOR_CNT = 'loggerSelectorControl';
        const loggerSelectorControl = this.buildSelectControl(
            LOGGER_SELECTOR_CNT,
            'Logger:',
            loggers[0],
            loggersValues,
            () => {
                const selector = this.gui.controls.get(this.LOGGER_SELECTOR_CNT)!.element as ApgGui_ISelect;

                const paragraph = this.gui.controls.get(this.LOGGER_PARAGRAPH_CNT)!.element as ApgGui_IElement;
                paragraph.innerHTML = this.#buildLoggerInfo(selector.value);
            }
        )
        controls.push(loggerSelectorControl);

        const loggerParagraphControl = this.buildParagraphControl(
            this.LOGGER_PARAGRAPH_CNT,
            'Not yet aquired',
            'margin-bottom:0.5rem',
        )
        controls.push(loggerParagraphControl);

        const LOGGER_CLOSE_BTN_CNT = 'loggerCloseButtonControl';
        const loggerCloseButtonControl = this.buildButtonControl(
            LOGGER_CLOSE_BTN_CNT,
            'Close',
            () => {
                const dialog = this.gui.controls.get(this.LOGGER_DIALOG_CNT)!.element as ApgGui_IDialog;
                dialog.close();
            }
        );
        controls.push(loggerCloseButtonControl);

        const r = this.buildDialogControl(
            this.LOGGER_DIALOG_CNT,
            "Logger info",
            controls
        );
        return r;
    }



    #buildLoggerInfo(
        aloggerName: string,
        apage = 0
    ) {

        const events = this._logger.logs(aloggerName, apage);
        const content = events.join("<br>\n");

        const style = `style="font-family: 'Lucida console', 'Courier New', monospace; font-size: 0.5rem;"`;
        const r = `
            <p ${style}">
            ${content}
            </p>
        `
        return r;

    }


}
