/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/
import {
    IApgDomBrowserWindow,
    IApgDomCanvas,
    IApgDomDocument,
    IApgDomElement
} from './ApgDom.ts';

import {
    THREE,
    THREE_EXRLoader,
    THREE_GPSkybox,
    THREE_OrbitControls,
    THREE_RGBELoader
} from './ApgWgl_Deps.ts';


export enum ApgWgl_eEnvMapMode {

    NONE = "none",
    HDR = "hdr",
    EXR = "exr",
    LDR = "ldr"
}


export interface ApgWgl_IEnvMaps {
    mode: ApgWgl_eEnvMapMode,
    maps: string[]
}



export enum ApgWgl_eLayers {
    unassigned = 0,
    helpers = 1,
    lights = 2,
    characters = 3,
    colliders = 4,
    instancedColliders = 5,
}

export interface ApgWgl_ILayerDescr {
    index: ApgWgl_eLayers,
    visible: boolean,
    name: string
}


export interface ApgWgl_IOrbitControlsParams {
    eye: THREE.Vector3,
    target: THREE.Vector3
}


export interface ApgWgl_IViewerSettings {

    /** Overall diameter size of the world */
    worldSize: number;
    /** Height position of the camera for the character head */
    eyeHeight: number;

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
    perspCameraNear: number;
    perspCameraFar: number;
    perspCameraPosition: THREE.Vector3;

    ambLightEnabled: boolean;
    ambLightColor: THREE.Color;
    ambLightIntensity: number;

    sunLightEnabled: boolean;
    sunLightColor: THREE.Color;
    sunLightIntensity: number;
    sunLightPosition: THREE.Vector3;
    sunLightShadowMapCameraSize: number,
    sunLightShadowMapCameraNear: number,
    sunLightShadowMapCameraFar: number,

    camLightEnabled: boolean;
    camLightColor: THREE.Color;
    camLightIntensity: number;
    camLightDistance: number;
    camLightPosition: THREE.Vector3;
    camLightIsDetachedFromCamera: boolean;

    envMapLighting: boolean;
    envMapMode: ApgWgl_eEnvMapMode;
    envMaps: string[];
    envMapLightingIntensity: number,
    envMapBackgroundBlurryness: number,
    envMapBackgroundIntensity: number,

    orbControlsTarget: THREE.Vector3;
    orbControlsMinDistance: number;
    orbControlsMaxDistance: number;
    orbControlsMinPolarAngle: number;
    orbControlsMaxPolarAngle: number;
    orbControlsEnableDamping: boolean;
    orbControlsDampingFactor: number;

    layers: Map<ApgWgl_eLayers, ApgWgl_ILayerDescr>;

}


export class ApgWgl_Viewer {

    /** We don't like global objects */
    protected window: IApgDomBrowserWindow;
    /** We don't like global objects */
    protected document: IApgDomDocument;

    readonly APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY = 'APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY';

    settings: ApgWgl_IViewerSettings;
    prevSettingsStamp: string;

    /** Dom Elements*/
    protected viewerElement!: IApgDomElement;
    protected viewerCanvasElement!: IApgDomCanvas;

    // Keep track of the render calls to THREE.Render
    protected static renderCalls = 0;

    /** THREE stuff */
    protected renderer!: THREE.WebGLRenderer;
    protected scene!: THREE.Scene;
    protected camera!: THREE.PerspectiveCamera;
    protected orbitControls!: THREE_OrbitControls;
    protected ambLight!: THREE.AmbientLight;
    protected sunLight!: THREE.DirectionalLight;
    protected camLight!: THREE.PointLight;
    protected raycaster!: THREE.Raycaster;

    /** Texture management */
    protected textureLoader: THREE.TextureLoader | null = null;
    protected textureMaps: THREE.Texture[] = [];
    protected bumpMaps: THREE.Texture[] = [];
    protected normalMaps: THREE.Texture[] = [];

    protected hdrLoader: THREE_RGBELoader | null = null;
    protected exrLoader: THREE_EXRLoader | null = null;

