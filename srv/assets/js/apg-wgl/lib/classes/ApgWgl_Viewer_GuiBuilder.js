import {
  ApgGui_Builder
} from "../../../apg-gui/mod.ts";
import {
  ApgWgl_Layers
} from "./ApgWgl_Viewer.ts";
import {
  ApgWgl_eEnvMapMode
} from "../enums/ApgWgl_eEnvMapMode.ts";
export class ApgWgl_Viewer_GuiBuilder extends ApgGui_Builder {
  settings;
  viewer;
  VIEWER_SETTINGS_DIALOG_CNT = "ApgWgl_ViewerSettings_DialogControl";
  constructor(agui, aname, aviewer) {
    super(agui, aname);
    this.viewer = aviewer;
    this.settings = aviewer.settings;
    this.settings.worldSizeMMS = { min: 500, max: 2e3, step: 500 };
    this.settings.pixelRatioMMS = {
      min: this.viewer.APG_WGL_MAX_PIXEL_RATIO / 10,
      max: this.viewer.APG_WGL_MAX_PIXEL_RATIO,
      step: this.viewer.APG_WGL_MAX_PIXEL_RATIO / 10
    };
    this.settings.fogDensityMMS = { min: 1e-4, max: 2e-3, step: 5e-5 };
    this.settings.toneMappingValues = /* @__PURE__ */ new Map([
      ["0", "None"],
      ["1", "Linear"],
      ["2", "Reinhard"],
      ["3", "Cineon"],
      ["5", "ACESFilmic"]
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
    this.settings.perspCameraFovMMS = { min: 25, max: 100, step: 5 };
    this.settings.perspCameraNearMMS = { min: 0.1, max: 1, step: 0.1 };
    this.settings.perspCameraFarMMS = { min: 10, max: 200, step: 5 };
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
    this.#getLayers();
  }
  #getLayers() {
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
    const controls = [];
    const FOG_COLOR_PICKER_CNT = "ApgWgl_FogColor_ColorPickerControl";
    controls.push(this.buildColorPickerControl(
      FOG_COLOR_PICKER_CNT,
      "Color",
      this.settings.fogColor.getHex(),
      () => {
        const color = this.readColorPickerControl(FOG_COLOR_PICKER_CNT);
        this.settings.fogColor.setHex(color);
      }
    ));
    const FOG_DENSITY_CNT = "ApgWgl_FogDensity_RangeControl";
    controls.push(this.buildRangeControl(
      FOG_DENSITY_CNT,
      "Density",
      this.settings.fogDensity,
      this.settings.fogDensityMMS,
      () => {
        const densityValue = this.readRangeControl(FOG_DENSITY_CNT);
        this.settings.fogDensity = densityValue;
      }
    ));
    const FOG_DETAILS_CNT = "ApgWgl_Fog_DetailsControl";
    const r = this.buildDetailsControl(
      FOG_DETAILS_CNT,
      "Fog",
      controls
    );
    return r;
  }
  #buildCameraDetails() {
    const controls = [];
    const CAMERA_ZOOM_CNT = "ApgWgl_CameraZoom_RangeControl";
    controls.push(this.buildRangeControl(
      CAMERA_ZOOM_CNT,
      "Zoom",
      this.settings.perspCameraZoom,
      this.settings.perspCameraZoomMMS,
      () => {
        const value = this.readRangeControl(CAMERA_ZOOM_CNT);
        this.settings.perspCameraZoom = value;
      }
    ));
    const CAMERA_FOV_CNT = "ApgWgl_CameraFov_RangeControl";
    controls.push(this.buildRangeControl(
      CAMERA_FOV_CNT,
      "Field of view",
      this.settings.perspCameraFov,
      this.settings.perspCameraFovMMS,
      () => {
        const value = this.readRangeControl(CAMERA_FOV_CNT);
        this.settings.perspCameraZoom = value;
      }
    ));
    const CAMERA_NEAR_CNT = "ApgWgl_CameraNear_RangeControl";
    controls.push(this.buildRangeControl(
      CAMERA_NEAR_CNT,
      "Near plane",
      this.settings.perspCameraNear,
      this.settings.perspCameraNearMMS,
      () => {
        const value = this.readRangeControl(CAMERA_NEAR_CNT);
        this.settings.perspCameraNear = value;
      }
    ));
    const CAMERA_FAR_CNT = "ApgWgl_CameraFar_RangeControl";
    controls.push(this.buildRangeControl(
      CAMERA_FAR_CNT,
      "Far plane",
      this.settings.perspCameraFar,
      this.settings.perspCameraFarMMS,
      () => {
        const value = this.readRangeControl(CAMERA_FAR_CNT);
        this.settings.perspCameraFar = value;
      }
    ));
    const CAMERA_DETAILS_CNT = "ApgWgl_Camera_DetailsControl";
    const r = this.buildDetailsControl(
      CAMERA_DETAILS_CNT,
      "Camera",
      controls
    );
    return r;
  }
  #buildLayersDetails() {
    const controls = [];
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
      controls.push(LayerCheckBox_Control);
    }
    const LAYERS_DETAILS_CNT = "ApgWgl_Layers_DetailsControl";
    const r = this.buildDetailsControl(
      LAYERS_DETAILS_CNT,
      "Layers",
      controls
    );
    return r;
  }
  #buildInfoDetails() {
    const controls = [];
    const info = this.viewer.getInfo();
    const INFO_PAR_CNT = "InfoParagraph_Control";
    controls.push(this.buildParagraphControl(
      INFO_PAR_CNT,
      info.join("\n")
    ));
    const ID = "ApgWgl_Info_DetailsControl";
    const r = this.buildDetailsControl(
      ID,
      "Info",
      controls,
      false,
      () => {
        const details = this.gui.document.getElementById(ID);
        if (details.open) {
          const paragraph = this.gui.document.getElementById(INFO_PAR_CNT);
          const info2 = this.viewer.getInfo();
          paragraph.innerText = info2.join("\n");
        }
      }
    );
    return r;
  }
  //--------------------------------------------------------------------------
  // #region Lights controls
  #buildLightsDetails() {
    const controls = [];
    controls.push(this.#buildAmbientLightFieldSet());
    controls.push(this.#buildSunLightFieldSet());
    controls.push(this.#buildCamLightFieldSet());
    const ID = "ApgWgl_Lights_DetailsControl";
    const r = this.buildDetailsControl(
      ID,
      "Lights",
      controls
    );
    return r;
  }
  #buildAmbientLightFieldSet() {
    const controls = [];
    const AMB_LIGHT_ENABLE_CNT = "ApgWgl_AmbLightEnable_CheckBoxControl";
    controls.push(this.buildCheckBoxControl(
      AMB_LIGHT_ENABLE_CNT,
      "Ambient light enable",
      this.settings.ambLightEnabled,
      () => {
        const checked = this.readCheckBoxControl(AMB_LIGHT_ENABLE_CNT);
        this.settings.ambLightEnabled = checked;
      }
    ));
    const AMB_LIGHT_COLOR_PICKER_CNT = "ApgWgl_AmbLightColor_ColorPickerControl";
    controls.push(this.buildColorPickerControl(
      AMB_LIGHT_COLOR_PICKER_CNT,
      "Ambient light Color",
      this.settings.ambLightColor.getHex(),
      () => {
        const color = this.readColorPickerControl(AMB_LIGHT_COLOR_PICKER_CNT);
        this.settings.ambLightColor.setHex(color);
      }
    ));
    const AMB_LIGHT_INTENSITY_CNT = "ApgWgl_AmbLightIntensity_RangeControl";
    controls.push(this.buildRangeControl(
      AMB_LIGHT_INTENSITY_CNT,
      "Ambient light intensity",
      this.settings.ambLightIntensity,
      this.settings.ambLightIntensityMMS,
      () => {
        const value = this.readRangeControl(AMB_LIGHT_INTENSITY_CNT);
        this.settings.ambLightIntensity = value;
      }
    ));
    const ID = "ApgWgl_AmbLight_FieldsetControl";
    const r = this.buildFieldSetControl(
      ID,
      "Ambient light settings",
      controls
    );
    return r;
  }
  #buildSunLightFieldSet() {
    const controls = [];
    const SUN_LIGHT_ENABLE_CNT = "ApgWgl_SunLightEnable_CheckBoxControl";
    controls.push(this.buildCheckBoxControl(
      SUN_LIGHT_ENABLE_CNT,
      "Enable",
      this.settings.sunLightEnabled,
      () => {
        const checked = this.readCheckBoxControl(SUN_LIGHT_ENABLE_CNT);
        this.settings.sunLightEnabled = checked;
      }
    ));
    const SUN_LIGHT_COLOR_PICKER_CNT = "ApgWgl_SunLightColor_ColorPickerControl";
    controls.push(this.buildColorPickerControl(
      SUN_LIGHT_COLOR_PICKER_CNT,
      "Color",
      this.settings.sunLightColor.getHex(),
      () => {
        const color = this.readColorPickerControl(SUN_LIGHT_COLOR_PICKER_CNT);
        this.settings.sunLightColor.setHex(color);
      }
    ));
    const SUN_LIGHT_INTENSITY_CNT = "ApgWgl_SunLightIntensity_RangeControl";
    controls.push(this.buildRangeControl(
      SUN_LIGHT_INTENSITY_CNT,
      "Intensity",
      this.settings.sunLightIntensity,
      this.settings.sunLightIntensityMMS,
      () => {
        const value = this.readRangeControl(SUN_LIGHT_INTENSITY_CNT);
        this.settings.sunLightIntensity = value;
      }
    ));
    const ID = "ApgWgl_SunLight_FieldsetControl";
    const r = this.buildFieldSetControl(
      ID,
      "Sun light settings",
      controls
    );
    return r;
  }
  #buildCamLightFieldSet() {
    const controls = [];
    const CAM_LIGHT_ENABLE_CNT = "ApgWgl_CamLightEnable_CheckBoxControl";
    controls.push(this.buildCheckBoxControl(
      CAM_LIGHT_ENABLE_CNT,
      "Enable",
      this.settings.camLightEnabled,
      () => {
        const checked = this.readCheckBoxControl(CAM_LIGHT_ENABLE_CNT);
        this.settings.camLightEnabled = checked;
      }
    ));
    const CAM_LIGHT_COLOR_PICKER_CNT = "ApgWgl_CamLightColor_ColorPickerControl";
    controls.push(this.buildColorPickerControl(
      CAM_LIGHT_COLOR_PICKER_CNT,
      "Color",
      this.settings.camLightColor.getHex(),
      () => {
        const color = this.readColorPickerControl(CAM_LIGHT_COLOR_PICKER_CNT);
        this.settings.camLightColor.setHex(color);
      }
    ));
    const CAM_LIGHT_INTENSITY_CNT = "ApgWgl_CamLightIntensity_RangeControl";
    controls.push(this.buildRangeControl(
      CAM_LIGHT_INTENSITY_CNT,
      "Intensity",
      this.settings.camLightIntensity,
      this.settings.camLightIntensityMMS,
      () => {
        const value = this.readRangeControl(CAM_LIGHT_INTENSITY_CNT);
        this.settings.camLightIntensity = value;
      }
    ));
    const ID = "ApgWgl_CamLight_FieldsetControl";
    const r = this.buildFieldSetControl(
      ID,
      "Cam light settings",
      controls
    );
    return r;
  }
  // #endregion
  //--------------------------------------------------------------------------
}
