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
    THREE_OrbitControls
} from './ApgWgl_Deps.ts';



export class ApgWgl_Layers {
    static readonly helpers = 1;
    static readonly lights = 2;
    static readonly characters = 3;
    static readonly meshColliders = 4;
    static readonly instancedColliders = 5;
}


export interface ApgWgl_IOrbitControlsParams {
    eye: THREE.Vector3,
    target: THREE.Vector3
}


export interface ApgWgl_IViewerSettings {

    /** Overall diameter size of the world */
    worldSize: number;

    /** Color of the fog */
    fogColor: THREE.Color;
    /** Fog mode */
    fogLinear: boolean;
    /** a percentage of word size*/
    fogNear: number;
    /** a percentage of word size*/
    fogFar: number;

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

    /** Scene background color */
    clearColor: number;

    /** Field of view */
    perspCameraFov: number;
    perspCameraNear: number;
    perspCameraFar: number;
    perspCameraPosition: THREE.Vector3;

    useEnvMapInsteadThanLights: boolean;

    ambLightColor: THREE.Color;
    ambLightIntensity: number;
    ambLightEnabled: boolean;

    sunLightColor: THREE.Color;
    sunLightIntensity: number;
    sunLightPosition: THREE.Vector3;
    sunLightShadowMapCameraSize: number,
    sunLightShadowMapCameraNear: number,
    sunLightShadowMapCameraFar: number,
    sunLightEnabled: boolean;

    camLightColor: THREE.Color;
    camLightIntensity: number;
    camLightDistance: number;
    camLightPosition: THREE.Vector3;
    camLightEnabled: boolean;
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


export class ApgWgl_Viewer {

    /** We don't like global objects */
    protected window: IApgDomBrowserWindow;
    /** We don't like global objects */
    protected document: IApgDomDocument;

    readonly EYE_HEIGHT = 1.65;
    readonly WORLD_SIZE = 2000; // 1 km radious!! 

    readonly APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY = 'APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY';

    readonly DEFAULT_SETTINGS: ApgWgl_IViewerSettings = {

        worldSize: this.WORLD_SIZE,

        fogColor: new THREE.Color(0x888888),
        fogLinear: true,
        fogNear: 0.8,
        fogFar: 1,

        toneMapping: THREE.LinearToneMapping,
        toneMappingExposure: 1,

        outputColorSpace: THREE.SRGBColorSpace,

        areShadowsEnabled: false,
        // shadowMapType: THREE.PCFSoftShadowMap,
        shadowMapType: THREE.BasicShadowMap,
        shadowMapRadious: 4,
        shadowMapSize: 1024 * 4,

        clearColor: 0x292929,

        perspCameraFov: 45,
        perspCameraNear: 0.1, // 100mm
        perspCameraFar: this.WORLD_SIZE / 2,
        perspCameraPosition: new THREE.Vector3(0, this.EYE_HEIGHT, 5),

        useEnvMapInsteadThanLights: false,

        ambLightEnabled: true,
        ambLightIntensity: 0.2,
        ambLightColor: new THREE.Color(0xffffff),

        sunLightEnabled: true,
        sunLightIntensity: 0.5,
        sunLightColor: new THREE.Color(0xffffaa),
        sunLightPosition: new THREE.Vector3(this.WORLD_SIZE / 4, this.WORLD_SIZE / 2.5, this.WORLD_SIZE / 4),
        sunLightShadowMapCameraSize: this.WORLD_SIZE / 40,
        sunLightShadowMapCameraNear: this.WORLD_SIZE / 3.5,
        sunLightShadowMapCameraFar: this.WORLD_SIZE / 1.5,

        camLightEnabled: false,
        camLightIntensity: 0.5,
        camLightColor: new THREE.Color(0xaaffff),
        camLightPosition: new THREE.Vector3(0, 0, 0),
        camLightDistance: this.WORLD_SIZE / 10,
        camLightIsDetachedFromCamera: false,

        orbControlsTarget: new THREE.Vector3(0, 0, 0),
        orbControlsMinDistance: 0.1,
        orbControlsMaxDistance: this.WORLD_SIZE / 2,
        orbControlsMinPolarAngle: 0,
        orbControlsMaxPolarAngle: Math.PI,
        orbControlsEnableDamping: true,
        orbControlsDampingFactor: 0.2,

        layers: [true, true, true, true]

    }

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


