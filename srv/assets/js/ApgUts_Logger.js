import {
  ApgUts
} from "./ApgUts.ts";
export class ApgUts_Logger {
  /** The maximum size of each log queue */
  LOG_QUEUE_SIZE = 1e3;
  /** The maximum size page size */
  LOG_PAGE_SIZE = 250;
  /** In development mode  */
  _devMode;
  /** Inital timestamp for delta time logging events */
  _creation = (performance || Date).now();
  /** Name of the current logger */
  _currentLogger = "";
  /** The map of the multipurpose logger elements */
  _loggerMap = /* @__PURE__ */ new Map();
  constructor(adevMode = true) {
    this._devMode = adevMode;
  }
  //#region Methods --------------------------------------------------------
  /** Returns the list of the registered loggers */
  loggers() {
    return this._loggerMap.keys();
  }
  /** Returns the page of the logged events for the specified logger */
  logs(alogger, apage = 0) {
    const logs = this._loggerMap.get(alogger);
    ApgUts.Assert(
      logs != void 0,
      `The logger ${alogger} is not present in the map.`
    );
    let start = logs.length - apage * this.LOG_PAGE_SIZE;
    if (start < 0) {
      start = logs.length;
    }
    let end = start - this.LOG_PAGE_SIZE;
    if (end < 0) {
      end = 0;
    }
    const r = [];
    for (let i = start - 1; i > end; i--) {
      r.push(`${i.toString().padStart(4, "0")} - ${logs[i]}`);
    }
    return r;
  }
  /** Add a new logger stream */
  addLogger(aname) {
    if (this._loggerMap.has(aname)) {
      alert(`Cannot create: the logger named (${aname}) is already present in the map. Error maybe???`);
    } else {
      this._loggerMap.set(aname, []);
    }
  }
  /** Records the message, collects the timestamp and appends to the current logger if not specified */
  log(aitem, alogger) {
    this.#log(true, aitem, alogger);
  }
  /** Like standard log but only if in dev mode. Is usefult for debugging purposes  */
  logDev(aitem, alogger) {
    if (this._devMode) {
      this.#log(true, aitem, alogger);
    }
  }
  /** Like log but without timestamp */
  logNoTime(aitem, alogger) {
    this.#log(false, aitem, alogger);
  }
  /** Like logDev but without timestamp */
  logDevNoTime(aitem, alogger) {
    if (this._devMode) {
      this.#log(false, aitem, alogger);
    }
  }
  #log(aprependTimeStamp, aitem, alogger) {
    if (alogger == "") {
      alogger = this._currentLogger;
    }
    ApgUts.Assert(
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
  }
  // #endregion
}
