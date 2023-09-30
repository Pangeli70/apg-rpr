import {
  eApgDomFormElementType,
  eApgDomInputType
} from "./ApgDom.ts";
import { ApgUtils } from "./ApgUtils.ts";
export class ApgGui {
  _devMode = true;
  /** Inital timestamp for logging events */
  _creation;
  /** Log Queue of Gui Messages */
  _log = [];
  /** The maximum size of the log queue */
  LOG_QUEUE_SIZE = 250;
  /** A status flag that is used to pause some other stuff while the Gui is refreshing */
  isRefreshing = false;
  /** Map of the controls, is used for binding events and reactivity */
  controls = /* @__PURE__ */ new Map();
  /** We don't like global objects */
  document;
  /** The destination element of the Gui */
  panelElement;
  /** The destination element of the canvas and so of the Hud */
  viewerElement;
  /** The multipurpose log element */
  loggerElement;
  /** The map of the multipurpose logger UL elements */
  _loggerUlMap = /* @__PURE__ */ new Map();
  /**  */
  static LOGGER_NAME = "ApgGuiLogger";
  constructor(adocument, apanelElementId, aviewerElementId) {
    this._creation = (performance || Date).now();
    this.document = adocument;
    this.panelElement = this.document.getElementById(apanelElementId);
    ApgUtils.Assert(this.panelElement != void 0, `$$108 The element for the GUI panel with id ${apanelElementId} was not found in the DOM. `);
    this.viewerElement = this.document.getElementById(aviewerElementId);
    ApgUtils.Assert(this.viewerElement != void 0, `$$111 The element for the Viewer canvas with id ${aviewerElementId} was not found in the DOM. `);
    this.loggerElement = this.document.createElement("div");
    this.loggerElement.style.cssText = "position: absolute; top: 0; right: 0.5%; width: 20%; height:50%; overflow: auto; background-color: #385167bd;";
    this.viewerElement.appendChild(this.loggerElement);
    this.createLoggerUl(ApgGui.LOGGER_NAME);
    this.log("ApgGui created");
  }
  createLoggerUl(aname) {
    ApgUtils.AssertNot(
      this._loggerUlMap.has(aname),
      `$$132 Cannot create: the logger UL named (${aname}) is already present in the ApgGui logger UL map)`
    );
    const loggerUl = this.document.createElement("ul");
    loggerUl.style.cssText = "font-family: 'Lucida console', 'Courier New', monospace; margin: 0.25rem; font-weight: 500; padding-left:0.4rem";
    this.loggerElement.appendChild(loggerUl);
    this._loggerUlMap.set(aname, loggerUl);
  }
  showLogger(aname) {
    ApgUtils.Assert(
      this._loggerUlMap.has(aname),
      `$$148 Cannot show: the requested logger UL named (${aname} is not present in the ApgGui logger UL map)`
    );
    this.loggerElement.style.display = "initial";
    for (const [key, ul] of this._loggerUlMap) {
      ul.style.display = key == aname ? "initial" : "none";
    }
  }
  hideLogger() {
    this.loggerElement.style.display = "none";
  }
  log(aitem, alogger = ApgGui.LOGGER_NAME) {
    this.#log(true, aitem, alogger);
  }
  devLog(aitem, alogger = ApgGui.LOGGER_NAME) {
    if (this._devMode) {
      this.#log(true, aitem, alogger);
    }
  }
  logNoTime(aitem, alogger = ApgGui.LOGGER_NAME) {
    this.#log(false, aitem, alogger);
  }
  devLogNoTime(aitem, alogger = ApgGui.LOGGER_NAME) {
    if (this._devMode) {
      this.#log(false, aitem, alogger);
    }
  }
  #log(aprependTimeStamp, aitem, alogger) {
    ApgUtils.Assert(
      this._loggerUlMap.has(alogger),
      `$$148 Cannot log: the requested logger UL named (${alogger} is not present in the ApgGui logger UL map)`
    );
    if (aprependTimeStamp) {
      const now = (performance || Date).now();
      const deltaTime = (now - this._creation) / 1e3;
      const prepend = deltaTime.toFixed(3).padStart(8, "0") + "s ";
      aitem = prepend + aitem;
    } else {
      aitem = " ".padStart(10, ".") + aitem;
    }
    const ul = this._loggerUlMap.get(alogger);
    if (this._log.length >= this.LOG_QUEUE_SIZE) {
      this._log.shift();
      const lastLi = ul.children[ul.children.length - 1];
      ul.removeChild(lastLi);
    }
    this._log.push(aitem);
    this.#creatiLogLi(aitem, ul);
  }
  #creatiLogLi(aitem, ul) {
    const li = this.document.createElement("li");
    li.innerText = aitem;
    li.style.cssText = "font-size: 0.4rem; margin-top: 0.1rem; margin-bottom: 0.1rem; color: #ffe53edb;";
    const firstLi = ul.children[0];
    ul.insertBefore(li, firstLi);
  }
  updateLogger(aname, aitems) {
    ApgUtils.Assert(
      this._loggerUlMap.has(aname),
      `$$148 Cannot update: the requested logger UL named (${aname} is not present in the ApgGui logger UL map)`
    );
    const ul = this._loggerUlMap.get(aname);
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
    this.controls.clear();
  }
  /**
   * Refreshes the DOM elements that have reactive GUI controls
   */
  updateReactiveControls() {
    for (const [_key, control] of this.controls) {
      if (control.reactive != void 0) {
        const reactiveValue = control.reactive.state[control.reactive.prop];
        switch (control.type) {
          case eApgDomFormElementType.INPUT: {
            switch (control.inputType) {
              case eApgDomInputType.RANGE: {
                const range = control.element;
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
