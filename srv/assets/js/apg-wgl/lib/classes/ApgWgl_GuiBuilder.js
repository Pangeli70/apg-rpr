import {
  ApgGui_Builder
} from "../../../apg-gui/lib/classes/ApgGui_Builder.ts";
import {
  ApgWgl_eEnvMapMode,
  ApgWgl_Layers
} from "./ApgWgl_Viewer.ts";
export class ApgWgl_GuiBuilder extends ApgGui_Builder {
  settings;
  viewer;
  VIEWER_SETTINGS_DIALOG_CNT = "ViewerSettingsDialogControl";
  constructor(agui, aname, aviewer) {
    super(agui, aname);
    this.viewer = aviewer;
    this.settings = aviewer.settings;
    this.settings.worldSizeMMS = { min: 500, max: 2e3, step: 500 };
    this.settings.pixelRatioMMS = {
      min: 0.2,
      max: this.viewer.APG_WGL_MAX_PIXEL_RATIO,
      step: 0.1
    };
    this.settings.fogDensityMMS = { min: 1e-4, max: 2e-3, step: 5e-5 };
    this.settings.toneMappingValues = /* @__PURE__ */ new Map([
      ["0", "None"],
      ["1", "Linear"],
      ["2", "Reinhard"],
      ["3", "Cineon"],
      ["5", "ACESFilmic"],
      ["6", "Custom"]
    ]);
    this.settings.toneMappingExposureMMS = { min: 0, max: 2, step: 0.1 };
    this.settings.outputColorSpaceValues = /* @__PURE__ */ new Map([
      ["", "Default"],
      ["srgb", "SRGB"],
      ["srgb-linear", "LinearSRGB"],
      ["display-p3", "DisplayP3"]
    ]);
    this.settings.shadowMapTypeValues = /* @__PURE__ */ new Map([
      ["0", "Basic "],
      ["1", "PCF"],
      ["2", "PCFSoft"],
      ["3", "VSM"]
    ]);
    this.settings.perspCameraZoomMMS = { min: 0.5, max: 20, step: 0.5 };
    this.settings.perspCameraFovMMS = { min: 35, max: 75, step: 5 };
    this.settings.perspCameraNearMMS = { min: 0.1, max: 1, step: 0.1 };
    this.settings.perspCameraFarMMS = { min: 10, max: 100, step: 5 };
    this.settings.ambLightIntensityMMS = { min: 0, max: 1, step: 0.1 };
    this.settings.sunLightIntensityMMS = { min: 0, max: 1, step: 0.1 };
    this.settings.camLightIntensityMMS = { min: 0, max: 1, step: 0.1 };
    this.settings.envMapModeValues = /* @__PURE__ */ new Map([
      [ApgWgl_eEnvMapMode.NONE, "None"],
      [ApgWgl_eEnvMapMode.LDR, "Low Dynamic Range"],
      [ApgWgl_eEnvMapMode.HDR, "High Dynamic Range"],
      [ApgWgl_eEnvMapMode.EXR, "Extened Dynamic Range"]
    ]);
    this.settings.envMapLightingIntensityMMS = { min: 0, max: 10, step: 0.1 };
    this.settings.envMapBackgroundBlurrynessMMS = { min: 0, max: 0.5, step: 0.025 };
    this.settings.envMapBackgroundIntensityMMS = { min: 0, max: 2, step: 0.1 };
    this.getLayersMap();
  }
  getLayersMap() {
    this.settings.layers[ApgWgl_Layers.unassigned.toString()] = {
      index: ApgWgl_Layers.unassigned,
      visible: true,
      name: "Unassigned"
    };
    this.settings.layers[ApgWgl_Layers.lights.toString()] = {
      index: ApgWgl_Layers.lights,
      visible: true,
      name: "Lights"
    };
    this.settings.layers[ApgWgl_Layers.helpers.toString()] = {
      index: ApgWgl_Layers.helpers,
      visible: false,
      name: "Helpers"
    };
  }
  /**
   * 
   * @returns 
   */
  buildControls() {
    const viewerSettingsDialogControl = this.#buildViewerSettingsDialogControl();
    const VIEWER_SETTINGS_BTN_CNT = "ViewerSettingsButtonControl";
    const viewerSettingsButtonControl = this.buildButtonControl(
      VIEWER_SETTINGS_BTN_CNT,
      "Viewer",
      () => {
        const dialog = this.gui.controls.get(this.VIEWER_SETTINGS_DIALOG_CNT).element;
        dialog.showModal();
      }
    );
    const controls = [
      viewerSettingsDialogControl,
      viewerSettingsButtonControl
    ];
    const r = controls.join("\n");
    return r;
  }
  #buildViewerSettingsDialogControl() {
    const cameraControl = this.#buildCameraDetails();
    const rendererControl = this.#buildRendererDetails();
    const shadowsControl = this.#buildShadowsDetails();
    const envMapControl = this.#buildEnvMapDetails();
    const fogControl = this.#buildFogDetails();
    const lightsControl = this.#buildLightsDetails();
    const layersControl = this.#buildLayersDetails();
    const infoControl = this.#buildInfoDetails();
    const VIEWER_SETTINGS_CLOSE_BTN_CNT = "CloseButton_Control";
    const CloseButton_Control = this.buildButtonControl(
      VIEWER_SETTINGS_CLOSE_BTN_CNT,
      "Close",
      () => {
        const dialog = this.gui.controls.get(this.VIEWER_SETTINGS_DIALOG_CNT).element;
        dialog.close();
      }
    );
    const r = this.buildDialogControl(
      this.VIEWER_SETTINGS_DIALOG_CNT,
      "Viewer settings:",
      [
        cameraControl,
        rendererControl,
        envMapControl,
        shadowsControl,
        fogControl,
        lightsControl,
        layersControl,
        infoControl,
        CloseButton_Control
      ]
    );
    return r;
  }
  #buildRendererDetails() {
    const RENDERER_PIXEL_RATIO_RANGE_CNT = "RendererPixelRatioRange_Control";
    const RendererPixelRatioRange_Control = this.buildRangeControl(
      RENDERER_PIXEL_RATIO_RANGE_CNT,
      "Pixel ratio",
      this.settings.pixelRatio,
      this.settings.pixelRatioMMS,
      () => {
        const value = this.readRangeControl(RENDERER_PIXEL_RATIO_RANGE_CNT);
        this.settings.pixelRatio = value;
      }
    );
    const RENDERER_CLEAR_COLOR_CNT = "RendererClearColorPicker_Control";
    const RendererClearColorPicker_Control = this.buildColorPickerControl(
      RENDERER_CLEAR_COLOR_CNT,
      "Clear Color",
      this.settings.clearColor.getHex(),
      () => {
        const color = this.readColorPickerControl(RENDERER_CLEAR_COLOR_CNT);
        this.settings.clearColor.setHex(color);
      }
    );
    const RENDERER_TONE_MAPPING_SELECT_CNT = "RendererToneMappingSelect_Control";
    const RendererToneMappingSelect_Control = this.buildSelectControl(
      RENDERER_TONE_MAPPING_SELECT_CNT,
      "Tone mapping",
      this.settings.toneMapping.toString(),
      this.settings.toneMappingValues,
      () => {
        const toneMapping = this.readSelectControl(RENDERER_TONE_MAPPING_SELECT_CNT);
        this.settings.toneMapping = parseInt(toneMapping);
      }
    );
    const RENDERER_TONE_MAPPING_EXPOSURE_RANGE_CNT = "RendererToneMappingExposureRange_Control";
    const RendererToneMappingExposureRange_Control = this.buildRangeControl(
      RENDERER_TONE_MAPPING_EXPOSURE_RANGE_CNT,
      "Exposure range",
      this.settings.toneMappingExposure,
      this.settings.toneMappingExposureMMS,
      () => {
        const toneMappingExpValue = this.readRangeControl(RENDERER_TONE_MAPPING_EXPOSURE_RANGE_CNT);
        this.settings.toneMappingExposure = toneMappingExpValue;
      }
    );
    const COLOR_SPACE_SELECT_CNT = "ColorSpaceSelect_Control";
    const ColorSpaceSelect_Control = this.buildSelectControl(
      COLOR_SPACE_SELECT_CNT,
      "Color space",
      this.settings.outputColorSpace,
      this.settings.outputColorSpaceValues,
      () => {
        const outputColorSpace = this.readSelectControl(COLOR_SPACE_SELECT_CNT);
        this.settings.outputColorSpace = outputColorSpace;
      }
    );
    const RENDERER_DETAILS_CNT = "RendererDetails_Control";
    const RendererDetails_Control = this.buildDetailsControl(
      RENDERER_DETAILS_CNT,
      "Renderer",
      [
        RendererPixelRatioRange_Control,
        RendererClearColorPicker_Control,
        RendererToneMappingSelect_Control,
        RendererToneMappingExposureRange_Control,
        ColorSpaceSelect_Control
      ]
    );
    return RendererDetails_Control;
  }
  #buildShadowsDetails() {
    const SHADOWS_ENABLE_CNT = "ShadowsCheckBox_Control";
    const ShadowsCheckBox_Control = this.buildCheckBoxControl(
      SHADOWS_ENABLE_CNT,
      "Shadows enable",
      this.settings.areShadowsEnabled,
      () => {
        const checked = this.readCheckBoxControl(SHADOWS_ENABLE_CNT);
        this.settings.areShadowsEnabled = checked;
      }
    );
    const SHADOWS_MAP_TYPE_SELECT_CNT = "ShadowsMapTypeSelect_Control";
    const ShadowsMapTypeSelect_Control = this.buildSelectControl(
      SHADOWS_MAP_TYPE_SELECT_CNT,
      "Shadow Map Type",
      this.settings.shadowMapType.toString(),
      this.settings.shadowMapTypeValues,
      () => {
        const shadowMapType = this.readSelectControl(SHADOWS_MAP_TYPE_SELECT_CNT);
        this.settings.shadowMapType = parseInt(shadowMapType);
      }
    );
    const SHADOWS_DETAILS_CNT = "ShadowsDetails_Control";
    const ShadowsDetails_Control = this.buildDetailsControl(
      SHADOWS_DETAILS_CNT,
      "Shadows",
      [
        ShadowsCheckBox_Control,
        ShadowsMapTypeSelect_Control
      ]
    );
    return ShadowsDetails_Control;
  }
  #buildEnvMapDetails() {
    const ENV_MAP_LIGHTING_CHK_CNT = "EnvMapLightingCheckBox_Control";
    const EnvMapLightingCheckBox_Control = this.buildCheckBoxControl(
      ENV_MAP_LIGHTING_CHK_CNT,
      "Use env. lighting",
      this.settings.envMapLighting,
      () => {
        const checked = this.readCheckBoxControl(ENV_MAP_LIGHTING_CHK_CNT);
        this.settings.envMapLighting = checked;
      }
    );
    const ENV_MAP_MODE_SELECT_CNT = "EnvMapModeSelect_Control";
    const EnvMapModeSelect_Control = this.buildSelectControl(
      ENV_MAP_MODE_SELECT_CNT,
      "Mode",
      this.settings.envMapMode.toString(),
      this.settings.envMapModeValues,
      () => {
        const envMapMode = this.readSelectControl(ENV_MAP_MODE_SELECT_CNT);
        this.settings.envMapMode = envMapMode;
      }
    );
    const ENV_MAP_LIGHT_INTENSITY_RANGE_CNT = "EnvMapLightIntensityRange_Control";
    const EnvMapLightIntensityRange_Control = this.buildRangeControl(
      ENV_MAP_LIGHT_INTENSITY_RANGE_CNT,
      "Light intensity",
      this.settings.envMapLightingIntensity,
      this.settings.envMapLightingIntensityMMS,
      () => {
        const lightIntensityValue = this.readRangeControl(ENV_MAP_LIGHT_INTENSITY_RANGE_CNT);
        this.settings.envMapLightingIntensity = lightIntensityValue;
      }
    );
    const ENV_MAP_BACKGROUND_INTENSITY_RANGE_CNT = "EnvMapBackgroundIntensityRange_Control";
    const EnvMapBackgroundIntensityRange_Control = this.buildRangeControl(
      ENV_MAP_BACKGROUND_INTENSITY_RANGE_CNT,
      "Background intensity",
      this.settings.envMapBackgroundIntensity,
      this.settings.envMapBackgroundIntensityMMS,
      () => {
        const backIntensityValue = this.readRangeControl(ENV_MAP_BACKGROUND_INTENSITY_RANGE_CNT);
        this.settings.envMapBackgroundIntensity = backIntensityValue;
      }
    );
    const ENV_MAP_BACKGROUND_BLURRYNESS_RANGE_CNT = "EnvMapBackgroundBlurrynessRange_Control";
    const EnvMapBackgroundBlurrynessRange_Control = this.buildRangeControl(
      ENV_MAP_BACKGROUND_BLURRYNESS_RANGE_CNT,
      "Background blurryness",
      this.settings.envMapBackgroundBlurryness,
      this.settings.envMapBackgroundBlurrynessMMS,
      () => {
        const backBlorrynessyValue = this.readRangeControl(ENV_MAP_BACKGROUND_BLURRYNESS_RANGE_CNT);
        this.settings.envMapBackgroundBlurryness = backBlorrynessyValue;
      }
    );
    const ENV_MAP_DETAILS_CNT = "EnvMapDetails_Control";
    const EnvMapDetails_Control = this.buildDetailsControl(
      ENV_MAP_DETAILS_CNT,
      "Env. mapping",
      [
        EnvMapLightingCheckBox_Control,
        EnvMapModeSelect_Control,
        EnvMapLightIntensityRange_Control,
        EnvMapBackgroundIntensityRange_Control,
        EnvMapBackgroundBlurrynessRange_Control
      ]
    );
    return EnvMapDetails_Control;
  }
  #buildFogDetails() {
    const FOG_COLOR_PICKER_CNT = "FogColorPicker_Control";
    const FogColorPicker_Control = this.buildColorPickerControl(
      FOG_COLOR_PICKER_CNT,
      "Color",
      this.settings.fogColor.getHex(),
      () => {
        const color = this.readColorPickerControl(FOG_COLOR_PICKER_CNT);
        this.settings.fogColor.setHex(color);
      }
    );
    const FOG_DENSITY_CNT = "FogNearRange_Control";
    const FogDensityRange_Control = this.buildRangeControl(
      FOG_DENSITY_CNT,
      "Density",
      this.settings.fogDensity,
      this.settings.fogDensityMMS,
      () => {
        const densityValue = this.readRangeControl(FOG_DENSITY_CNT);
        this.settings.fogDensity = densityValue;
      }
    );
    const FOG_DETAILS_CNT = "FogDetails_Control";
    const fogDetails_Control = this.buildDetailsControl(
      FOG_DETAILS_CNT,
      "Fog",
      [
        FogColorPicker_Control,
        FogDensityRange_Control
      ]
    );
    return fogDetails_Control;
  }
  #buildCameraDetails() {
    const CAMERA_ZOOM_CNT = "CameraZoomRange_Control";
    const CameraZoomRange_Control = this.buildRangeControl(
      CAMERA_ZOOM_CNT,
      "Zoom",
      this.settings.perspCameraZoom,
      this.settings.perspCameraZoomMMS,
      () => {
        const value = this.readRangeControl(CAMERA_ZOOM_CNT);
        this.settings.perspCameraZoom = value;
      }
    );
    const CAMERA_FOV_CNT = "CameraFovRange_Control";
    const CameraFovRange_Control = this.buildRangeControl(
      CAMERA_FOV_CNT,
      "Field of view",
      this.settings.perspCameraFov,
      this.settings.perspCameraFovMMS,
      () => {
        const value = this.readRangeControl(CAMERA_FOV_CNT);
        this.settings.perspCameraZoom = value;
      }
    );
    const CAMERA_NEAR_CNT = "CameraNearRange_Control";
    const CameraNearRange_Control = this.buildRangeControl(
      CAMERA_NEAR_CNT,
      "Near plane",
      this.settings.perspCameraNear,
      this.settings.perspCameraNearMMS,
      () => {
        const value = this.readRangeControl(CAMERA_NEAR_CNT);
        this.settings.perspCameraNear = value;
      }
    );
    const CAMERA_FAR_CNT = "CameraFarRange_Control";
    const CameraFarRange_Control = this.buildRangeControl(
      CAMERA_FAR_CNT,
      "Far plane",
      this.settings.perspCameraFar,
      this.settings.perspCameraFarMMS,
      () => {
        const value = this.readRangeControl(CAMERA_FAR_CNT);
        this.settings.perspCameraFar = value;
      }
    );
    const CAMERA_DETAILS_CNT = "CameraDetails_Control";
    const cameraDetails_Control = this.buildDetailsControl(
      CAMERA_DETAILS_CNT,
      "Camera",
      [
        CameraZoomRange_Control,
        CameraFovRange_Control,
        CameraNearRange_Control,
        CameraFarRange_Control
      ]
    );
    return cameraDetails_Control;
  }
  #buildLayersDetails() {
    const layersControls = [];
    for (const index of Object.keys(this.settings.layers)) {
      const layerDescr = this.settings.layers[index];
      const LAYERS_CHK_CNT = "Layer_" + index + "_CheckBox_Control";
      const LayerCheckBox_Control = this.buildCheckBoxControl(
        LAYERS_CHK_CNT,
        layerDescr.name,
        layerDescr.visible,
        () => {
          const fragments = LAYERS_CHK_CNT.split("_");
          const index2 = fragments[1];
          const checked = this.readCheckBoxControl(LAYERS_CHK_CNT);
          const layerDescr2 = this.settings.layers[index2];
          layerDescr2.visible = checked;
        }
      );
      layersControls.push(LayerCheckBox_Control);
    }
    const LAYERS_DETAILS_CNT = "LayersDetails_Control";
    const fogDetails_Control = this.buildDetailsControl(
      LAYERS_DETAILS_CNT,
      "Layers",
      layersControls
    );
    return fogDetails_Control;
  }
  #buildLightsDetails() {
    const ambLightControl = this.#buildAmbienLightFieldSet();
    const sunLightControl = this.#buildSunLightFieldSet();
    const camLightControl = this.#buildCamLightFieldSet();
    const LIGHTS_DETAILS_CNT = "LightsDetails_Control";
    const lightsDetails_Control = this.buildDetailsControl(
      LIGHTS_DETAILS_CNT,
      "Lights",
      [
        ambLightControl,
        sunLightControl,
        camLightControl
      ]
    );
    return lightsDetails_Control;
  }
  #buildInfoDetails() {
    const INFO_PAR_CNT = "InfoParagraph_Control";
    const info = this.viewer.getInfo();
    const InfoParagraph_Control = this.buildParagraphControl(
      INFO_PAR_CNT,
      info.join("\n")
    );
    const INFO_DETAILS_CNT = "InfoDetails_Control";
    const infoDetails_Control = this.buildDetailsControl(
      INFO_DETAILS_CNT,
      "Info",
      [
        InfoParagraph_Control
      ],
      false,
      () => {
        const details = this.gui.document.getElementById(INFO_DETAILS_CNT);
        if (details.open) {
          const paragraph = this.gui.document.getElementById(INFO_PAR_CNT);
          const info2 = this.viewer.getInfo();
          paragraph.innerText = info2.join("\n");
        }
      }
    );
    return infoDetails_Control;
  }
  #buildAmbienLightFieldSet() {
    const AMB_LIGHT_ENABLE_CNT = "AmbLightChecBox_Control";
    const AmbLightEnable_Control = this.buildCheckBoxControl(
      AMB_LIGHT_ENABLE_CNT,
      "Ambient light enable",
      this.settings.ambLightEnabled,
      () => {
        const checked = this.readCheckBoxControl(AMB_LIGHT_ENABLE_CNT);
        this.settings.ambLightEnabled = checked;
      }
    );
    const AMB_LIGHT_COLOR_PICKER_CNT = "AmbLightColorPicker_Control";
    const AmbLightColor_Control = this.buildColorPickerControl(
      AMB_LIGHT_COLOR_PICKER_CNT,
      "Ambient light Color",
      this.settings.ambLightColor.getHex(),
      () => {
        const color = this.readColorPickerControl(AMB_LIGHT_COLOR_PICKER_CNT);
        this.settings.ambLightColor.setHex(color);
      }
    );
    const AMB_LIGHT_INTENSITY_CNT = "AmbLightRange_Control";
    const AmbLightIntensity_Controls = this.buildRangeControl(
      AMB_LIGHT_INTENSITY_CNT,
      "Ambient light intensity",
      this.settings.ambLightIntensity,
      this.settings.ambLightIntensityMMS,
      () => {
        const value = this.readRangeControl(AMB_LIGHT_INTENSITY_CNT);
        this.settings.ambLightIntensity = value;
      }
    );
    const AMB_LIGHT_FIELDSET_CNT = "AmbLightFieldset_Control";
    const ambLightFieldset_Control = this.buildFieldSetControl(
      AMB_LIGHT_FIELDSET_CNT,
      "Ambient light settings",
      [
        AmbLightEnable_Control,
        AmbLightColor_Control,
        AmbLightIntensity_Controls
      ]
    );
    return ambLightFieldset_Control;
  }
  #buildSunLightFieldSet() {
    const SUN_LIGHT_ENABLE_CNT = "SunLightChecBox_Control";
    const SunLightEnable_Control = this.buildCheckBoxControl(
      SUN_LIGHT_ENABLE_CNT,
      "Enable",
      this.settings.sunLightEnabled,
      () => {
        const checked = this.readCheckBoxControl(SUN_LIGHT_ENABLE_CNT);
        this.settings.sunLightEnabled = checked;
      }
    );
    const SUN_LIGHT_COLOR_PICKER_CNT = "SunLightColorPicker_Control";
    const SunLightColorPicker_Control = this.buildColorPickerControl(
      SUN_LIGHT_COLOR_PICKER_CNT,
      "Color",
      this.settings.sunLightColor.getHex(),
      () => {
        const color = this.readColorPickerControl(SUN_LIGHT_COLOR_PICKER_CNT);
        this.settings.sunLightColor.setHex(color);
      }
    );
    const SUN_LIGHT_INTENSITY_CNT = "SunLightRange_Control";
    const sunLightIntensity_Controls = this.buildRangeControl(
      SUN_LIGHT_INTENSITY_CNT,
      "Intensity",
      this.settings.sunLightIntensity,
      this.settings.sunLightIntensityMMS,
      () => {
        const value = this.readRangeControl(SUN_LIGHT_INTENSITY_CNT);
        this.settings.sunLightIntensity = value;
      }
    );
    const SUN_LIGHT_FIELDSET_CNT = "SunLightFieldset_Control";
    const sunLightFieldset_Control = this.buildFieldSetControl(
      SUN_LIGHT_FIELDSET_CNT,
      "Sun light settings",
      [
        SunLightEnable_Control,
        SunLightColorPicker_Control,
        sunLightIntensity_Controls
      ]
    );
    return sunLightFieldset_Control;
  }
  #buildCamLightFieldSet() {
    const CAM_LIGHT_ENABLE_CNT = "CamLightChecBox_Control";
    const CamLightEnable_Control = this.buildCheckBoxControl(
      CAM_LIGHT_ENABLE_CNT,
      "Enable",
      this.settings.camLightEnabled,
      () => {
        const checked = this.readCheckBoxControl(CAM_LIGHT_ENABLE_CNT);
        this.settings.camLightEnabled = checked;
      }
    );
    const CAM_LIGHT_COLOR_PICKER_CNT = "CamLightColorPicker_Control";
    const CamLightColorPicker_Control = this.buildColorPickerControl(
      CAM_LIGHT_COLOR_PICKER_CNT,
      "Color",
      this.settings.camLightColor.getHex(),
      () => {
        const color = this.readColorPickerControl(CAM_LIGHT_COLOR_PICKER_CNT);
        this.settings.camLightColor.setHex(color);
      }
    );
    const CAM_LIGHT_INTENSITY_CNT = "CamLightRange_Control";
    const CamLightIntensity_Controls = this.buildRangeControl(
      CAM_LIGHT_INTENSITY_CNT,
      "Intensity",
      this.settings.camLightIntensity,
      this.settings.camLightIntensityMMS,
      () => {
        const value = this.readRangeControl(CAM_LIGHT_INTENSITY_CNT);
        this.settings.camLightIntensity = value;
      }
    );
    const CAM_LIGHT_FIELDSET_CNT = "CamLightFieldset_Control";
    const camLightFieldset_Control = this.buildFieldSetControl(
      CAM_LIGHT_FIELDSET_CNT,
      "Cam light settings",
      [
        CamLightEnable_Control,
        CamLightColorPicker_Control,
        CamLightIntensity_Controls
      ]
    );
    return camLightFieldset_Control;
  }
}
