/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { RAPIER } from "./ApgRprDeps.ts";
import { eApgRpr_InstancedMeshesGroups } from "./ApgRprEnums.ts";
import { ApgRpr_eSimulationName } from "./ApgRpr_Simulations.ts";


export interface IApgRpr_Point2D {
    x: number;
    y: number;
}


export interface IApgRpr_Point3D extends IApgRpr_Point2D {
    z: number;
}


export interface ApgRpr_ISettings {

    name: ApgRpr_eSimulationName,

    gravity: RAPIER.Vector3;

    velocityIterations: number;

    frictionIterations: number;

    stabilizationIterations: number;

    linearError: number;

    errorReductionRatio: number;

    predictionDistance: number;

    slowdown: number;

    cameraPosition: IApgRpr_CameraPosition;

}

export interface IApgRpr_CameraPosition {
    eye: IApgRpr_Point3D,
    target: IApgRpr_Point3D
}


export interface IApgRpr_DebugInfo {
    stepId: number;
    integrationParams?: RAPIER.IntegrationParameters;
    // @NOTE The following are not used momentarily -- APG 20230916
    worldHash?: string;
    worldHashTime?: number;
    snapshotTime?: number;
    snapshotStepId?: number;
}


export interface IApgRpr_InstanceDesc {

    /** Group of instanced Meshes ID */
    groupId: eApgRpr_InstancedMeshesGroups;
    /** Instanceable Meshes ID */
    indexInGroup: number;
    /** Collider handle */
    colliderHandle: number;
    /** Instance count at moment of creation */
    count: number;
    /** This instance is hightlighted */
    highlighted: boolean;
    /** Scaling factors of this ins */
    scale: THREE.Vector3

}
