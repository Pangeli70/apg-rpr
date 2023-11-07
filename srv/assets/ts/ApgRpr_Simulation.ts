/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    ApgGui_IMinMaxStep
} from "./ApgGui.ts";

import {
    PRANDO,
    RAPIER
} from './ApgRpr_Deps.ts';

import {
    ApgRpr_ICameraPosition
} from "./ApgRpr_Interfaces.ts";

import {
    ApgRpr_Simulation_GuiBuilder
} from "./ApgRpr_Simulation_GuiBuilder.ts";

import {
    ApgRpr_eSimulationName
} from "./ApgRpr_Simulations.ts";

import {
    ApgRpr_Simulator
} from "./ApgRpr_Simulator.ts";

import {
    ApgUts_Logger
} from "./ApgUts_Logger.ts";

interface ApgRpr_ISimulationTable {
    width: number;
    depth: number;
    height: number;
    thickness: number;
}


export interface ApgRpr_ISimulationSettings {

    simulation: ApgRpr_eSimulationName;

    colliderSize: number;

    sceneSize: number;

    table: ApgRpr_ISimulationTable;

    isSimulatorDetailsOpened: boolean;

    gravity: RAPIER.Vector3;
    gravityXMMS: ApgGui_IMinMaxStep;
    gravityYMMS: ApgGui_IMinMaxStep;
    gravityZMMS: ApgGui_IMinMaxStep;

    velocityIterations: number;
    velocityIterationsMMS: ApgGui_IMinMaxStep;

    frictionIterations: number;
    frictionIterationsMMS: ApgGui_IMinMaxStep;

    stabilizationIterations: number;
    stabilizationIterationsMMS: ApgGui_IMinMaxStep;

    ccdSteps: number;
    ccdStepsMMS: ApgGui_IMinMaxStep;

    linearError: number;
    linearErrorMMS: ApgGui_IMinMaxStep;

    errorReductionRatio: number;
    errorReductionRatioMMS: ApgGui_IMinMaxStep;

    predictionDistance: number;
    predictionDistanceMMS: ApgGui_IMinMaxStep;

    slowDownFactor: number;
    slowdownMMS: ApgGui_IMinMaxStep;

    cameraPosition: ApgRpr_ICameraPosition;

    isDebugMode: boolean;

    doResetCamera: boolean;
    doResetToDefaults: boolean;
    doRestart: boolean;

    isStatsGroupOpened: boolean;
}



export interface ApgRpr_ISimulationParams {

    simulation: ApgRpr_eSimulationName,

