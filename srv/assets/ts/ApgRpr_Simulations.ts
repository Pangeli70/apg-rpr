/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgRprSim_Base } from './ApgRprSimulationBase.ts';


import { ApgRprSim_Pyramid } from "./simulations/ApgRprSim_A0_Pyramid.ts";
import { ApgRprSim_Column } from "./simulations/ApgRprSim_A1_Column.ts";
import { ApgRprSim_Domino } from "./simulations/ApgRprSim_A2_Domino.ts";
import { ApgRprSim_Jenga } from "./simulations/ApgRprSim_A3_Jenga.ts";
import { ApgRprSim_Fountain } from "./simulations/ApgRprSimFountain.ts";
import { ApgRprSim_LockedRotations } from "./simulations/ApgRprSimLockedRotations.ts";
import { ApgRprSim_Damping } from "./simulations/ApgRprSimDamping.ts";
import { ApgRprSim_CollisionGroups } from "./simulations/ApgRprSimCollisionGroups.ts";
import { ApgRprSim_TrimeshTerrain } from "./simulations/ApgRprSimTrimeshTerrain.ts";
import { ApgRprSim_PngTerrain } from "./simulations/ApgRprSimPngTerrain.ts";
// import * as Keva from "./simulations/ApgRprSimKeva.ts";
// import * as Joints from "./simulations/ApgRprSimJoints.ts";
import { ApgRprSim_ConvexPolyhedron } from "./simulations/ApgRprSimConvexPolyhedron.ts";
import { ApgRprSim_Platform } from "./simulations/ApgRprSimPlatform.ts";
import { ApgRprSim_CCDs } from "./simulations/ApgRprSimCCDs.ts";
import { ApgRprSim_Joints } from "./simulations/ApgRprSimJoints.ts";
import { ApgRprSim_CharacterController } from "./simulations/ApgRprSim_CharacterController.ts";


export enum ApgRpr_eSimulationName {
    A0_PYRAMID = 'Pyramid',
    A1_COLUMN = 'Column',
    A2_DOMINO = 'Domino',
    A3_JENGA = 'Jenga',
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


export function ApgRprSim_Get() {
    const simulations: Map<ApgRpr_eSimulationName, typeof ApgRprSim_Base> = new Map();

    simulations.set(ApgRpr_eSimulationName.A0_PYRAMID, ApgRprSim_Pyramid);
    simulations.set(ApgRpr_eSimulationName.A1_COLUMN, ApgRprSim_Column);
    simulations.set(ApgRpr_eSimulationName.A2_DOMINO, ApgRprSim_Domino);
    simulations.set(ApgRpr_eSimulationName.A3_JENGA, ApgRprSim_Jenga);
    simulations.set(ApgRpr_eSimulationName.B_FOUNTAIN, ApgRprSim_Fountain);
    simulations.set(ApgRpr_eSimulationName.C_LOCKED_ROTATIONS, ApgRprSim_LockedRotations);
    simulations.set(ApgRpr_eSimulationName.D_DAMPING, ApgRprSim_Damping);
    simulations.set(ApgRpr_eSimulationName.E_COLLISION_GROUPS, ApgRprSim_CollisionGroups);
    simulations.set(ApgRpr_eSimulationName.F_TRI_MESH_TERRAIN, ApgRprSim_TrimeshTerrain);
    simulations.set(ApgRpr_eSimulationName.G_PNG_MESH_TERRAIN, ApgRprSim_PngTerrain);
    simulations.set(ApgRpr_eSimulationName.H_CONVEX_POLYHEDRONS, ApgRprSim_ConvexPolyhedron);
    simulations.set(ApgRpr_eSimulationName.I_PLATFORM, ApgRprSim_Platform);
    simulations.set(ApgRpr_eSimulationName.J_CCDs, ApgRprSim_CCDs);
    simulations.set(ApgRpr_eSimulationName.K_JOINTS, ApgRprSim_Joints);
    simulations.set(ApgRpr_eSimulationName.L_CHARACTER_CONTROLLER, ApgRprSim_CharacterController);

    return simulations;
}



