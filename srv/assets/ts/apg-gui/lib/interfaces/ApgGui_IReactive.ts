import { ApgGui_TReactiveState } from "../classes/ApgGui.ts";





export interface ApgGui_IReactive {

  /** The object that holds the property that need reactivity in one of the GUI controls */
  state: ApgGui_TReactiveState;

  /** The name of the property that will be associated to the GUI state */
  prop: string;
}
