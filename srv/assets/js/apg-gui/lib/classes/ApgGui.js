import { ApgGui_eInputType } from "../enums/ApgGui_eInputType.ts";
import { ApgGui_eFormElementType } from "../enums/ApgGui_eFormElementType.ts";
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
  /**
   * If the condition is false alerts and throws an error
   * @param acondition condition that has to be true
   * @param aerrorMessage message to display
   */
  static Assert(acondition, aerrorMessage) {
    if (!acondition) {
      alert(aerrorMessage);
      throw new Error(aerrorMessage);
    }
  }
  /**
   * If the condition is true alerts and throws an error
   * @param acondition condition that has to be false
   * @param aerrorMessage message to display
   */
  static AssertNot(acondition, aerrorMessage) {
    this.Assert(!acondition, aerrorMessage);
  }
  constructor(adocument, apanelElementId, aviewerElementId, alogger) {
    this.document = adocument;
    this.logger = alogger;
    this.panelElement = this.document.getElementById(apanelElementId);
    ApgGui.Assert(
      this.panelElement != void 0,
      `The element for the GUI panel with id ${apanelElementId} was not found in the DOM. `
    );
    this.viewerElement = this.document.getElementById(aviewerElementId);
    ApgGui.Assert(
      this.viewerElement != void 0,
      `The element for the Viewer canvas with id ${aviewerElementId} was not found in the DOM. `
    );
    this.hudElement = this.document.createElement("div");
    this.hudElement.style.cssText = "position: absolute; bottom: 2.5%; left: 22.5%; width: 75%; min-height:0%; background-color: #38516740;";
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
    ApgGui.Assert(
      control != void 0,
      `$$164 Trying to set reactivity to control ${acontrolId} but it does not exist in the map.`
    );
    ApgGui.Assert(
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
    for (const [key, control] of this.controls) {
      if (control.reactive != void 0) {
        const nestedProps = control.reactive.prop.split(".");
        let i = 0;
        let reactiveValue = control.reactive.state;
        do {
          reactiveValue = reactiveValue[nestedProps[i]];
          const typeOfValue = typeof reactiveValue;
          if (i == nestedProps.length - 1) {
            ApgGui.Assert(
              typeOfValue != "object",
              `Last property ${control.reactive.prop} in state of reactive control ${key} can't have an object value.`
            );
          } else {
            ApgGui.Assert(
              typeOfValue == "object",
              `Itermediate property ${nestedProps[i]} of ${control.reactive.prop} in state of reactive control ${key} must be an object value.`
            );
          }
          i++;
        } while (i < nestedProps.length);
        switch (control.type) {
          case ApgGui_eFormElementType.INPUT: {
            switch (control.inputType) {
              case ApgGui_eInputType.RANGE: {
                const range = control.element;
                range.value = reactiveValue.toString();
                break;
              }
            }
            break;
          }
          case ApgGui_eFormElementType.OUTPUT: {
            const output = control.element;
            output.innerHTML = reactiveValue.toString();
            break;
          }
        }
      }
    }
  }
}
