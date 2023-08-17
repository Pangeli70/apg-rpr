import { eApgRpr_SimulationName } from "./ApgRprEnums.ts";
import { ApgRprSimPyramid } from "./simulations/ApgRprSimPyramid.ts";
import { ApgRprSimFountain } from "./simulations/ApgRprSimFountain.ts";
import { ApgRprSim_LockedRotations } from "./simulations/ApgRprSimLockedRotations.ts";
import { ApgRprSim_Damping } from "./simulations/ApgRprSimDamping.ts";
import { ApgRprSim_CollisionGroups } from "./simulations/ApgRprSimCollisionGroups.ts";
import { ApgRprSimTrimeshTerrain } from "./simulations/ApgRprSimTrimeshTerrain.ts";
import { ApgRprSimPngTerrain } from "./simulations/ApgRprSimPngTerrain.ts";
import { ApgRprSimConvexPolyhedron } from "./simulations/ApgRprSimConvexPolyhedron.ts";
import { ApgRprSimPlatform } from "./simulations/ApgRprSimPlatform.ts";
import { ApgRprSim_CCDs } from "./simulations/ApgRprSimCCDs.ts";
export const ApgRpr_Simulations = /* @__PURE__ */ new Map([
  [eApgRpr_SimulationName.A_PYRAMID, ApgRprSimPyramid],
  [eApgRpr_SimulationName.B_FOUNTAIN, ApgRprSimFountain],
  [eApgRpr_SimulationName.C_LOCKED_ROTATIONS, ApgRprSim_LockedRotations],
  [eApgRpr_SimulationName.D_DAMPING, ApgRprSim_Damping],
  [eApgRpr_SimulationName.E_COLLISION_GROUPS, ApgRprSim_CollisionGroups],
  [eApgRpr_SimulationName.F_TRI_MESH_TERRAIN, ApgRprSimTrimeshTerrain],
  [eApgRpr_SimulationName.G_PNG_MESH_TERRAIN, ApgRprSimPngTerrain],
  [eApgRpr_SimulationName.H_CONVEX_POLYHEDRONS, ApgRprSimConvexPolyhedron],
  [eApgRpr_SimulationName.I_PLATFORM, ApgRprSimPlatform],
  [eApgRpr_SimulationName.J_CCDs, ApgRprSim_CCDs]
  // ["joints", Joints.initWorld],
  // ["keva tower", Keva.initWorld],
]);
