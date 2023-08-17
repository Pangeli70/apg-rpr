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
import { IApgRpr_CameraPosition, IApgRprInstanceDesc } from "./ApgRprInterfaces.ts";
import { eApgRprInstancedMeshesGroup } from "./ApgRprEnums.ts";



enum eApgRprCollidersColorPalette {
    FIXED = 0,
    KINEMATIC = 1,
    DYNAMIC = 2,
    CCD_ENABLED = 3,
    HIGHLIGHTED = 4
}

export class ApgRprThreeViewer {

    /** We don't like global objects */
    window: IApgDomBrowserWindow;
    /** We don't like global objects */
    document: IApgDomDocument;

    /** Dom objects for THREE.js */
    container: IApgDomElement;
    canvas: IApgDomCanvas;
    toolbar: IApgDomElement;
    panels: IApgDomElement;

    // Maximum count of mesh instances
    readonly MAX_INSTANCES = 250;

    /** Collections used to relate colliders with meshes */
    instancedMeshDescByColliderHandleMap: Map<number, IApgRprInstanceDesc>;
    meshesByColliderHandleMap: Map<number, THREE.InstancedMesh | THREE.Mesh>;
    collidersByRigidBodyHandleMap: Map<number, RAPIER.Collider[]>;


    /** Colors for the instanced colliders meshes */
    colorPalette: Map<eApgRprCollidersColorPalette, { colors: number[], offset: number }>;


    /** THREE stuff */
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: THREE_OrbitControls;
    light: THREE.PointLight;
    // Keep track of the render calls to THREE.Render
    static renderCalls = 0;

    rng: PRANDO;


    /** Is used for highlighing the colliders that are picked with the mouse */
    lines: THREE.LineSegments;

    /** Used for picking the colliders */
    raycaster: THREE.Raycaster;
    /** Index of the current highlighted collider */
    highlightedCollider: number;

    /** Set of reusable meshes used to represent the standard colliders */
    instancedMeshesGroups: Map<eApgRprInstancedMeshesGroup, THREE.InstancedMesh[]>;

    constructor(
        awindow: IApgDomBrowserWindow,
        adocument: IApgDomDocument
    ) {
        this.window = awindow;
        this.document = adocument;

        const viewerHeight = `${this.window.innerHeight * 0.95}px`;

        this.container = this.document.getElementById('ApgRprViewerContainer');
        this.container.style.width = "80%";
        this.container.style.height = viewerHeight;

        this.canvas = this.document.createElement('canvas') as IApgDomCanvas;
        this.canvas.id = 'ApgWglRprViewerCanvas';
        this.container.appendChild(this.canvas);

        this.toolbar = this.document.getElementById('ApgRprViewerToolbar');
        this.toolbar.style.width = "20%";
        this.toolbar.style.height = viewerHeight;

        this.panels = this.document.getElementById('ApgRprViewerToolbarPanels');

        this.rng = new PRANDO('ApgRprThreeViewer');

        this.instancedMeshDescByColliderHandleMap = new Map();
        this.meshesByColliderHandleMap = new Map();
        this.collidersByRigidBodyHandleMap = new Map();

        this.colorPalette = new Map();
        this.colorPalette.set(eApgRprCollidersColorPalette.FIXED, { colors: [0xffd480], offset: 0 });
        // this.colorPalette.set(eApgRprCollidersColorPalette.STATIC, [0xf3d9b1]);
        this.colorPalette.set(eApgRprCollidersColorPalette.KINEMATIC, { colors: [0x4040bf], offset: 1 });
        // this.colorPalette.set(eApgRprCollidersColorPalette.DYNAMIC, [0x98c1d9, 0x053c5e, 0x1f7a8c, 0x6743ff]);
        this.colorPalette.set(eApgRprCollidersColorPalette.DYNAMIC, { colors: [0x17334f, 0x295989, 0x4e8cca, 0xc4d9ed], offset: 2 });
        this.colorPalette.set(eApgRprCollidersColorPalette.CCD_ENABLED, { colors: [0xffff00], offset: 6 });
        this.colorPalette.set(eApgRprCollidersColorPalette.HIGHLIGHTED, { colors: [0xff0000], offset: 7 });

        this.scene = new THREE.Scene();

        // const aspectRatio = this.window.innerWidth / this.window.innerHeight;
        const aspectRatio = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 10000);

        // this.renderer = new THREE.WebGLRenderer({ antialias: true });
        // this.renderer.setSize(this.window.innerWidth, this.window.innerWidth);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        this.renderer.setClearColor(0x292929, 1);

        // High pixel Ratio could make the rendering extremely slow, so we cap it.
        const pixelRatio = this.window.devicePixelRatio
            ? Math.min(this.window.devicePixelRatio, 1.5)
            : 1;
        this.renderer.setPixelRatio(pixelRatio);

