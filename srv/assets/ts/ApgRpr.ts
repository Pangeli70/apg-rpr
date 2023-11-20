/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/09/26]
 * -----------------------------------------------------------------------
*/

import {
    ApgGui_IBrowserWindow,
    ApgGui_IDocument
} from "./apg-gui/lib/interfaces/ApgGui_Dom.ts";

import {
    RAPIER
} from "./ApgRpr_Deps.ts";

import {
    ApgRpr_PrepareSimulations,
    ApgRpr_eSimulationName
} from "./ApgRpr_Simulations.ts";

import {
    ApgRpr_Simulator
} from "./ApgRpr_Simulator.ts";




export async function ApgRpr(
    awindow: ApgGui_IBrowserWindow,
    adocument: ApgGui_IDocument,
    aguiElementId: string,
    aviewerElementId: string,
) {

    await RAPIER.init();

    const simulations = ApgRpr_PrepareSimulations();

    const simulator = new ApgRpr_Simulator(
        awindow,
        adocument,
        aguiElementId,
        aviewerElementId,
        simulations,
        ApgRpr_eSimulationName.A0_PYRAMID
    );

    const params = simulator.getSimulationParams();

    simulator.setSimulation(params);

    simulator.run();

}