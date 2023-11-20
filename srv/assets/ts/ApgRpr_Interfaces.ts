/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    RAPIER
} from "./ApgRpr_Deps.ts";



export interface ApgRpr_IPoint2D {
    x: number;
    y: number;
}


export interface ApgRpr_IPoint3D extends ApgRpr_IPoint2D {
    z: number;
}



export interface ApgRpr_ICameraPosition {
    eye: ApgRpr_IPoint3D;
    target: ApgRpr_IPoint3D;
}




export interface ApgRpr_IDebugInfo {
    stepId: number;
    integrationParams?: RAPIER.IntegrationParameters;
    // @NOTE The following are not used momentarily -- APG 20230916
    worldHash?: string;
    worldHashTime?: number;
    snapshotTime?: number;
    snapshotStepId?: number;
}

