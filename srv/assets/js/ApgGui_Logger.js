import { ApgUtils } from "./ApgUtils.ts";
export class ApgGui_Logger {
  /** The maximum size of each log queue */
  LOG_QUEUE_SIZE = 1e3;
  /** The maximum size of the UL element queue */
  LOG_UL_QUEUE_SIZE = 250;
  /** We don't like global objects */
  document;
  /** In development mode  */
  _devMode = true;
  /** Inital timestamp for delta time logging events */
  _creation = (performance || Date).now();
  /** Name of the current logget */
  _currentLogger = "";
  /** The map of the multipurpose logger elements */
  _loggerMap = /* @__PURE__ */ new Map();
  /** The multipurpose log element */
  _loggerElement;
  /** The title of the log element */
  _title;
  /** The UL element */
  _ul;
  constructor(adocument, aparentElement) {
    this.document = adocument;
    this._loggerElement = this.document.createElement("div");
    this._loggerElement.style.cssText = "position: absolute; top: 0; right: 0.5%; width: 20%; height:50%; overflow: auto; background-color: #385167bd;";
    aparentElement.appendChild(this._loggerElement);
    this._title = this.document.createElement("p");
    this._title.style.cssText = "font-family: 'Lucida console', 'Courier New', monospace; margin: 0.25rem; font-weight: 500; padding-left:0.4rem";
    this._loggerElement.appendChild(this._title);
    this._ul = this.document.createElement("ul");
    this._ul.style.cssText = "font-family: 'Lucida console', 'Courier New', monospace; margin: 0.25rem; font-weight: 500; padding-left:0.4rem";
    this._loggerElement.appendChild(this._ul);
  }
  addLogger(aname) {
    ApgUtils.AssertNot(
      this._loggerMap.has(aname),
      `Cannot create: the logger named (${aname}) is already present in the map)`
    );
    this._loggerMap.set(aname, []);
  }
  log(aitem, alogger = "") {
    this.#log(true, aitem, alogger);
  }
  logDev(aitem, alogger = "") {
    if (this._devMode) {
      this.#log(true, aitem, alogger);
    }
  }
  logNoTime(aitem, alogger = "") {
    this.#log(false, aitem, alogger);
  }
  logDevNoTime(aitem, alogger = "") {
    if (this._devMode) {
      this.#log(false, aitem, alogger);
    }
  }
  #log(aprependTimeStamp, aitem, alogger) {
    if (alogger == "") {
      alogger = this._currentLogger;
    }
    ApgUtils.Assert(
      this._loggerMap.has(alogger),
      `Cannot log: the requested logger named (${alogger} is not present in the map)`
    );
    if (aprependTimeStamp) {
      const now = (performance || Date).now();
      const deltaTime = (now - this._creation) / 1e3;
      const prepend = deltaTime.toFixed(3).padStart(8, "0") + "s ";
      aitem = prepend + aitem;
    } else {
      aitem = " ".padStart(10, ".") + aitem;
    }
    const loggerStream = this._loggerMap.get(alogger);
    if (loggerStream.length >= this.LOG_QUEUE_SIZE) {
      loggerStream.shift();
    }
    loggerStream.push(aitem);
    if (this._currentLogger == alogger) {
      if (this._ul.children.length >= this.LOG_UL_QUEUE_SIZE) {
        const lastLi = this._ul.children[this._ul.children.length - 1];
        this._ul.removeChild(lastLi);
      }
      this.#addLi(aitem);
    }
  }
  #addLi(aitem) {
    const li = this.document.createElement("li");
    li.innerText = aitem;
    li.style.cssText = "font-size: 0.4rem; margin-top: 0.1rem; margin-bottom: 0.1rem; color: #ffe53edb;";
    const firstLi = this._ul.children[0];
    this._ul.insertBefore(li, firstLi);
  }
  change(aname) {
    ApgUtils.Assert(
      this._loggerMap.has(aname),
      `Cannot update the Ul: the requested logger named (${aname} is not present in the map)`
    );
    if (this._currentLogger == aname) {
      return;
    }
    const queue = this._loggerMap.get(aname);
    const liNum = this._ul.children.length;
    const deleteNum = liNum - queue.length;
    const createNum = queue.length - liNum;
    let i = 0;
    for (const child of this._ul.children) {
      child.innerText = queue[i];
      i++;
    }
    if (createNum > 0) {
      for (; i < queue.length; i++) {
        this.#addLi(queue[i]);
      }
    }
    if (deleteNum > 0) {
      for (; i < liNum; i++) {
        const lastLi = this._ul.children[this._ul.children.length - 1];
        this._ul.removeChild(lastLi);
      }
    }
    this._currentLogger = aname;
    this._title.innerText = this._currentLogger;
  }
  show() {
    this._loggerElement.style.display = "initial";
  }
  hide() {
    this._loggerElement.style.display = "none";
  }
}
