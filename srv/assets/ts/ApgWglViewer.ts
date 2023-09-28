/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/
import { THREE, THREE_OrbitControls, PRANDO, RAPIER } from './ApgRprDeps.ts';
import { ApgRprUtils } from "./ApgRprUtils.ts";
import {
    IApgDomBrowserWindow, IApgDomCanvas, IApgDomDocument, IApgDomElement
} from './ApgDom.ts'
import { IApgRpr_CameraPosition, IApgRpr_InstanceDesc } from "./ApgRprInterfaces.ts";
import { eApgRpr_InstancedMeshesGroups } from "./ApgRprEnums.ts";


export class ApgWglLayers {
    static readonly helpers = 1;
    static readonly lights = 2;
    static readonly characters = 3;
    static readonly meshColliders = 4;
    static readonly instancedColliders = 5;
}


export interface IApgWglOrbitControlsParams {
    eye: THREE.Vector3,
    target: THREE.Vector3
}



export interface IApgWglViewerOptions {

    /** Overall diameter size of the world */
    worldSize: number;

    /** Color of the fog */
    fogColor: number;
    /** Fog mode */
    fogLinear: boolean;
    /** a percentage of word size*/
    fogMinDistance: number;
    /** a percentage of word size*/
    fogMaxDistance: number;

    /** THREE JS Constants */
    toneMapping: THREE.ToneMapping;
    /** ??? */
    toneMappingExposure: number;
    
    /** THREE JS Constants */
    outputColorSpace: THREE.ColorSpace;

    /** Use shadows */
    shadowMapEnabled: boolean;
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

export class ApgWglViewer {

    /** We don't like global objects */
    protected window: IApgDomBrowserWindow;
    /** We don't like global objects */
    protected document: IApgDomDocument;

    readonly EYE_HEIGHT = 1.65;
    readonly WORLD_SIZE = 2000; // 1 km radious!! 

    readonly APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY = 'APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY';

    readonly DEFAULT_OPTIONS: IApgWglViewerOptions = {

        worldSize: this.WORLD_SIZE,

        fogColor: 0x888888,
        fogLinear: true,
        fogMinDistance: this.WORLD_SIZE / 4,
        fogMaxDistance: this.WORLD_SIZE / 2,

        toneMapping: THREE.LinearToneMapping,
        toneMappingExposure: 1,

        outputColorSpace: THREE.SRGBColorSpace,

        shadowMapEnabled: false,
        // shadowMapType: THREE.PCFSoftShadowMap,
        shadowMapType: THREE.BasicShadowMap,
        shadowMapRadious: 4,
        shadowMapSize: 1024 * 4,

        clearColor: 0x292929,

        perspCameraFov: 45,
        perspCameraNear: 0.1, // 100mm
        perspCameraFar: this.WORLD_SIZE/2,
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

    protected options: IApgWglViewerOptions;

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

        this.options = { ...this.DEFAULT_OPTIONS }

        this.#initDomElements();
        this.#initRenderer();
        this.#initCamera();
        this.#initScene();
        this.#initLights();
        this.#initOrbitControls();

        this.raycaster = new THREE.Raycaster();

        this.window.addEventListener("resize", () => { this.resize() }, false);

    }

    #initDomElements() {

        this.viewerCanvasElement = this.document.createElement('canvas') as IApgDomCanvas;
        this.viewerCanvasElement.id = 'ApgWglViewerCanvas';
        this.viewerElement.appendChild(this.viewerCanvasElement);

    }

