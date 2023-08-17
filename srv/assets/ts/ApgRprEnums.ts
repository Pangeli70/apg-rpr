/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/


export enum eApgRprInstancedMeshesGroup {
  BOXES = 0,
  BALLS = 1,
  CYLINDERS = 2,
  CONES = 3,
  CAPSULES = 4,
}

// TODO move this away -- APG 20230816
export enum eApgRpr_SimulationName {
  A_PYRAMID = 'Pyramid',
  B_FOUNTAIN = 'Fountain',
  C_LOCKED_ROTATIONS = 'Locked rotations',
  D_DAMPING = 'Damping',
  E_COLLISION_GROUPS = 'Collision groups',
  F_TRI_MESH_TERRAIN = 'Tri-mesh terrain',
  G_PNG_MESH_TERRAIN = 'Png terrain',
  H_CONVEX_POLYHEDRONS = 'Convex polyhedrons',
  I_PLATFORM = 'Platform',
  J_CCDs = 'CCDs',

  Z_NONE = '',
}
