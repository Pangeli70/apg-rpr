/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { ApgGui_IMinMaxStep } from "./ApgGui.ts";
import { ApgGui_Stats } from "./ApgGuiStats.ts";
import { RAPIER, PRANDO } from './ApgRprDeps.ts';
import { ApgRpr_eSimulationName } from "./ApgRprEnums.ts";
import { IApgRprDebugInfo, IApgRpr_CameraPosition } from "./ApgRprInterfaces.ts";
import { ApgRprSim_GuiBuilder } from "./ApgRprSimGuiBuilder.ts";
import { ApgRpr_Simulator } from "./ApgRpr_Simulator.ts";




export interface ApgRprSim_IGuiSettings {

    isSimulationGroupOpened: boolean;

    velocityIterations: number;
    velocityIterationsMMS: ApgGui_IMinMaxStep;

    frictionIterations: number;
    frictionIterationsMMS: ApgGui_IMinMaxStep;

    slowdown: number;
    slowdownMMS: ApgGui_IMinMaxStep;

    isStatsGroupOpened: boolean;

    cameraPosition: IApgRpr_CameraPosition;

}


export interface IApgRprSim_Params {
    gravity?: RAPIER.Vector3,
    restart?: boolean;

    simulation: ApgRpr_eSimulationName,
    simulations?: ApgRpr_eSimulationName[],

    guiSettings?: ApgRprSim_IGuiSettings;

    stats?: ApgGui_Stats;

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
        const html = guiBuilder.buildHtml();
        this.simulator.updateViewerPanel(html);
        guiBuilder.bindControls();

        this.simulator.gui.log('Sim Gui built', true);
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

        const r: ApgRprSim_IGuiSettings = {

            isSimulationGroupOpened: false,

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

            isStatsGroupOpened: false,

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
        axNum: number,
        azNum: number,
        axScale: number,
        ayScale: number,
        azScale: number,
    ) {

        const rng = new PRANDO(arandomSeed)

        const randomHeights: number[] = [];

        for (let i = 0; i < (axNum + 1); i++) {

            for (let j = 0; j < (azNum + 1); j++) {

                randomHeights.push(rng.next());

            }

        }

        const r = this.generateHeightMap(
            axNum, azNum,
            axScale, ayScale, azScale,
            randomHeights);

        return r;
    }


    protected generateHeightMap(
        axNum: number,
        azNum: number,
        axScale: number,
        ayScale: number,
        azScale: number,
        aheights: number[],
    ) {

        const xSize = axScale / axNum;
        const zSize = azScale / azNum;

        const xHalf = axScale / 2;
        const zHalf = azScale / 2;

        // create vertices lattice
        const vertices: number[] = [];

        for (let iz = 0; iz < (azNum + 1); iz++) {

            for (let ix = 0; ix < (axNum + 1); ix++) {

                const index = ix + (iz * axNum);
                const x = (ix * xSize) - xHalf;
                const y = aheights[index] * ayScale;
                const z = (iz * zSize) - zHalf;
                vertices.push(x, y, z);

            }

        }

        // create triangle indexes 
        const indices: number[] = [];

        for (let z = 0; z < azNum; z++) {

            for (let x = 0; x < axNum; x++) {

                const i1 = x + (z * (axNum + 1));
                const i2 = x + ((z + 1) * (axNum + 1));
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
