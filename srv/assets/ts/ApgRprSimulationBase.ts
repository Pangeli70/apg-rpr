/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgGui_IMinMaxStep } from "./ApgGui.ts";
import { ApgGui_Stats } from "./ApgGuiStats.ts";
import { RAPIER, PRANDO } from './ApgRprDeps.ts';
import { ApgRpr_eSimulationName } from "./ApgRpr_Simulations.ts";
import { IApgRpr_DebugInfo, IApgRpr_CameraPosition, ApgRpr_ISettings } from "./ApgRprInterfaces.ts";
import { ApgRprSim_GuiBuilder } from "./ApgRprSimGuiBuilder.ts";
import { ApgRpr_Simulator } from "./ApgRpr_Simulator.ts";



export interface ApgRprSim_IGuiSettings extends ApgRpr_ISettings {

    name: ApgRpr_eSimulationName,

    isSimulationGroupOpened: boolean;

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

    slowdown: number;
    slowdownMMS: ApgGui_IMinMaxStep;

    doResetToDefaults: boolean;

    isStatsGroupOpened: boolean;

    cameraPosition: IApgRpr_CameraPosition;
    doResetCamera: boolean;

}


export interface IApgRprSim_Params {

    restart?: boolean;

    simulation: ApgRpr_eSimulationName,
    simulations?: ApgRpr_eSimulationName[],

    // TODO Can we say that is not optional? Yes if we exctract a default Rapier settings -- APG 20230916
    guiSettings?: ApgRprSim_IGuiSettings;

    stats?: ApgGui_Stats;

    debugInfo?: IApgRpr_DebugInfo;
}


export class ApgRprSim_Base {

    /** The Rapier world*/
    protected world: RAPIER.World;

    /** The Apg Rapier simulator */
    protected simulator: ApgRpr_Simulator;

    /** Current simulation params and settings */
    protected params: IApgRprSim_Params;

    /** Copy of params and settings stored for comparison*/
    protected prevParams!: IApgRprSim_Params;

    /** General purpose pseudorandom negerator */
    protected rng: PRANDO;


    /**
     * Creates a new simulation and a new world for the Rapier simulator
     * @param asimulator 
     * @param aparams 
     */
    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {
        this.simulator = asimulator;

        this.params = {
            restart: aparams.restart || false,
            simulation: aparams.simulation,
            simulations: Array.from(this.simulator.simulations.keys()),
            guiSettings: aparams.guiSettings,
            stats: this.simulator.stats,
            debugInfo: this.simulator.debugInfo,
        }
        // @WARNING I know its ugly but to avoid TS complaints this must remain here! After the this.params creation -- APG 20230916
        if (this.params.guiSettings == undefined) {
            this.params.guiSettings = this.defaultGuiSettings();
        }


        this.rng = new PRANDO(this.params.simulation);

        this.saveParams();

        this.world = new RAPIER.World(this.params.guiSettings!.gravity);

        this.#applyGuiSettingsToWorld();

    }


