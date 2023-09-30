/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/16]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomDialog
} from "./ApgDom.ts";

import {
    ApgGui,
    ApgGui_IMinMaxStep,
    ApgGui_TSelectValuesMap
} from "./ApgGui.ts";

import {
    ApgGui_Builder
} from "./ApgGui_Builder.ts";

import {
    ApgWgl_IViewerSettings, ApgWgl_Viewer
} from "./ApgWgl_Viewer.ts";



export interface ApgWgl_IViewerGuiSettings extends ApgWgl_IViewerSettings {

    worldSize: number;
    worldSizeMMS: ApgGui_IMinMaxStep;

    fogColor: THREE.Color;
    // fogNear: number;
    fogNearMMS: ApgGui_IMinMaxStep;
    // fogFar: number;
    fogFarMMS: ApgGui_IMinMaxStep;

    toneMapping: THREE.ToneMapping;
    toneMappingValues: ApgGui_TSelectValuesMap;

    toneMappingExposure: number;

    outputColorSpace: THREE.ColorSpace;
    outputColorSpaceValues: ApgGui_TSelectValuesMap;

    areShadowsEnabled: boolean;
    shadowMapType: THREE.ShadowMapType;
    shadowMapTypeValues: ApgGui_TSelectValuesMap;
    shadowMapRadious: number;
    shadowMapSize: number;

    clearColor: number;

    perspCameraFov: number;
    //perspCameraFovMMS: ApgGui_IMinMaxStep;
    perspCameraNear: number;
    //perspCameraNearMMS: ApgGui_IMinMaxStep;
    perspCameraFar: number;
    //perspCameraFarMMS: ApgGui_IMinMaxStep;

    perspCameraPosition: THREE.Vector3;

    useEnvMapInsteadThanLights: boolean;

    ambLightIntensityMMS: ApgGui_IMinMaxStep;

    sunLightIntensityMMS: ApgGui_IMinMaxStep;

    sunLightPosition: THREE.Vector3;
    sunLightShadowMapCameraSize: number,
    sunLightShadowMapCameraNear: number,
    sunLightShadowMapCameraFar: number,

    camLightIntensityMMS: ApgGui_IMinMaxStep;
    camLightDistance: number;
    //camLightDistanceMMS: ApgGui_IMinMaxStep;
    camLightPosition: THREE.Vector3;
    camLightIsDetachedFromCamera: boolean;

    orbControlsTarget: THREE.Vector3;
    orbControlsMinDistance: number;
    orbControlsMaxDistance: number;
    orbControlsMinPolarAngle: number;
    orbControlsMaxPolarAngle: number;
    orbControlsEnableDamping: boolean;
    orbControlsDampingFactor: number;

    layers: boolean[];

}

/**
 * This is the basic simulation gui Builder that contains the elements shared by
 * all the simulations. It prepares the controls that allows to change the simulation, 
 * to tweak the simulation settings, to create the stats panels and the the credits 
 * dialog
 */
export class ApgWgl_GuiBuilder extends ApgGui_Builder {

    settings: ApgWgl_IViewerGuiSettings;
    viewer: ApgWgl_Viewer;

    readonly VIEWER_SETTINGS_DIALOG_CNT = "ViewerSettingsDialogControl"

