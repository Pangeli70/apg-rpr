import {
  THREE,
  THREE_EXRLoader,
  THREE_OrbitControls,
  THREE_RGBELoader
} from "./ApgWgl_Deps.ts";
export var ApgWgl_eEnvMapMode = /* @__PURE__ */ ((ApgWgl_eEnvMapMode2) => {
  ApgWgl_eEnvMapMode2["NONE"] = "none";
  ApgWgl_eEnvMapMode2["HDR"] = "hdr";
  ApgWgl_eEnvMapMode2["EXR"] = "exr";
  ApgWgl_eEnvMapMode2["LDR"] = "ldr";
  return ApgWgl_eEnvMapMode2;
})(ApgWgl_eEnvMapMode || {});
export var ApgWgl_eLayers = /* @__PURE__ */ ((ApgWgl_eLayers2) => {
  ApgWgl_eLayers2[ApgWgl_eLayers2["unassigned"] = 0] = "unassigned";
  ApgWgl_eLayers2[ApgWgl_eLayers2["helpers"] = 1] = "helpers";
  ApgWgl_eLayers2[ApgWgl_eLayers2["lights"] = 2] = "lights";
  ApgWgl_eLayers2[ApgWgl_eLayers2["characters"] = 3] = "characters";
  ApgWgl_eLayers2[ApgWgl_eLayers2["colliders"] = 4] = "colliders";
  ApgWgl_eLayers2[ApgWgl_eLayers2["instancedColliders"] = 5] = "instancedColliders";
  return ApgWgl_eLayers2;
})(ApgWgl_eLayers || {});
export class ApgWgl_Viewer {
  /** We don't like global objects */
  window;
  /** We don't like global objects */
  document;
  EYE_HEIGHT = 1.65;
  WORLD_SIZE = 1e3;
  // 5 km radious!! 
  APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY = "APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY";
  DEFAULT_SETTINGS = {
    worldSize: this.WORLD_SIZE,
    fogColor: new THREE.Color(8947848),
    fogDensity: 25e-5,
    toneMapping: THREE.LinearToneMapping,
    toneMappingExposure: 1,
    outputColorSpace: THREE.SRGBColorSpace,
    areShadowsEnabled: false,
    // shadowMapType: THREE.PCFSoftShadowMap,
    shadowMapType: THREE.BasicShadowMap,
    shadowMapRadious: 4,
    shadowMapSize: 1024 * 4,
    anisotropy: 4,
    clearColor: new THREE.Color(2697513),
    perspCameraFov: 45,
    perspCameraNear: 0.1,
    // 100mm
    perspCameraFar: this.WORLD_SIZE / 2,
    perspCameraPosition: new THREE.Vector3(0, this.EYE_HEIGHT, 5),
    ambLightEnabled: true,
    ambLightIntensity: 0.2,
    ambLightColor: new THREE.Color(16777215),
    sunLightEnabled: true,
    sunLightIntensity: 0.5,
    sunLightColor: new THREE.Color(16777130),
    sunLightPosition: new THREE.Vector3(this.WORLD_SIZE / 4, this.WORLD_SIZE / 2.5, this.WORLD_SIZE / 4),
    sunLightShadowMapCameraSize: this.WORLD_SIZE / 40,
    sunLightShadowMapCameraNear: this.WORLD_SIZE / 3.5,
    sunLightShadowMapCameraFar: this.WORLD_SIZE / 1.5,
    camLightEnabled: false,
    camLightIntensity: 0.5,
    camLightColor: new THREE.Color(11206655),
    camLightPosition: new THREE.Vector3(0, 0, 0),
    camLightDistance: this.WORLD_SIZE / 10,
    camLightIsDetachedFromCamera: false,
    envMapLighting: false,
    envMapMode: "exr" /* EXR */,
    envMaps: ["a.jpg", "a.hdr", "a.exr"],
    envMapLightingIntensity: 1,
    envMapBackgroundBlurryness: 0,
    envMapBackgroundIntensity: 1,
    orbControlsTarget: new THREE.Vector3(0, 0, 0),
    orbControlsMinDistance: 0.1,
    orbControlsMaxDistance: this.WORLD_SIZE / 2,
    orbControlsMinPolarAngle: 0,
    orbControlsMaxPolarAngle: Math.PI,
    orbControlsEnableDamping: true,
    orbControlsDampingFactor: 0.2,
    layers: /* @__PURE__ */ new Map()
  };
  settings;
  prevSettingsStamp;
  /** Dom Elements*/
  viewerElement;
  viewerCanvasElement;
  // Keep track of the render calls to THREE.Render
  static renderCalls = 0;
  /** THREE stuff */
  renderer;
  scene;
  camera;
  orbitControls;
  ambLight;
  sunLight;
  camLight;
  raycaster;
  /** Texture management */
  textureLoader = null;
  textureMaps = [];
  bumpMaps = [];
  normalMaps = [];
  ldrMaps = [];
  hdrLoader = null;
  exrLoader = null;
  constructor(awindow, adocument, aviewerElement) {
    this.window = awindow;
    this.document = adocument;
    this.viewerElement = aviewerElement;
    this.settings = { ...this.DEFAULT_SETTINGS };
    this.prevSettingsStamp = JSON.stringify(this.settings);
    this.#initCanvas();
    this.#initRenderer();
    this.#initCamera();
    this.#initScene();
    this.#initLights();
    this.#initOrbitControls();
    this.#initTextureLoaders();
    this.updateEnvMap();
    this.updateLayers();
    this.raycaster = new THREE.Raycaster();
    this.window.addEventListener("resize", () => {
      this.resize();
    }, false);
  }
  #initCanvas() {
    this.viewerCanvasElement = this.document.createElement("canvas");
    this.viewerCanvasElement.id = "ApgWglViewerCanvas";
    this.viewerElement.appendChild(this.viewerCanvasElement);
  }
  #initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.viewerCanvasElement });
    this.renderer.setSize(this.viewerElement.clientWidth, this.viewerElement.clientHeight);
    this.renderer.setPixelRatio(this.window.devicePixelRatio);
    this.updateRenderer();
  }
  updateRenderer() {
    this.renderer.setClearColor(this.settings.clearColor, 1);
    this.renderer.toneMapping = this.settings.toneMapping;
    this.renderer.toneMappingExposure = this.settings.toneMappingExposure;
    this.renderer.outputColorSpace = this.settings.outputColorSpace;
    this.renderer.shadowMap.enabled = this.settings.areShadowsEnabled;
    this.renderer.shadowMap.type = this.settings.shadowMapType;
    const deviceMaxAnysotropy = this.renderer.capabilities.getMaxAnisotropy();
  }
  #initCamera() {
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(
      this.settings.perspCameraPosition.x,
      this.settings.perspCameraPosition.y,
      this.settings.perspCameraPosition.z
    );
    this.camera.layers.enableAll();
    this.updateCamera();
  }
  updateCamera() {
    this.camera.fov = this.settings.perspCameraFov;
    const aspectRatio = this.viewerElement.clientWidth / this.viewerElement.clientHeight;
    this.camera.aspect = aspectRatio;
    this.camera.near = this.settings.perspCameraNear;
    this.camera.far = this.settings.perspCameraFar;
    this.camera.updateProjectionMatrix();
  }
  #initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(
      this.settings.fogColor,
      this.settings.fogDensity * this.WORLD_SIZE / 100
    );
  }
  updateFog() {
    this.scene.fog = new THREE.FogExp2(
      this.settings.fogColor,
      this.settings.fogDensity * this.WORLD_SIZE / 100
    );
  }
  #initLights() {
    this.ambLight = new THREE.AmbientLight();
    this.ambLight.layers.set(2 /* lights */);
    this.updateAmbLight();
    this.scene.add(this.ambLight);
    this.sunLight = new THREE.DirectionalLight();
    this.sunLight.layers.set(2 /* lights */);
    this.updateSunLight();
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);
    const sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 100, 16711680);
    sunLightHelper.layers.set(1 /* helpers */);
    this.scene.add(sunLightHelper);
    const sunLightShadowCameraHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
    sunLightShadowCameraHelper.layers.set(1 /* helpers */);
    this.scene.add(sunLightShadowCameraHelper);
    this.camLight = new THREE.PointLight();
    this.updateCamLight();
    this.camLight.layers.set(2 /* lights */);
    this.scene.add(this.camLight);
    const camLightHelper = new THREE.PointLightHelper(this.camLight, 1, 255);
    camLightHelper.layers.set(1 /* helpers */);
    this.scene.add(camLightHelper);
  }
  updateAmbLight() {
    this.ambLight.color = this.settings.ambLightColor;
    this.ambLight.intensity = this.settings.ambLightIntensity;
    this.ambLight.visible = !this.settings.envMapLighting && this.settings.ambLightEnabled;
  }
  updateSunLight() {
    this.sunLight.color = this.settings.sunLightColor;
    this.sunLight.intensity = this.settings.sunLightIntensity;
    this.sunLight.visible = !this.settings.envMapLighting && this.settings.sunLightEnabled;
    this.sunLight.position.set(
      this.settings.sunLightPosition.x,
      this.settings.sunLightPosition.y,
      this.settings.sunLightPosition.z
    );
    this.sunLight.shadow.radius = this.settings.shadowMapRadious;
    this.sunLight.shadow.mapSize.width = this.settings.shadowMapSize;
    this.sunLight.shadow.mapSize.height = this.settings.shadowMapSize;
    this.sunLight.shadow.bias = -1e-4;
    this.sunLight.shadow.camera.top = this.settings.sunLightShadowMapCameraSize;
    this.sunLight.shadow.camera.right = this.settings.sunLightShadowMapCameraSize;
    this.sunLight.shadow.camera.bottom = -this.settings.sunLightShadowMapCameraSize;
    this.sunLight.shadow.camera.left = -this.settings.sunLightShadowMapCameraSize;
    this.sunLight.shadow.camera.near = this.settings.sunLightShadowMapCameraNear;
    this.sunLight.shadow.camera.far = this.settings.sunLightShadowMapCameraFar;
  }
  updateCamLight() {
    this.camLight.color = this.settings.camLightColor;
    this.camLight.intensity = this.settings.camLightIntensity;
    this.camLight.visible = !this.settings.envMapLighting && this.settings.camLightEnabled;
    this.camLight.distance = this.settings.camLightDistance;
    this.camLight.position.set(
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z
    );
  }
  #initOrbitControls() {
    this.orbitControls = new THREE_OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.minDistance = this.settings.orbControlsMinDistance;
    this.orbitControls.maxDistance = this.settings.orbControlsMaxDistance;
    this.orbitControls.target.set(
      this.settings.orbControlsTarget.x,
      this.settings.orbControlsTarget.y,
      this.settings.orbControlsTarget.z
    );
    this.orbitControls.minPolarAngle = this.settings.orbControlsMinPolarAngle;
    this.orbitControls.maxPolarAngle = this.settings.orbControlsMaxPolarAngle;
    this.orbitControls.enableDamping = this.settings.orbControlsEnableDamping;
    this.orbitControls.dampingFactor = this.settings.orbControlsDampingFactor;
    this.orbitControls.update();
  }
  #initTextureLoaders() {
    if (this.textureLoader == null) {
      this.textureLoader = new THREE.TextureLoader();
      this.textureLoader.crossOrigin = "";
      this.textureLoader.setCrossOrigin("anonymous");
    }
    if (this.hdrLoader == null) {
      this.hdrLoader = new THREE_RGBELoader();
      this.hdrLoader.crossOrigin = "";
      this.hdrLoader.setCrossOrigin("anonymous");
    }
    if (this.exrLoader == null) {
      this.exrLoader = new THREE_EXRLoader();
      this.exrLoader.crossOrigin = "";
      this.hdrLoader.setCrossOrigin("anonymous");
    }
  }
  #_loadHdrAsync(aloader, aurl) {
    const p = new Promise((resolve, reject) => {
      aloader.load(
        aurl,
        (hdrEnvironmentMap) => {
          resolve(hdrEnvironmentMap);
        }
      ), void 0, (reason) => {
        reject(reason);
      };
    });
    return p;
  }
  #_loadExrAsync(aloader, aurl) {
    const p = new Promise((resolve, reject) => {
      aloader.load(
        aurl,
        (exrEnvironmentMap) => {
          resolve(exrEnvironmentMap);
        }
      ), void 0, (reason) => {
        reject(reason);
      };
    });
    return p;
  }
  async updateEnvMap() {
    let envMap = null;
    switch (this.settings.envMapMode) {
      case "ldr" /* LDR */: {
        if (this.textureLoader) {
          const url = "/assets/env/ldr/Psychedelic_1.jpg";
          envMap = this.textureLoader.load(url);
        }
        break;
      }
      case "hdr" /* HDR */: {
        if (this.hdrLoader) {
          const url = "/assets/env/hdr/Residential_garden_2k.hdr";
          envMap = await this.#_loadHdrAsync(this.hdrLoader, url);
        }
        break;
      }
      case "exr" /* EXR */: {
        if (this.exrLoader) {
          const url = "/assets/env/exr/Neon_photostudio_1k.exr";
          envMap = await this.#_loadExrAsync(this.exrLoader, url);
        }
        break;
      }
      default: {
        this.scene.background = null;
        this.scene.environment = null;
        break;
      }
    }
    if (envMap != null) {
      envMap.colorSpace = this.settings.outputColorSpace;
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = envMap;
      if (this.settings.envMapLighting) {
        this.scene.environment = envMap;
      }
      this.scene.backgroundBlurriness = this.settings.envMapBackgroundBlurryness;
      this.scene.backgroundIntensity = this.settings.envMapBackgroundIntensity;
      this.#updateAllEnvMapSensitiveMaterialsInTheScene();
    }
  }
  #updateAllEnvMapSensitiveMaterialsInTheScene() {
    this.scene.traverse((object) => {
      const mesh = object;
      if (mesh.isMesh) {
        const mat = mesh.material;
        if (mat.isMeshStandardMaterial) {
          mat.envMapIntensity = this.settings.envMapLightingIntensity;
        }
      }
    });
  }
  updateLayers() {
    for (const [index, layerDescr] of this.settings.layers) {
      if (layerDescr.visible) {
        this.camera.layers.enable(index);
      } else {
        this.camera.layers.disable(index);
      }
    }
  }
  updateSettings() {
    const strSettingsStamp = JSON.stringify(this.settings);
    if (this.prevSettingsStamp != strSettingsStamp) {
      this.updateRenderer();
      this.updateFog();
      this.updateCamera();
      this.updateAmbLight();
      this.updateSunLight();
      this.updateCamLight();
      this.updateEnvMap();
      this.updateLayers();
      this.prevSettingsStamp = JSON.stringify(this.settings);
    }
  }
  /**
   * Callback when the window is resized
   */
  resize() {
    if (this.camera) {
      const viewerHeight = `${this.window.innerHeight * 0.95}px`;
      this.viewerElement.style.height = viewerHeight;
      this.camera.aspect = this.viewerElement.clientWidth / this.viewerElement.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.viewerElement.clientWidth, this.viewerElement.clientHeight);
    }
  }
  /**
   * Move the camera associated with the orbit control
   * @param anewPosition 
   */
  setOrbControlsParams(anewPosition) {
    this.camera.position.set(
      anewPosition.eye.x,
      anewPosition.eye.y,
      anewPosition.eye.z
    );
    this.orbitControls.target.set(
      anewPosition.target.x,
      anewPosition.target.y,
      anewPosition.target.z
    );
    this.orbitControls.update();
  }
  castRayAtMousePosition(apos) {
    this.raycaster.setFromCamera(apos, this.camera);
    return this.raycaster.ray;
  }
  /**
   * Collects data on the current viewer settings
   * @returns Array of strings 
   */
  getInfo() {
    const r = [];
    const tp = this.orbitControls.target;
    const cp = this.camera.position;
    r.push(`Apg Wgl Viewer`);
    r.push(``);
    r.push(`Orbit Controls:`);
    r.push(` - Target pos.: (${tp.x.toFixed(1)}, ${tp.y.toFixed(1)}, ${tp.z.toFixed(1)})`);
    r.push(` - Camera pos.: (${cp.x.toFixed(1)}, ${cp.y.toFixed(1)}, ${cp.z.toFixed(1)})`);
    r.push(` - Min.dist.: ${this.orbitControls.minDistance.toFixed(1)}`);
    r.push(` - Max.dist.: ${this.orbitControls.minDistance.toFixed(1)}`);
    r.push(`Camera:`);
    r.push(` - FOV: ${this.camera.fov.toFixed(1)}`);
    r.push(` - Near: ${this.camera.near.toFixed(1)}`);
    r.push(` - Far: ${this.camera.far.toFixed(1)}`);
    const fog = this.scene.fog;
    r.push(`Fog:`);
    r.push(` - Color: ${fog.color.getHexString()}`);
    r.push(` - Density: ${fog.density.toFixed(1)}`);
    r.push("Lights:");
    r.push(` - Ambient is: ${this.ambLight.visible ? "Enabled" : "Disabled"}`);
    r.push(` - Ambient color: ${this.ambLight.color.getHexString()}`);
    r.push(` - Sun is: ${this.sunLight.visible ? "Enabled" : "Disabled"}`);
    r.push(` - Sun color: ${this.sunLight.color.getHexString()}`);
    r.push(` - Camera is: ${this.camLight.visible ? "Enabled" : "Disabled"}`);
    r.push(` - Camera color: ${this.camLight.color.getHexString()}`);
    const vp = this.renderer.getViewport(new THREE.Vector4());
    r.push("Renderer:");
    const cc = new THREE.Color();
    r.push(` - Clear color: ${this.renderer.getClearColor(cc).getHexString()}`);
    r.push(` - Shadows are: ${this.renderer.shadowMap.enabled ? "Enabled" : "Disabled"}`);
    r.push(` - Dimensions are: ${vp.width.toFixed(1)} x ${vp.height.toFixed(1)}`);
    r.push(` - Pixel ratio is: ${this.renderer.getPixelRatio().toFixed(3)}`);
    return r;
  }
  render() {
    this.updateSettings();
    this.renderer.render(this.scene, this.camera);
  }
}
