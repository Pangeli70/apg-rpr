/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgGui_IMinMaxStep } from "./apg-gui/lib/interfaces/ApgGui_IMinMaxStep.ts";

import {
    PRANDO,
    RAPIER
} from './ApgRpr_Deps.ts';

import {
    ApgRpr_ICameraPosition
} from "./ApgRpr_Interfaces.ts";

import {
    ApgRpr_IMaterial,
    ApgRrp_MaterialsTable,
    ApgRrp_eMaterial
} from "./ApgRpr_Materials.ts";

import {
    ApgRpr_Simulator_GuiBuilder
} from "./gui-builders/ApgRpr_Simulation_GuiBuilder.ts";

import {
    ApgRpr_eSimulationName
} from "./ApgRpr_Simulations.ts";

import {
    ApgRpr_Simulator
} from "./ApgRpr_Simulator.ts";

import {
    ApgGui_Logger
} from "./apg-gui/lib/classes/ApgGui_Logger.ts";



interface ApgRpr_ISimulationPlayground {
    width: number;
    depth: number;
    height: number;
    thickness: number;
}


/**
 * Data structure to contain all the basic settings for the simulation
 */
export interface ApgRpr_ISimulationSettings {

    /**
     * Signature to detect if the data format of the settings in the local 
     * storage is still valid
     */
    signature: string;

    /**
     * Identifier of the current simulation
     */
    simulation: ApgRpr_eSimulationName;

    /** 
     * cale factor of the simulation NOT YET IMPLEMENTED
     */
    globalScale: number;

    /**
     * Average collider size
     */
    colliderSize: number;

    /**
     * Scene size for the THREE environment
     */
    sceneSize: number;

    /**
     * Playground
     */
    playground: ApgRpr_ISimulationPlayground;

    /**
     * World Gravity
     */
    gravity: RAPIER.Vector3;
    gravityXMMS: ApgGui_IMinMaxStep;
    gravityYMMS: ApgGui_IMinMaxStep;
    gravityZMMS: ApgGui_IMinMaxStep;

    /**
     * Simulator movement precision
     */
    velocityIterations: number;
    velocityIterationsMMS: ApgGui_IMinMaxStep;

    /**
     * Simulator friction precision
     */
    frictionIterations: number;
    frictionIterationsMMS: ApgGui_IMinMaxStep;

    /**
     * Simulator stabilization precision
     */
    stabilizationIterations: number;
    stabilizationIterationsMMS: ApgGui_IMinMaxStep;

    /**
     * Simulator fast moving objects precision
     */
    ccdSteps: number;
    ccdStepsMMS: ApgGui_IMinMaxStep;

    /**
     * Simulator linear error
     */
    linearError: number;
    linearErrorMMS: ApgGui_IMinMaxStep;

    /**
     * Simulator error reduction
     */
    errorReductionRatio: number;
    errorReductionRatioMMS: ApgGui_IMinMaxStep;

    /**
     * Simulator collision prediction
     */
    predictionDistance: number;
    predictionDistanceMMS: ApgGui_IMinMaxStep;

    /**
     * Simulation speed
     */
    slowDownFactor: number;
    slowdownMMS: ApgGui_IMinMaxStep;

    /**
     * Simulator is in debug mode
     */
    isDebugMode: boolean;

    /**
     * Camera
     */
    cameraPosition: ApgRpr_ICameraPosition;

    /**
     * Flag to reset camera position
     */
    doResetCamera: boolean;
    /**
     * Flag to restore default settings for the simulation
     */
    doResetToDefaults: boolean;
    /**
     * Flag to restart the simulation
     */
    doRestart: boolean;

    /**
     * GUI Flag for the simulation details
     */
    isSimulatorDetailsOpened: boolean;
    /**
     * GUI Flag for the stats details
     */
    isStatsDetailsOpened: boolean;
}



/**
 * Data structure to manage the simulation change and the persistance in local storage 
 */
export interface ApgRpr_ISimulationParams {

    simulation: ApgRpr_eSimulationName,

    settings: ApgRpr_ISimulationSettings | null

}



/**
 * Base class for the simulations
 */
export class ApgRpr_Simulation {

    /** The Rapier world*/
    protected world: RAPIER.World;

    /** The Apg Rapier simulator */
    protected simulator: ApgRpr_Simulator;

