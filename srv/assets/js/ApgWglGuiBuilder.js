import { ApgGui_Builder } from "./ApgGui_Builder.ts";
export class ApgWgl_GuiBuilder extends ApgGui_Builder {
  settings;
  VIEWER_SETTINGS_DIALOG_CNT = "ViewerSettingsDialogControl";
  constructor(agui, aname, asettings) {
    super(agui, aname);
    this.settings = {
      ...asettings,
      worldSizeMMS: { min: 500, max: 2e3, step: 500 },
      toneMappingValues: /* @__PURE__ */ new Map([
        ["0", "NoToneMapping"],
        ["1", "LinearToneMapping"],
        ["2", "ReinhardToneMapping"],
        ["3", "CineonToneMapping"],
        ["5", "ACESFilmicToneMapping"],
        ["6", "CustomToneMapping"]
      ]),
      outputColorSpaceValues: /* @__PURE__ */ new Map([
        ["", "NoColorSpace"],
        ["srgb", "SRGBColorSpace"],
        ["srgb-linear", "LinearSRGBColorSpace"],
        ["display-p3", "DisplayP3ColorSpace"]
      ]),
      shadowMapTypeValues: /* @__PURE__ */ new Map([
        ["0", "BasicShadowMap "],
        ["1", "PCFShadowMap"],
        ["2", "PCFSoftShadowMap"],
        ["3", "VSMShadowMap"]
      ]),
      ambLightIntensityMMS: {
        min: 0,
        max: 1,
        step: 0.1
      },
      sunLightIntensityMMS: {
        min: 0,
        max: 1,
        step: 0.1
      },
      camLightIntensityMMS: {
        min: 0,
        max: 1,
        step: 0.1
      }
    };
  }
  /**
   * 
   * @returns 
   */
  buildHtml() {
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
    const fogFieldset_Control = this.#buildFogFieldset();
    const ambLightFieldset_Control = this.#buildAmbienLightFieldSet();
    const sunLightFieldset_Control = this.#buildSunLightFieldSet();
    const camLightFieldset_Control = this.#buildCamLightFieldSet();
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
        fogFieldset_Control,
        ambLightFieldset_Control,
        sunLightFieldset_Control,
        camLightFieldset_Control,
        CloseButton_Control
      ]
    );
    return r;
  }
  getPropertyName(obj, selector) {
    const keyRecord = Object.keys(obj).reduce((res, key) => {
      const typedKey = key;
      res[typedKey] = typedKey;
      return res;
    }, {});
    return selector(keyRecord);
  }
  #buildFogFieldset() {
    const FOG_COLOR_PICKER_CNT = "FogColorPicker_Control";
    const FogColorPicker_Control = this.buildColorPickerControl(
      FOG_COLOR_PICKER_CNT,
      "Fog Color",
      this.settings.fogColor.getHex(),
      () => {
        const color = this.readColorPickerControl(FOG_COLOR_PICKER_CNT);
        this.settings.fogColor.setHex(color);
      }
    );
    const FOG_FIELDSET_CNT = "FogFieldset_Control";
    const fogFieldset_Control = this.buildFieldSetControl(
      FOG_FIELDSET_CNT,
      "Fog settings",
      [FogColorPicker_Control]
    );
    return fogFieldset_Control;
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
      this.settings.ambLightIntensityMMS.min,
      this.settings.ambLightIntensityMMS.max,
      this.settings.ambLightIntensityMMS.step,
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
      this.settings.sunLightIntensityMMS.min,
      this.settings.sunLightIntensityMMS.max,
      this.settings.sunLightIntensityMMS.step,
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
    const CAM_LIGHT_COLOR_PICKER_CNT = "CamLightColorPicker_Control";
    const CamLightColorPicker_Control = this.buildColorPickerControl(
      CAM_LIGHT_COLOR_PICKER_CNT,
      "Cam light Color",
      this.settings.camLightColor.getHex(),
      () => {
        const color = this.readColorPickerControl(CAM_LIGHT_COLOR_PICKER_CNT);
        this.settings.camLightColor.setHex(color);
      }
    );
    const CAM_LIGHT_FIELDSET_CNT = "CamLightFieldset_Control";
    const camLightFieldset_Control = this.buildFieldSetControl(
      CAM_LIGHT_FIELDSET_CNT,
      "Cam light settings",
      [CamLightColorPicker_Control]
    );
    return camLightFieldset_Control;
  }
}