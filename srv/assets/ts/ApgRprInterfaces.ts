/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { eApgRprInstancedMeshesGroup } from "./ApgRprEnums.ts";


export interface IApgRprPoint2D {
    x: number;
    y: number;
}


export interface IApgRpr_Point3D extends IApgRprPoint2D {
    z: number;
}


export interface IApgRpr_CameraPosition {
    eye: IApgRpr_Point3D,
    target: IApgRpr_Point3D
}


export interface IApgRprDebugInfo {
    stepId: number;
    worldHash?: string;
    worldHashTime?: number;
    snapshotTime?: number;
    snapshotStepId?: number;
}


export interface IApgRprInstanceDesc {

    groupId: eApgRprInstancedMeshesGroup;
    instanceId: number;
    elementId: number;
    highlighted: boolean;
    scale: THREE.Vector3

}
