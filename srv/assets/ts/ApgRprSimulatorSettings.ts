/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { eApgRpr_SimulationName } from "./ApgRprEnums.ts";


export class ApgRprSimulatorSettings {

  readonly MIN_VELOCITY_ITERATIONS = 1;
  readonly MAX_VELOCITY_ITERATIONS = 16;

  currentSimulationIndex: number;
  currentSimulation: eApgRpr_SimulationName;
  previousSimulation: eApgRpr_SimulationName;
  worldVelocityIterations: number;

  isRunning: boolean;
  isStepping: boolean;

  isTakingSnapshots: boolean;
  isShowingDebugPanel: boolean;

  isDebugMode: boolean;

  constructor() {
    this.currentSimulationIndex = 0;
    this.currentSimulation = Object.values(eApgRpr_SimulationName)[this.currentSimulationIndex];
    this.previousSimulation = eApgRpr_SimulationName.Z_NONE;
    this.worldVelocityIterations = 4;
    this.isRunning = true;
    this.isStepping = false;
    this.isShowingDebugPanel = false;
    this.isTakingSnapshots = false;
    this.isDebugMode = false;
  }

  // TODO Move those lookups for lilGui to the simulator or the GUI ?? -- APG 20230811
  step() { }
  restart() { }
  takeSnapshot() { }
  restoreSnapshot() { }
}