        /** DONE change this we want to add the rendered to a defined div -- APG 20230812/20230815 */
        // this.document.body.appendChild(this.renderer.domElement);
        this.container.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0x606060);
        this.scene.add(ambientLight);

        this.light = new THREE.PointLight(0xffffff, 1, 1000);
        this.light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.scene.add(this.light);

        this.raycaster = new THREE.Raycaster();

        this.highlightedCollider = -1;

        // For the debug-renderer or collider highlighting.
        {
            const material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                vertexColors: true,
            });
            const geometry = new THREE.BufferGeometry();
            this.lines = new THREE.LineSegments(geometry, material);
            this.scene.add(this.lines);
        }

        this.window.addEventListener("resize", this.resize, false);

        this.controls = new THREE_OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.2;
        this.controls.maxPolarAngle = Math.PI / 2;

        this.instancedMeshesGroups = new Map();
        this.initInstancesByGroupAndPalette();
    }


    resize() {
        if (this.camera) {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            // this.camera.aspect = this.window.innerWidth / this.window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            // this.renderer.setSize(this.window.innerWidth, this.window.innerHeight);
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
                instance.userData.elementId2coll = new Map();
                instance.count = 0;
                instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                this.scene.add(instance);
            });
        });
    }


    buildInstancesByPalette(agroup: eApgRprInstancedMeshesGroup) {
        const group: THREE.InstancedMesh[] = [];

        let geometry;

        switch (agroup) {
            case eApgRprInstancedMeshesGroup.BOXES:
                geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0);
                break;
            case eApgRprInstancedMeshesGroup.BALLS:
                geometry = new THREE.SphereGeometry(1.0);
                break;
            case eApgRprInstancedMeshesGroup.CYLINDERS:
                geometry = new THREE.CylinderGeometry(1.0, 1.0);
                break;
            case eApgRprInstancedMeshesGroup.CONES:
                geometry = new THREE.ConeGeometry(1.0, 1.0);
                break;
            case eApgRprInstancedMeshesGroup.CAPSULES:
                geometry = new THREE.CapsuleGeometry(1.0, 1.0);
                break;
        }

        for (const type of this.colorPalette.keys()) {
            for (const color of this.colorPalette.get(type)!.colors) {
                const material = new THREE.MeshPhongMaterial({
                    color: color,
                    flatShading: true,
                });
                const instancedMesh = new THREE.InstancedMesh(geometry, material, this.MAX_INSTANCES);
                group.push(instancedMesh);
            }
        }
        this.instancedMeshesGroups.set(agroup, group);
    }

    render(aworld: RAPIER.World, aisDebugMode: boolean) {

        ApgRprThreeViewer.renderCalls += 1;

        this.controls.update();
        // if (kk % 100 == 0) {
        //     console.log(this.camera.position);
        //     console.log(this.controls.target);
        // }
        this.light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        if (aisDebugMode) {
            const buffers = aworld.debugRender();
            this.lines.visible = true;
            this.lines.geometry.setAttribute("position", new THREE.BufferAttribute(buffers.vertices, 3));
            this.lines.geometry.setAttribute("color", new THREE.BufferAttribute(buffers.colors, 4));
        }
        else {
            this.lines.visible = false;
        }
        this.updatePositions(aworld);
        this.renderer.render(this.scene, this.camera);
    }


    rayAtMousePosition(pos: THREE.Vector2) {
        this.raycaster.setFromCamera(pos, this.camera);
        return this.raycaster.ray;
    }


    setCamera(acameraPosition: IApgRpr_CameraPosition) {
        this.camera.position.set(acameraPosition.eye.x, acameraPosition.eye.y, acameraPosition.eye.z);
        this.controls.target.set(acameraPosition.target.x, acameraPosition.target.y, acameraPosition.target.z);
        this.controls.update();
    }


    highlightedInstanceId() {
        return 7; //this.colorPalette.length - 1;
    }


    highlightCollider(handle: number) {
        if (handle == this.highlightedCollider)
            // Avoid flickering when moving the mouse on a single collider.
            return;
        if (this.highlightedCollider != null) {
            const desc = this.instancedMeshDescByColliderHandleMap.get(this.highlightedCollider);
            if (desc) {
                desc.highlighted = false; // ???? TODO
                const instancedGroup = this.instancedMeshesGroups.get(desc.groupId)!;
                instancedGroup[this.highlightedInstanceId()].count = 0;
            }
        }
        if (handle != -1) {
            const desc = this.instancedMeshDescByColliderHandleMap.get(handle);
            if (desc) {
                if (desc.instanceId != 0)
                    // Don't highlight static/kinematic bodies.
                    desc.highlighted = true;
            }
        }
        this.highlightedCollider = handle;
    }


    updatePositions(world: RAPIER.World) {
        const tempObj = new THREE.Object3D();
        world.forEachCollider((collider: RAPIER.Collider) => {
            const instancedMeshDesc = this.instancedMeshDescByColliderHandleMap.get(collider.handle);
            const translation = collider.translation()!;
            const rotation = collider.rotation()!;
            if (instancedMeshDesc) {
                const instancedGroup = this.instancedMeshesGroups.get(instancedMeshDesc.groupId)!;
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
                // TODO Rename elementId2coll -- APG 20230815
                instance.userData.elementId2coll = new Map();
                instance.count = 0;
            }
        }

        this.rng.reset();

        this.meshesByColliderHandleMap.forEach((mesh) => {
            this.scene.remove(mesh);
        });

        this.meshesByColliderHandleMap = new Map();
        this.instancedMeshDescByColliderHandleMap = new Map();
        this.collidersByRigidBodyHandleMap = new Map();

    }


    removeRigidBody(arigidBody: RAPIER.RigidBody) {

        const colliders = this.collidersByRigidBodyHandleMap.get(arigidBody.handle);

        if (colliders) {

            for (const collider of colliders) {
                this.removeCollider(collider)
            }

            this.collidersByRigidBodyHandleMap.delete(arigidBody.handle);
        }

    }


    removeCollider(collider: RAPIER.Collider) {

        const instancedMeshDesc = this.instancedMeshDescByColliderHandleMap.get(collider.handle);
        if (instancedMeshDesc) {
            const instancesGroup = this.instancedMeshesGroups.get(instancedMeshDesc.groupId)!;
            const instancedMesh = instancesGroup[instancedMeshDesc.instanceId];
            if (instancedMesh.count > 1) {
                // TODO Check all this stuff seems obscure and very incomplete -- APG 20230815
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


    addCollider(acollider: RAPIER.Collider) {


        const rigidBodyParentOfCollider: RAPIER.RigidBody = acollider.parent();

        const palette = this.getPaletteByRigidBodyType(rigidBodyParentOfCollider);

        let colliders = this.collidersByRigidBodyHandleMap.get(rigidBodyParentOfCollider.handle);
        if (colliders) {
            colliders.push(acollider);
        }
        else {
            colliders = [acollider];
            this.collidersByRigidBodyHandleMap.set(rigidBodyParentOfCollider.handle, colliders);
        }

        const instanceDesc: IApgRprInstanceDesc = {
            groupId: 0,
            instanceId: this.getInstanceIdByPalette(palette),
            elementId: 0,
            highlighted: false,
            scale: new THREE.Vector3(1, 1, 1)
        };

        let instance;
        switch (acollider.shapeType()) {
            case RAPIER.ShapeType.Cuboid: {
                const size = acollider.halfExtents()!;
                const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.BOXES)!;
                instance = instancesGroups[instanceDesc.instanceId];
                instanceDesc.groupId = eApgRprInstancedMeshesGroup.BOXES;
                instanceDesc.scale = new THREE.Vector3(size.x, size.y, size.z);
                break;
            }
            case RAPIER.ShapeType.Ball: {
                const radious = acollider.radius();
                const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.BALLS)!;
                instance = instancesGroups[instanceDesc.instanceId];
                instanceDesc.groupId = eApgRprInstancedMeshesGroup.BALLS;
                instanceDesc.scale = new THREE.Vector3(radious, radious, radious);
                break;
            }
            case RAPIER.ShapeType.Cylinder:
            case RAPIER.ShapeType.RoundCylinder: {
                const radious = acollider.radius();
                const height = acollider.halfHeight() * 2.0;
                const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.CYLINDERS)!;
                instance = instancesGroups[instanceDesc.instanceId];
                instanceDesc.groupId = eApgRprInstancedMeshesGroup.CYLINDERS;
                instanceDesc.scale = new THREE.Vector3(radious, height, radious);
                break;
            }
            case RAPIER.ShapeType.Cone: {
                const radious = acollider.radius();
                const height = acollider.halfHeight() * 2.0;
                const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.CONES)!;
                instance = instancesGroups[instanceDesc.instanceId];
                instanceDesc.groupId = eApgRprInstancedMeshesGroup.CONES;
                instanceDesc.scale = new THREE.Vector3(radious, height, radious);
                break;
            }
            case RAPIER.ShapeType.Capsule: {

                const radious = acollider.radius();
                const height = acollider.halfHeight();
                const instancesGroups = this.instancedMeshesGroups.get(eApgRprInstancedMeshesGroup.CAPSULES)!;
                instance = instancesGroups[instanceDesc.instanceId];
                instanceDesc.groupId = eApgRprInstancedMeshesGroup.CAPSULES;
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

            const collTransl = acollider.translation()!;
            const collRot = acollider.rotation()!;

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
        const palette = this.colorPalette.get(paletteIndex)!;
        return palette;
    }
}