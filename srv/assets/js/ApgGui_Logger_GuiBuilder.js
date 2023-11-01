import {
  ApgGui_Builder
} from "./ApgGui_Builder.ts";
export class ApgGui_Logger_GuiBuilder extends ApgGui_Builder {
  logger;
  LOGGER_DIALOG_CNT = "loggerDialogControl";
  LOGGER_SELECTOR_CNT = "loggerSelectorControl";
  LOGGER_PARAGRAPH_CNT = "loggerParagraphControl";
  constructor(agui, alogger) {
    super(agui, "Logger Dialog");
    this.logger = alogger;
  }
  //#region Methods --------------------------------------------------------
  buildControls() {
    const loggerDialogControl = this.#buildLoggerDialogControl();
    const LOGGER_OPEN_BTN_CNT = "loggerOpenButtonControl";
    const loggerOpenButtonControl = this.buildButtonControl(
      LOGGER_OPEN_BTN_CNT,
      "Show logger",
      () => {
        const dialog = this.gui.controls.get(this.LOGGER_DIALOG_CNT).element;
        dialog.showModal();
        const selector = this.gui.controls.get(this.LOGGER_SELECTOR_CNT).element;
        const paragraph = this.gui.controls.get(this.LOGGER_PARAGRAPH_CNT).element;
        paragraph.innerHTML = this.#buildLoggerInfo(selector.value);
      }
    );
    const r = this.joinControls(
      [
        loggerDialogControl,
        loggerOpenButtonControl
      ]
    );
    return r;
  }
  #buildLoggerDialogControl() {
    const controls = [];
    const loggers = Array.from(this.logger.loggers());
    const loggersValues = /* @__PURE__ */ new Map();
    for (const logger of loggers) {
      loggersValues.set(logger, logger);
    }
    const LOGGER_SELECTOR_CNT = "loggerSelectorControl";
    const loggerSelectorControl = this.buildSelectControl(
      LOGGER_SELECTOR_CNT,
      "Logger:",
      loggers[0],
      loggersValues,
      () => {
        const selector = this.gui.controls.get(this.LOGGER_SELECTOR_CNT).element;
        const paragraph = this.gui.controls.get(this.LOGGER_PARAGRAPH_CNT).element;
        paragraph.innerHTML = this.#buildLoggerInfo(selector.value);
      }
    );
    controls.push(loggerSelectorControl);
    const loggerParagraphControl = this.buildParagraphControl(
      this.LOGGER_PARAGRAPH_CNT,
      "Not yet aquired",
      "margin-bottom:0.5rem"
    );
    controls.push(loggerParagraphControl);
    const LOGGER_CLOSE_BTN_CNT = "loggerCloseButtonControl";
    const loggerCloseButtonControl = this.buildButtonControl(
      LOGGER_CLOSE_BTN_CNT,
      "Close",
      () => {
        const dialog = this.gui.controls.get(this.LOGGER_DIALOG_CNT).element;
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
  #buildLoggerInfo(aloggerName, apage = 0) {
    const events = this.logger.logs(aloggerName, apage);
    const content = events.join("<br>\n");
    const style = `style="font-family: 'Lucida console', 'Courier New', monospace; font-size: 0.5rem;"`;
    const r = `
            <p ${style}">
            ${content}
            </p>
        `;
    return r;
  }
  //#endregion
}
