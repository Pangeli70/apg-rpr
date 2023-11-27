import { ApgGui_IElement, ApgGui_TEventCallback } from "./ApgGui_Dom.ts";
import { ApgGui_eInputType } from "../enums/ApgGui_eInputType.ts";
import { ApgGui_eFormElementType } from "../enums/ApgGui_eFormElementType.ts";
import { ApgGui_IReactive } from "./ApgGui_IReactive.ts";

/**
 * Data structure to collect data for a Gui Controls
 */




export interface ApgGui_IControl {

  /** Dom element */
  element: (ApgGui_IElement | null);

  /** Dom Element type */
  type: ApgGui_eFormElementType;

  /** Input type */
  inputType?: ApgGui_eInputType;

  /** Function to call when the event handled is called. Now only one event handler is associated automatically for every input type  */
  callback?: ApgGui_TEventCallback;

  /** Used to manage two way automatic update of the controls */
  reactive?: ApgGui_IReactive;

  /** Allows to inject a prebuilt element in the control */
  injected?: ApgGui_IElement;
}