    settings: ApgRpr_ISimulationSettings | null

}



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
    protected logger: ApgUts_Logger;

    static readonly RPR_SIMULATION_NAME = "Rapier simulation";


    /**
     * Creates a new simulation and a new world for the Rapier simulator
     * @param asimulator 
     * @param aparams 
     */
    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        this.simulator = asimulator;
        this.logger = asimulator.logger;
        if (!this.logger.hasLogger(ApgRpr_Simulation.RPR_SIMULATION_NAME)) { 
            this.logger.addLogger(ApgRpr_Simulation.RPR_SIMULATION_NAME);
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
     * and extended by derived classes to add more settings specific of the single simulation. 
     */
    protected defaultSettings(
        acolliderSize = this.simulator.DEFAULT_COLLIDER_SIZE,
        asceneSize = this.simulator.DEFAULT_SCENE_SIZE
    ) {

        const linearError = acolliderSize * this.simulator.DEFAULT_APG_RPR_LINEAR_ERROR_FACTOR;
        const preditionDistance = acolliderSize * this.simulator.DEFAULT_APG_RPR_PREDICTION_DISTANCE_FACTOR;

        const r: ApgRpr_ISimulationSettings = {

            simulation: this.params.simulation,

            colliderSize: acolliderSize,

            sceneSize: asceneSize,

            table: {
                width: 2,
                depth: 1,
                height: 1,
                thickness: 0.05
            },

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
                min: linearError / 5,
                max: linearError * 5,
                step: linearError / 5
            },

            errorReductionRatio: this.simulator.DEFAULT_APG_RPR_ERR_REDUCTION_RATIO,
            errorReductionRatioMMS: {
                min: 0.05,
                max: 1,
                step: 0.05
            },

            predictionDistance: preditionDistance,
            predictionDistanceMMS: {
                min: preditionDistance / 5,
                max: preditionDistance * 5,
                step: preditionDistance / 5
            },

            slowDownFactor: 1,
            slowdownMMS: {
                min: 1,
                max: this.simulator.MAX_SLOWDOWN,
                step: 1
            },

            cameraPosition: {
                eye: {
                    x: asceneSize,
                    y: this.simulator.viewer.defaultEyeHeight,
                    z: -asceneSize
                },
                target: {
                    x: 0, y: 1, z: 0
                }
            },

            isDebugMode: false,

            doResetCamera: false,

            doResetToDefaults: false,

            doRestart: false,


            isSimulatorDetailsOpened: false,

            isStatsGroupOpened: false,
        }

        return r;
    }



    #applySettingsToWorld() {

        this.world.gravity = this.params.settings!.gravity;
        this.world.maxVelocityIterations = this.params.settings!.velocityIterations;
        this.world.maxVelocityFrictionIterations = this.params.settings!.frictionIterations;
        this.world.maxStabilizationIterations = this.params.settings!.stabilizationIterations;
        this.world.integrationParameters.allowedLinearError = this.params.settings!.linearError;
        this.world.integrationParameters.erp = this.params.settings!.errorReductionRatio;
        this.world.integrationParameters.predictionDistance = this.params.settings!.predictionDistance;

    }



    protected createGround() {

        const groundRadious = this.simulator.viewer.metrics.worldSize;

        const GROUND_HEIGHT = 1;

        const userData = {
            color: 0x00bbff
        }
        const groundBodyDesc = RAPIER.RigidBodyDesc
            .fixed()
            .setUserData(userData);
        const body = this.world.createRigidBody(groundBodyDesc);

        const groundColliderDesc = RAPIER.ColliderDesc
            .cylinder(GROUND_HEIGHT / 2, groundRadious)
            // .setSensor(true)
            .setTranslation(0, -GROUND_HEIGHT / 2, 0)
        this.world.createCollider(groundColliderDesc, body);

    }



    protected createWorld(_asettings: unknown) {

        this.createGround();

    }



    /**
     * Create the Gui for the current simulation
     * @param aguiBuilderType The class derived from the standard GuiBuilder
     */
    protected buildGui(
        aguiBuilderType: typeof ApgRpr_Simulation_GuiBuilder,
    ) {
        const guiBuilder = new aguiBuilderType(
            this.simulator,
            this.params.settings!
        );
        const guiHtml = guiBuilder.buildControls();
        this.simulator.updateViewerPanel(guiHtml);

        const hudHtml = guiBuilder.buildControlsToContainer();
        this.simulator.updateViewerHud(hudHtml);

        guiBuilder.bindControls();

        this.logger.log(`Gui built for simulation ${this.params.simulation}`, ApgRpr_Simulation.RPR_SIMULATION_NAME);
    }




    /** 
     * Update the simulation params accordingly with the Gui settings. This method 
     * can be overridden and extended by derived classes to manage the settings 
     * specific of the single simulation that need immediate and not restar updating. 
     */
    protected updateFromGui() {

        if (this.needsUpdate()) {

            this.updateSimulatorFromGui();

            this.savePrevParams();

            this.simulator.gui.updateReactiveControls();
        }

    }



    /** 
     * Update the Rapier simulator params from the Gui setting. This function should
     * not be overridden.
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
     * Raw verification of the current params and gui settings. If something was changed 
     * from the previous saved data or if a restart command was issued the result is true. 
     * False otherwise
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



    protected createSimulationTable(
        atableWidth = 2,
        atableDepth = 1,
        atableHeight = 1,
        atableThickness = 0.05
    ) {

        const tableBodyDesc = RAPIER.RigidBodyDesc
            .fixed();
        const tableBody = this.world.createRigidBody(tableBodyDesc);
        const tableColliderDesc = RAPIER.ColliderDesc
            .cuboid(atableWidth / 2, atableThickness / 2, atableDepth / 2)
            .setTranslation(0, atableHeight - atableThickness / 2, 0)
            .setFriction(1);
        this.world.createCollider(tableColliderDesc, tableBody);


        const tableSupportSize = 0.2;
        const tableSupportHeight = (atableHeight - atableThickness);

        const tableSupportBodyDesc = RAPIER.RigidBodyDesc
            .fixed();
        const tableSupportBody = this.world.createRigidBody(tableSupportBodyDesc);
        const tableSupportColliderDesc = RAPIER.ColliderDesc
            .cuboid(tableSupportSize / 2, tableSupportHeight / 2, tableSupportSize / 2)
            .setTranslation(0, tableSupportHeight / 2, 0);
        this.world.createCollider(tableSupportColliderDesc, tableSupportBody);
    }



    /**
     * WARNING: The number of columns and rows generates a list of vertices
     * of the size ( (number of columns + 1 ) * ( number of rows + 1) )
     * @param anumberOfColumns 
     * @param anumberOfRows 
     * @returns An array of Float32Array heights one per vertex
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
     * @param aseed 
     * @param anumberOfColumns 
     * @param anumberOfRows 
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
