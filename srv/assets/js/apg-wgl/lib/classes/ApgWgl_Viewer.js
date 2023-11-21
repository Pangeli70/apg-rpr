import {
  THREE,
  THREE_EXRLoader,
  THREE_OrbitControls,
  THREE_RGBELoader
} from "../../deps.ts";
import {
  ApgWgl_eEnvMapMode
} from "../enums/ApgWgl_eEnvMapMode.ts";
export class ApgWgl_Layers {
  static unassigned = 0;
  static helpers = 1;
  static lights = 2;
}
export class ApgWgl_Viewer {
  /** We don't like global objects */
  window;
  /** We don't like global objects */
  document;
  /** Logger */
  logger;
  /** Settings that can update THREE objects using a GUI */
  settings;
  prevSettingsStamp;
  /** Metrics of the visualizable and interactable space */
  metrics;
  static APG_WGL_DEFAULT_SCENE_SIZE = 10;
  static APG_WGL_DEFAULT_EYE_HEIGHT = 1.65;
  get defaultEyeHeight() {
    return ApgWgl_Viewer.APG_WGL_DEFAULT_EYE_HEIGHT;
  }
  static APG_WGL_DEFAULT_WORLD_FACTOR = 10;
  APG_WGL_MAX_PIXEL_RATIO;
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
  /** Env map management */
  hdrLoader = null;
  exrLoader = null;
  /** Logger name */
  static WGL_VIEWER_LOGGER_NAME = "Web GL Viewer";
  /** To store settings in local storage */
  APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY = "APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY";
  constructor(awindow, adocument, aviewerElement, alogger, asceneSize = ApgWgl_Viewer.APG_WGL_DEFAULT_SCENE_SIZE, aworldFactor = ApgWgl_Viewer.APG_WGL_DEFAULT_WORLD_FACTOR, aeyeHeight = ApgWgl_Viewer.APG_WGL_DEFAULT_EYE_HEIGHT) {
    this.window = awindow;
    this.document = adocument;
    this.viewerElement = aviewerElement;
    this.logger = alogger;
    this.logger.addLogger(ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
    this.APG_WGL_MAX_PIXEL_RATIO = this.window.devicePixelRatio;
    this.metrics = this.#initMetrics(asceneSize, aworldFactor, aeyeHeight);
    this.settings = this.defaultSettings(this.window, this.metrics);
    this.prevSettingsStamp = JSON.stringify(this.settings);
    this.#initCanvas();
    this.#initRenderer();
    this.#initCamera();
    this.#initScene();
    this.#initGrids();
    this.#initLights();
    this.#initOrbitControls();
    this.#initTextureLoaders();
    this.#updateEnvMap();
    this.#updateLayers();
    this.raycaster = new THREE.Raycaster();
    this.window.addEventListener("resize", () => {
      this.resize();
    }, false);
    this.logger.devLog("Constructor has built", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  defaultSettings(awindow, ametrics) {
    const r = {
      worldSize: ametrics.worldSize,
      eyeHeight: ametrics.eyeHeight,
      pixelRatio: awindow.devicePixelRatio,
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
      perspCameraZoom: 1,
      perspCameraFov: 45,
      perspCameraNear: 0.1,
      // 100mm
      perspCameraFar: ametrics.worldSize / 2,
      perspCameraPosition: new THREE.Vector3(ametrics.sceneSize, ametrics.eyeHeight, ametrics.sceneSize),
      ambLightEnabled: true,
      ambLightIntensity: 0.2,
      ambLightColor: new THREE.Color(16777215),
      sunLightEnabled: true,
      sunLightIntensity: 0.5,
      sunLightColor: new THREE.Color(16777130),
      sunLightPosition: new THREE.Vector3(ametrics.worldSize / 4, ametrics.worldSize / 2.5, ametrics.worldSize / 4),
      sunLightShadowMapCameraSize: ametrics.worldSize / 40,
      sunLightShadowMapCameraNear: ametrics.worldSize / 3.5,
      sunLightShadowMapCameraFar: ametrics.worldSize / 1.5,
      camLightEnabled: false,
      camLightIntensity: 0.5,
      camLightColor: new THREE.Color(11206655),
      camLightPosition: new THREE.Vector3(0, 0, 0),
      camLightDistance: ametrics.worldSize / 10,
      camLightIsDetachedFromCamera: false,
      envMapLighting: false,
      envMapMode: ApgWgl_eEnvMapMode.EXR,
      envMaps: [],
      envMapLightingIntensity: 1,
      envMapBackgroundBlurryness: 0,
      envMapBackgroundIntensity: 1,
      orbControlsTarget: new THREE.Vector3(0, 1, 0),
      orbControlsMinDistance: 0.1,
      orbControlsMaxDistance: ametrics.worldSize / 2,
      orbControlsMinPolarAngle: 0,
      orbControlsMaxPolarAngle: Math.PI,
      orbControlsEnableDamping: true,
      orbControlsDampingFactor: 0.2,
      layers: {}
    };
    return r;
  }
  #initMetrics(asceneSize, aworldFactor, aeyeHeight) {
    const worldSize = asceneSize * aworldFactor;
    const r = {
      sceneSize: asceneSize,
      worldSize,
      sightSize: worldSize + asceneSize,
      universeSize: 2 * worldSize + asceneSize,
      eyeHeight: aeyeHeight
    };
    this.logger.devLog(` - Scene size: ${r.sceneSize}`, ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
    this.logger.devLog(` - World size: ${r.worldSize}`, ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
    this.logger.devLog(` - Sight size: ${r.sightSize}`, ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
    this.logger.devLog(` - Universe size: ${r.universeSize}`, ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
    this.logger.devLog("Scene metrics initialized", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
    return r;
  }
  #initCanvas() {
    this.viewerCanvasElement = this.document.createElement("canvas");
    this.viewerCanvasElement.id = "ApgWglViewerCanvas";
    this.viewerElement.appendChild(this.viewerCanvasElement);
    this.logger.devLog("Canvas initialized", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #initRenderer() {
    this.renderer = new THREE.WebGLRenderer(
      { antialias: true, canvas: this.viewerCanvasElement }
    );
    this.renderer.setSize(this.viewerElement.clientWidth, this.viewerElement.clientHeight);
    this.#updateRenderer();
    this.logger.devLog("Renderer initialized", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #updateRenderer() {
    this.renderer.setPixelRatio(this.settings.pixelRatio);
    this.renderer.setClearColor(this.settings.clearColor, 1);
    this.renderer.toneMapping = this.settings.toneMapping;
    this.renderer.toneMappingExposure = this.settings.toneMappingExposure;
    this.renderer.outputColorSpace = this.settings.outputColorSpace;
    this.renderer.shadowMap.enabled = this.settings.areShadowsEnabled;
    this.renderer.shadowMap.type = this.settings.shadowMapType;
    const deviceMaxAnysotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.logger.devLog("Renderer updated", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #initCamera() {
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(
      this.settings.perspCameraPosition.x,
      this.settings.perspCameraPosition.y,
      this.settings.perspCameraPosition.z
    );
    this.camera.layers.enableAll();
    this.#updateCamera();
    this.logger.devLog("Camera initialized", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #updateCamera() {
    this.camera.zoom = this.settings.perspCameraZoom;
    this.camera.fov = this.settings.perspCameraFov;
    const aspectRatio = this.viewerElement.clientWidth / this.viewerElement.clientHeight;
    this.camera.aspect = aspectRatio;
    this.camera.near = this.settings.perspCameraNear;
    this.camera.far = this.settings.perspCameraFar;
    this.camera.updateProjectionMatrix();
    this.logger.devLog("Camera updated", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #initScene() {
    this.scene = new THREE.Scene();
    this.scene.frustumCulled = false;
    this.scene.fog = new THREE.FogExp2(
      this.settings.fogColor,
      this.settings.fogDensity * this.settings.worldSize / 100
    );
    this.logger.devLog("Scene initialized", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #updateFog() {
    this.scene.fog = new THREE.FogExp2(
      this.settings.fogColor,
      this.settings.fogDensity * this.settings.worldSize / 100
    );
    this.logger.devLog("Fog updated", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #initGrids() {
    const xzGridHelper = new THREE.GridHelper(this.metrics.sceneSize, 10, 16776960, 16776960);
    xzGridHelper.layers.enable(ApgWgl_Layers.helpers);
    this.scene.add(xzGridHelper);
    const xyGridHelper = new THREE.GridHelper(this.metrics.sceneSize, 10, 16711935, 16711935);
    xyGridHelper.layers.enable(ApgWgl_Layers.helpers);
    xyGridHelper.rotateZ(Math.PI / 2);
    this.scene.add(xyGridHelper);
    const zyGridHelper = new THREE.GridHelper(this.metrics.sceneSize, 10, 65535, 65535);
    zyGridHelper.layers.enable(ApgWgl_Layers.helpers);
    zyGridHelper.rotateX(Math.PI / 2);
    this.scene.add(zyGridHelper);
  }
  #initLights() {
    this.ambLight = new THREE.AmbientLight();
    this.ambLight.layers.set(ApgWgl_Layers.lights);
    this.#updateAmbLight();
    this.scene.add(this.ambLight);
    this.sunLight = new THREE.DirectionalLight();
    this.sunLight.layers.set(ApgWgl_Layers.lights);
    this.#updateSunLight();
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);
    const sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 100, 16711680);
    sunLightHelper.layers.set(ApgWgl_Layers.helpers);
    this.scene.add(sunLightHelper);
    const sunLightShadowCameraHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
    sunLightShadowCameraHelper.layers.set(ApgWgl_Layers.helpers);
    this.scene.add(sunLightShadowCameraHelper);
    this.camLight = new THREE.PointLight();
    this.#updateCamLight();
    this.camLight.layers.set(ApgWgl_Layers.lights);
    this.scene.add(this.camLight);
    const camLightHelper = new THREE.PointLightHelper(this.camLight, 1, 255);
    camLightHelper.layers.set(ApgWgl_Layers.helpers);
    this.scene.add(camLightHelper);
    this.logger.devLog("Light initialized", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #updateAmbLight() {
    this.ambLight.color = this.settings.ambLightColor;
    this.ambLight.intensity = this.settings.ambLightIntensity;
    this.ambLight.visible = !this.settings.envMapLighting && this.settings.ambLightEnabled;
    this.logger.devLog("Ambient light updated", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #updateSunLight() {
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
    this.logger.devLog("Sun light updated", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  #updateCamLight() {
    this.camLight.color = this.settings.camLightColor;
    this.camLight.intensity = this.settings.camLightIntensity;
    this.camLight.visible = !this.settings.envMapLighting && this.settings.camLightEnabled;
    this.camLight.distance = this.settings.camLightDistance;
    this.camLight.position.set(
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z
    );
    this.logger.devLog("Camera light updated", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
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
    this.logger.devLog("Orbit controls initialized", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
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
    this.logger.devLog("Texture loaders initialized", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
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
  async #updateEnvMap() {
    let envMap = null;
    this.logger.devLog("Env map loading started", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
    switch (this.settings.envMapMode) {
      case ApgWgl_eEnvMapMode.LDR: {
        if (this.textureLoader) {
          const url = "/assets/env/ldr/Psychedelic_1.jpg";
          envMap = this.textureLoader.load(url);
        }
        break;
      }
      case ApgWgl_eEnvMapMode.HDR: {
        if (this.hdrLoader) {
          const url = "/assets/env/hdr/Residential_garden_2k.hdr";
          envMap = await this.#_loadHdrAsync(this.hdrLoader, url);
        }
        break;
      }
      case ApgWgl_eEnvMapMode.EXR: {
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
    this.logger.devLog("Env map updated", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
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
  #updateLayers() {
    for (const index of Object.keys(this.settings.layers)) {
      const layerDescr = this.settings.layers[index];
      if (layerDescr.visible) {
        this.camera.layers.enable(layerDescr.index);
      } else {
        this.camera.layers.disable(layerDescr.index);
      }
    }
    this.logger.devLog("Layers updated", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
  }
  updateSettings() {
    const strSettingsStamp = JSON.stringify(this.settings);
    if (this.prevSettingsStamp != strSettingsStamp) {
      this.#updateRenderer();
      this.#updateFog();
      this.#updateCamera();
      this.#updateAmbLight();
      this.#updateSunLight();
      this.#updateCamLight();
      this.#updateEnvMap();
      this.#updateLayers();
      this.prevSettingsStamp = strSettingsStamp;
      this.logger.devLog("Settings updated", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
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
      this.logger.devLog("Vieport resized", ApgWgl_Viewer.WGL_VIEWER_LOGGER_NAME);
    }
  }
  /**
   * Move the camera associated to the orbit control
   * @param anewParams 
   */
  moveCamera(anewParams) {
    this.camera.position.set(
      anewParams.eye.x,
      anewParams.eye.y,
      anewParams.eye.z
    );
    this.orbitControls.target.set(
      anewParams.target.x,
      anewParams.target.y,
      anewParams.target.z
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
