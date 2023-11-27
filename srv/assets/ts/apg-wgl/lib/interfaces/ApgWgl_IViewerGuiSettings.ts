/** -----------------------------------------------------------------------
 * @module [apg-wgl]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.8 [APG 2023/11/20]
 * -----------------------------------------------------------------------
*/

import {
  ApgGui_TSelectValuesMap
} from "../../../apg-gui/lib/classes/ApgGui.ts";
import { ApgGui_IMinMaxStep } from "../../../apg-gui/lib/interfaces/ApgGui_IMinMaxStep.ts";

import {
  ApgWgl_IViewerSettings
} from "./ApgWgl_IViewerSettings.ts";



export interface ApgWgl_IViewerGuiSettings extends ApgWgl_IViewerSettings {

  // - worldSize: number;
  worldSizeMMS: ApgGui_IMinMaxStep;

  // eyeHeight: number
  // - pixelRatio: number;
  pixelRatioMMS: ApgGui_IMinMaxStep;

  // - fogColor: THREE.Color;
  // - fogDensity: number;
  fogDensityMMS: ApgGui_IMinMaxStep;

  // - toneMapping: THREE.ToneMapping;
  toneMappingValues: ApgGui_TSelectValuesMap;
  // - toneMappingExposure: number;
  toneMappingExposureMMS: ApgGui_IMinMaxStep;

  // - outputColorSpace: THREE.ColorSpace;
  outputColorSpaceValues: ApgGui_TSelectValuesMap;

  // - areShadowsEnabled: boolean;
  // - shadowMapType: THREE.ShadowMapType;
  shadowMapTypeValues: ApgGui_TSelectValuesMap;
  //shadowMapRadious: number;
  //shadowMapSize: number;
  //anisotropy: number;
  //anisotropyMMS: ApgGui_IMinMaxStep;
  // - clearColor: THREE.Color;
  // - perspCameraZoom: number;
  perspCameraZoomMMS: ApgGui_IMinMaxStep;
  // - perspCameraFov: number;
  perspCameraFovMMS: ApgGui_IMinMaxStep;
  // - perspCameraNear: number;
  perspCameraNearMMS: ApgGui_IMinMaxStep;
  // - perspCameraFar: number;
  perspCameraFarMMS: ApgGui_IMinMaxStep;
  //perspCameraPosition: THREE.Vector3;
  //perspCameraPositionXMMS: ApgGui_IMinMaxStep;
  //perspCameraPositionYMMS: ApgGui_IMinMaxStep;
  //perspCameraPositionZMMS: ApgGui_IMinMaxStep;
  // - ambLightEnabled: boolean;
  // - ambLightColor: THREE.Color;
  // - ambLightIntensity: number;
  ambLightIntensityMMS: ApgGui_IMinMaxStep;

  // - sunLightColor: THREE.Color;
  // - sunLightEnabled: boolean;
  // - sunLightIntensity: number;
  sunLightIntensityMMS: ApgGui_IMinMaxStep;
  //sunLightPosition: THREE.Vector3;
  //sunLightPositionXMMS: ApgGui_IMinMaxStep;
  //sunLightPositionYMMS: ApgGui_IMinMaxStep;
  //sunLightPositionZMMS: ApgGui_IMinMaxStep;
  //sunLightShadowMapCameraSize: number,
  //sunLightShadowMapCameraNear: number,
  //sunLightShadowMapCameraFar: number,
  // - camLightEnabled: boolean;
  // - camLightColor: THREE.Color;
  // - camLightIntensity: number;
  camLightIntensityMMS: ApgGui_IMinMaxStep;
  //camLightDistance: number;
  //camLightDistanceMMS: ApgGui_IMinMaxStep;
  //camLightPosition: THREE.Vector3;
  //camLightPositionXMMS: ApgGui_IMinMaxStep;
  //camLightPositionYMMS: ApgGui_IMinMaxStep;
  //camLightPositionZMMS: ApgGui_IMinMaxStep;
  //camLightIsDetachedFromCamera: boolean;
  // - envMapLighting: boolean;
  // - envMapMode: ApgWgl_eEnvMapMode;
  envMapModeValues: ApgGui_TSelectValuesMap;
  //envMaps: string[];
  // - envMapLightingIntensity: number,
  envMapLightingIntensityMMS: ApgGui_IMinMaxStep;
  // - envMapBackgroundBlurryness: number,
  envMapBackgroundBlurrynessMMS: ApgGui_IMinMaxStep;
  // - envMapBackgroundIntensity: number,
  envMapBackgroundIntensityMMS: ApgGui_IMinMaxStep;

}