    constructor(
        awindow: IApgDomBrowserWindow,
        adocument: IApgDomDocument,
        aviewerElement: IApgDomElement,
        aworldSize = 1000,
        ayeHeight = 1.65
    ) {
        this.window = awindow;
        this.document = adocument;
        this.viewerElement = aviewerElement;

        this.settings = ApgWgl_Viewer.GetDefaultSettings(aworldSize, ayeHeight)
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

        this.window.addEventListener("resize", () => { this.resize() }, false);
    }


    static GetDefaultSettings(aworldSize: number, aeyeHeight: number) {
        const r: ApgWgl_IViewerSettings = {

            worldSize: aworldSize,
            eyeHeight: aeyeHeight,

            fogColor: new THREE.Color(0x888888),
            fogDensity: 0.00025,

            toneMapping: THREE.LinearToneMapping,
            toneMappingExposure: 1,

            outputColorSpace: THREE.SRGBColorSpace,

            areShadowsEnabled: false,
            // shadowMapType: THREE.PCFSoftShadowMap,
            shadowMapType: THREE.BasicShadowMap,
            shadowMapRadious: 4,
            shadowMapSize: 1024 * 4,
            anisotropy: 4,

            clearColor: new THREE.Color(0x292929),

            perspCameraFov: 45,
            perspCameraNear: 0.1, // 100mm
            perspCameraFar: aworldSize / 2,
            perspCameraPosition: new THREE.Vector3(0, aeyeHeight, 5),

            ambLightEnabled: true,
            ambLightIntensity: 0.2,
            ambLightColor: new THREE.Color(0xffffff),

            sunLightEnabled: true,
            sunLightIntensity: 0.5,
            sunLightColor: new THREE.Color(0xffffaa),
            sunLightPosition: new THREE.Vector3(aworldSize / 4, aworldSize / 2.5, aworldSize / 4),
            sunLightShadowMapCameraSize: aworldSize / 40,
            sunLightShadowMapCameraNear: aworldSize / 3.5,
            sunLightShadowMapCameraFar: aworldSize / 1.5,

            camLightEnabled: false,
            camLightIntensity: 0.5,
            camLightColor: new THREE.Color(0xaaffff),
            camLightPosition: new THREE.Vector3(0, 0, 0),
            camLightDistance: aworldSize / 10,
            camLightIsDetachedFromCamera: false,

            envMapLighting: false,
            envMapMode: ApgWgl_eEnvMapMode.EXR,
            envMaps: [],
            envMapLightingIntensity: 1,
            envMapBackgroundBlurryness: 0,
            envMapBackgroundIntensity: 1,

            orbControlsTarget: new THREE.Vector3(0, 0, 0),
            orbControlsMinDistance: 0.1,
            orbControlsMaxDistance: aworldSize / 2,
            orbControlsMinPolarAngle: 0,
            orbControlsMaxPolarAngle: Math.PI,
            orbControlsEnableDamping: true,
            orbControlsDampingFactor: 0.2,

            layers: new Map()

        }
        return r;
    }
    

