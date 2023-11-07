/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgRpr_Simulation } from './ApgRpr_Simulation.ts';


import { ApgRpr_A0_Pyramid_Simulation } from "./simulations/ApgRpr_A0_Pyramid.ts";
import { ApgRpr_A1_Column_Simulation } from "./simulations/ApgRpr_A1_Column.ts";
import { ApgRpr_A2_Domino_Simulation } from "./simulations/ApgRpr_A2_Domino.ts";
import { ApgRpr_A3_Jenga_Simulation } from "./simulations/ApgRpr_A3_Jenga.ts";
import { ApgRpr_A4_Keva_Simulation } from "./simulations/ApgRpr_A4_Keva.ts";
import { ApgRpr_B0_Fountain_Simulation } from "./simulations/ApgRpr_B0_Fountain.ts";
import { ApgRpr_C0_LockedRotations_Simulation } from "./simulations/ApgRpr_C0_LockedRotations.ts";
import { ApgRpr_C1_Damping_Simulation } from "./simulations/ApgRpr_C1_Damping.ts";
import { ApgRpr_D0_CollisionGroups_Simulation } from "./simulations/ApgRpr_D0_CollisionGroups.ts";
import { ApgRpr_E0_TrimeshTerrain_Simulation } from "./simulations/ApgRpr_E0_TrimeshTerrain.ts";
import { ApgRpr_E1_PngTerrain_Simulation } from "./simulations/ApgRpr_E1_PngTerrain.ts";
// import * as Keva from "./simulations/ApgRprSimKeva.ts";
import { ApgRpr_E2_ConvexPolyhedron_Simulation } from "./simulations/ApgRpr_E2_ConvexPolyhedron.ts";
import { ApgRpr_F0_Platform_Simulation } from "./simulations/ApgRpr_F0_Platform.ts";
import { ApgRpr_G0_CCDs_Simulation } from "./simulations/ApgRpr_G0_CCDs.ts";
import { ApgRpr_H0_Joints_Simulation } from "./simulations/ApgRpr_H0_Joints.ts";
import { ApgRpr_I0_CharacterController_Simulation } from "./simulations/ApgRpr_I0_CharacterController.ts";


export enum ApgRpr_eSimulationName {
    A0_PYRAMID = 'Pyramid',
    A1_COLUMN = 'Column',
    A2_DOMINO = 'Domino',
    A3_JENGA = 'Jenga',
    A4_Keva = 'Keva',
    B_FOUNTAIN = 'Fountain',
    C_LOCKED_ROTATIONS = 'Locked rotations',
    D_DAMPING = 'Damping',
    E_COLLISION_GROUPS = 'Collision groups',
    F_TRI_MESH_TERRAIN = 'Tri-mesh terrain',
    G_PNG_MESH_TERRAIN = 'Png terrain',
    H_CONVEX_POLYHEDRONS = 'Convex polyhedrons',
    I_PLATFORM = 'Platform',
    J_CCDs = 'CCDs',
    K_JOINTS = 'Joints',
    L_CHARACTER_CONTROLLER = 'Character controller',

    Z_NONE = '',
}


export function ApgRpr_PrepareSimulations() {
    const simulations: Map<ApgRpr_eSimulationName, typeof ApgRpr_Simulation> = new Map();

    simulations.set(ApgRpr_eSimulationName.A0_PYRAMID, ApgRpr_A0_Pyramid_Simulation);
    simulations.set(ApgRpr_eSimulationName.A1_COLUMN, ApgRpr_A1_Column_Simulation);
    simulations.set(ApgRpr_eSimulationName.A2_DOMINO, ApgRpr_A2_Domino_Simulation);
    simulations.set(ApgRpr_eSimulationName.A3_JENGA, ApgRpr_A3_Jenga_Simulation);
    simulations.set(ApgRpr_eSimulationName.A4_Keva, ApgRpr_A4_Keva_Simulation);
    simulations.set(ApgRpr_eSimulationName.B_FOUNTAIN, ApgRpr_B0_Fountain_Simulation);
    simulations.set(ApgRpr_eSimulationName.C_LOCKED_ROTATIONS, ApgRpr_C0_LockedRotations_Simulation);
    simulations.set(ApgRpr_eSimulationName.D_DAMPING, ApgRpr_C1_Damping_Simulation);
    simulations.set(ApgRpr_eSimulationName.E_COLLISION_GROUPS, ApgRpr_D0_CollisionGroups_Simulation);
    simulations.set(ApgRpr_eSimulationName.F_TRI_MESH_TERRAIN, ApgRpr_E0_TrimeshTerrain_Simulation);
    simulations.set(ApgRpr_eSimulationName.G_PNG_MESH_TERRAIN, ApgRpr_E1_PngTerrain_Simulation);
    simulations.set(ApgRpr_eSimulationName.H_CONVEX_POLYHEDRONS, ApgRpr_E2_ConvexPolyhedron_Simulation);
    simulations.set(ApgRpr_eSimulationName.I_PLATFORM, ApgRpr_F0_Platform_Simulation);
    simulations.set(ApgRpr_eSimulationName.J_CCDs, ApgRpr_G0_CCDs_Simulation);
    simulations.set(ApgRpr_eSimulationName.K_JOINTS, ApgRpr_H0_Joints_Simulation);
    simulations.set(ApgRpr_eSimulationName.L_CHARACTER_CONTROLLER, ApgRpr_I0_CharacterController_Simulation);

    return simulations;
}