    #initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.viewerCanvasElement });
        this.renderer.setSize(this.viewerElement.clientWidth, this.viewerElement.clientHeight);
        this.renderer.toneMapping = this.options.toneMapping;
        this.renderer.toneMappingExposure = this.options.toneMappingExposure;
        this.renderer.outputColorSpace = this.options.outputColorSpace;
        this.renderer.shadowMap.enabled = this.options.shadowMapEnabled;
        this.renderer.shadowMap.type = this.options.shadowMapType;
        this.renderer.setClearColor(this.options.clearColor, 1);
        this.renderer.setPixelRatio(this.window.devicePixelRatio);
    }

    #initCamera() {
        const aspectRatio = this.viewerElement.clientWidth / this.viewerElement.clientHeight;
        this.camera = new THREE.PerspectiveCamera();
        this.camera.fov = this.options.perspCameraFov;
        this.camera.aspect = aspectRatio;
        this.camera.near = this.options.perspCameraNear;
        this.camera.far = this.options.perspCameraFar;
        this.camera.position.set(
            this.options.perspCameraPosition.x,
            this.options.perspCameraPosition.y,
            this.options.perspCameraPosition.z);
        this.camera.updateProjectionMatrix();
        this.camera.layers.enableAll();
    }

    #initScene() {

        this.scene = new THREE.Scene();

        this.scene.fog = new THREE.Fog(
            this.options.fogColor,
            this.options.fogMinDistance,
            this.options.fogMaxDistance
        );

    }

    #initLights() {

        this.ambLight = new THREE.AmbientLight()
        this.ambLight.color = this.options.ambLightColor;
        this.ambLight.intensity = this.options.ambLightIntensity;
        this.ambLight.visible =
            !this.options.useEnvMapInsteadThanLights
            && this.options.ambLightEnabled;
        this.ambLight.layers.set(ApgWglLayers.lights);
        this.scene.add(this.ambLight);

        this.sunLight = new THREE.DirectionalLight()
        this.sunLight.color = this.options.sunLightColor;
        this.sunLight.intensity = this.options.sunLightIntensity;
        this.sunLight.visible =
            !this.options.useEnvMapInsteadThanLights
            && this.options.sunLightEnabled;
        this.sunLight.layers.set(ApgWglLayers.lights);

        this.sunLight.position.set(
            this.options.sunLightPosition.x,
            this.options.sunLightPosition.y,
            this.options.sunLightPosition.z);
        
        const sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 100, 0xff0000);
        sunLightHelper.layers.set(ApgWglLayers.helpers);
        this.scene!.add(sunLightHelper);

        if (this.options.shadowMapEnabled) {
            this.sunLight.castShadow = true;
            this.sunLight.shadow.radius = this.options.shadowMapRadious;
            this.sunLight.shadow.mapSize.width = this.options.shadowMapSize;
            this.sunLight.shadow.mapSize.height = this.options.shadowMapSize;
            this.sunLight.shadow.camera.top = this.options.sunLightShadowMapCameraSize;
            this.sunLight.shadow.camera.right = this.options.sunLightShadowMapCameraSize;
            this.sunLight.shadow.camera.bottom = -this.options.sunLightShadowMapCameraSize;
            this.sunLight.shadow.camera.left = -this.options.sunLightShadowMapCameraSize;
            this.sunLight.shadow.camera.near = this.options.sunLightShadowMapCameraNear;
            this.sunLight.shadow.camera.far = this.options.sunLightShadowMapCameraFar;
            //this.sunLight.shadow.bias = -0.001;
            this.sunLight.shadow.bias = -0.0001;
            //this.sunLight.shadow.normalBias = 0.3;

            const sunLightShadowCameraHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
            sunLightShadowCameraHelper.layers.set(ApgWglLayers.helpers);
            this.scene.add(sunLightShadowCameraHelper);
        }
        this.scene!.add(this.sunLight);

        this.camLight = new THREE.PointLight()
        this.camLight.color = this.options.camLightColor;
        this.camLight.intensity = this.options.camLightIntensity
        this.camLight.distance = this.options.camLightIntensity;
        this.camLight.position.set(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z
        );
        this.camLight.visible =
            !this.options.useEnvMapInsteadThanLights
            && this.options.camLightEnabled;
        this.camLight.layers.set(ApgWglLayers.lights);
        this.scene.add(this.camLight);

        const camLightHelper = new THREE.PointLightHelper(this.camLight, 1, 0x0000ff);
        camLightHelper.layers.set(ApgWglLayers.helpers);
        this.scene.add(camLightHelper);

    }

    #initOrbitControls() {
        this.orbitControls = new THREE_OrbitControls(this.camera, this.renderer.domElement);

        this.orbitControls.minDistance = this.options.orbControlsMinDistance;
        this.orbitControls.maxDistance = this.options.orbControlsMaxDistance;
        this.orbitControls.target.set(
            this.options.orbControlsTarget.x,
            this.options.orbControlsTarget.y,
            this.options.orbControlsTarget.z,
        );
        this.orbitControls.minPolarAngle = this.options.orbControlsMinPolarAngle;
        this.orbitControls.maxPolarAngle = this.options.orbControlsMaxPolarAngle;
        this.orbitControls.enableDamping = this.options.orbControlsEnableDamping;
        this.orbitControls.dampingFactor = this.options.orbControlsDampingFactor;

        this.orbitControls.update();
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
    setOrbControlsParams(anewPosition: IApgWglOrbitControlsParams) {
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

        r.push('Lights:');
        r.push(` - Ambient is: ${this.ambLight.visible ? 'Enabled': 'Disabled'}`);
        r.push(` - Sun is: ${this.sunLight.visible ? 'Enabled' : 'Disabled'}`);
        r.push(` - Camera is: ${this.camLight.visible ? 'Enabled' : 'Disabled'}`);
        
        const vp = this.renderer.getViewport(new THREE.Vector4);
        r.push('Renderer:');
        r.push(` - Shadows are: ${this.renderer.shadowMap.enabled ? 'Enabled' : 'Disabled'}`);
        r.push(` - Dimensions are: ${vp.width.toFixed(1)} x ${vp.height.toFixed(1)}`);
        r.push(` - Pixel ratio is: ${this.renderer.getPixelRatio().toFixed(3)}`);
        


        return r;
    }

}

