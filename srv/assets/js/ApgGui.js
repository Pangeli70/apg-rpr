import {
  eApgDomFormElementType,
  eApgDomInputType
} from "./ApgDom.ts";
import { ApgUts } from "./ApgUts.ts";
export class ApgGui {
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
  /** The Hud element to show controls to interact with the simulation*/
  hudElement;
  /** The multipurpose logger */
  logger;
  /** Name of the logger */
  static LOGGER_NAME = "Gui";
  constructor(adocument, apanelElementId, aviewerElementId, alogger) {
    this.document = adocument;
    this.logger = alogger;
    this.panelElement = this.document.getElementById(apanelElementId);
    ApgUts.Assert(
      this.panelElement != void 0,
      `The element for the GUI panel with id ${apanelElementId} was not found in the DOM. `
    );
    this.viewerElement = this.document.getElementById(aviewerElementId);
    ApgUts.Assert(
      this.viewerElement != void 0,
      `The element for the Viewer canvas with id ${aviewerElementId} was not found in the DOM. `
    );
    this.hudElement = this.document.createElement("div");
    this.hudElement.style.cssText = "position: absolute; bottom: 2.5%; left: 22.5%; width: 75%; height:15%; background-color: #385167bd;";
    this.viewerElement.appendChild(this.hudElement);
    this.logger.addLogger(ApgGui.LOGGER_NAME);
    this.logger.log("ApgGui created", ApgGui.LOGGER_NAME);
  }
  log(aitem) {
    this.logger.log(aitem, ApgGui.LOGGER_NAME);
  }
  devLog(aitem) {
    this.logger.devLog(aitem, ApgGui.LOGGER_NAME);
  }
  logNoTime(aitem) {
    this.logger.logNoTime(aitem, ApgGui.LOGGER_NAME);
  }
  devLogNoTime(aitem) {
    this.logger.logDevNoTime(aitem, ApgGui.LOGGER_NAME);
  }
  clearControls() {
    this.controls.clear();
  }
  setReactiveControl(acontrolId, astate, aprop) {
    const control = this.controls.get(acontrolId);
    ApgUts.Assert(
      control != void 0,
      `$$164 Trying to set reactivity to control ${acontrolId} but it does not exist in the map.`
    );
    ApgUts.Assert(
      control.reactive == void 0,
      `$$169 The control ${acontrolId} is already reactive`
    );
    control.reactive = {
      state: astate,
      prop: aprop
    };
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
          case eApgDomFormElementType.OUTPUT: {
            const output = control.element;
            output.innerHTML = reactiveValue.toString();
            break;
          }
        }
      }
    }
  }
}
