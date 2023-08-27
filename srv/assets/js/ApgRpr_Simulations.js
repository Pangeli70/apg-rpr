import { ApgRprSim_Pyramid } from "./simulations/ApgRprSimPyramid.ts";
import { ApgRprSim_Column } from "./simulations/ApgRprSim_A1_Column.ts";
import { ApgRprSim_Domino } from "./simulations/ApgRprSim_A2_Domino.ts";
import { ApgRprSim_Jenga } from "./simulations/ApgRprSim_A3_Jenga.ts";
import { ApgRprSim_Fountain } from "./simulations/ApgRprSimFountain.ts";
import { ApgRprSim_LockedRotations } from "./simulations/ApgRprSimLockedRotations.ts";
import { ApgRprSim_Damping } from "./simulations/ApgRprSimDamping.ts";
import { ApgRprSim_CollisionGroups } from "./simulations/ApgRprSimCollisionGroups.ts";
import { ApgRprSim_TrimeshTerrain } from "./simulations/ApgRprSimTrimeshTerrain.ts";
import { ApgRprSim_PngTerrain } from "./simulations/ApgRprSimPngTerrain.ts";
import { ApgRprSim_ConvexPolyhedron } from "./simulations/ApgRprSimConvexPolyhedron.ts";
import { ApgRprSim_Platform } from "./simulations/ApgRprSimPlatform.ts";
import { ApgRprSim_CCDs } from "./simulations/ApgRprSimCCDs.ts";
import { ApgRprSim_Joints } from "./simulations/ApgRprSimJoints.ts";
import { ApgRprSim_CharacterController } from "./simulations/ApgRprSim_CharacterController.ts";
export var ApgRpr_eSimulationName = /* @__PURE__ */ ((ApgRpr_eSimulationName2) => {
  ApgRpr_eSimulationName2["A_PYRAMID"] = "Pyramid";
  ApgRpr_eSimulationName2["A1_COLUMN"] = "Column";
  ApgRpr_eSimulationName2["A2_DOMINO"] = "Domino";
  ApgRpr_eSimulationName2["A3_JENGA"] = "Jenga";
  ApgRpr_eSimulationName2["B_FOUNTAIN"] = "Fountain";
  ApgRpr_eSimulationName2["C_LOCKED_ROTATIONS"] = "Locked rotations";
  ApgRpr_eSimulationName2["D_DAMPING"] = "Damping";
  ApgRpr_eSimulationName2["E_COLLISION_GROUPS"] = "Collision groups";
  ApgRpr_eSimulationName2["F_TRI_MESH_TERRAIN"] = "Tri-mesh terrain";
  ApgRpr_eSimulationName2["G_PNG_MESH_TERRAIN"] = "Png terrain";
  ApgRpr_eSimulationName2["H_CONVEX_POLYHEDRONS"] = "Convex polyhedrons";
  ApgRpr_eSimulationName2["I_PLATFORM"] = "Platform";
  ApgRpr_eSimulationName2["J_CCDs"] = "CCDs";
  ApgRpr_eSimulationName2["K_JOINTS"] = "Joints";
  ApgRpr_eSimulationName2["L_CHARACTER_CONTROLLER"] = "Character controller";
  ApgRpr_eSimulationName2["Z_NONE"] = "";
  return ApgRpr_eSimulationName2;
})(ApgRpr_eSimulationName || {});
export function ApgRprSim_Get() {
  const simulations = /* @__PURE__ */ new Map();
  simulations.set("Pyramid" /* A_PYRAMID */, ApgRprSim_Pyramid);
  simulations.set("Column" /* A1_COLUMN */, ApgRprSim_Column);
  simulations.set("Domino" /* A2_DOMINO */, ApgRprSim_Domino);
  simulations.set("Jenga" /* A3_JENGA */, ApgRprSim_Jenga);
  simulations.set("Fountain" /* B_FOUNTAIN */, ApgRprSim_Fountain);
  simulations.set("Locked rotations" /* C_LOCKED_ROTATIONS */, ApgRprSim_LockedRotations);
  simulations.set("Damping" /* D_DAMPING */, ApgRprSim_Damping);
  simulations.set("Collision groups" /* E_COLLISION_GROUPS */, ApgRprSim_CollisionGroups);
  simulations.set("Tri-mesh terrain" /* F_TRI_MESH_TERRAIN */, ApgRprSim_TrimeshTerrain);
  simulations.set("Png terrain" /* G_PNG_MESH_TERRAIN */, ApgRprSim_PngTerrain);
  simulations.set("Convex polyhedrons" /* H_CONVEX_POLYHEDRONS */, ApgRprSim_ConvexPolyhedron);
  simulations.set("Platform" /* I_PLATFORM */, ApgRprSim_Platform);
  simulations.set("CCDs" /* J_CCDs */, ApgRprSim_CCDs);
  simulations.set("Joints" /* K_JOINTS */, ApgRprSim_Joints);
  simulations.set("Character controller" /* L_CHARACTER_CONTROLLER */, ApgRprSim_CharacterController);
  return simulations;
}
