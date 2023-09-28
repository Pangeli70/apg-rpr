/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/
import { THREE, PRANDO, RAPIER } from './ApgRprDeps.ts';
import { ApgRprUtils } from "./ApgRprUtils.ts";
import {
    IApgDomBrowserWindow, IApgDomDocument, IApgDomElement
} from './ApgDom.ts'
import { IApgRpr_InstanceDesc } from "./ApgRprInterfaces.ts";
import { eApgRpr_InstancedMeshesGroups } from "./ApgRprEnums.ts";
import { ApgWglLayers, ApgWglViewer } from "./ApgWglViewer.ts";
import { ApgUtils } from "./ApgUtils.ts";


interface IApgRprInstancedMeshUserData {
    isRprInstancedMesh: boolean;
    mapOfCollidersAssocToThisInstancedMesh: Map<number, RAPIER.Collider>;
}


enum eApgRprCollidersColorPalette {
    FIXED = 0,
    KINEMATIC = 1,
    DYNAMIC = 2,
    CCD_ENABLED = 3,
    SENSOR = 4,
    HIGHLIGHTED = 5
}


export class ApgRprViewer extends ApgWglViewer {

    // Maximum count of colliders mesh instances
    readonly COLLIDERS_MESH_INSTANCES_MAX = 250;

    /** Collections used to relate colliders and rigidbodies with meshes */
    mapOfInstancedMeshDescriptorsByColliderHandle: Map<number, IApgRpr_InstanceDesc>;
    mapOfMeshesByColliderHandle: Map<number, THREE.InstancedMesh | THREE.Mesh>;
    mapOfCollidersByRigidBodyHandle: Map<number, RAPIER.Collider[]>;

    /** Colors for the instanced colliders meshes */
    collidersPalette: Map<eApgRprCollidersColorPalette, { colors: number[], offset: number }>;

    rng: PRANDO;

    /** Is used for highlighing the colliders that are picked with the mouse */
    lines: THREE.LineSegments;


    /** Index of the current highlighted collider */
    highlightedCollider: number;

    /** Set of reusable meshes used to represent the standard colliders */
    instancedMeshesGroups: Map<eApgRpr_InstancedMeshesGroups, THREE.InstancedMesh[]>;

    constructor(
        awindow: IApgDomBrowserWindow,
        adocument: IApgDomDocument,
        aviewerElement: IApgDomElement,
    ) {
        super(awindow, adocument, aviewerElement);

        this.rng = new PRANDO('ApgRprThreeViewer');

        this.mapOfInstancedMeshDescriptorsByColliderHandle = new Map();
        this.mapOfMeshesByColliderHandle = new Map();
        this.mapOfCollidersByRigidBodyHandle = new Map();

        this.collidersPalette = new Map();
        this.#initCollidersPalette();

        this.instancedMeshesGroups = new Map();
        this.#initInstanceMeshesGroups();

        // For the debug-renderer or collider highlighting.
        this.highlightedCollider = -1;
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            vertexColors: true,
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

        this.collidersPalette.set(eApgRprCollidersColorPalette.FIXED, { colors: [0xffd480], offset: 0 });
        this.collidersPalette.set(eApgRprCollidersColorPalette.KINEMATIC, { colors: [0x4040bf], offset: 1 });
        this.collidersPalette.set(eApgRprCollidersColorPalette.DYNAMIC, { colors: [0x17334f, 0x295989, 0x4e8cca, 0xc4d9ed], offset: 2 });
        this.collidersPalette.set(eApgRprCollidersColorPalette.CCD_ENABLED, { colors: [0xffff00], offset: 6 });
        this.collidersPalette.set(eApgRprCollidersColorPalette.SENSOR, { colors: [0x00ff00], offset: 7 });
        this.collidersPalette.set(eApgRprCollidersColorPalette.HIGHLIGHTED, { colors: [0xff0000], offset: 8 });
    }


    #buildInstancedMeshesGroup(agroup: eApgRpr_InstancedMeshesGroups, amaxInstances: number) {

