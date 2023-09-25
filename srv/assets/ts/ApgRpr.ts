/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/09/26]
 * -----------------------------------------------------------------------
*/

import { IApgDomBrowserWindow, IApgDomDocument } from "./ApgDom.ts";
import { RAPIER } from "./ApgRprDeps.ts";
import { ApgRpr_PrepareSimulations, ApgRpr_eSimulationName } from "./ApgRpr_Simulations.ts";
import { ApgRpr_Simulator } from "./ApgRpr_Simulator.ts";


export async function ApgRpr(awindow: IApgDomBrowserWindow, adocument: IApgDomDocument,) {

    await RAPIER.init();

    const simulations = ApgRpr_PrepareSimulations();

    const simulator = new ApgRpr_Simulator(awindow, adocument, simulations, ApgRpr_eSimulationName.A0_PYRAMID);

    const params = simulator.getSimulationParams();

    simulator.setSimulation(params);

    simulator.run();

}