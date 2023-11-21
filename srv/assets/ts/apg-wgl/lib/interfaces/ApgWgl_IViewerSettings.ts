/** -----------------------------------------------------------------------
 * @module [apg-wgl]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.8 [APG 2023/11/20]
 * -----------------------------------------------------------------------
*/

import {
    THREE
} from '../../deps.ts';

import {
    ApgWgl_eEnvMapMode
} from "../enums/ApgWgl_eEnvMapMode.ts";

import {
    ApgWgl_ILayerDescr
} from "./ApgWgl_ILayerDescr.ts";




export interface ApgWgl_IViewerSettings {

    /** Overall diameter size of the world */
    worldSize: number;
    /** Height position of the camera for the character head */
    eyeHeight: number;

    /** Renderer scaling factor */
    pixelRatio: number;

    /** Color of the fog */
    fogColor: THREE.Color;
    /** Exponential fog density */
    fogDensity: number;

    /** THREE JS Constants */
    toneMapping: THREE.ToneMapping;
    /** ??? */
    toneMappingExposure: number;

    /** THREE JS Constants */
    outputColorSpace: THREE.ColorSpace;

    /** Use shadows */
    areShadowsEnabled: boolean;
    /** THREE JS Constants */
    shadowMapType: THREE.ShadowMapType;
    /** ??? */
    shadowMapRadious: number;
    /** Multiples of 1024 */
    shadowMapSize: number;

    /** Anysotropy for textures */
    anisotropy: number;

    /** Scene background color */
    clearColor: THREE.Color;

    /** Field of view */
    perspCameraFov: number;
    /** Near clipping plane */
    perspCameraNear: number;
    /** Far clipping plane */
    perspCameraFar: number;
    /** Position */
    perspCameraPosition: THREE.Vector3;
    /** Zoom level */
    perspCameraZoom: number;

    /** Ambient light */
    ambLightEnabled: boolean;
    /**  */
    ambLightColor: THREE.Color;
    /**  */
    ambLightIntensity: number;

    /** Sun light */
    sunLightEnabled: boolean;
    /** */
    sunLightColor: THREE.Color;
    /** */
    sunLightIntensity: number;
    /** */
    sunLightPosition: THREE.Vector3;
    /** Sun light shadow*/
    sunLightShadowMapCameraSize: number;
    /** */
    sunLightShadowMapCameraNear: number;
    /** */
    sunLightShadowMapCameraFar: number;

    /** Camera light */
    camLightEnabled: boolean;
    /** */
    camLightColor: THREE.Color;
    /** */
    camLightIntensity: number;
    /** */
    camLightDistance: number;
    /** */
    camLightPosition: THREE.Vector3;
    /** */
    camLightIsDetachedFromCamera: boolean;

    /** Environment lighting and mapping */
    envMapLighting: boolean;
    /** Three modes are available LDR, HDR and EXR*/
    envMapMode: ApgWgl_eEnvMapMode;
    /** urls of the environment maps */
    envMaps: string[];
    /** */
    envMapLightingIntensity: number;
    /** */
    envMapBackgroundBlurryness: number;
    /** */
    envMapBackgroundIntensity: number;

    /** User interaction controller */
    orbControlsTarget: THREE.Vector3;
    /** */
    orbControlsMinDistance: number;
    /** */
    orbControlsMaxDistance: number;
    /** */
    orbControlsMinPolarAngle: number;
    /** */
    orbControlsMaxPolarAngle: number;
    /** */
    orbControlsEnableDamping: boolean;
    /** */
    orbControlsDampingFactor: number;

    /** */
    layers: Record<string, ApgWgl_ILayerDescr>;

}
