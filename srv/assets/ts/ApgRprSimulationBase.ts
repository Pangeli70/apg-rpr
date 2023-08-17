/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgGuiStats } from "./ApgGuiStats.ts";
import { RAPIER, PRANDO } from './ApgRprDeps.ts';
import { eApgRpr_SimulationName } from "./ApgRprEnums.ts";
import { IApgRprDebugInfo, IApgRpr_CameraPosition } from "./ApgRprInterfaces.ts";
import { ApgRprSim_GuiBuilder } from "./ApgRprSimGuiBuilder.ts";
import { ApgRpr_Simulator } from "./ApgRpr_Simulator.ts";


export interface IApgRprSim_MinMaxStep {
    min: number;
    max: number;
    step: number;
}


export interface IApgRprSim_GuiSettings {

    velocityIterations: number;
    velocityIterationsMMS: IApgRprSim_MinMaxStep;

    frictionIterations: number;
    frictionIterationsMMS: IApgRprSim_MinMaxStep;

    slowdown: number;
    slowdownMMS: IApgRprSim_MinMaxStep;

    cameraPosition: IApgRpr_CameraPosition;

}


export interface IApgRprSim_Params {
    gravity?: RAPIER.Vector3,
    restart?: boolean;

    simulation: eApgRpr_SimulationName,
    simulations?: eApgRpr_SimulationName[],

    guiSettings?: IApgRprSim_GuiSettings;

    stats?: ApgGuiStats;

    debugInfo?: IApgRprDebugInfo;
}


export class ApgRprSim_Base {

    /** */
    protected world: RAPIER.World;

    /** */
    protected simulator: ApgRpr_Simulator;

    /** */
    protected params: IApgRprSim_Params;
    /** */
    protected prevParams!: IApgRprSim_Params;


    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {
        this.simulator = asimulator;

        this.params = {
            gravity: aparams.gravity || new RAPIER.Vector3(0, -9.81, 0),
            restart: aparams.restart || false,
            simulation: aparams.simulation,
            simulations: Array.from(this.simulator.simulations.keys()),
            guiSettings: aparams.guiSettings || this.defaultGuiSettings(),
            stats: this.simulator.stats,
            debugInfo: this.simulator.debugInfo,
        }

        this.savePrevParams();

        this.world = new RAPIER.World(this.params.gravity!);
    }


    protected buildGui(
        aguiBuilderType: typeof ApgRprSim_GuiBuilder
    ) {
        const guiBuilder = new aguiBuilderType(
            this.simulator.gui,
            this.params
        );
        const gui = guiBuilder.build();
        this.simulator.viewer.panels.innerHTML = gui;
        guiBuilder.bindControls();
    }


    protected updateFromGui() {

        // TODO move everything coming from the gui in the guiSettings -- APG 20230817
        if (this.params.restart) {
            this.simulator.setSimulation(this.params);
        }
        
        // TODO move everything coming from the gui in the guiSettings -- APG 20230817
        if (this.prevParams.simulation != this.params.simulation) {
            this.simulator.setSimulation({ simulation: this.params.simulation })
        }

        if (this.prevParams.guiSettings!.velocityIterations != this.params.guiSettings!.velocityIterations) {
            this.simulator.world!.maxVelocityIterations = this.params.guiSettings!.velocityIterations
        }

        if (this.prevParams.guiSettings!.frictionIterations != this.params.guiSettings!.frictionIterations) {
            this.simulator.world!.maxVelocityFrictionIterations = this.params.guiSettings!.frictionIterations
        }

        if (this.prevParams.guiSettings!.slowdown != this.params.guiSettings!.slowdown) {
            this.simulator.slowdown = this.params.guiSettings!.slowdown
        }

        this.savePrevParams();

    }


    protected defaultGuiSettings() {

        const r: IApgRprSim_GuiSettings = {

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

            slowdown: 1,
            slowdownMMS: {
                min: 1,
                max: this.simulator.MAX_SLOWDOWN,
                step: 1
            },

            cameraPosition: {
                eye: { x: - 80, y: 10, z: 80 },
                target: { x: 0, y: 0, z: 0 }
            }

        }

        return r;
    }


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


    protected savePrevParams() {
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


    protected generateRandomHeightMap(
        arandomSeed: string | number,
        anumWidthXDivs: number,
        anumDepthZDivs: number,
        awidthX: number,
        aheightY: number,
        adepthZ: number,
    ) {

        const rng = new PRANDO(arandomSeed)

        const randomHeights: number[] = [];
        for (let i = 0; i <= anumWidthXDivs; i++) {
            for (let j = 0; j <= anumDepthZDivs; j++) {
                randomHeights.push(rng.next());
            }
        }
        const r = this.generateHeightMap(
            anumWidthXDivs, anumDepthZDivs,
            awidthX, aheightY, adepthZ,
            randomHeights);

        return r;
    }


    protected generateHeightMap(
        anumWidthXDivs: number,
        anumDepthZDivs: number,
        awidthX: number,
        aheightY: number,
        adepthZ: number,
        aheights: number[],
    ) {

        const elementWidthX = 1.0 / anumWidthXDivs;
        const elementDepthZ = 1.0 / anumDepthZDivs;

        // create vertices lattice
        const vertices: number[] = [];
        for (let i = 0; i <= anumWidthXDivs; ++i) {
            for (let j = 0; j <= anumDepthZDivs; ++j) {
                const index = (i * anumWidthXDivs) + j;
                const x = (i * elementWidthX - 0.5) * awidthX;
                const y = aheights[index] * aheightY;
                const z = (j * elementDepthZ - 0.5) * adepthZ;
                vertices.push(x, y, z);
            }
        }

        // create triangle indexes 
        const indices: number[] = [];
        for (let i = 0; i < anumWidthXDivs; ++i) {
            for (let j = 0; j < anumDepthZDivs; ++j) {
                const i1 = (i + 0) * (anumWidthXDivs + 1) + (j + 0);
                const i2 = (i + 0) * (anumWidthXDivs + 1) + (j + 1);
                const i3 = (i + 1) * (anumWidthXDivs + 1) + (j + 0);
                const i4 = (i + 1) * (anumWidthXDivs + 1) + (j + 1);
                indices.push(i1, i3, i2);
                indices.push(i3, i4, i2);
            }
        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint32Array(indices),
        };
    }

}
