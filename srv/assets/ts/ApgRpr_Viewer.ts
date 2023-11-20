/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/


//--------------------------------------------------------------------------
// #region Imports


import {
    PRANDO,
    RAPIER,
} from './ApgRpr_Deps.ts';

import {
    THREE
} from './apg-wgl/lib/ApgWgl_Deps.ts';

import {
    ApgRpr_Utils
} from "./ApgRpr_Utils.ts";

import {
    ApgGui_IBrowserWindow,
    ApgGui_IDocument,
    ApgGui_IElement
} from './apg-gui/lib/interfaces/ApgGui_Dom.ts';

import {
    ApgWgl_Layers,
    ApgWgl_Viewer
} from "./apg-wgl/lib/classes/ApgWgl_Viewer.ts";

import {
    ApgUts
} from "./ApgUts.ts";
import { ApgGui_Logger } from "./apg-gui/lib/classes/ApgGui_Logger.ts";



// #endregion
//--------------------------------------------------------------------------



interface ApgRpr_IInstancedMeshUserData {
    isRprInstancedMesh: boolean;
    mapOfCollidersAssocToThisInstancedMesh: Map<number, RAPIER.Collider>;
}



export enum ApgRpr_eInstancedMeshType {
    UNDEFINED = "NDFD",
    CUBOIDS = "CBDS",
    ROUNDED_CUBOIDS = "RCBDS",
    BALLS = "BLLS",
    CYLINDERS = "CYLS",
    ROUNDED_CYLINDERS = "RCYLS",
    CONES = "CNS",
    ROUNDEND_CONES = "RCNS",
    CAPSULES = "CPLS",
}



export interface ApgRpr_IEntity {
    collider: RAPIER.Collider,
    body: RAPIER.RigidBody,
    mesh: THREE.Mesh
}



/** Descriptor of the instanced meshes */
export interface ApgRpr_IInstancedMeshDesc {

    /** Instanced Meshes type */
    type: ApgRpr_eInstancedMeshType;
    /** Collider handle */
    colliderHandle: number;
    /** Instance count at moment of creation of this descriptor */
    index: number;
    /** Scaling factors of this instanced mesh */
    scale: THREE.Vector3
    /** Color of this instanced mesh */
    colliderColor: ApgRpr_ColliderColor
}



export class ApgRpr_Layers extends ApgWgl_Layers { 
    static readonly meshColliders = 20;
    static readonly instancedColliders = 21;
    static readonly characters = 25;
}



export class ApgRpr_Viewer extends ApgWgl_Viewer {

    // Maximum count of colliders mesh instances
    readonly COLLIDERS_MESH_INSTANCES_MAX = 2000;

    /** Collections used to relate colliders and rigidbodies with meshes */
    mapOfInstancedMeshDescriptorsByColliderHandle: Map<number, ApgRpr_IInstancedMeshDesc>;
    mapOfMeshesByColliderHandle: Map<number, THREE.Mesh>;

    // TODO What is this used for??? --APG 20231119
    mapOfCollidersByRigidBodyHandle: Map<number, RAPIER.Collider[]>;

    /** Colors for the instanced colliders meshes */
    //collidersPalette: Map<ApgRpr_eCollidersColorPalette, { colors: number[], offset: number }>;

    /** Random generator */
    rng: PRANDO;

    /** Is used for highlighing the colliders that are picked with the mouse */
    lines: THREE.LineSegments;


    /** Index of the current highlighted collider NOT USED!!  */
    highlightedCollider: number;

    /** Set of reusable instanced meshes used to represent the standard colliders */
    instancedMeshes: Map<ApgRpr_eInstancedMeshType, THREE.InstancedMesh>;


    /** To log data properly */
    static readonly RPR_VIEWER_LOGGER_NAME = 'Rapier Viewer';



