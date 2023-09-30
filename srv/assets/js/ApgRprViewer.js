import { THREE, PRANDO, RAPIER } from "./ApgRprDeps.ts";
import { ApgRprUtils } from "./ApgRprUtils.ts";
import { eApgRpr_InstancedMeshesGroups } from "./ApgRprEnums.ts";
import { ApgWglLayers, ApgWglViewer } from "./ApgWglViewer.ts";
import { ApgUtils } from "./ApgUtils.ts";
var eApgRprCollidersColorPalette = /* @__PURE__ */ ((eApgRprCollidersColorPalette2) => {
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["FIXED"] = 0] = "FIXED";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["KINEMATIC"] = 1] = "KINEMATIC";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["DYNAMIC"] = 2] = "DYNAMIC";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["CCD_ENABLED"] = 3] = "CCD_ENABLED";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["SENSOR"] = 4] = "SENSOR";
  eApgRprCollidersColorPalette2[eApgRprCollidersColorPalette2["HIGHLIGHTED"] = 5] = "HIGHLIGHTED";
  return eApgRprCollidersColorPalette2;
})(eApgRprCollidersColorPalette || {});
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
  constructor(awindow, adocument, aviewerElement) {
    super(awindow, adocument, aviewerElement);
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
  updateAndRender(aworld, aisDebugMode) {
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
    this.render();
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
        ApgUtils.Assert(
          mesh != void 0,
          `$$257: We have an unmapped collider here! (${collider.handle}), where does it come from?`
        );
        mesh.position.set(translation.x, translation.y, translation.z);
        mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        mesh.updateMatrix();
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