import { THREE, THREE_OrbitControls, PRANDO, RAPIER } from "./ApgRprDeps.ts";
import { ApgRprUtils } from "./ApgRprUtils.ts";
import { eApgRpr_InstancedMeshesGroups } from "./ApgRprEnums.ts";
var eApgRprCollidersColorPalette = /* @__PURE__ */ ((eApgRprCollidersColorPalette2) => {
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["FIXED"] = 0] = "FIXED";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["KINEMATIC"] = 1] = "KINEMATIC";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["DYNAMIC"] = 2] = "DYNAMIC";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["CCD_ENABLED"] = 3] = "CCD_ENABLED";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["SENSOR"] = 4] = "SENSOR";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["HIGHLIGHTED"] = 5] = "HIGHLIGHTED";
  return eApgRprCollidersColorPalette2;
})(eApgRprCollidersColorPalette || {});
class ApgWglLayers {
  static helpers = 1;
  static lights = 2;
  static characters = 3;
  static meshColliders = 4;
  static instancedColliders = 5;
}
export class ApgWglViewer {
  /** We don't like global objects */
  window;
  /** We don't like global objects */
  document;
  EYE_HEIGHT = 1.65;
  WORLD_SIZE = 2e3;
  // 1 km radious!! 
  APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY = "APG_WGL_VIEWER_OPTIONS_LOCAL_STORAGE_KEY";
  DEFAULT_OPTIONS = {
    worldSize: this.WORLD_SIZE,
    fogColor: 8947848,
    fogMinDistance: this.WORLD_SIZE / 4,
    fogMaxDistance: this.WORLD_SIZE / 2,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1,
    outputColorSpace: THREE.SRGBColorSpace,
    shadowMapEnabled: true,
    // shadowMapType: THREE.PCFSoftShadowMap,
    shadowMapType: THREE.BasicShadowMap,
    shadowMapRadious: 4,
    shadowMapSize: 1024 * 4,
    clearColor: 2697513,
    perspCameraFov: 45,
    perspCameraNear: 0.1,
    // 100mm
    perspCameraFar: this.WORLD_SIZE / 2,
    perspCameraPosition: new THREE.Vector3(0, this.EYE_HEIGHT, 5),
    useEnvMapInsteadThanLights: false,
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
    orbControlsTarget: new THREE.Vector3(0, 0, 0),
    orbControlsMinDistance: 0.1,
    orbControlsMaxDistance: this.WORLD_SIZE / 2,
    orbControlsMinPolarAngle: 0,
    orbControlsMaxPolarAngle: Math.PI,
    orbControlsEnableDamping: true,
    orbControlsDampingFactor: 0.2,
    layers: [true, true, true, true]
  };
  options;
  /** Dom Elements*/
  guiElement;
  guiPanelElement;
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
  constructor(awindow, adocument) {
    this.window = awindow;
    this.document = adocument;
    this.options = { ...this.DEFAULT_OPTIONS };
    this.#initDomElements();
    this.#initRenderer();
    this.#initCamera();
    this.#initScene();
    this.#initLights();
    this.#initOrbitControls();
    this.raycaster = new THREE.Raycaster();
    this.window.addEventListener("resize", () => {
      this.resize();
    }, false);
  }
  #initDomElements() {
    this.guiElement = this.document.getElementById("ApgWglGui");
    this.viewerElement = this.document.getElementById("ApgWglViewer");
    this.viewerCanvasElement = this.document.createElement("canvas");
    this.viewerCanvasElement.id = "ApgWglViewerCanvas";
    this.viewerElement.appendChild(this.viewerCanvasElement);
    this.guiPanelElement = this.document.getElementById("ApgWglGuiPanel");
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
      this.options.perspCameraPosition.z
    );
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
    this.ambLight = new THREE.AmbientLight();
    this.ambLight.color = this.options.ambLightColor;
    this.ambLight.intensity = this.options.ambLightIntensity;
    this.ambLight.visible = !this.options.useEnvMapInsteadThanLights && this.options.ambLightEnabled;
    this.ambLight.layers.set(ApgWglLayers.lights);
    this.scene.add(this.ambLight);
    this.sunLight = new THREE.DirectionalLight();
    this.sunLight.color = this.options.sunLightColor;
    this.sunLight.intensity = this.options.sunLightIntensity;
    this.sunLight.visible = !this.options.useEnvMapInsteadThanLights && this.options.sunLightEnabled;
    this.sunLight.layers.set(ApgWglLayers.lights);
    this.sunLight.position.set(
      this.options.sunLightPosition.x,
      this.options.sunLightPosition.y,
      this.options.sunLightPosition.z
    );
    const sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 100, 16711680);
    sunLightHelper.layers.set(ApgWglLayers.helpers);
    this.scene.add(sunLightHelper);
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
      this.sunLight.shadow.bias = -1e-4;
      const sunLightShadowCameraHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
      sunLightShadowCameraHelper.layers.set(ApgWglLayers.helpers);
      this.scene.add(sunLightShadowCameraHelper);
    }
    this.scene.add(this.sunLight);
    this.camLight = new THREE.PointLight();
    this.camLight.color = this.options.camLightColor;
    this.camLight.intensity = this.options.camLightIntensity;
    this.camLight.distance = this.options.camLightIntensity;
    this.camLight.position.set(
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z
    );
    this.camLight.visible = !this.options.useEnvMapInsteadThanLights && this.options.camLightEnabled;
    this.camLight.layers.set(ApgWglLayers.lights);
    this.scene.add(this.camLight);
    const camLightHelper = new THREE.PointLightHelper(this.camLight, 1, 255);
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
      this.options.orbControlsTarget.z
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
    r.push("Lights:");
    r.push(` - Ambient is: ${this.ambLight.visible ? "Enabled" : "Disabled"}`);
    r.push(` - Sun is: ${this.sunLight.visible ? "Enabled" : "Disabled"}`);
    r.push(` - Camera is: ${this.camLight.visible ? "Enabled" : "Disabled"}`);
    const vp = this.renderer.getViewport(new THREE.Vector4());
    r.push("Renderer:");
    r.push(` - Shadows are: ${this.renderer.shadowMap.enabled ? "Enabled" : "Disabled"}`);
    r.push(` - Dimensions are: ${vp.width.toFixed(1)} x ${vp.height.toFixed(1)}`);
    r.push(` - Pixel ratio is: ${this.renderer.getPixelRatio().toFixed(3)}`);
    return r;
  }
}
export class ApgRprViewer extends ApgWglViewer {
  // Maximum count of colliders mesh instances
  COLLIDERS_MESH_INSTANCES_MAX = 250;
  /** Collections used to relate colliders and rigidbodies with meshes */
  mapOfInstancedMeshDescriptorsByColliderHandle;
  mapOfMeshesByColliderHandle;
  mapOfCollidersByRigidBodyHandle;
  /** Colors for the instanced colliders meshes */
  collidersPalette;
  rng;
  /** Is used for highlighing the colliders that are picked with the mouse */
  lines;
  /** Index of the current highlighted collider */
  highlightedCollider;
  /** Set of reusable meshes used to represent the standard colliders */
  instancedMeshesGroups;
  constructor(awindow, adocument) {
    super(awindow, adocument);
    this.rng = new PRANDO("ApgRprThreeViewer");
    this.mapOfInstancedMeshDescriptorsByColliderHandle = /* @__PURE__ */ new Map();
    this.mapOfMeshesByColliderHandle = /* @__PURE__ */ new Map();
    this.mapOfCollidersByRigidBodyHandle = /* @__PURE__ */ new Map();
    this.collidersPalette = /* @__PURE__ */ new Map();
    this.#initCollidersPalette();
    this.instancedMeshesGroups = /* @__PURE__ */ new Map();
    this.#initInstanceMeshesGroups();
    this.highlightedCollider = -1;
    const material = new THREE.LineBasicMaterial({
      color: 16777215,
      vertexColors: true
    });
    const geometry = new THREE.BufferGeometry();
    this.lines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.lines);
  }
  #initInstanceMeshesGroups() {
    this.#buildInstancedMeshesGroup(eApgRpr_InstancedMeshesGroups.BOXES, this.COLLIDERS_MESH_INSTANCES_MAX);
    this.#buildInstancedMeshesGroup(eApgRpr_InstancedMeshesGroups.BALLS, this.COLLIDERS_MESH_INSTANCES_MAX);
    this.#buildInstancedMeshesGroup(eApgRpr_InstancedMeshesGroups.CYLINDERS, this.COLLIDERS_MESH_INSTANCES_MAX);
    this.#buildInstancedMeshesGroup(eApgRpr_InstancedMeshesGroups.CONES, this.COLLIDERS_MESH_INSTANCES_MAX);
    this.#buildInstancedMeshesGroup(eApgRpr_InstancedMeshesGroups.CAPSULES, this.COLLIDERS_MESH_INSTANCES_MAX);
  }
  #initCollidersPalette() {
    this.collidersPalette.set(0 /* FIXED */, { colors: [16766080], offset: 0 });
    this.collidersPalette.set(1 /* KINEMATIC */, { colors: [4210879], offset: 1 });
    this.collidersPalette.set(2 /* DYNAMIC */, { colors: [1520463, 2709897, 5147850, 12900845], offset: 2 });
    this.collidersPalette.set(3 /* CCD_ENABLED */, { colors: [16776960], offset: 6 });
    this.collidersPalette.set(4 /* SENSOR */, { colors: [65280], offset: 7 });
    this.collidersPalette.set(5 /* HIGHLIGHTED */, { colors: [16711680], offset: 8 });
  }
  #buildInstancedMeshesGroup(agroup, amaxInstances) {
    let geometry;
    switch (agroup) {
      case eApgRpr_InstancedMeshesGroups.BOXES:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case eApgRpr_InstancedMeshesGroups.BALLS:
        geometry = new THREE.SphereGeometry(0.5);
        break;
      case eApgRpr_InstancedMeshesGroups.CYLINDERS:
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1);
        break;
      case eApgRpr_InstancedMeshesGroups.CONES:
        geometry = new THREE.ConeGeometry(0.5, 1, 16, 1);
        break;
      case eApgRpr_InstancedMeshesGroups.CAPSULES:
        geometry = new THREE.CapsuleGeometry(0.25, 0.5, 4, 16);
        break;
    }
    const group = [];
    for (const type of this.collidersPalette.keys()) {
      for (const color of this.collidersPalette.get(type).colors) {
        const material = new THREE.MeshPhongMaterial({
          color,
          flatShading: false
        });
        const instancedMesh = new THREE.InstancedMesh(geometry, material, amaxInstances);
        const userData = instancedMesh.userData;
        userData.isRprInstancedMesh = true;
        userData.mapOfCollidersAssocToThisInstancedMesh = /* @__PURE__ */ new Map();
        instancedMesh.count = 0;
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        instancedMesh.layers.set(ApgWglLayers.instancedColliders);
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;
        group.push(instancedMesh);
        this.scene.add(instancedMesh);
      }
    }
    this.instancedMeshesGroups.set(agroup, group);
  }
  /**
   * Renders the three scene of the current Rapier world
   * @param aworld 
   * @param aisDebugMode 
   */
  render(aworld, aisDebugMode) {
    ApgRprViewer.renderCalls++;
    this.orbitControls.update();
    this.camLight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    this.updateCollidersPositions(aworld);
    if (aisDebugMode) {
      this.lines.visible = true;
      const buffers = aworld.debugRender();
      this.lines.geometry.setAttribute("position", new THREE.BufferAttribute(buffers.vertices, 3));
      this.lines.geometry.setAttribute("color", new THREE.BufferAttribute(buffers.colors, 4));
    } else {
      this.lines.visible = false;
    }
    this.renderer.render(this.scene, this.camera);
  }
  highlightedInstanceId() {
    return 7;
  }
  highlightCollider(handle) {
    if (handle == this.highlightedCollider)
      return;
    if (this.highlightedCollider != null) {
      const desc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(this.highlightedCollider);
      if (desc) {
        desc.highlighted = false;
        const instancedGroup = this.instancedMeshesGroups.get(desc.groupId);
        instancedGroup[this.highlightedInstanceId()].count = 0;
      }
    }
    if (handle != -1) {
      const desc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(handle);
      if (desc) {
        if (desc.indexInGroup != 0)
          desc.highlighted = true;
      }
    }
    this.highlightedCollider = handle;
  }
  updateCollidersPositions(world) {
    const tempObj = new THREE.Object3D();
    world.forEachCollider((collider) => {
      const translation = collider.translation();
      const rotation = collider.rotation();
      const instancedMeshDesc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(collider.handle);
      if (instancedMeshDesc != void 0) {
        const instancedGroup = this.instancedMeshesGroups.get(instancedMeshDesc.groupId);
        const instance = instancedGroup[instancedMeshDesc.indexInGroup];
        tempObj.position.set(translation.x, translation.y, translation.z);
        tempObj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        tempObj.scale.set(instancedMeshDesc.scale.x, instancedMeshDesc.scale.y, instancedMeshDesc.scale.z);
        tempObj.updateMatrix();
        instance.setMatrixAt(instancedMeshDesc.count, tempObj.matrix);
        const highlightInstance = instancedGroup[this.highlightedInstanceId()];
        if (instancedMeshDesc.highlighted) {
          highlightInstance.count = 1;
          highlightInstance.setMatrixAt(0, tempObj.matrix);
        }
        instance.instanceMatrix.needsUpdate = true;
        highlightInstance.instanceMatrix.needsUpdate = true;
      } else {
        const mesh = this.mapOfMeshesByColliderHandle.get(collider.handle);
        if (mesh == void 0) {
          ApgRprUtils.Assert(`$$333: We have an unmapped collider here! (${collider.handle})`);
        } else {
          mesh.position.set(translation.x, translation.y, translation.z);
          mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
          mesh.updateMatrix();
        }
      }
    });
  }
  reset() {
    for (const group of this.instancedMeshesGroups.values()) {
      for (const instance of group) {
        const userData = instance.userData;
        userData.isRprInstancedMesh = true;
        userData.mapOfCollidersAssocToThisInstancedMesh = /* @__PURE__ */ new Map();
        instance.count = 0;
      }
    }
    this.mapOfInstancedMeshDescriptorsByColliderHandle = /* @__PURE__ */ new Map();
    this.mapOfMeshesByColliderHandle.forEach((mesh) => {
      this.scene.remove(mesh);
    });
    this.mapOfMeshesByColliderHandle = /* @__PURE__ */ new Map();
    this.mapOfCollidersByRigidBodyHandle = /* @__PURE__ */ new Map();
    this.rng.reset();
  }
  removeRigidBody(arigidBody) {
    const colliders = this.mapOfCollidersByRigidBodyHandle.get(arigidBody.handle);
    if (colliders) {
      for (const collider of colliders) {
        this.removeCollider(collider);
      }
      this.mapOfCollidersByRigidBodyHandle.delete(arigidBody.handle);
    }
  }
  removeCollider(acollider) {
    const instancedMeshDesc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(acollider.handle);
    if (instancedMeshDesc == void 0) {
      const message = `Trying to remove the collider with handle (${acollider.handle}) but it hasn't a corrispondent descriptor`;
      alert(message);
    } else {
      this.mapOfInstancedMeshDescriptorsByColliderHandle.delete(acollider.handle);
      const instancedGroup = this.instancedMeshesGroups.get(instancedMeshDesc.groupId);
      const instancedMesh = instancedGroup[instancedMeshDesc.indexInGroup];
      if (instancedMesh.count > 1) {
        instancedMesh.count -= 1;
        const userData = instancedMesh.userData;
        const collAssocMap = userData.mapOfCollidersAssocToThisInstancedMesh;
        const collider = collAssocMap.get(instancedMeshDesc.colliderHandle);
        if (collider == void 0) {
          const message = `$$407: Trying to remove the collider with handle (${acollider.handle}) from the instanced mesh user data but it is not present in the map.`;
          alert(message);
        } else {
          collAssocMap.delete(instancedMeshDesc.colliderHandle);
        }
      }
    }
  }
  addCollider(acollider) {
    const rigidBodyParentOfCollider = acollider.parent();
    const palette = this.getPaletteByRigidBodyType(rigidBodyParentOfCollider);
    let colliders = this.mapOfCollidersByRigidBodyHandle.get(rigidBodyParentOfCollider.handle);
    if (colliders) {
      colliders.push(acollider);
    } else {
      colliders = [acollider];
      this.mapOfCollidersByRigidBodyHandle.set(rigidBodyParentOfCollider.handle, colliders);
    }
    const instanceDesc = {
      groupId: 0,
      indexInGroup: this.getInstanceIdByPalette(palette),
      colliderHandle: 0,
      count: 0,
      highlighted: false,
      scale: new THREE.Vector3(1, 1, 1)
    };
    let instance;
    switch (acollider.shapeType()) {
      case RAPIER.ShapeType.Cuboid: {
        const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.BOXES);
        instance = instancesGroups[instanceDesc.indexInGroup];
        instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.BOXES;
        const size = acollider.halfExtents();
        instanceDesc.scale = new THREE.Vector3(size.x * 2, size.y * 2, size.z * 2);
        break;
      }
      case RAPIER.ShapeType.Ball: {
        const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.BALLS);
        instance = instancesGroups[instanceDesc.indexInGroup];
        instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.BALLS;
        const radious = acollider.radius();
        instanceDesc.scale = new THREE.Vector3(radious, radious, radious);
        break;
      }
      case RAPIER.ShapeType.Cylinder:
      case RAPIER.ShapeType.RoundCylinder: {
        const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.CYLINDERS);
        instance = instancesGroups[instanceDesc.indexInGroup];
        instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.CYLINDERS;
        const radious = acollider.radius();
        const height = acollider.halfHeight() * 2;
        instanceDesc.scale = new THREE.Vector3(radious, height, radious);
        break;
      }
      case RAPIER.ShapeType.Cone: {
        const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.CONES);
        instance = instancesGroups[instanceDesc.indexInGroup];
        instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.CONES;
        const radious = acollider.radius();
        const height = acollider.halfHeight() * 2;
        instanceDesc.scale = new THREE.Vector3(radious, height, radious);
        break;
      }
      case RAPIER.ShapeType.Capsule: {
        const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.CAPSULES);
        instance = instancesGroups[instanceDesc.indexInGroup];
        instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.CAPSULES;
        const radious = acollider.radius();
        const height = acollider.halfHeight();
        instanceDesc.scale = new THREE.Vector3(radious, height, radious);
        break;
      }
      case RAPIER.ShapeType.TriMesh:
      case RAPIER.ShapeType.HeightField:
      case RAPIER.ShapeType.ConvexPolyhedron:
      case RAPIER.ShapeType.RoundConvexPolyhedron: {
        const geometry = new THREE.BufferGeometry();
        let vertices;
        let indices;
        if (acollider.shapeType() != RAPIER.ShapeType.HeightField) {
          vertices = acollider.vertices();
          indices = acollider.indices();
        } else {
          const heightFieldGeomData = ApgRprUtils.GetHeightfieldGeometryDataByHeightFieldColliderData(acollider);
          vertices = heightFieldGeomData.vertices;
          indices = heightFieldGeomData.indices;
        }
        geometry.setIndex(Array.from(indices));
        geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        const colorIndex = Math.trunc(this.rng.next() * palette.colors.length);
        const color = palette.colors[colorIndex];
        const material = new THREE.MeshPhongMaterial({
          color,
          side: THREE.DoubleSide,
          flatShading: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.layers.set(ApgWglLayers.meshColliders);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.mapOfMeshesByColliderHandle.set(acollider.handle, mesh);
        return;
      }
      default:
        console.log("Unknown shape to render.");
        break;
    }
    if (instance) {
      instanceDesc.colliderHandle = acollider.handle;
      const userData = instance.userData;
      userData.mapOfCollidersAssocToThisInstancedMesh.set(acollider.handle, acollider);
      const collTransl = acollider.translation();
      const collRot = acollider.rotation();
      const tempObj = new THREE.Object3D();
      tempObj.position.set(collTransl.x, collTransl.y, collTransl.z);
      tempObj.quaternion.set(collRot.x, collRot.y, collRot.z, collRot.w);
      tempObj.scale.set(instanceDesc.scale.x, instanceDesc.scale.y, instanceDesc.scale.z);
      tempObj.updateMatrix();
      instanceDesc.count = instance.count;
      instance.setMatrixAt(instanceDesc.count, tempObj.matrix);
      instance.instanceMatrix.needsUpdate = true;
      this.mapOfInstancedMeshDescriptorsByColliderHandle.set(acollider.handle, instanceDesc);
      instance.count += 1;
    }
  }
  getInstanceIdByPalette(palette) {
    const instanceId = Math.trunc(this.rng.next() * palette.colors.length) + palette.offset;
    return instanceId;
  }
  getPaletteByRigidBodyType(rigidBodyParentOfCollider) {
    let paletteIndex;
    if (rigidBodyParentOfCollider.isFixed()) {
      paletteIndex = 0 /* FIXED */;
    } else if (rigidBodyParentOfCollider.isKinematic()) {
      paletteIndex = 1 /* KINEMATIC */;
    } else if (rigidBodyParentOfCollider.isCcdEnabled()) {
      paletteIndex = 3 /* CCD_ENABLED */;
    } else {
      paletteIndex = 2 /* DYNAMIC */;
    }
    const palette = this.collidersPalette.get(paletteIndex);
    return palette;
  }
}