    constructor(
        awindow: ApgGui_IBrowserWindow,
        adocument: ApgGui_IDocument,
        aviewerElement: ApgGui_IElement,
        alogger: ApgGui_Logger,
        asceneSize: number,
    ) {

        super(awindow, adocument, aviewerElement, alogger, asceneSize);

        this.logger.addLogger(ApgRpr_Viewer.RPR_VIEWER_LOGGER_NAME)

        this.rng = new PRANDO('ApgRprThreeViewer');

        this.mapOfInstancedMeshDescriptorsByColliderHandle = new Map();
        this.mapOfMeshesByColliderHandle = new Map();
        this.mapOfCollidersByRigidBodyHandle = new Map();

        this.instancedMeshes = new Map();
        this.#initInstanceMeshesGroups();

        // For the debug-renderer
        this.highlightedCollider = -1;
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            vertexColors: true,
        });
        const geometry = new THREE.BufferGeometry();
        this.lines = new THREE.LineSegments(geometry, material);
        this.scene.add(this.lines);

        this.logger.devLog('Constructor has built', ApgRpr_Viewer.RPR_VIEWER_LOGGER_NAME);

    }



    #initInstanceMeshesGroups() {

        this.#buildInstancedMesh(ApgRpr_eInstancedMeshType.CUBOIDS, this.COLLIDERS_MESH_INSTANCES_MAX);
        this.#buildInstancedMesh(ApgRpr_eInstancedMeshType.BALLS, this.COLLIDERS_MESH_INSTANCES_MAX);
        this.#buildInstancedMesh(ApgRpr_eInstancedMeshType.CYLINDERS, this.COLLIDERS_MESH_INSTANCES_MAX);
        this.#buildInstancedMesh(ApgRpr_eInstancedMeshType.CONES, this.COLLIDERS_MESH_INSTANCES_MAX);
        this.#buildInstancedMesh(ApgRpr_eInstancedMeshType.CAPSULES, this.COLLIDERS_MESH_INSTANCES_MAX);

        this.logger.devLog('Instanced meshes was build ', ApgRpr_Viewer.RPR_VIEWER_LOGGER_NAME);

    }


    #buildInstancedMesh(atype: ApgRpr_eInstancedMeshType, amaxInstances: number) {

        let geometry;
        switch (atype) {
            case ApgRpr_eInstancedMeshType.CUBOIDS:
                geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
                break;
            case ApgRpr_eInstancedMeshType.ROUNDED_CUBOIDS:
                geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
                break;
            case ApgRpr_eInstancedMeshType.BALLS:
                geometry = new THREE.SphereGeometry(0.5);
                break;
            case ApgRpr_eInstancedMeshType.CYLINDERS:
                geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 16, 1);
                break;
            case ApgRpr_eInstancedMeshType.ROUNDED_CYLINDERS:
                geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 16, 1);
                break;
            case ApgRpr_eInstancedMeshType.CONES:
                geometry = new THREE.ConeGeometry(0.5, 1.0, 16, 1);
                break;
            case ApgRpr_eInstancedMeshType.ROUNDEND_CONES:
                geometry = new THREE.ConeGeometry(0.5, 1.0, 16, 1);
                break;
            case ApgRpr_eInstancedMeshType.CAPSULES:
                geometry = new THREE.CapsuleGeometry(0.25, 0.5, 4, 16);
                break;
        }

        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            flatShading: false,
        });

        const instancedMesh = new THREE.InstancedMesh(geometry, material, amaxInstances);
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;
        instancedMesh.layers.set(ApgRpr_Layers.instancedColliders);
        instancedMesh.count = 0;
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        const userData = instancedMesh.userData as ApgRpr_IInstancedMeshUserData;
        userData.isRprInstancedMesh = true;
        userData.mapOfCollidersAssocToThisInstancedMesh = new Map();

        this.instancedMeshes.set(atype, instancedMesh);
        this.scene.add(instancedMesh);
    }


    /**
     * Renders the three scene of the current Rapier world
     */
    updateAndRender(
        aworld: RAPIER.World,
        aisDebugMode: boolean
    ) {

        ApgRpr_Viewer.renderCalls++;

        this.orbitControls.update();

        this.camLight.position
            .set(
                this.camera.position.x,
                this.camera.position.y,
                this.camera.position.z
            );

        this.updateCollidersPositions(aworld);

        if (aisDebugMode) {
            this.lines.visible = true;
            const buffers = aworld.debugRender();
            this.lines.geometry
                .setAttribute(
                    "position",
                    new THREE.BufferAttribute(buffers.vertices, 3)
                );
            this.lines.geometry
                .setAttribute(
                    "color",
                    new THREE.BufferAttribute(buffers.colors, 4)
                );
        }
        else {
            this.lines.visible = false;
        }

        this.render();
    }



    updateCollidersPositions(
        aworld: RAPIER.World
    ) {

        const tempObj = new THREE.Object3D();

        aworld.forEachCollider((collider: RAPIER.Collider) => {

            const translation = collider.translation()!;
            const rotation = collider.rotation()!;

            // @PERFORMANCE Add the instancedMeshDesc th the collider user data -- APG 20231119
            const instancedMeshDesc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(collider.handle);

            if (instancedMeshDesc != undefined) {

                const instance = this.instancedMeshes.get(instancedMeshDesc.type)!;
                instance.setColorAt(instancedMeshDesc.index, instancedMeshDesc.colliderColor.color)

                tempObj.position.set(translation.x, translation.y, translation.z);
                tempObj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
                tempObj.scale.set(instancedMeshDesc.scale.x, instancedMeshDesc.scale.y, instancedMeshDesc.scale.z);
                tempObj.updateMatrix();

                instance.setMatrixAt(instancedMeshDesc.index, tempObj.matrix);
                instance.instanceMatrix.needsUpdate = true;

            }
            else {

                const mesh = this.mapOfMeshesByColliderHandle.get(collider.handle);

                ApgUts.Assert(
                    mesh != undefined,
                    `$$345: We have an unmapped collider here! (${collider.handle}), where does it come from?`
                )

                mesh!.position.set(translation.x, translation.y, translation.z);
                mesh!.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
                mesh!.updateMatrix();

            }
        });
    }



    reset() {

        for (const instance of this.instancedMeshes.values()) {
            const userData = instance.userData as ApgRpr_IInstancedMeshUserData;
            userData.isRprInstancedMesh = true;
            userData.mapOfCollidersAssocToThisInstancedMesh = new Map();
            instance.count = 0;
        }
        this.mapOfInstancedMeshDescriptorsByColliderHandle = new Map();

        this.mapOfMeshesByColliderHandle.forEach((mesh) => {
            this.scene.remove(mesh);
        });
        this.mapOfMeshesByColliderHandle = new Map();

        this.mapOfCollidersByRigidBodyHandle = new Map();

        // this.#removeOrphanedChildsFromScene();

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



    removeRigidBody(arigidBody: RAPIER.RigidBody) {

        const colliders = this.mapOfCollidersByRigidBodyHandle.get(arigidBody.handle);

        if (colliders) {

            for (const collider of colliders) {
                this.removeCollider(collider)
            }

            this.mapOfCollidersByRigidBodyHandle.delete(arigidBody.handle);
        }

    }



    removeCollider(acollider: RAPIER.Collider) {

        const instancedMeshDesc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(acollider.handle);

        if (instancedMeshDesc == undefined) {
            const message = `Trying to remove the collider with handle (${acollider.handle}) but it hasn't a corrispondent descriptor`
            alert(message);
        }
        else {

            this.mapOfInstancedMeshDescriptorsByColliderHandle.delete(acollider.handle);

            const instancedMesh = this.instancedMeshes.get(instancedMeshDesc.type)!;

            // @NOTE to know if there are still instances of this instanced mesh we check for the count
            if (instancedMesh.count > 1) {

                instancedMesh.count -= 1;

                // @TODO Check all this stuff seems obscure and very incomplete -- APG 20230815
                const userData = instancedMesh.userData as ApgRpr_IInstancedMeshUserData;

                const collAssocMap = userData.mapOfCollidersAssocToThisInstancedMesh;

                const collider = collAssocMap.get(instancedMeshDesc.colliderHandle);

                if (collider == undefined) {
                    const message = `$$407: Trying to remove the collider with handle (${acollider.handle}) from the instanced mesh user data but it is not present in the map.`
                    alert(message);
                }
                else {
                    collAssocMap.delete(instancedMeshDesc.colliderHandle);
                }

            }
        }

    }



    #isInstacedMeshCollider(acollider: RAPIER.Collider) {

        const st = acollider.shapeType()
        if (
            st == RAPIER.ShapeType.TriMesh ||
            st == RAPIER.ShapeType.HeightField ||
            st == RAPIER.ShapeType.ConvexPolyhedron ||
            st == RAPIER.ShapeType.RoundConvexPolyhedron
        ) {
            return false;
        }
        return true;
    }



    addCollider(acollider: RAPIER.Collider) {

        const rigidBodyParentOfCollider: RAPIER.RigidBody = acollider.parent();

        let colliders = this.mapOfCollidersByRigidBodyHandle.get(rigidBodyParentOfCollider.handle);
        if (colliders) {
            colliders.push(acollider);
        }
        else {
            colliders = [acollider];
            this.mapOfCollidersByRigidBodyHandle.set(rigidBodyParentOfCollider.handle, colliders);
        }

        if (this.#isInstacedMeshCollider(acollider)) {

            const instanceDesc: ApgRpr_IInstancedMeshDesc = {
                type: ApgRpr_eInstancedMeshType.UNDEFINED,
                index: 0,
                scale: new THREE.Vector3(1, 1, 1),
                colliderHandle: 0,
                colliderColor: new ApgRpr_ColliderColor(acollider, this.rng)
            };

            let instancedMesh: THREE.InstancedMesh | undefined = undefined;

            const shapeType = acollider.shapeType();

            switch (shapeType) {
                case RAPIER.ShapeType.RoundCuboid:
                case RAPIER.ShapeType.Cuboid: {
                    instancedMesh = this.instancedMeshes.get(ApgRpr_eInstancedMeshType.CUBOIDS)!;
                    instanceDesc.type = ApgRpr_eInstancedMeshType.CUBOIDS;

                    const size = acollider.halfExtents()!;
                    instanceDesc.scale = new THREE.Vector3(size.x * 2, size.y * 2, size.z * 2);
                    break;
                }
                case RAPIER.ShapeType.Ball: {
                    instancedMesh = this.instancedMeshes.get(ApgRpr_eInstancedMeshType.BALLS)!;
                    instanceDesc.type = ApgRpr_eInstancedMeshType.BALLS;

                    const radious = acollider.radius();
                    instanceDesc.scale = new THREE.Vector3(radious * 2, radious * 2, radious * 2);
                    break;
                }
                case RAPIER.ShapeType.RoundCylinder: 
                case RAPIER.ShapeType.Cylinder:{
                    instancedMesh = this.instancedMeshes.get(ApgRpr_eInstancedMeshType.CYLINDERS)!;
                    instanceDesc.type = ApgRpr_eInstancedMeshType.CYLINDERS;

                    const radious = acollider.radius();
                    const height = acollider.halfHeight() * 2.0;
                    instanceDesc.scale = new THREE.Vector3(radious * 2, height, radious * 2);
                    break;
                }
                case RAPIER.ShapeType.RoudedCone: 
                case RAPIER.ShapeType.Cone: {
                    instancedMesh = this.instancedMeshes.get(ApgRpr_eInstancedMeshType.CONES)!;
                    instanceDesc.type = ApgRpr_eInstancedMeshType.CONES;

                    const radious = acollider.radius();
                    const height = acollider.halfHeight() * 2.0;
                    instanceDesc.scale = new THREE.Vector3(radious * 2, height, radious * 2);
                    break;
                }
                case RAPIER.ShapeType.Capsule: {
                    instancedMesh = this.instancedMeshes.get(ApgRpr_eInstancedMeshType.CAPSULES)!;
                    instanceDesc.type = ApgRpr_eInstancedMeshType.CAPSULES;

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

                // const userData = instancedMesh.userData as ApgRpr_IInstancedMeshUserData;
                // userData.mapOfCollidersAssocToThisInstancedMesh.set(acollider.handle, acollider);

                const collTransl = acollider.translation()!;
                const collRot = acollider.rotation()!;

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
        }
        else {

            switch (acollider.shapeType()) {
                /** The following are non instanced meshes */
                case RAPIER.ShapeType.TriMesh:
                case RAPIER.ShapeType.HeightField:
                case RAPIER.ShapeType.ConvexPolyhedron:
                case RAPIER.ShapeType.RoundConvexPolyhedron: {
                    const geometry = new THREE.BufferGeometry();
                    let vertices: Float32Array;
                    let indices: Uint32Array;
                    if (acollider.shapeType() != RAPIER.ShapeType.HeightField) {
                        vertices = acollider.vertices();
                        indices = acollider.indices();
                    }
                    else {
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
                        flatShading: true,
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

    private _baseColor: number;
    get color() { return this.getColor() }

    private _collider: RAPIER.Collider;
    private _body: RAPIER.RigidBody;

    private readonly UNKNOWN_BASE_COLOR = 0x00FF00;
    private readonly STATIC_BASE_COLOR = 0x703000;
    private readonly DYNAMIC_BASE_COLOR = 0x003040;
    private readonly KINEMATIC_BASE_COLOR = 0x001040;

    private readonly IS_ACTIVE_GRADIENT = 0x202020;
    private readonly IS_ENABLED_COLOR_GRADIENT = 0x202020;
    private readonly IS_CCD_ENABLED_COLOR_GRADIENT = 0x202000;
    private readonly IS_SENSOR_COLOR_GRADIENT = 0x400000;

    constructor(
        acollider: RAPIER.Collider,
        arng: PRANDO
    ) {

        this._collider = acollider;
        this._body = this._collider.parent() as RAPIER.RigidBody;
        this._baseColor = this.#getRandomizedGradient(arng);

    }


    private getColor() {

        let color: number;

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
            //color = 0xff0000;
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

    #getRandomizedGradient(arng: PRANDO) {

        const r = Math.floor(arng.next() * 0x40);

        return r + r * 0x100 + r * 0x10000;

    }


}