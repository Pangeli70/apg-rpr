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
import { ApgRpr_E2_ConvexPolyhedron_Simulation } from "./simulations/ApgRpr_E2_ConvexPolyhedron.ts";
import { ApgRpr_F0_Platform_Simulation } from "./simulations/ApgRpr_F0_Platform.ts";
import { ApgRpr_G0_CCDs_Simulation } from "./simulations/ApgRpr_G0_CCDs.ts";
import { ApgRpr_H0_Joints_Simulation } from "./simulations/ApgRpr_H0_Joints.ts";
import { ApgRpr_I0_CharacterController_Simulation } from "./simulations/ApgRpr_I0_CharacterController.ts";
export var ApgRpr_eSimulationName = /* @__PURE__ */ ((ApgRpr_eSimulationName2) => {
  ApgRpr_eSimulationName2["A0_PYRAMID"] = "Pyramid";
  ApgRpr_eSimulationName2["A1_COLUMN"] = "Column";
  ApgRpr_eSimulationName2["A2_DOMINO"] = "Domino";
  ApgRpr_eSimulationName2["A3_JENGA"] = "Jenga";
  ApgRpr_eSimulationName2["A4_Keva"] = "Keva";
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
export function ApgRpr_PrepareSimulations() {
  const simulations = /* @__PURE__ */ new Map();
  simulations.set("Pyramid" /* A0_PYRAMID */, ApgRpr_A0_Pyramid_Simulation);
  simulations.set("Column" /* A1_COLUMN */, ApgRpr_A1_Column_Simulation);
  simulations.set("Domino" /* A2_DOMINO */, ApgRpr_A2_Domino_Simulation);
  simulations.set("Jenga" /* A3_JENGA */, ApgRpr_A3_Jenga_Simulation);
  simulations.set("Keva" /* A4_Keva */, ApgRpr_A4_Keva_Simulation);
  simulations.set("Fountain" /* B_FOUNTAIN */, ApgRpr_B0_Fountain_Simulation);
  simulations.set("Locked rotations" /* C_LOCKED_ROTATIONS */, ApgRpr_C0_LockedRotations_Simulation);
  simulations.set("Damping" /* D_DAMPING */, ApgRpr_C1_Damping_Simulation);
  simulations.set("Collision groups" /* E_COLLISION_GROUPS */, ApgRpr_D0_CollisionGroups_Simulation);
  simulations.set("Tri-mesh terrain" /* F_TRI_MESH_TERRAIN */, ApgRpr_E0_TrimeshTerrain_Simulation);
  simulations.set("Png terrain" /* G_PNG_MESH_TERRAIN */, ApgRpr_E1_PngTerrain_Simulation);
  simulations.set("Convex polyhedrons" /* H_CONVEX_POLYHEDRONS */, ApgRpr_E2_ConvexPolyhedron_Simulation);
  simulations.set("Platform" /* I_PLATFORM */, ApgRpr_F0_Platform_Simulation);
  simulations.set("CCDs" /* J_CCDs */, ApgRpr_G0_CCDs_Simulation);
  simulations.set("Joints" /* K_JOINTS */, ApgRpr_H0_Joints_Simulation);
  simulations.set("Character controller" /* L_CHARACTER_CONTROLLER */, ApgRpr_I0_CharacterController_Simulation);
  return simulations;
}
