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
    ApgRpr_Simulator_GuiBuilder
} from "./ApgRpr_Simulator_GuiBuilder.ts";

import {
    ApgRpr_eSimulationName
} from "./ApgRpr_Simulations.ts";

import {
    ApgRpr_Simulator
} from "./ApgRpr_Simulator.ts";

import {
    ApgUts_Logger
} from "./ApgUts_Logger.ts";




export interface ApgRpr_ISimulationSettings {

    simulation: ApgRpr_eSimulationName,

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

    linearError: number;
    linearErrorMMS: ApgGui_IMinMaxStep;

    errorReductionRatio: number;
    errorReductionRatioMMS: ApgGui_IMinMaxStep;

    predictionDistance: number;
    predictionDistanceMMS: ApgGui_IMinMaxStep;

    slowDownFactor: number;
    slowdownMMS: ApgGui_IMinMaxStep;

    cameraPosition: ApgRpr_ICameraPosition;

    doResetCamera: boolean;
    doResetToDefaults: boolean;
    doRestart: boolean;

    isDebugMode: boolean;

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
        this.logger.addLogger(ApgRpr_Simulation.RPR_SIMULATION_NAME);

        this.params = aparams;

        if (this.params.settings == undefined) {
            this.params.settings = this.defaultSettings();
        }

        this.rng = new PRANDO(this.params.simulation);

        this.saveParams();

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
    protected defaultSettings() {
        return this.#defaultSettings(this.params.simulation, this.simulator);
    }



    #defaultSettings(asimulation: ApgRpr_eSimulationName, asimulator: ApgRpr_Simulator) {

        const r: ApgRpr_ISimulationSettings = {

            simulation: asimulation,

            isSimulatorDetailsOpened: false,

            gravity: new RAPIER.Vector3(0, -9.81, 0),
            gravityXMMS: {
                min: -5,
                max: 5,
                step: 0.1
            },
            gravityYMMS: {
                min: -5,
                max: 5,
                step: 0.1
            },
            gravityZMMS: {
                min: -5,
                max: 5,
                step: 0.1
            },

            velocityIterations: asimulator.DEFAULT_VELOCITY_ITERATIONS,
            velocityIterationsMMS: {
                min: 1,
                max: 16,
                step: 3
            },

            frictionIterations: asimulator.DEFAULT_FRICTION_ITERATIONS,
            frictionIterationsMMS: {
                min: 1,
                max: 16,
                step: 3
            },

            stabilizationIterations: asimulator.DEFAULT_STABILIZATION_ITERATIONS,
            stabilizationIterationsMMS: {
                min: 1,
                max: 16,
                step: 3
            },

            linearError: asimulator.DEFAULT_LINEAR_ERROR,
            linearErrorMMS: {
                min: 0.0001,
                max: 0.01,
                step: 0.0001
            },

            errorReductionRatio: asimulator.DEFAULT_ERR_REDUCTION_RATIO,
            errorReductionRatioMMS: {
                min: 0.05,
                max: 1,
                step: 0.05
            },

            predictionDistance: asimulator.DEFAULT_PREDICTION_DISTANCE,
            predictionDistanceMMS: {
                min: 0.002,
                max: 0.1,
                step: 0.002
            },

            slowDownFactor: 1,
            slowdownMMS: {
                min: 1,
                max: asimulator.MAX_SLOWDOWN,
                step: 1
            },

            isDebugMode: false,

            cameraPosition: {
                eye: { x: - 80, y: 10, z: 80 },
                target: { x: 0, y: 0, z: 0 }
            },

            doResetCamera: false,

            doResetToDefaults: false,

            doRestart: false,

            isStatsGroupOpened: false,
        }

        return r;
    }



    #applySettingsToWorld() {

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
        aguiBuilderType: typeof ApgRpr_Simulator_GuiBuilder,
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

        this.logger.log('Simulation Gui built', ApgRpr_Simulation.RPR_SIMULATION_NAME);
    }




    /** 
     * Update the simulation params accordingly with the Gui settings. This method 
     * can be overridden and extended by derived classes to manage the settings 
     * specific of the single simulation that need immediate and not restar updating. 
     */
    protected updateFromGui() {

        if (this.needsUpdate()) {

            this.updateSimulatorFromGui();

            this.saveParams();

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

        if (this.params.simulation != this.prevParams.simulation) {
            return true;
        }
        if (this.params.settings!.isDebugMode != this.prevParams.settings!.isDebugMode) {
            return true;
        }
        if (this.params.settings!.doRestart) {
            return true;
        }
        if (this.params.settings!.doResetToDefaults) {
            return true;
        }
        if (this.params.settings!.doResetCamera) {
            return true;
        }
        if (this.params.settings!.velocityIterations != this.prevParams.settings!.velocityIterations) {
            return true;
        }
        if (this.params.settings!.frictionIterations != this.prevParams.settings!.frictionIterations) {
            return true;
        }
        if (this.params.settings!.stabilizationIterations != this.prevParams.settings!.stabilizationIterations) {
            return true;
        }
        if (this.params.settings!.linearError != this.prevParams.settings!.linearError) {
            return true;
        }
        if (this.params.settings!.errorReductionRatio != this.prevParams.settings!.errorReductionRatio) {
            return true;
        }
        if (this.params.settings!.predictionDistance != this.prevParams.settings!.predictionDistance) {
            return true;
        }
        if (this.params.settings!.slowDownFactor != this.prevParams.settings!.slowDownFactor) {
            return true;
        }

        const currsettings = JSON.stringify(this.params.settings);
        const prevSettings = JSON.stringify(this.prevParams.settings);
        if (currsettings != prevSettings) {
            return true;
        }

        return r;
    }



    /**
     * Save the params for later comparison in order to detect changes due
     * to the user's interaction
     */
    protected saveParams() {

        if (!this.prevParams) {
            this.prevParams = {
                simulation: this.params.simulation,
                settings: null
            }
        }
        else {
            this.prevParams.simulation = this.params.simulation;
        }
        this.prevParams.settings = JSON.parse(JSON.stringify(this.params.settings));
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