    constructor(
        awindow: IApgDomBrowserWindow,
        adocument: IApgDomDocument,
        aviewerElement: IApgDomElement,
    ) {
        this.window = awindow;
        this.document = adocument;
        this.viewerElement = aviewerElement;

        this.settings = { ...this.DEFAULT_SETTINGS }
        this.prevSettingsStamp = JSON.stringify(this.settings);

        this.#initCanvas();
        this.#initRenderer();
        this.#initCamera();
        this.#initScene();
        this.#initLights();
        this.#initOrbitControls();

        this.raycaster = new THREE.Raycaster();

        this.window.addEventListener("resize", () => { this.resize() }, false);
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
        this.renderer.toneMapping = this.settings.toneMapping;
        this.renderer.toneMappingExposure = this.settings.toneMappingExposure;
        this.renderer.outputColorSpace = this.settings.outputColorSpace;
        this.renderer.shadowMap.enabled = this.settings.areShadowsEnabled;
        this.renderer.shadowMap.type = this.settings.shadowMapType;
        this.renderer.setClearColor(this.settings.clearColor, 1);
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

        this.scene.fog = new THREE.Fog(
            this.settings.fogColor,
            this.WORLD_SIZE * this.settings.fogNear,
            this.WORLD_SIZE * this.settings.fogFar
        );

    }


    updateFog(): void {
        const fog = this.scene.fog! as THREE.Fog;
        fog.color.set(this.settings.fogColor);

        if (this.settings.fogNear > this.settings.fogFar) {
            const t = this.settings.fogNear;
            this.settings.fogNear = this.settings.fogFar;
            this.settings.fogFar = t;
        }
        if (this.settings.fogNear == this.settings.fogFar) {
            this.settings.fogFar = 1;
        }

        fog.near = this.WORLD_SIZE * this.settings.fogNear;
        fog.far = this.WORLD_SIZE * this.settings.fogFar;
    }


    #initLights(): void {

        this.ambLight = new THREE.AmbientLight()
        this.ambLight.layers.set(ApgWgl_Layers.lights);
        this.updateAmbLight();
        this.scene.add(this.ambLight);

        this.sunLight = new THREE.DirectionalLight()
        this.sunLight.layers.set(ApgWgl_Layers.lights);
        this.updateSunLight()
        this.sunLight.castShadow = true;
        this.scene.add(this.sunLight);

        const sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 100, 0xff0000);
        sunLightHelper.layers.set(ApgWgl_Layers.helpers);
        this.scene.add(sunLightHelper);

        const sunLightShadowCameraHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
        sunLightShadowCameraHelper.layers.set(ApgWgl_Layers.helpers);
        this.scene.add(sunLightShadowCameraHelper);

        this.camLight = new THREE.PointLight()
        this.updateCamLight();
        this.camLight.layers.set(ApgWgl_Layers.lights);
        this.scene.add(this.camLight);

        const camLightHelper = new THREE.PointLightHelper(this.camLight, 1, 0x0000ff);
        camLightHelper.layers.set(ApgWgl_Layers.helpers);
        this.scene.add(camLightHelper);

    }


    updateAmbLight(): void {
        this.ambLight.color = this.settings.ambLightColor;
        this.ambLight.intensity = this.settings.ambLightIntensity;
        this.ambLight.visible =
            !this.settings.useEnvMapInsteadThanLights
            && this.settings.ambLightEnabled;
    }


    updateSunLight() {
        this.sunLight.color = this.settings.sunLightColor;
        this.sunLight.intensity = this.settings.sunLightIntensity;
        this.sunLight.visible =
            !this.settings.useEnvMapInsteadThanLights
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
            !this.settings.useEnvMapInsteadThanLights
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

        const fog = this.scene.fog! as THREE.Fog;
        r.push(`Fog:`);
        r.push(` - Color: ${fog.color.getHex()}`);
        r.push(` - Near: ${fog.near.toFixed(1)}`);
        r.push(` - Far: ${fog.far.toFixed(1)}`);


        r.push('Lights:');
        r.push(` - Ambient is: ${this.ambLight.visible ? 'Enabled' : 'Disabled'}`);
        r.push(` - Sun is: ${this.sunLight.visible ? 'Enabled' : 'Disabled'}`);
        r.push(` - Camera is: ${this.camLight.visible ? 'Enabled' : 'Disabled'}`);

        const vp = this.renderer.getViewport(new THREE.Vector4);
        r.push('Renderer:');
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