    /** Current simulation params and settings */
    protected params: ApgRpr_ISimulationParams;

    /** Copy of params and settings stored for comparison*/
    protected prevParams!: ApgRpr_ISimulationParams;

    /** General purpose pseudorandom generator */
    protected rng: PRANDO;

    /** Logger for the various simulations */
    protected logger: ApgGui_Logger;

    static readonly RPR_SIMULATION_LOGGER_NAME = "Rapier simulation";

    static readonly RPR_SIMULATION_SETTINGS_SIGNATURE = "0.0.8";  

    /**
     * Creates a new simulation and a new world for the RAPIER simulator
     */
    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        this.simulator = asimulator;
        this.logger = asimulator.logger;
        if (!this.logger.hasLogger(ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME)) {
            this.logger.addLogger(ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME);
        }

        this.params = aparams;

        if (this.params.settings == undefined) {
            this.params.settings = this.defaultSettings();
        }

        this.rng = new PRANDO(this.params.simulation);

        this.savePrevParams();

        this.world = new RAPIER.World(this.params.settings!.gravity);

        this.#applySettingsToWorld();

        if (this.params.settings!.doRestart) {
            this.simulator.resetCamera(this.params.settings.cameraPosition);
            this.params.settings!.doRestart = false;
        }

        if (this.params.settings!.doResetCamera) {
            this.simulator.resetCamera(this.params.settings.cameraPosition);
            this.params.settings!.doResetCamera = false;
        }

    }



    /** 
     * Set up the default Gui settings for the simulator. This method can be overridden 
     * and extended by derived classes to add more settings each specific of every simulation. 
     */
    protected defaultSettings(
        aglobalScale = 1,
        acolliderSize = this.simulator.DEFAULT_COLLIDER_SIZE,
        asceneSize = this.simulator.DEFAULT_SCENE_SIZE,
    ) {

        const linearError = aglobalScale * acolliderSize * this.simulator.DEFAULT_APG_RPR_LINEAR_ERROR_FACTOR;
        const preditionDistance = aglobalScale * acolliderSize * this.simulator.DEFAULT_APG_RPR_PREDICTION_DISTANCE_FACTOR;
        const playground: ApgRpr_ISimulationPlayground = {
            width: aglobalScale * 2,
            depth: aglobalScale * 1,
            height: aglobalScale * 1,
            thickness: aglobalScale * 0.05
        };


        const r: ApgRpr_ISimulationSettings = {

            signature: ApgRpr_Simulation.RPR_SIMULATION_SETTINGS_SIGNATURE,

            simulation: this.params.simulation,

            globalScale: aglobalScale, // Not Yet Implemented

            colliderSize: aglobalScale * acolliderSize,

            sceneSize: aglobalScale * asceneSize,

            playground,

            gravity: new RAPIER.Vector3(
                this.simulator.DEFAULT_GRAVITY_X,
                this.simulator.DEFAULT_GRAVITY_Y,
                this.simulator.DEFAULT_GRAVITY_Z
            ),
            gravityXMMS: {
                min: -20,
                max: 20,
                step: 0.2
            },
            gravityYMMS: {
                min: -20,
                max: 20,
                step: 0.2
            },
            gravityZMMS: {
                min: -20,
                max: 20,
                step: 0.2
            },

            velocityIterations: this.simulator.DEFAULT_APG_RPR_VELOCITY_ITERATIONS,
            velocityIterationsMMS: {
                min: 1,
                max: 20,
                step: 1
            },

            frictionIterations: this.simulator.DEFAULT_APG_RPR_FRICTION_ITERATIONS,
            frictionIterationsMMS: {
                min: 1,
                max: 20,
                step: 1
            },

            stabilizationIterations: this.simulator.DEFAULT_APG_RPR_STABILIZATION_ITERATIONS,
            stabilizationIterationsMMS: {
                min: 1,
                max: 20,
                step: 1
            },

            ccdSteps: this.simulator.DEFAULT_RAPIER_CCD_STEPS,
            ccdStepsMMS: {
                min: 1,
                max: 20,
                step: 1
            },

            linearError: linearError,
            linearErrorMMS: {
                min: linearError / 10,
                max: linearError * 10,
                step: linearError / 10
            },

            errorReductionRatio: this.simulator.DEFAULT_APG_RPR_ERR_REDUCTION_RATIO,
            errorReductionRatioMMS: {
                min: 0.05,
                max: 1,
                step: 0.05
            },

            predictionDistance: preditionDistance,
            predictionDistanceMMS: {
                min: preditionDistance / 10,
                max: preditionDistance * 10,
                step: preditionDistance / 10
            },

            slowDownFactor: 1,
            slowdownMMS: {
                min: 1,
                max: this.simulator.MAX_SLOWDOWN,
                step: 1
            },

            isDebugMode: false,

            cameraPosition: {
                eye: {
                    x: playground.width * 2,
                    y: aglobalScale * this.simulator.viewer.defaultEyeHeight,
                    z: -playground.width * 2
                },
                target: {
                    x: 0,
                    y: playground.height,
                    z: 0
                }
            },

            doResetCamera: false,

            doResetToDefaults: false,

            doRestart: false,


            isSimulatorDetailsOpened: false,

            isStatsDetailsOpened: false,
        }

        return r;
    }



    /**
     * Per frame updating of the RAPIER simulator settings
     */
    #applySettingsToWorld() {

        this.world.gravity = this.params.settings!.gravity;
        this.world.maxVelocityIterations = this.params.settings!.velocityIterations;
        this.world.maxVelocityFrictionIterations = this.params.settings!.frictionIterations;
        this.world.maxStabilizationIterations = this.params.settings!.stabilizationIterations;
        this.world.integrationParameters.allowedLinearError = this.params.settings!.linearError;
        this.world.integrationParameters.erp = this.params.settings!.errorReductionRatio;
        this.world.integrationParameters.predictionDistance = this.params.settings!.predictionDistance;

    }



    /**
     * Applies the physic material properties to the rigid body descriptor
     */
    protected applyMaterialToRigidBodyDesc(
        arigidBodyDesc: RAPIER.RigidBodyDesc,
        material: ApgRpr_IMaterial
    ) {
        arigidBodyDesc
            .setLinearDamping(material.linearDamping || 0)
            .setAngularDamping(material.angularDamping || 0)
    }



    /**
     * Applies the physic material properties to the collider descriptor
     */
    protected applyMaterialToColliderDesc(
        acolliderDesc: RAPIER.ColliderDesc,
        material: ApgRpr_IMaterial
    ) {
        acolliderDesc
            .setDensity(material.density)
            .setFriction(material.friction)
            .setRestitution(material.restitution)
    }



    /**
     * Overridable method to create a simulation
     */
    protected createWorld(_asettings: unknown) {

        this.createGround();

    }



    /**
     * Create the Gui for the current simulation
     */
    protected buildGui(
        aguiBuilderType: typeof ApgRpr_Simulator_GuiBuilder,
    ) {

        const guiBuilder = new aguiBuilderType(
            this.simulator,
            this.params.settings!
        );

        const settingsHtml = guiBuilder.buildControls();
        this.simulator.updateGuiPanel(settingsHtml);

        const hudHtml = guiBuilder.buildHudControls();
        this.simulator.updateGuiHud(hudHtml);

        guiBuilder.bindControls();

        this.logger.log(
            `Gui built for simulation ${this.params.simulation}`,
            ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME
        );
    }



    /** 
     * Update the simulation params accordingly with the Gui settings. 
     * This method can be overridden and extended by derived classes to manage 
     * the settings specific of the single simulation that need immediate 
     * per frame updating. 
     */
    protected updateFromGui() {

        if (this.needsUpdate()) {

            this.updateSimulatorFromGui();

            this.savePrevParams();

            this.simulator.gui.updateReactiveControls();
        }

    }



    /** 
     * Update the Rapier simulator params from the Gui setting. 
     * WARNING!! This method should not be overridden.
     */
    protected updateSimulatorFromGui() {

        this.params.simulation = this.params.settings!.simulation;

        // reset 
        if (this.params.settings!.doResetToDefaults) {
            const defaultSettings = this.defaultSettings();
            Object.assign(this.params.settings!, defaultSettings);
        }

        if (this.params.settings!.doResetCamera) {
            this.simulator.resetCamera(this.params.settings!.cameraPosition);
            this.params.settings!.doResetCamera = false;
        }

        if (this.params.settings?.doRestart) {
            this.simulator.setSimulation(this.params);
            return;
        }

        if (this.prevParams.simulation != this.params.simulation) {
            const params = {
                simulation: this.params.simulation,
                settings: null
            }
            this.simulator.setSimulation(params)
            return;
        }

        this.#applySettingsToWorld();

        if (this.prevParams.settings!.slowDownFactor != this.params.settings!.slowDownFactor) {
            this.simulator.slowDownFactor = this.params.settings!.slowDownFactor
        }

        if (this.prevParams.settings!.isDebugMode != this.params.settings!.isDebugMode) {
            this.simulator.debugMode = this.params.settings!.isDebugMode
        }

    }



    /** 
     * Detects it the current params and gui settings are changed from the 
     * previous saved data or if a restart command was issued
     */
    protected needsUpdate() {

        const r = false;
        const currSettings = this.params.settings!;
        const prevSettings = this.prevParams.settings!;

        if (this.params.simulation != this.prevParams.simulation) {
            return true;
        }
        if (currSettings.isDebugMode != prevSettings.isDebugMode) {
            return true;
        }
        if (currSettings.doRestart) {
            return true;
        }
        if (currSettings.doResetToDefaults) {
            return true;
        }
        if (currSettings.doResetCamera) {
            return true;
        }
        if (currSettings.velocityIterations != prevSettings.velocityIterations) {
            return true;
        }
        if (currSettings.frictionIterations != prevSettings.frictionIterations) {
            return true;
        }
        if (currSettings.stabilizationIterations != prevSettings.stabilizationIterations) {
            return true;
        }
        if (currSettings.linearError != prevSettings.linearError) {
            return true;
        }
        if (currSettings.errorReductionRatio != prevSettings.errorReductionRatio) {
            return true;
        }
        if (currSettings.predictionDistance != prevSettings.predictionDistance) {
            return true;
        }
        if (currSettings.slowDownFactor != prevSettings.slowDownFactor) {
            return true;
        }
        if (currSettings.slowDownFactor != prevSettings.slowDownFactor) {
            return true;
        }
        if (currSettings.gravity.toString() != prevSettings.gravity.toString()) {
            return true;
        }

        const currFullSettings = JSON.stringify(this.params.settings);
        const prevFullSettings = JSON.stringify(this.prevParams.settings);
        if (currFullSettings != prevFullSettings) {
            return true;
        }

        return r;
    }



    /**
     * Save the params for later comparison in order to detect changes due
     * to the user's interaction
     */
    protected savePrevParams() {

        this.prevParams = JSON.parse(JSON.stringify(this.params));
    }



    /**
     * Creates a ground for the simulation
     */
    protected createGround(
        amaterialName = ApgRrp_eMaterial.Stone
    ) {

        const groundRadious = this.simulator.viewer.metrics.worldSize;

        const GROUND_HEIGHT = 1;

        const material = ApgRrp_MaterialsTable[amaterialName];

        const userData = {
            material
        }

        const bodyDesc = RAPIER.RigidBodyDesc
            .fixed()
            .setUserData(userData);
        this.applyMaterialToRigidBodyDesc(bodyDesc, material);
        const body = this.world.createRigidBody(bodyDesc);

        const colliderDesc = RAPIER.ColliderDesc
            .cylinder(GROUND_HEIGHT / 2, groundRadious)
            .setTranslation(0, -GROUND_HEIGHT / 2, 0)
        this.applyMaterialToColliderDesc(colliderDesc, material)
        this.world.createCollider(colliderDesc, body);

    }



    /**
     * Creates a playground table for the simulation
     */
    protected createSimulationTable(
        atableWidth = 2,
        atableDepth = 1,
        atableHeight = 1,
        atableThickness = 0.05,
        amaterialName = ApgRrp_eMaterial.HardWood,
    ) {

        const material = ApgRrp_MaterialsTable[amaterialName];

        const userData = {
            material
        }

        const tableRBD = RAPIER.RigidBodyDesc
            .fixed()
            .setUserData(userData);
        this.applyMaterialToRigidBodyDesc(tableRBD, material);
        const tableBody = this.world.createRigidBody(tableRBD);

        const tableCD = RAPIER.ColliderDesc
            .cuboid(atableWidth / 2, atableThickness / 2, atableDepth / 2)
            .setTranslation(0, atableHeight - atableThickness / 2, 0)
        this.applyMaterialToColliderDesc(tableCD, material)
        this.world.createCollider(tableCD, tableBody);


        const tableSupportSize = 0.2;
        const tableSupportHeight = (atableHeight - atableThickness);

        const tableSupportRBD = RAPIER.RigidBodyDesc
            .fixed()
            .setUserData(userData);
        this.applyMaterialToRigidBodyDesc(tableSupportRBD, material);
        const tableSupportBody = this.world.createRigidBody(tableSupportRBD);

        const tableSupportCD = RAPIER.ColliderDesc
            .cuboid(tableSupportSize / 2, tableSupportHeight / 2, tableSupportSize / 2)
            .setTranslation(0, tableSupportHeight / 2, 0);
        this.applyMaterialToColliderDesc(tableSupportCD, material)
        this.world.createCollider(tableSupportCD, tableSupportBody);
    }



    /**
     * WARNING: The number of columns and rows generates a list of vertices
     * of the size ( (number of columns + 1 ) * ( number of rows + 1) )
     * @returns An Float32Array of heights one per vertex
     */
    protected generateSlopedHeightFieldArray(
        anumberOfColumns: number,
        anumberOfRows: number,
    ) {

        const heights: number[] = [];
        const deltaSlope = 1 / anumberOfRows;

        for (let column = 0; column < (anumberOfColumns + 1); column++) {

            const h = column * deltaSlope;

            for (let row = 0; row < (anumberOfRows + 1); row++) {

                heights.push(h);

            }

        }

        return new Float32Array(heights);

    }



    /**
     * WARNING: The number of columns and rows generates a list of vertices
     * of the size ( (number of columns + 1 ) * ( number of rows + 1) )
     * @returns An array of Float32Array heights one per vertex
     */
    protected generateRandomHeightFieldArray(
        aseed: string,
        anumberOfColumns: number,
        anumberOfRows: number,
    ) {

        const rng = new PRANDO(aseed);
        const heights: number[] = [];

        for (let column = 0; column < (anumberOfColumns + 1); column++) {


            for (let row = 0; row < (anumberOfRows + 1); row++) {

                const h = rng.next();
                heights.push(h);

            }

        }

        return new Float32Array(heights);

    }



    protected generateRandomTrimshHeightMap(
        arandomSeed: string | number,
        axNumVertices: number,
        azNumVertices: number,
        axScale: number,
        ayScale: number,
        azScale: number,
    ) {

        const rng = new PRANDO(arandomSeed)

        const randomHeights: number[] = [];

        for (let i = 0; i < (axNumVertices + 1); i++) {

            for (let j = 0; j < (azNumVertices + 1); j++) {

                randomHeights.push(rng.next());

            }

        }

        const r = this.generateTrimeshHeightMap(
            axNumVertices, azNumVertices,
            axScale, ayScale, azScale,
            randomHeights);

        return r;
    }



    protected generateTrimeshHeightMap(
        axVertexesNum: number,
        azVertexesNum: number,
        axScale: number,
        ayScale: number,
        azScale: number,
        aheights: number[],
    ) {

        const xSize = axScale / axVertexesNum;
        const zSize = azScale / azVertexesNum;

        const xHalf = axScale / 2;
        const zHalf = azScale / 2;

        // create vertices lattice
        const vertices: number[] = [];

        for (let iz = 0; iz < azVertexesNum; iz++) {

            for (let ix = 0; ix < axVertexesNum; ix++) {

                const index = ix + (iz * axVertexesNum);
                const x = (ix * xSize) - xHalf;
                const y = aheights[index] * ayScale;
                const z = (iz * zSize) - zHalf;
                vertices.push(x, y, z);

            }

        }

        // create triangle indexes 
        const indices: number[] = [];

        for (let z = 0; z < (azVertexesNum - 1); z++) {

            for (let x = 0; x < (axVertexesNum); x++) {

                const i1 = x + (z * (axVertexesNum));
                const i2 = x + ((z + 1) * (axVertexesNum));
                const i3 = i1 + 1;
                const i4 = i2 + 1;

                indices.push(i1, i2, i3);
                indices.push(i3, i2, i4);

            }

        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint32Array(indices),
        };
    }

}