    constructor(
        agui: ApgGui,
        aname: string,
        aviewer: ApgWgl_Viewer,
    ) {
        super(agui, aname);

        this.viewer = aviewer;
        this.settings = aviewer.settings as ApgWgl_IViewerGuiSettings;

        // @NOTE we are injecting GUI properties in the original settings object !!! -- APG 20230930

        this.settings.worldSizeMMS = { min: 500, max: 2000, step: 500 };
        
        this.settings.fogNearMMS = { min: 0.2, max: 0.8, step: 0.1 };
        this.settings.fogFarMMS = { min: 0.5, max: 1, step: 0.1 };

        this.settings.toneMappingValues = new Map([
            ['0', 'NoToneMapping'],
            ['1', 'LinearToneMapping'],
            ['2', 'ReinhardToneMapping'],
            ['3', 'CineonToneMapping'],
            ['5', 'ACESFilmicToneMapping'],
            ['6', 'CustomToneMapping']
        ]);
        this.settings.outputColorSpaceValues = new Map([
            ['', 'NoColorSpace'],
            ['srgb', 'SRGBColorSpace'],
            ['srgb-linear', 'LinearSRGBColorSpace'],
            ['display-p3', 'DisplayP3ColorSpace'],
        ]);
        this.settings.shadowMapTypeValues = new Map([
            ['0', 'BasicShadowMap '],
            ['1', 'PCFShadowMap'],
            ['2', 'PCFSoftShadowMap'],
            ['3', 'VSMShadowMap'],
        ]);
        this.settings.ambLightIntensityMMS = { min: 0, max: 1, step: 0.1 }
        this.settings.sunLightIntensityMMS = { min: 0, max: 1, step: 0.1 }
        this.settings.camLightIntensityMMS = { min: 0, max: 1, step: 0.1 }

    }


    /**
     * 
     * @returns 
     */
    override buildHtml() {

        const viewerSettingsDialogControl = this.#buildViewerSettingsDialogControl();

        const VIEWER_SETTINGS_BTN_CNT = 'ViewerSettingsButtonControl';
        const viewerSettingsButtonControl = this.buildButtonControl(
            VIEWER_SETTINGS_BTN_CNT,
            'Viewer',
            () => {
                const dialog = this.gui.controls.get(this.VIEWER_SETTINGS_DIALOG_CNT)!.element as IApgDomDialog;
                dialog.showModal();
            }
        );

        const controls = [
            viewerSettingsDialogControl,
            viewerSettingsButtonControl,
        ];
        const r = controls.join("\n");

        return r;

    }






    #buildViewerSettingsDialogControl() {

        const shadowsFiledSet_Control = this.#buildShadowsFieldset();

        const fogFieldset_Control = this.#buildFogFieldset();

        const ambLightFieldset_Control = this.#buildAmbienLightFieldSet();

        const sunLightFieldset_Control = this.#buildSunLightFieldSet();

        const camLightFieldset_Control = this.#buildCamLightFieldSet();


        const VIEWER_INFO_BTN_CNT = 'InfoButton_Control';
        const InfoButton_Control = this.buildButtonControl(
            VIEWER_INFO_BTN_CNT,
            'Info',
            () => {
                const info = this.viewer.getInfo();
                alert(info.join("\n"));
            }
        );

        const VIEWER_SETTINGS_CLOSE_BTN_CNT = 'CloseButton_Control';
        const CloseButton_Control = this.buildButtonControl(
            VIEWER_SETTINGS_CLOSE_BTN_CNT,
            'Close',
            () => {
                const dialog = this.gui.controls.get(this.VIEWER_SETTINGS_DIALOG_CNT)!.element as IApgDomDialog;
                dialog.close();
            }
        );