    #applyGuiSettingsToWorld() {
        this.world.maxVelocityIterations = this.params.guiSettings!.velocityIterations;
        this.world.maxVelocityFrictionIterations = this.params.guiSettings!.frictionIterations;
        this.world.maxStabilizationIterations = this.params.guiSettings!.stabilizationIterations;
        this.world.integrationParameters.allowedLinearError = this.params.guiSettings!.linearError;
        this.world.integrationParameters.erp = this.params.guiSettings!.errorReductionRatio;
        this.world.integrationParameters.predictionDistance = this.params.guiSettings!.predictionDistance;
    }

    /**
     * Create the Gui for the current simulation
     * @param aguiBuilderType The class derived from the standard GuiBuilder
     */
    protected buildGui(
        aguiBuilderType: typeof ApgRprSim_GuiBuilder,

    ) {
        const guiBuilder = new aguiBuilderType(
            this.simulator.gui,
            this.params
        );
        const html = guiBuilder.buildHtml();
        this.simulator.updateViewerPanel(html);
        guiBuilder.bindControls();

        this.simulator.gui.log('Sim Gui built', true);
    }


    /** 
     * Set up the default Gui settings for the simulator. This method can be overridden 
     * and extended by derived classes to add more settings specific of the single simulation. 
     */
    protected defaultGuiSettings() {

        const r: ApgRprSim_IGuiSettings = {

            name: this.params.simulation,
            
            isSimulationGroupOpened: false,

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

            velocityIterations: this.simulator.DEFAULT_VELOCITY_ITERATIONS,
            velocityIterationsMMS: {
                min: 1,
                max: 16,
                step: 3
            },

            frictionIterations: this.simulator.DEFAULT_FRICTION_ITERATIONS,
            frictionIterationsMMS: {
                min: 1,
                max: 16,
                step: 3
            },

            stabilizationIterations: this.simulator.DEFAULT_STABILIZATION_ITERATIONS,
            stabilizationIterationsMMS: {
                min: 1,
                max: 16,
                step: 3
            },

            linearError: this.simulator.DEFAULT_LINEAR_ERROR,
            linearErrorMMS: {
                min: 0.0001,
                max: 0.01,
                step: 0.0001
            },

            errorReductionRatio: this.simulator.DEFAULT_ERR_REDUCTION_RATIO,
            errorReductionRatioMMS: {
                min: 0.05,
                max: 1,
                step: 0.05
            },

            predictionDistance: this.simulator.DEFAULT_PREDICTION_DISTANCE,
            predictionDistanceMMS: {
                min: 0.002,
                max: 0.1,
                step: 0.002
            },

            slowdown: 1,
            slowdownMMS: {
                min: 1,
                max: this.simulator.MAX_SLOWDOWN,
                step: 1
            },

            doResetToDefaults: false,

            isStatsGroupOpened: false,

            cameraPosition: {
                eye: { x: - 80, y: 10, z: 80 },
                target: { x: 0, y: 0, z: 0 }
            },

            doResetCamera: false

        }

        return r;
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
        }

    }


    /** 
     * Update the Rapier simulator params from the Gui setting. This function should
     * not be overridden.
     */
    protected updateSimulatorFromGui() {

        if (this.prevParams.guiSettings!.doResetToDefaults != this.params.guiSettings!.doResetToDefaults) {
            this.params.guiSettings!.doResetToDefaults = this.prevParams.guiSettings!.doResetToDefaults;
            this.params.guiSettings = this.defaultGuiSettings();
            this.#applyGuiSettingsToWorld();
            this.params.restart = true;
        }

        if (this.params.restart) {

            this.simulator.setSimulation(this.params);
        }

        if (this.prevParams.simulation != this.params.simulation) {
            this.simulator.setSimulation({ simulation: this.params.simulation })
        }

        if (this.prevParams.guiSettings!.velocityIterations != this.params.guiSettings!.velocityIterations) {
            this.simulator.world!.maxVelocityIterations = this.params.guiSettings!.velocityIterations
        }

        if (this.prevParams.guiSettings!.frictionIterations != this.params.guiSettings!.frictionIterations) {
            this.simulator.world!.maxVelocityFrictionIterations = this.params.guiSettings!.frictionIterations
        }

        if (this.prevParams.guiSettings!.stabilizationIterations != this.params.guiSettings!.stabilizationIterations) {
            this.simulator.world!.maxStabilizationIterations = this.params.guiSettings!.stabilizationIterations
        }

        if (this.prevParams.guiSettings!.linearError != this.params.guiSettings!.linearError) {
            this.world.integrationParameters.allowedLinearError = this.params.guiSettings!.linearError;
        }

        if (this.prevParams.guiSettings!.errorReductionRatio != this.params.guiSettings!.errorReductionRatio) {
            this.world.integrationParameters.erp = this.params.guiSettings!.errorReductionRatio;
        }

        if (this.prevParams.guiSettings!.predictionDistance != this.params.guiSettings!.predictionDistance) {
            this.world.integrationParameters.predictionDistance = this.params.guiSettings!.predictionDistance;
        }


        if (this.prevParams.guiSettings!.slowdown != this.params.guiSettings!.slowdown) {
            this.simulator.slowdown = this.params.guiSettings!.slowdown
        }



    }


    /** 
     * Raw verification of the current params and gui settings. If something was changed 
     * from the previous saved data or if a restart command was issued the result is true. 
     * False otherwise
     */
    protected needsUpdate() {

        const r = false;

        if (this.params.restart) {
            return true;
        }

        if (this.params.simulation != this.prevParams.simulation) {
            return true;
        }

        const currsettings = JSON.stringify(this.params.guiSettings);
        const prevSettings = JSON.stringify(this.prevParams.guiSettings);
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
                simulation: this.params.simulation
            }
        }
        else {
            this.prevParams.simulation = this.params.simulation;
        }
        this.prevParams.guiSettings = JSON.parse(JSON.stringify(this.params.guiSettings));
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
