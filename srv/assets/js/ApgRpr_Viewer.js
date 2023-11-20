import {
  PRANDO,
  RAPIER
} from "./ApgRpr_Deps.ts";
import {
  THREE
} from "./apg-wgl/lib/ApgWgl_Deps.ts";
import {
  ApgRpr_Utils
} from "./ApgRpr_Utils.ts";
import {
  ApgWgl_Layers,
  ApgWgl_Viewer
} from "./apg-wgl/lib/classes/ApgWgl_Viewer.ts";
import {
  ApgUts
} from "./ApgUts.ts";
export var ApgRpr_eInstancedMeshType = /* @__PURE__ */ ((ApgRpr_eInstancedMeshType2) => {
  ApgRpr_eInstancedMeshType2["UNDEFINED"] = "NDFD";
  ApgRpr_eInstancedMeshType2["CUBOIDS"] = "CBDS";
  ApgRpr_eInstancedMeshType2["ROUNDED_CUBOIDS"] = "RCBDS";
  ApgRpr_eInstancedMeshType2["BALLS"] = "BLLS";
  ApgRpr_eInstancedMeshType2["CYLINDERS"] = "CYLS";
  ApgRpr_eInstancedMeshType2["ROUNDED_CYLINDERS"] = "RCYLS";
  ApgRpr_eInstancedMeshType2["CONES"] = "CNS";
  ApgRpr_eInstancedMeshType2["ROUNDEND_CONES"] = "RCNS";
  ApgRpr_eInstancedMeshType2["CAPSULES"] = "CPLS";
  return ApgRpr_eInstancedMeshType2;
})(ApgRpr_eInstancedMeshType || {});
export class ApgRpr_Layers extends ApgWgl_Layers {
  static meshColliders = 20;
  static instancedColliders = 21;
  static characters = 25;
}
export class ApgRpr_Viewer extends ApgWgl_Viewer {
  // Maximum count of colliders mesh instances
  COLLIDERS_MESH_INSTANCES_MAX = 2e3;
  /** Collections used to relate colliders and rigidbodies with meshes */
  mapOfInstancedMeshDescriptorsByColliderHandle;
  mapOfMeshesByColliderHandle;
  // TODO What is this used for??? --APG 20231119
  mapOfCollidersByRigidBodyHandle;
  /** Colors for the instanced colliders meshes */
  //collidersPalette: Map<ApgRpr_eCollidersColorPalette, { colors: number[], offset: number }>;
  /** Random generator */
  rng;
  /** Is used for highlighing the colliders that are picked with the mouse */
  lines;
  /** Index of the current highlighted collider NOT USED!!  */
  highlightedCollider;
  /** Set of reusable instanced meshes used to represent the standard colliders */
  instancedMeshes;
  /** To log data properly */
  static RPR_VIEWER_LOGGER_NAME = "Rapier Viewer";
  constructor(awindow, adocument, aviewerElement, alogger, asceneSize) {
    super(awindow, adocument, aviewerElement, alogger, asceneSize);
    this.logger.addLogger(ApgRpr_Viewer.RPR_VIEWER_LOGGER_NAME);
    this.rng = new PRANDO("ApgRprThreeViewer");
    this.mapOfInstancedMeshDescriptorsByColliderHandle = /* @__PURE__ */ new Map();
    this.mapOfMeshesByColliderHandle = /* @__PURE__ */ new Map();
    this.mapOfCollidersByRigidBodyHandle = /* @__PURE__ */ new Map();
    this.instancedMeshes = /* @__PURE__ */ new Map();
    this.#initInstanceMeshesGroups();
    this.highlightedCollider = -1;
    const material = new THREE.LineBasicMaterial({
      color: 16777215,
      vertexColors: true
    });
    const geometry = new THREE.BufferGeometry();
    this.lines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.lines);
    this.logger.devLog("Constructor has built", ApgRpr_Viewer.RPR_VIEWER_LOGGER_NAME);
  }
  #initInstanceMeshesGroups() {
    this.#buildInstancedMesh("CBDS" /* CUBOIDS */, this.COLLIDERS_MESH_INSTANCES_MAX);
    this.#buildInstancedMesh("BLLS" /* BALLS */, this.COLLIDERS_MESH_INSTANCES_MAX);
    this.#buildInstancedMesh("CYLS" /* CYLINDERS */, this.COLLIDERS_MESH_INSTANCES_MAX);
    this.#buildInstancedMesh("CNS" /* CONES */, this.COLLIDERS_MESH_INSTANCES_MAX);
    this.#buildInstancedMesh("CPLS" /* CAPSULES */, this.COLLIDERS_MESH_INSTANCES_MAX);
    this.logger.devLog("Instanced meshes was build ", ApgRpr_Viewer.RPR_VIEWER_LOGGER_NAME);
  }
  #buildInstancedMesh(atype, amaxInstances) {
    let geometry;
    switch (atype) {
      case "CBDS" /* CUBOIDS */:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case "RCBDS" /* ROUNDED_CUBOIDS */:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case "BLLS" /* BALLS */:
        geometry = new THREE.SphereGeometry(0.5);
        break;
      case "CYLS" /* CYLINDERS */:
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1);
        break;
      case "RCYLS" /* ROUNDED_CYLINDERS */:
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1);
        break;
      case "CNS" /* CONES */:
        geometry = new THREE.ConeGeometry(0.5, 1, 16, 1);
        break;
      case "RCNS" /* ROUNDEND_CONES */:
        geometry = new THREE.ConeGeometry(0.5, 1, 16, 1);
        break;
      case "CPLS" /* CAPSULES */:
        geometry = new THREE.CapsuleGeometry(0.25, 0.5, 4, 16);
        break;
    }
    const material = new THREE.MeshStandardMaterial({
      color: 16777215,
      flatShading: false
    });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, amaxInstances);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMesh.layers.set(ApgRpr_Layers.instancedColliders);
    instancedMesh.count = 0;
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const userData = instancedMesh.userData;
    userData.isRprInstancedMesh = true;
    userData.mapOfCollidersAssocToThisInstancedMesh = /* @__PURE__ */ new Map();
    this.instancedMeshes.set(atype, instancedMesh);
    this.scene.add(instancedMesh);
  }
  /**
   * Renders the three scene of the current Rapier world
   */
  updateAndRender(aworld, aisDebugMode) {
    ApgRpr_Viewer.renderCalls++;
    this.orbitControls.update();
    this.camLight.position.set(
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z
    );
    this.updateCollidersPositions(aworld);
    if (aisDebugMode) {
      this.lines.visible = true;
      const buffers = aworld.debugRender();
      this.lines.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(buffers.vertices, 3)
      );
      this.lines.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(buffers.colors, 4)
      );
    } else {
      this.lines.visible = false;
    }
    this.render();
  }
  updateCollidersPositions(aworld) {
    const tempObj = new THREE.Object3D();
    aworld.forEachCollider((collider) => {
      const translation = collider.translation();
      const rotation = collider.rotation();
      const instancedMeshDesc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(collider.handle);
      if (instancedMeshDesc != void 0) {
        const instance = this.instancedMeshes.get(instancedMeshDesc.type);
        instance.setColorAt(instancedMeshDesc.index, instancedMeshDesc.colliderColor.color);
        tempObj.position.set(translation.x, translation.y, translation.z);
        tempObj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        tempObj.scale.set(instancedMeshDesc.scale.x, instancedMeshDesc.scale.y, instancedMeshDesc.scale.z);
        tempObj.updateMatrix();
        instance.setMatrixAt(instancedMeshDesc.index, tempObj.matrix);
        instance.instanceMatrix.needsUpdate = true;
      } else {
        const mesh = this.mapOfMeshesByColliderHandle.get(collider.handle);
        ApgUts.Assert(
          mesh != void 0,
          `$$345: We have an unmapped collider here! (${collider.handle}), where does it come from?`
        );
        mesh.position.set(translation.x, translation.y, translation.z);
        mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        mesh.updateMatrix();
      }
    });
  }
  reset() {
    for (const instance of this.instancedMeshes.values()) {
      const userData = instance.userData;
      userData.isRprInstancedMesh = true;
      userData.mapOfCollidersAssocToThisInstancedMesh = /* @__PURE__ */ new Map();
      instance.count = 0;
    }
    this.mapOfInstancedMeshDescriptorsByColliderHandle = /* @__PURE__ */ new Map();
    this.mapOfMeshesByColliderHandle.forEach((mesh) => {
      this.scene.remove(mesh);
    });
    this.mapOfMeshesByColliderHandle = /* @__PURE__ */ new Map();
    this.mapOfCollidersByRigidBodyHandle = /* @__PURE__ */ new Map();
    this.rng.reset();
  }
  #removeOrphanedChildsFromScene() {
    while (this.scene.children.length > 0) {
      const obj3D = this.scene.children[0];
      const message = `Removing orphaned object id[${obj3D.id}] name[${obj3D.name}] from scene`;
      this.logger.devLog(message, ApgRpr_Viewer.RPR_VIEWER_LOGGER_NAME, true);
      this.scene.remove(obj3D);
    }
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
      const instancedMesh = this.instancedMeshes.get(instancedMeshDesc.type);
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
  #isInstacedMeshCollider(acollider) {
    const st = acollider.shapeType();
    if (st == RAPIER.ShapeType.TriMesh || st == RAPIER.ShapeType.HeightField || st == RAPIER.ShapeType.ConvexPolyhedron || st == RAPIER.ShapeType.RoundConvexPolyhedron) {
      return false;
    }
    return true;
  }
  addCollider(acollider) {
    const rigidBodyParentOfCollider = acollider.parent();
    let colliders = this.mapOfCollidersByRigidBodyHandle.get(rigidBodyParentOfCollider.handle);
    if (colliders) {
      colliders.push(acollider);
    } else {
      colliders = [acollider];
      this.mapOfCollidersByRigidBodyHandle.set(rigidBodyParentOfCollider.handle, colliders);
    }
    if (this.#isInstacedMeshCollider(acollider)) {
      const instanceDesc = {
        type: "NDFD" /* UNDEFINED */,
        index: 0,
        scale: new THREE.Vector3(1, 1, 1),
        colliderHandle: 0,
        colliderColor: new ApgRpr_ColliderColor(acollider, this.rng)
      };
      let instancedMesh = void 0;
      const shapeType = acollider.shapeType();
      switch (shapeType) {
        case RAPIER.ShapeType.RoundCuboid:
        case RAPIER.ShapeType.Cuboid: {
          instancedMesh = this.instancedMeshes.get("CBDS" /* CUBOIDS */);
          instanceDesc.type = "CBDS" /* CUBOIDS */;
          const size = acollider.halfExtents();
          instanceDesc.scale = new THREE.Vector3(size.x * 2, size.y * 2, size.z * 2);
          break;
        }
        case RAPIER.ShapeType.Ball: {
          instancedMesh = this.instancedMeshes.get("BLLS" /* BALLS */);
          instanceDesc.type = "BLLS" /* BALLS */;
          const radious = acollider.radius();
          instanceDesc.scale = new THREE.Vector3(radious * 2, radious * 2, radious * 2);
          break;
        }
        case RAPIER.ShapeType.RoundCylinder:
        case RAPIER.ShapeType.Cylinder: {
          instancedMesh = this.instancedMeshes.get("CYLS" /* CYLINDERS */);
          instanceDesc.type = "CYLS" /* CYLINDERS */;
          const radious = acollider.radius();
          const height = acollider.halfHeight() * 2;
          instanceDesc.scale = new THREE.Vector3(radious * 2, height, radious * 2);
          break;
        }
        case RAPIER.ShapeType.RoudedCone:
        case RAPIER.ShapeType.Cone: {
          instancedMesh = this.instancedMeshes.get("CNS" /* CONES */);
          instanceDesc.type = "CNS" /* CONES */;
          const radious = acollider.radius();
          const height = acollider.halfHeight() * 2;
          instanceDesc.scale = new THREE.Vector3(radious * 2, height, radious * 2);
          break;
        }
        case RAPIER.ShapeType.Capsule: {
          instancedMesh = this.instancedMeshes.get("CPLS" /* CAPSULES */);
          instanceDesc.type = "CPLS" /* CAPSULES */;
          const radious = acollider.radius();
          const height = acollider.halfHeight();
          instanceDesc.scale = new THREE.Vector3(radious * 4, height * 4, radious * 4);
          break;
        }
        default:
          console.log("Unknown shape to render.");
          break;
      }
      if (instancedMesh) {
        instanceDesc.index = instancedMesh.count;
        instanceDesc.colliderHandle = acollider.handle;
        const collTransl = acollider.translation();
        const collRot = acollider.rotation();
        const tempObj = new THREE.Object3D();
        tempObj.position.set(collTransl.x, collTransl.y, collTransl.z);
        tempObj.quaternion.set(collRot.x, collRot.y, collRot.z, collRot.w);
        tempObj.scale.set(instanceDesc.scale.x, instanceDesc.scale.y, instanceDesc.scale.z);
        tempObj.updateMatrix();
        instancedMesh.setMatrixAt(instanceDesc.index, tempObj.matrix);
        instancedMesh.instanceMatrix.needsUpdate = true;
        this.mapOfInstancedMeshDescriptorsByColliderHandle.set(acollider.handle, instanceDesc);
        instancedMesh.count += 1;
      }
    } else {
      switch (acollider.shapeType()) {
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
            const heightFieldGeomData = ApgRpr_Utils.GetHeightfieldGeometryDataByHeightFieldColliderData(acollider);
            vertices = heightFieldGeomData.vertices;
            indices = heightFieldGeomData.indices;
          }
          geometry.setIndex(Array.from(indices));
          geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
          const colliderColor = new ApgRpr_ColliderColor(acollider, this.rng);
          const material = new THREE.MeshStandardMaterial({
            color: colliderColor.color,
            side: THREE.DoubleSide,
            flatShading: true
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.layers.set(ApgRpr_Layers.meshColliders);
          this.scene.add(mesh);
          this.mapOfMeshesByColliderHandle.set(acollider.handle, mesh);
          return;
        }
        default:
          console.log("Unknown shape to render.");
          break;
      }
    }
  }
}
export class ApgRpr_ColliderColor {
  _baseColor;
  get color() {
    return this.getColor();
  }
  _collider;
  _body;
  UNKNOWN_BASE_COLOR = 65280;
  STATIC_BASE_COLOR = 7352320;
  DYNAMIC_BASE_COLOR = 12352;
  KINEMATIC_BASE_COLOR = 4160;
  IS_ACTIVE_GRADIENT = 2105376;
  IS_ENABLED_COLOR_GRADIENT = 2105376;
  IS_CCD_ENABLED_COLOR_GRADIENT = 2105344;
  IS_SENSOR_COLOR_GRADIENT = 4194304;
  constructor(acollider, arng) {
    this._collider = acollider;
    this._body = this._collider.parent();
    this._baseColor = this.#getRandomizedGradient(arng);
  }
  getColor() {
    let color;
    if (this._body.isDynamic()) {
      color = this._baseColor + this.DYNAMIC_BASE_COLOR;
    } else if (this._body.isKinematic()) {
      color = this._baseColor + this.KINEMATIC_BASE_COLOR;
    } else if (this._body.isFixed()) {
      color = this._baseColor + this.STATIC_BASE_COLOR;
    } else {
      color = this._baseColor + this.UNKNOWN_BASE_COLOR;
    }
    if (this._collider.isEnabled()) {
      color += this.IS_ENABLED_COLOR_GRADIENT;
    }
    if (this._body.isSleeping()) {
      color -= this.IS_ACTIVE_GRADIENT;
    }
    if (this._body.isCcdEnabled()) {
      color += this.IS_CCD_ENABLED_COLOR_GRADIENT;
    }
    if (this._collider.isSensor()) {
      color += this.IS_SENSOR_COLOR_GRADIENT;
    }
    const r = new THREE.Color(color);
    return r;
  }
  #getRandomizedGradient(arng) {
    const r = Math.floor(arng.next() * 64);
    return r + r * 256 + r * 65536;
  }
}
