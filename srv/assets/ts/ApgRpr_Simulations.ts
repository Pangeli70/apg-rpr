/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgRpr_eSimulationName } from "./ApgRprEnums.ts";
import { ApgRprSim_Base } from './ApgRprSimulationBase.ts';


import { ApgRprSim_Pyramid } from "./simulations/ApgRprSimPyramid.ts";
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



export const ApgRpr_Simulations: Map<ApgRpr_eSimulationName, typeof ApgRprSim_Base> =
    new Map([
        [ApgRpr_eSimulationName.A_PYRAMID, ApgRprSim_Pyramid],
        [ApgRpr_eSimulationName.B_FOUNTAIN, ApgRprSim_Fountain],
        [ApgRpr_eSimulationName.C_LOCKED_ROTATIONS, ApgRprSim_LockedRotations],
        [ApgRpr_eSimulationName.D_DAMPING, ApgRprSim_Damping],
        [ApgRpr_eSimulationName.E_COLLISION_GROUPS, ApgRprSim_CollisionGroups],
        [ApgRpr_eSimulationName.F_TRI_MESH_TERRAIN, ApgRprSim_TrimeshTerrain],
        [ApgRpr_eSimulationName.G_PNG_MESH_TERRAIN, ApgRprSim_PngTerrain],
        [ApgRpr_eSimulationName.H_CONVEX_POLYHEDRONS, ApgRprSim_ConvexPolyhedron],
        [ApgRpr_eSimulationName.I_PLATFORM, ApgRprSim_Platform],
        [ApgRpr_eSimulationName.J_CCDs, ApgRprSim_CCDs],
        // ["joints", Joints.initWorld],
        // ["keva tower", Keva.initWorld],
    ]);