        const r = this.buildDialogControl(
            this.VIEWER_SETTINGS_DIALOG_CNT,
            "Viewer settings:",
            [
                shadowsFiledSet_Control,
                fogFieldset_Control,
                ambLightFieldset_Control,
                sunLightFieldset_Control,
                camLightFieldset_Control,
                InfoButton_Control,
                CloseButton_Control
            ],
        );
        return r;
    }





    getPropertyName<T extends object>(obj: T, selector: (x: Record<keyof T, keyof T>) => keyof T): keyof T {
        const keyRecord = Object.keys(obj).reduce((res, key) => {
            const typedKey = key as keyof T
            res[typedKey] = typedKey
            return res
        }, {} as Record<keyof T, keyof T>)
        return selector(keyRecord)
    }


    #buildShadowsFieldset() {

        const SHADOWS_ENABLE_CNT = 'ShadowsChecBox_Control';
        const ShadowsChecBox_Control = this.buildCheckBoxControl(
            SHADOWS_ENABLE_CNT,
            'Shadows enable',
            this.settings.areShadowsEnabled,
            () => {
                const checked = this.readCheckBoxControl(SHADOWS_ENABLE_CNT);
                this.settings.areShadowsEnabled = checked;
            }
        )

        const SHADOWS_FIELDSET_CNT = 'ShadowsFieldset_Control';
        const ShadowsFieldset_Control = this.buildFieldSetControl(
            SHADOWS_FIELDSET_CNT,
            'Shadows settings',
            [
                ShadowsChecBox_Control,
            ]
        );

        return ShadowsFieldset_Control;
    }


    #buildFogFieldset() {

        const FOG_COLOR_PICKER_CNT = 'FogColorPicker_Control';
        const FogColorPicker_Control = this.buildColorPickerControl(
            FOG_COLOR_PICKER_CNT,
            'Fog Color',
            this.settings.fogColor.getHex(),
            () => {
                const color = this.readColorPickerControl(FOG_COLOR_PICKER_CNT)
                this.settings.fogColor.setHex(color);
            }
        );

        const FOG_NEAR_CNT = 'FogNearRange_Control';
        const FogNearRange_Control = this.buildRangeControl(
            FOG_NEAR_CNT,
            'Near',
            this.settings.fogNear,
            this.settings.fogNearMMS,
            () => {
                const nearValue = this.readRangeControl(FOG_NEAR_CNT);
                this.settings.fogNear = nearValue;
            }
        )

        const FOG_FAR_CNT = 'FogFarRange_Control';
        const FogFarRange_Control = this.buildRangeControl(
            FOG_FAR_CNT,
            'Far',
            this.settings.fogFar,
            this.settings.fogFarMMS,
            () => {
                const farValue = this.readRangeControl(FOG_FAR_CNT);
                this.settings.fogFar = farValue;
            }
        )

        const FOG_FIELDSET_CNT = 'FogFieldset_Control';
        const fogFieldset_Control = this.buildFieldSetControl(
            FOG_FIELDSET_CNT,
            'Fog settings',
            [
                FogColorPicker_Control,
                FogNearRange_Control,
                FogFarRange_Control
            ]
        );

        return fogFieldset_Control;
    }


    #buildAmbienLightFieldSet() {

        const AMB_LIGHT_ENABLE_CNT = 'AmbLightChecBox_Control';
        const AmbLightEnable_Control = this.buildCheckBoxControl(
            AMB_LIGHT_ENABLE_CNT,
            'Ambient light enable',
            this.settings.ambLightEnabled,
            () => {
                const checked = this.readCheckBoxControl(AMB_LIGHT_ENABLE_CNT);
                this.settings.ambLightEnabled = checked;
            }
        )

        const AMB_LIGHT_COLOR_PICKER_CNT = 'AmbLightColorPicker_Control';
        const AmbLightColor_Control = this.buildColorPickerControl(
            AMB_LIGHT_COLOR_PICKER_CNT,
            'Ambient light Color',
            this.settings.ambLightColor.getHex(),
            () => {
                const color = this.readColorPickerControl(AMB_LIGHT_COLOR_PICKER_CNT);
                this.settings.ambLightColor.setHex(color);
            }
        );

        const AMB_LIGHT_INTENSITY_CNT = 'AmbLightRange_Control';
        const AmbLightIntensity_Controls = this.buildRangeControl(
            AMB_LIGHT_INTENSITY_CNT,
            'Ambient light intensity',
            this.settings.ambLightIntensity,
            this.settings.ambLightIntensityMMS,
            () => {
                const value = this.readRangeControl(AMB_LIGHT_INTENSITY_CNT);
                this.settings.ambLightIntensity = value;
            }
        )

        const AMB_LIGHT_FIELDSET_CNT = 'AmbLightFieldset_Control';
        const ambLightFieldset_Control = this.buildFieldSetControl(
            AMB_LIGHT_FIELDSET_CNT,
            'Ambient light settings',
            [
                AmbLightEnable_Control,
                AmbLightColor_Control,
                AmbLightIntensity_Controls
            ]
        );
        return ambLightFieldset_Control;
    }


    #buildSunLightFieldSet(): string {

        const SUN_LIGHT_ENABLE_CNT = 'SunLightChecBox_Control';
        const SunLightEnable_Control = this.buildCheckBoxControl(
            SUN_LIGHT_ENABLE_CNT,
            'Enable',
            this.settings.sunLightEnabled,
            () => {
                const checked = this.readCheckBoxControl(SUN_LIGHT_ENABLE_CNT);
                this.settings.sunLightEnabled = checked;
            }
        )

        const SUN_LIGHT_COLOR_PICKER_CNT = 'SunLightColorPicker_Control';
        const SunLightColorPicker_Control = this.buildColorPickerControl(
            SUN_LIGHT_COLOR_PICKER_CNT,
            'Color',
            this.settings.sunLightColor.getHex(),
            () => {
                const color = this.readColorPickerControl(SUN_LIGHT_COLOR_PICKER_CNT);
                this.settings.sunLightColor.setHex(color);
            }
        );

        const SUN_LIGHT_INTENSITY_CNT = 'SunLightRange_Control';
        const sunLightIntensity_Controls = this.buildRangeControl(
            SUN_LIGHT_INTENSITY_CNT,
            'Intensity',
            this.settings.sunLightIntensity,
            this.settings.sunLightIntensityMMS,
            () => {
                const value = this.readRangeControl(SUN_LIGHT_INTENSITY_CNT);
                this.settings.sunLightIntensity = value;
            }
        )


        const SUN_LIGHT_FIELDSET_CNT = 'SunLightFieldset_Control';
        const sunLightFieldset_Control = this.buildFieldSetControl(
            SUN_LIGHT_FIELDSET_CNT,
            'Sun light settings',
            [
                SunLightEnable_Control,
                SunLightColorPicker_Control,
                sunLightIntensity_Controls
            ]
        );
        return sunLightFieldset_Control;
    }


    #buildCamLightFieldSet() {

        const CAM_LIGHT_ENABLE_CNT = 'CamLightChecBox_Control';
        const CamLightEnable_Control = this.buildCheckBoxControl(
            CAM_LIGHT_ENABLE_CNT,
            'Enable',
            this.settings.camLightEnabled,
            () => {
                const checked = this.readCheckBoxControl(CAM_LIGHT_ENABLE_CNT);
                this.settings.camLightEnabled = checked;
            }
        )

        const CAM_LIGHT_COLOR_PICKER_CNT = 'CamLightColorPicker_Control';
        const CamLightColorPicker_Control = this.buildColorPickerControl(
            CAM_LIGHT_COLOR_PICKER_CNT,
            'Color',
            this.settings.camLightColor.getHex(),
            () => {
                const color = this.readColorPickerControl(CAM_LIGHT_COLOR_PICKER_CNT);
                this.settings.camLightColor.setHex(color);
            }
        );

        const CAM_LIGHT_INTENSITY_CNT = 'CamLightRange_Control';
        const CamLightIntensity_Controls = this.buildRangeControl(
            CAM_LIGHT_INTENSITY_CNT,
            'Intensity',
            this.settings.camLightIntensity,
            this.settings.camLightIntensityMMS,
            () => {
                const value = this.readRangeControl(CAM_LIGHT_INTENSITY_CNT);
                this.settings.camLightIntensity = value;
            }
        )


        const CAM_LIGHT_FIELDSET_CNT = 'CamLightFieldset_Control';
        const camLightFieldset_Control = this.buildFieldSetControl(
            CAM_LIGHT_FIELDSET_CNT,
            'Cam light settings',
            [
                CamLightEnable_Control,
                CamLightColorPicker_Control,
                CamLightIntensity_Controls
            ]
        );
        return camLightFieldset_Control;
    }

}
