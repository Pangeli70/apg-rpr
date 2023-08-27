import { THREE, THREE_OrbitControls, PRANDO, RAPIER } from "./ApgRprDeps.ts";
import { ApgRprUtils } from "./ApgRprUtils.ts";
import { eApgRprInstancedMeshesGroup } from "./ApgRprEnums.ts";
var eApgRprCollidersColorPalette = /* @__PURE__ */ ((eApgRprCollidersColorPalette2) => {
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["FIXED"] = 0] = "FIXED";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["KINEMATIC"] = 1] = "KINEMATIC";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["DYNAMIC"] = 2] = "DYNAMIC";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["CCD_ENABLED"] = 3] = "CCD_ENABLED";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["SENSOR"] = 4] = "SENSOR";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["HIGHLIGHTED"] = 5] = "HIGHLIGHTED";
  return eApgRprCollidersColorPalette2;
})(eApgRprCollidersColorPalette || {});
export class ApgRprThreeViewer {
  /** We don't like global objects */
  window;
  /** We don't like global objects */
  document;
  /** Dom objects for THREE.js */
  container;
  canvas;
  toolbar;
  panels;
  // Maximum count of mesh instances
  MAX_INSTANCES = 250;
  /** Collections used to relate colliders with meshes */
  instancedMeshDescByColliderHandleMap;
  meshesByColliderHandleMap;
  collidersByRigidBodyHandleMap;
  /** Colors for the instanced colliders meshes */
  colorPalette;
  /** THREE stuff */
  renderer;
  scene;
  camera;
  controls;
  light;
  // Keep track of the render calls to THREE.Render
  static renderCalls = 0;
  rng;
  /** Is used for highlighing the colliders that are picked with the mouse */
  lines;
  /** Used for picking the colliders */
  raycaster;
  /** Index of the current highlighted collider */
  highlightedCollider;
  /** Set of reusable meshes used to represent the standard colliders */
  instancedMeshesGroups;
  constructor(awindow, adocument) {
    this.window = awindow;
    this.document = adocument;
    const viewerHeight = `${this.window.innerHeight * 0.95}px`;
    this.container = this.document.getElementById("ApgRprViewerContainer");
    this.container.style.width = "80%";
    this.container.style.height = viewerHeight;
    this.canvas = this.document.createElement("canvas");
    this.canvas.id = "ApgWglRprViewerCanvas";
    this.container.appendChild(this.canvas);
    this.toolbar = this.document.getElementById("ApgRprViewerToolbar");
    this.toolbar.style.width = "20%";
    this.toolbar.style.height = viewerHeight;
    this.panels = this.document.getElementById("ApgRprViewerToolbarPanels");
    this.rng = new PRANDO("ApgRprThreeViewer");
    this.instancedMeshDescByColliderHandleMap = /* @__PURE__ */ new Map();
    this.meshesByColliderHandleMap = /* @__PURE__ */ new Map();
    this.collidersByRigidBodyHandleMap = /* @__PURE__ */ new Map();
    this.colorPalette = /* @__PURE__ */ new Map();
    this.colorPalette.set(0 /* FIXED */, { colors: [16766080], offset: 0 });
    this.colorPalette.set(1 /* KINEMATIC */, { colors: [4210879], offset: 1 });
    this.colorPalette.set(2 /* DYNAMIC */, { colors: [1520463, 2709897, 5147850, 12900845], offset: 2 });
    this.colorPalette.set(3 /* CCD_ENABLED */, { colors: [16776960], offset: 6 });
    this.colorPalette.set(4 /* SENSOR */, { colors: [65280], offset: 7 });
    this.colorPalette.set(5 /* HIGHLIGHTED */, { colors: [16711680], offset: 8 });
    this.scene = new THREE.Scene();
    const aspectRatio = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1e3);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(2697513, 1);
    const pixelRatio = this.window.devicePixelRatio ? Math.min(this.window.devicePixelRatio, 1.5) : 1;
    this.renderer.setPixelRatio(pixelRatio);
    const ambientLight = new THREE.AmbientLight(6316128);
    this.scene.add(ambientLight);
    this.light = new THREE.PointLight(16777215, 1, 1e3);
    this.light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    this.scene.add(this.light);
    this.raycaster = new THREE.Raycaster();
    this.highlightedCollider = -1;
    {
      const material = new THREE.LineBasicMaterial({
        color: 16777215,
        vertexColors: true
      });
      const geometry = new THREE.BufferGeometry();
      this.lines = new THREE.LineSegments(geometry, material);
      this.scene.add(this.lines);
    }
    this.window.addEventListener("resize", () => {
      this.resize();
    }, false);
    this.controls = new THREE_OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.2;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.instancedMeshesGroups = /* @__PURE__ */ new Map();
    this.initInstancesByGroupAndPalette();
  }
  resize() {
    if (this.camera) {
      const viewerHeight = `${this.window.innerHeight * 0.95}px`;
      this.container.style.height = viewerHeight;
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
  }
  initInstancesByGroupAndPalette() {
    this.buildInstancesByPalette(eApgRprInstancedMeshesGroup.BOXES);
    this.buildInstancesByPalette(eApgRprInstancedMeshesGroup.BALLS);
    this.buildInstancesByPalette(eApgRprInstancedMeshesGroup.CYLINDERS);
    this.buildInstancesByPalette(eApgRprInstancedMeshesGroup.CONES);
    this.buildInstancesByPalette(eApgRprInstancedMeshesGroup.CAPSULES);
    this.instancedMeshesGroups.forEach((group) => {
      group.forEach((instance) => {
        instance.userData.elementId2coll = /* @__PURE__ */ new Map();
        instance.count = 0;
        instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(instance);
      });
    });
  }
  buildInstancesByPalette(agroup) {
    const group = [];
    let geometry;
    switch (agroup) {
      case eApgRprInstancedMeshesGroup.BOXES:
        geometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case eApgRprInstancedMeshesGroup.BALLS:
        geometry = new THREE.SphereGeometry(1);
        break;
      case eApgRprInstancedMeshesGroup.CYLINDERS:
        geometry = new THREE.CylinderGeometry(1, 1, 1);
        break;
      case eApgRprInstancedMeshesGroup.CONES:
        geometry = new THREE.ConeGeometry(1, 1);
        break;
      case eApgRprInstancedMeshesGroup.CAPSULES:
        geometry = new THREE.CapsuleGeometry(1, 1, 4, 16);
        break;
    }
    for (const type of this.colorPalette.keys()) {
      for (const color of this.colorPalette.get(type).colors) {
        const material = new THREE.MeshPhongMaterial({
          color,
          flatShading: false
        });
        const instancedMesh = new THREE.InstancedMesh(geometry, material, this.MAX_INSTANCES);
        group.push(instancedMesh);
      }
    }
    this.instancedMeshesGroups.set(agroup, group);
  }
  render(aworld, aisDebugMode) {
    ApgRprThreeViewer.renderCalls += 1;
    this.controls.update();
    this.light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    if (aisDebugMode) {
      const buffers = aworld.debugRender();
      this.lines.visible = true;
      this.lines.geometry.setAttribute("position", new THREE.BufferAttribute(buffers.vertices, 3));
      this.lines.geometry.setAttribute("color", new THREE.BufferAttribute(buffers.colors, 4));
    } else {
      this.lines.visible = false;
    }
    this.updatePositions(aworld);
    this.renderer.render(this.scene, this.camera);
  }
  rayAtMousePosition(pos) {
    this.raycaster.setFromCamera(pos, this.camera);
    return this.raycaster.ray;
  }
  setCamera(acameraPosition) {
    this.camera.position.set(acameraPosition.eye.x, acameraPosition.eye.y, acameraPosition.eye.z);
    this.controls.target.set(acameraPosition.target.x, acameraPosition.target.y, acameraPosition.target.z);
    this.controls.update();
  }
  highlightedInstanceId() {
    return 7;
  }
  highlightCollider(handle) {
    if (handle == this.highlightedCollider)
      return;
    if (this.highlightedCollider != null) {
      const desc = this.instancedMeshDescByColliderHandleMap.get(this.highlightedCollider);
      if (desc) {
        desc.highlighted = false;
        const instancedGroup = this.instancedMeshesGroups.get(desc.groupId);
        instancedGroup[this.highlightedInstanceId()].count = 0;
      }
    }
    if (handle != -1) {
      const desc = this.instancedMeshDescByColliderHandleMap.get(handle);
      if (desc) {
        if (desc.instanceId != 0)
          desc.highlighted = true;
      }
    }
    this.highlightedCollider = handle;
  }
  updatePositions(world) {
    const tempObj = new THREE.Object3D();
    world.forEachCollider((collider) => {
      const instancedMeshDesc = this.instancedMeshDescByColliderHandleMap.get(collider.handle);
      const translation = collider.translation();
      const rotation = collider.rotation();
      if (instancedMeshDesc) {
        const instancedGroup = this.instancedMeshesGroups.get(instancedMeshDesc.groupId);
        const instance = instancedGroup[instancedMeshDesc.instanceId];
        tempObj.scale.set(instancedMeshDesc.scale.x, instancedMeshDesc.scale.y, instancedMeshDesc.scale.z);
        tempObj.position.set(translation.x, translation.y, translation.z);
        tempObj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        tempObj.updateMatrix();
        instance.setMatrixAt(instancedMeshDesc.elementId, tempObj.matrix);
        const highlightInstance = instancedGroup[this.highlightedInstanceId()];
        if (instancedMeshDesc.highlighted) {
          highlightInstance.count = 1;
          highlightInstance.setMatrixAt(0, tempObj.matrix);
        }
        instance.instanceMatrix.needsUpdate = true;
        highlightInstance.instanceMatrix.needsUpdate = true;
      }
      const mesh = this.meshesByColliderHandleMap.get(collider.handle);
      if (mesh) {
        mesh.position.set(translation.x, translation.y, translation.z);
        mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        mesh.updateMatrix();
      }
    });
  }
  reset() {
    for (const group of this.instancedMeshesGroups.values()) {
      for (const instance of group) {
        instance.userData.elementId2coll = /* @__PURE__ */ new Map();
        instance.count = 0;
      }
    }
    this.rng.reset();
    this.meshesByColliderHandleMap.forEach((mesh) => {
      this.scene.remove(mesh);
    });
    this.meshesByColliderHandleMap = /* @__PURE__ */ new Map();
    this.instancedMeshDescByColliderHandleMap = /* @__PURE__ */ new Map();
    this.collidersByRigidBodyHandleMap = /* @__PURE__ */ new Map();
  }
  removeRigidBody(arigidBody) {
    const colliders = this.collidersByRigidBodyHandleMap.get(arigidBody.handle);
    if (colliders) {
      for (const collider of colliders) {
        this.removeCollider(collider);
      }
      this.collidersByRigidBodyHandleMap.delete(arigidBody.handle);
    }
  }
  removeCollider(collider) {
    const instancedMeshDesc = this.instancedMeshDescByColliderHandleMap.get(collider.handle);
    if (instancedMeshDesc) {
      const instancesGroup = this.instancedMeshesGroups.get(instancedMeshDesc.groupId);
      const instancedMesh = instancesGroup[instancedMeshDesc.instanceId];
      if (instancedMesh.count > 1) {
        const coll2 = instancedMesh.userData.elementId2coll.get(instancedMesh.count - 1);
        instancedMesh.userData.elementId2coll.delete(instancedMesh.count - 1);
        instancedMesh.userData.elementId2coll.set(instancedMeshDesc.elementId, coll2);
        const gfx2 = this.instancedMeshDescByColliderHandleMap.get(coll2.handle);
        if (gfx2) {
          gfx2.elementId = instancedMeshDesc.elementId;
        }
      }
      instancedMesh.count -= 1;
      this.instancedMeshDescByColliderHandleMap.delete(collider.handle);
    }
  }
  addCollider(acollider) {
    const rigidBodyParentOfCollider = acollider.parent();
    const palette = this.getPaletteByRigidBodyType(rigidBodyParentOfCollider);
    let colliders = this.collidersByRigidBodyHandleMap.get(rigidBodyParentOfCollider.handle);
    if (colliders) {
      colliders.push(acollider);
    } else {
      colliders = [acollider];
      this.collidersByRigidBodyHandleMap.set(rigidBodyParentOfCollider.handle, colliders);
    }
    const instanceDesc = {
      groupId: 0,
      instanceId: this.getInstanceIdByPalette(palette),
      elementId: 0,
      highlighted: false,
      scale: new THREE.Vector3(1, 1, 1)
    };
    let instance;
    switch (acollider.shapeType()) {
      case RAPIER.ShapeType.Cuboid: {
        const size = acollider.halfExtents();
        const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.BOXES);
        instance = instancesGroups[instanceDesc.instanceId];
        instanceDesc.groupId = eApgRprInstancedMeshesGroup.BOXES;
        instanceDesc.scale = new THREE.Vector3(size.x, size.y, size.z);
        break;
      }
      case RAPIER.ShapeType.Ball: {
        const radious = acollider.radius();
        const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.BALLS);
        instance = instancesGroups[instanceDesc.instanceId];
        instanceDesc.groupId = eApgRprInstancedMeshesGroup.BALLS;
        instanceDesc.scale = new THREE.Vector3(radious, radious, radious);
        break;
      }
      case RAPIER.ShapeType.Cylinder:
      case RAPIER.ShapeType.RoundCylinder: {
        const radious = acollider.radius();
        const height = acollider.halfHeight() * 2;
        const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.CYLINDERS);
        instance = instancesGroups[instanceDesc.instanceId];
        instanceDesc.groupId = eApgRprInstancedMeshesGroup.CYLINDERS;
        instanceDesc.scale = new THREE.Vector3(radious, height, radious);
        break;
      }
      case RAPIER.ShapeType.Cone: {
        const radious = acollider.radius();
        const height = acollider.halfHeight() * 2;
        const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.CONES);
        instance = instancesGroups[instanceDesc.instanceId];
        instanceDesc.groupId = eApgRprInstancedMeshesGroup.CONES;
        instanceDesc.scale = new THREE.Vector3(radious, height, radious);
        break;
      }
      case RAPIER.ShapeType.Capsule: {
        const radious = acollider.radius();
        const height = acollider.halfHeight();
        const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.CAPSULES);
        instance = instancesGroups[instanceDesc.instanceId];
        instanceDesc.groupId = eApgRprInstancedMeshesGroup.CAPSULES;
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
        this.scene.add(mesh);
        this.meshesByColliderHandleMap.set(acollider.handle, mesh);
        return;
      }
      default:
        console.log("Unknown shape to render.");
        break;
    }
    if (instance) {
      instanceDesc.elementId = instance.count;
      instance.userData.elementId2coll.set(instance.count, acollider);
      instance.count += 1;
      const collTransl = acollider.translation();
      const collRot = acollider.rotation();
      const tempObj = new THREE.Object3D();
      tempObj.position.set(collTransl.x, collTransl.y, collTransl.z);
      tempObj.quaternion.set(collRot.x, collRot.y, collRot.z, collRot.w);
      tempObj.scale.set(instanceDesc.scale.x, instanceDesc.scale.y, instanceDesc.scale.z);
      tempObj.updateMatrix();
      instance.setMatrixAt(instanceDesc.elementId, tempObj.matrix);
      instance.instanceMatrix.needsUpdate = true;
      this.instancedMeshDescByColliderHandleMap.set(acollider.handle, instanceDesc);
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
    const palette = this.colorPalette.get(paletteIndex);
    return palette;
  }
}