        let geometry;
        switch (agroup) {
            case eApgRpr_InstancedMeshesGroups.BOXES:
                geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
                break;
            case eApgRpr_InstancedMeshesGroups.BALLS:
                geometry = new THREE.SphereGeometry(0.5);
                break;
            case eApgRpr_InstancedMeshesGroups.CYLINDERS:
                geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 16, 1);
                break;
            case eApgRpr_InstancedMeshesGroups.CONES:
                geometry = new THREE.ConeGeometry(0.5, 1.0, 16, 1);
                break;
            case eApgRpr_InstancedMeshesGroups.CAPSULES:
                geometry = new THREE.CapsuleGeometry(0.25, 0.5, 4, 16);
                break;
        }

        const group: THREE.InstancedMesh[] = [];
        for (const type of this.collidersPalette.keys()) {
            for (const color of this.collidersPalette.get(type)!.colors) {
                const material = new THREE.MeshPhongMaterial({
                    color: color,
                    flatShading: false,
                });
                const instancedMesh = new THREE.InstancedMesh(geometry, material, amaxInstances);

                const userData = instancedMesh.userData as IApgRprInstancedMeshUserData;
                userData.isRprInstancedMesh = true;
                userData.mapOfCollidersAssocToThisInstancedMesh = new Map();
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
    render(aworld: RAPIER.World, aisDebugMode: boolean) {

        ApgRprViewer.renderCalls++;

        this.orbitControls.update();

        this.camLight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);

        this.updateCollidersPositions(aworld);

        if (aisDebugMode) {
            this.lines.visible = true;
            const buffers = aworld.debugRender();
            this.lines.geometry.setAttribute("position", new THREE.BufferAttribute(buffers.vertices, 3));
            this.lines.geometry.setAttribute("color", new THREE.BufferAttribute(buffers.colors, 4));
        }
        else {
            this.lines.visible = false;
        }

        this.renderer.render(this.scene, this.camera);
    }




    highlightedInstanceId() {
        return 7; //this.colorPalette.length - 1;
    }


    highlightCollider(handle: number) {
        if (handle == this.highlightedCollider)
            // Avoid flickering when moving the mouse on a single collider.
            return;
        if (this.highlightedCollider != null) {
            const desc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(this.highlightedCollider);
            if (desc) {
                desc.highlighted = false; // ???? TODO
                const instancedGroup = this.instancedMeshesGroups.get(desc.groupId)!;
                instancedGroup[this.highlightedInstanceId()].count = 0;
            }
        }
        if (handle != -1) {
            const desc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(handle);
            if (desc) {
                if (desc.indexInGroup != 0)
                    // Don't highlight static/kinematic bodies.
                    desc.highlighted = true;
            }
        }
        this.highlightedCollider = handle;
    }


    updateCollidersPositions(world: RAPIER.World) {

        const tempObj = new THREE.Object3D();

        world.forEachCollider((collider: RAPIER.Collider) => {

            const translation = collider.translation()!;
            const rotation = collider.rotation()!;

            const instancedMeshDesc = this.mapOfInstancedMeshDescriptorsByColliderHandle.get(collider.handle);

            if (instancedMeshDesc != undefined) {

                const instancedGroup = this.instancedMeshesGroups.get(instancedMeshDesc.groupId)!;
                const instance = instancedGroup[instancedMeshDesc.indexInGroup];

                tempObj.position.set(translation.x, translation.y, translation.z);
                tempObj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
                tempObj.scale.set(instancedMeshDesc.scale.x, instancedMeshDesc.scale.y, instancedMeshDesc.scale.z);
                tempObj.updateMatrix();
                instance.setMatrixAt(instancedMeshDesc.count, tempObj.matrix);

                // TODO Review this highlighted management is incomplete -- APG 20230926
                const highlightInstance = instancedGroup[this.highlightedInstanceId()];
                if (instancedMeshDesc.highlighted) {
                    highlightInstance.count = 1;
                    highlightInstance.setMatrixAt(0, tempObj.matrix);
                }
                instance.instanceMatrix.needsUpdate = true;
                highlightInstance.instanceMatrix.needsUpdate = true;
            }
            else {

                const mesh = this.mapOfMeshesByColliderHandle.get(collider.handle);

                ApgUtils.Assert(
                    mesh != undefined,
                    `$$257: We have an unmapped collider here! (${collider.handle}), where does it come from?`
                )

                mesh!.position.set(translation.x, translation.y, translation.z);
                mesh!.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
                mesh!.updateMatrix();

            }
        });
    }


    reset() {

        for (const group of this.instancedMeshesGroups.values()) {
            for (const instance of group) {
                const userData = instance.userData as IApgRprInstancedMeshUserData;
                userData.isRprInstancedMesh = true;
                userData.mapOfCollidersAssocToThisInstancedMesh = new Map();
                instance.count = 0;
            }
        }
        this.mapOfInstancedMeshDescriptorsByColliderHandle = new Map();


        this.mapOfMeshesByColliderHandle.forEach((mesh) => {
            this.scene.remove(mesh);
        });
        this.mapOfMeshesByColliderHandle = new Map();


        this.mapOfCollidersByRigidBodyHandle = new Map();

        // while (this.scene.children.length > 0) {
        //     this.scene.remove(this.scene.children[0]);
        //     console.log('Orphaned object removed')
        // }

        this.rng.reset();

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

            const instancedGroup = this.instancedMeshesGroups.get(instancedMeshDesc.groupId)!;

            const instancedMesh = instancedGroup[instancedMeshDesc.indexInGroup];

            // @NOTE to know if there are still instances of this instanced mesh we check for the count
            if (instancedMesh.count > 1) {

                instancedMesh.count -= 1;

                // TODO Check all this stuff seems obscure and very incomplete -- APG 20230815
                const userData = instancedMesh.userData as IApgRprInstancedMeshUserData;

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


    addCollider(acollider: RAPIER.Collider) {


        const rigidBodyParentOfCollider: RAPIER.RigidBody = acollider.parent();

        const palette = this.getPaletteByRigidBodyType(rigidBodyParentOfCollider);

        let colliders = this.mapOfCollidersByRigidBodyHandle.get(rigidBodyParentOfCollider.handle);
        if (colliders) {
            colliders.push(acollider);
        }
        else {
            colliders = [acollider];
            this.mapOfCollidersByRigidBodyHandle.set(rigidBodyParentOfCollider.handle, colliders);
        }

        const instanceDesc: IApgRpr_InstanceDesc = {
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
                const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.BOXES)!;
                instance = instancesGroups[instanceDesc.indexInGroup];
                instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.BOXES;

                const size = acollider.halfExtents()!;
                instanceDesc.scale = new THREE.Vector3(size.x * 2, size.y * 2, size.z * 2);
                break;
            }
            case RAPIER.ShapeType.Ball: {
                const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.BALLS)!;
                instance = instancesGroups[instanceDesc.indexInGroup];
                instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.BALLS;

                const radious = acollider.radius();
                instanceDesc.scale = new THREE.Vector3(radious, radious, radious);
                break;
            }
            case RAPIER.ShapeType.Cylinder:
            case RAPIER.ShapeType.RoundCylinder: {
                const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.CYLINDERS)!;
                instance = instancesGroups[instanceDesc.indexInGroup];
                instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.CYLINDERS;

                const radious = acollider.radius();
                const height = acollider.halfHeight() * 2.0;
                instanceDesc.scale = new THREE.Vector3(radious, height, radious);
                break;
            }
            case RAPIER.ShapeType.Cone: {
                const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.CONES)!;
                instance = instancesGroups[instanceDesc.indexInGroup];
                instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.CONES;

                const radious = acollider.radius();
                const height = acollider.halfHeight() * 2.0;
                instanceDesc.scale = new THREE.Vector3(radious, height, radious);
                break;
            }
            case RAPIER.ShapeType.Capsule: {
                const instancesGroups = this.instancedMeshesGroups.get(eApgRpr_InstancedMeshesGroups.CAPSULES)!;
                instance = instancesGroups[instanceDesc.indexInGroup];
                instanceDesc.groupId = eApgRpr_InstancedMeshesGroups.CAPSULES;

                const radious = acollider.radius();
                const height = acollider.halfHeight();
                instanceDesc.scale = new THREE.Vector3(radious, height, radious);
                break;
            }
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
                    flatShading: true,
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

            const userData = instance.userData as IApgRprInstancedMeshUserData;
            userData.mapOfCollidersAssocToThisInstancedMesh.set(acollider.handle, acollider);

            const collTransl = acollider.translation()!;
            const collRot = acollider.rotation()!;

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

    private getInstanceIdByPalette(palette: {
        colors: number[];
        offset: number;
    }) {
        const instanceId = Math.trunc(this.rng.next() * palette.colors.length) + palette.offset;
        return instanceId;
    }

    private getPaletteByRigidBodyType(rigidBodyParentOfCollider: RAPIER.RigidBody) {
        let paletteIndex: eApgRprCollidersColorPalette;
        if (rigidBodyParentOfCollider.isFixed()) {
            paletteIndex = eApgRprCollidersColorPalette.FIXED;
        }
        else if (rigidBodyParentOfCollider.isKinematic()) {
            paletteIndex = eApgRprCollidersColorPalette.KINEMATIC;
        }
        else if (rigidBodyParentOfCollider.isCcdEnabled()) {
            paletteIndex = eApgRprCollidersColorPalette.CCD_ENABLED;
        }
        else {
            paletteIndex = eApgRprCollidersColorPalette.DYNAMIC;
        }
        const palette = this.collidersPalette.get(paletteIndex)!;
        return palette;
    }
}
