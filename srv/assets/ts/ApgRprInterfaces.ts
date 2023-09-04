/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { RAPIER } from "./ApgRprDeps.ts";
import { eApgRpr_InstancedMeshesGroup } from "./ApgRprEnums.ts";


export interface IApgRpr_Point2D {
    x: number;
    y: number;
}


export interface IApgRpr_Point3D extends IApgRpr_Point2D {
    z: number;
}


export interface IApgRpr_CameraPosition {
    eye: IApgRpr_Point3D,
    target: IApgRpr_Point3D
}


export interface IApgRpr_DebugInfo {
    stepId: number;
    integrationParams?: RAPIER.IntegrationParameters
    worldHash?: string;
    worldHashTime?: number;
    snapshotTime?: number;
    snapshotStepId?: number;
}


export interface IApgRpr_InstanceDesc {

    groupId: eApgRpr_InstancedMeshesGroup;
    instanceId: number;
    elementId: number;
    highlighted: boolean;
    scale: THREE.Vector3

}
