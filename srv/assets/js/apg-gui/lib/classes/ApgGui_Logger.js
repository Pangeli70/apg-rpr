import {
  ApgGui
} from "./ApgGui.ts";
export class ApgGui_Logger {
  /** The maximum size of each log queue */
  LOG_QUEUE_SIZE = 1e3;
  /** The page size */
  LOG_PAGE_SIZE = this.LOG_QUEUE_SIZE / 5;
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
  /**
   * Usually the mode is set only in development phase, but anyways if you need
   */
  setDevMode(amode) {
    this._devMode = amode;
  }
  /**
   * Returns the list of the registered loggers
   */
  loggers() {
    return this._loggerMap.keys();
  }
  /**
   * Returns true if the requested logger is already in the map
   */
  hasLogger(aname) {
    return this._loggerMap.has(aname);
  }
  /**
   * Returns the page of the logged messages for the specified logger
   */
  logs(alogger, apage = 0) {
    const logs = this._loggerMap.get(alogger);
    ApgGui.Assert(
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
  /**
   * Add a new logger stream
   */
  addLogger(aname) {
    if (this._loggerMap.has(aname)) {
      alert(`WARNING: Cannot create the logger named (${aname}) because it is already present in the map. Error maybe???`);
    } else {
      this._loggerMap.set(aname, []);
    }
  }
  /** 
   * Records the message, collects the timestamp and appends to the current 
   * logger if not specified 
   */
  log(amessage, alogger, ashowAlert = false) {
    this.#log(true, amessage, alogger, ashowAlert);
  }
  /**
   * Like standard log but only if in dev mode. Is usefult for debugging purposes
   */
  devLog(amessage, alogger, ashowAlert = false) {
    if (this._devMode) {
      this.#log(true, amessage, alogger, ashowAlert);
    }
  }
  /** 
   * Like log but without timestamp
   */
  logNoTime(amessage, alogger, ashowAlert = false) {
    this.#log(false, amessage, alogger, ashowAlert);
  }
  /**
   * Like logDev but without timestamp
   */
  logDevNoTime(amessage, alogger, ashowAlert = false) {
    if (this._devMode) {
      this.#log(false, amessage, alogger, ashowAlert);
    }
  }
  /**
   * Actual log method
   */
  #log(aprependTimeStamp, amessage, alogger, ashowAlert = false) {
    if (alogger == "") {
      alogger = this._currentLogger;
    }
    ApgGui.Assert(
      this._loggerMap.has(alogger),
      `Cannot log: the requested logger named (${alogger} is not present in the map)`
    );
    if (aprependTimeStamp) {
      const now = (performance || Date).now();
      const deltaTime = (now - this._creation) / 1e3;
      const prepend = deltaTime.toFixed(3).padStart(8, "0") + "s ";
      amessage = prepend + amessage;
    } else {
      amessage = " ".padStart(10, ".") + amessage;
    }
    const loggerStream = this._loggerMap.get(alogger);
    if (loggerStream.length >= this.LOG_QUEUE_SIZE) {
      loggerStream.shift();
    }
    loggerStream.push(amessage);
    if (ashowAlert) {
      alert(amessage);
    }
  }
}