    #initCanvas(): void {
        this.viewerCanvasElement = this.document.createElement('canvas') as IApgDomCanvas;
        this.viewerCanvasElement.id = 'ApgWglViewerCanvas';
        this.viewerElement.appendChild(this.viewerCanvasElement);
    }


    #initRenderer(): void {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.viewerCanvasElement });
        this.renderer.setSize(this.viewerElement.clientWidth, this.viewerElement.clientHeight);
        this.renderer.setPixelRatio(this.window.devicePixelRatio);
        this.updateRenderer();
    }


    updateRenderer(): void {

        this.renderer.setClearColor(this.settings.clearColor, 1);
        this.renderer.toneMapping = this.settings.toneMapping;
        this.renderer.toneMappingExposure = this.settings.toneMappingExposure;
        this.renderer.outputColorSpace = this.settings.outputColorSpace;
        this.renderer.shadowMap.enabled = this.settings.areShadowsEnabled;
        this.renderer.shadowMap.type = this.settings.shadowMapType;
        const deviceMaxAnysotropy = this.renderer.capabilities.getMaxAnisotropy();

    }


    #initCamera(): void {
        this.camera = new THREE.PerspectiveCamera();

        this.camera.position.set(
            this.settings.perspCameraPosition.x,
            this.settings.perspCameraPosition.y,
            this.settings.perspCameraPosition.z);

        this.camera.layers.enableAll();

        this.updateCamera();
    }


    updateCamera(): void {
        this.camera.fov = this.settings.perspCameraFov;
        const aspectRatio = this.viewerElement.clientWidth / this.viewerElement.clientHeight;
        this.camera.aspect = aspectRatio;
        this.camera.near = this.settings.perspCameraNear;
        this.camera.far = this.settings.perspCameraFar;
        this.camera.updateProjectionMatrix();
    }


    #initScene(): void {

        this.scene = new THREE.Scene();

        this.scene.fog = new THREE.FogExp2(
            this.settings.fogColor,
            this.settings.fogDensity * this.settings.worldSize / 100
        );

    }


    updateFog(): void {
        this.scene.fog = new THREE.FogExp2(
            this.settings.fogColor,
            this.settings.fogDensity * this.settings.worldSize / 100
        );
    }


    #initLights(): void {

        this.ambLight = new THREE.AmbientLight()
        this.ambLight.layers.set(ApgWgl_eLayers.lights);
        this.updateAmbLight();
        this.scene.add(this.ambLight);

        this.sunLight = new THREE.DirectionalLight()
        this.sunLight.layers.set(ApgWgl_eLayers.lights);
        this.updateSunLight()
        this.sunLight.castShadow = true;
        this.scene.add(this.sunLight);

        const sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 100, 0xff0000);
        sunLightHelper.layers.set(ApgWgl_eLayers.helpers);
        this.scene.add(sunLightHelper);

        const sunLightShadowCameraHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
        sunLightShadowCameraHelper.layers.set(ApgWgl_eLayers.helpers);
        this.scene.add(sunLightShadowCameraHelper);

        this.camLight = new THREE.PointLight()
        this.updateCamLight();
        this.camLight.layers.set(ApgWgl_eLayers.lights);
        this.scene.add(this.camLight);

        const camLightHelper = new THREE.PointLightHelper(this.camLight, 1, 0x0000ff);
        camLightHelper.layers.set(ApgWgl_eLayers.helpers);
        this.scene.add(camLightHelper);

    }


    updateAmbLight(): void {
        this.ambLight.color = this.settings.ambLightColor;
        this.ambLight.intensity = this.settings.ambLightIntensity;
        this.ambLight.visible =
            !this.settings.envMapLighting
            && this.settings.ambLightEnabled;
    }


    updateSunLight() {
        this.sunLight.color = this.settings.sunLightColor;
        this.sunLight.intensity = this.settings.sunLightIntensity;
        this.sunLight.visible =
            !this.settings.envMapLighting
            && this.settings.sunLightEnabled;

        this.sunLight.position.set(
            this.settings.sunLightPosition.x,
            this.settings.sunLightPosition.y,
            this.settings.sunLightPosition.z);

        this.sunLight.shadow.radius = this.settings.shadowMapRadious;
        this.sunLight.shadow.mapSize.width = this.settings.shadowMapSize;
        this.sunLight.shadow.mapSize.height = this.settings.shadowMapSize;

        this.sunLight.shadow.bias = -0.0001;

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
        this.camLight.visible =
            !this.settings.envMapLighting
            && this.settings.camLightEnabled;

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
            this.settings.orbControlsTarget.z,
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
            this.textureLoader.crossOrigin = '';
            this.textureLoader.setCrossOrigin("anonymous"); // TODO ??
        }

        if (this.hdrLoader == null) {
            this.hdrLoader = new THREE_RGBELoader();
            this.hdrLoader.crossOrigin = '';
            this.hdrLoader.setCrossOrigin("anonymous"); // TODO ??
        }

        if (this.exrLoader == null) {
            this.exrLoader = new THREE_EXRLoader();
            this.exrLoader.crossOrigin = '';
            this.hdrLoader.setCrossOrigin("anonymous"); // TODO ??
        }

    }


    #_loadHdrAsync(aloader: THREE_RGBELoader, aurl: string) {

        const p = new Promise((resolve: (v: THREE.DataTexture) => void, reject: (e: any) => void) => {

            aloader.load(
                aurl,
                (hdrEnvironmentMap) => {
                    resolve(hdrEnvironmentMap)
                }),
                undefined,
                (reason: any) => {
                    reject(reason)
                }
        })
        return p;
    }

    #_loadExrAsync(aloader: THREE_EXRLoader, aurl: string) {

        const p = new Promise((resolve: (v: THREE.DataTexture) => void, reject: (e: any) => void) => {

            aloader.load(
                aurl,
                (exrEnvironmentMap) => {
                    resolve(exrEnvironmentMap)
                }),
                undefined,
                (reason: any) => {
                    reject(reason)
                }
        })
        return p;
    }

    async updateEnvMap() {

        let envMap: THREE.Texture | THREE.DataTexture | null = null;

        switch (this.settings.envMapMode) {

            case ApgWgl_eEnvMapMode.LDR: {
                if (this.textureLoader) {
                    const url = '/assets/env/ldr/Psychedelic_1.jpg';
                    envMap = this.textureLoader.load(url);
                }
                break;
            }
            case ApgWgl_eEnvMapMode.HDR: {
                if (this.hdrLoader) {
                    const url = '/assets/env/hdr/Residential_garden_2k.hdr';
                    envMap = await this.#_loadHdrAsync(this.hdrLoader, url);
                }
                break;
            }
            case ApgWgl_eEnvMapMode.EXR: {
                if (this.exrLoader) {
                    const url = '/assets/env/exr/Neon_photostudio_1k.exr';
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


            // const skybox = new THREE_GPSkybox(envMap);
            // skybox.scale.setScalar(4000);
            // skybox.radious = 4000;
            // skybox.height = 75;
            //this.scene.add(skybox);
            
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

        this.scene.traverse((object: THREE.Object3D) => {
            const mesh = <THREE.Mesh>object;
            if (mesh.isMesh) {
                const mat = <THREE.MeshStandardMaterial>mesh.material;
                if (mat.isMeshStandardMaterial) {
                    mat.envMapIntensity = this.settings.envMapLightingIntensity;
                }
            }

        })

    }


    updateLayers() {
        for (const [index, layerDescr] of this.settings.layers) {
            if (layerDescr.visible) {
                this.camera.layers.enable(index)
            }
            else {
                this.camera.layers.disable(index)
            }
        }
    }


    updateSettings() {

        // TODO this could be slow to do at every frame??? -- APG 20230930
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
            this.prevSettingsStamp = strSettingsStamp;
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
    setOrbControlsParams(anewPosition: ApgWgl_IOrbitControlsParams) {
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


    castRayAtMousePosition(apos: THREE.Vector2) {
        this.raycaster.setFromCamera(apos, this.camera);
        return this.raycaster.ray;
    }


    /**
     * Collects data on the current viewer settings
     * @returns Array of strings 
     */
    getInfo() {

        const r: string[] = [];

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

        const fog = this.scene.fog! as THREE.FogExp2;
        r.push(`Fog:`);
        r.push(` - Color: ${fog.color.getHexString()}`);
        r.push(` - Density: ${fog.density.toFixed(1)}`);

        r.push('Lights:');
        r.push(` - Ambient is: ${this.ambLight.visible ? 'Enabled' : 'Disabled'}`);
        r.push(` - Ambient color: ${this.ambLight.color.getHexString()}`);
        r.push(` - Sun is: ${this.sunLight.visible ? 'Enabled' : 'Disabled'}`);
        r.push(` - Sun color: ${this.sunLight.color.getHexString()}`);
        r.push(` - Camera is: ${this.camLight.visible ? 'Enabled' : 'Disabled'}`);
        r.push(` - Camera color: ${this.camLight.color.getHexString()}`);

        const vp = this.renderer.getViewport(new THREE.Vector4);
        r.push('Renderer:');
        const cc = new THREE.Color();
        r.push(` - Clear color: ${this.renderer.getClearColor(cc).getHexString()}`);
        r.push(` - Shadows are: ${this.renderer.shadowMap.enabled ? 'Enabled' : 'Disabled'}`);
        r.push(` - Dimensions are: ${vp.width.toFixed(1)} x ${vp.height.toFixed(1)}`);
        r.push(` - Pixel ratio is: ${this.renderer.getPixelRatio().toFixed(3)}`);

        return r;
    }


    render() {

        this.updateSettings();

        this.renderer.render(this.scene, this.camera);

    }
}

