/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomBrowserWindow, IApgDomDocument,
    IApgDomMouseEvent
} from "./ApgDom.ts";
import { ApgGui } from "./ApgGui.ts";
import {
    ApgGuiRprCollidersStatsPanel, ApgGuiRprStepStatsPanel,
    ApgGuiStats
} from "./ApgGuiStats.ts";
import { RAPIER, md5 } from './ApgRprDeps.ts';
import { eApgRpr_SimulationName } from "./ApgRprEnums.ts";
import {
    IApgRpr_CameraPosition, IApgRprDebugInfo,
    IApgRprPoint2D
} from "./ApgRprInterfaces.ts";
import {
    ApgRprSim_Base, IApgRprSim_Params
} from "./ApgRprSimulationBase.ts";
import { ApgRprThreeViewer } from "./ApgRprThreeViewer.ts";


export class ApgRpr_Simulator {

    /** Used to interact with the browser we don't like global variables */
    window: IApgDomBrowserWindow;
    /** Used to interact with the DOM we don't like global variables */
    document: IApgDomDocument;

    /** The current set of simulations */
    simulations: Map<eApgRpr_SimulationName, typeof ApgRprSim_Base>;

    /** Gui */
    gui: ApgGui;

    /** Stats objects */
    stats!: ApgGuiStats;
    stepStatsPanel!: ApgGuiRprStepStatsPanel;
    collidersStatsPanel!: ApgGuiRprCollidersStatsPanel;

    /** The THREE viewer attached to the simulation */
    viewer: ApgRprThreeViewer;

    /** Eventually used for picking objects with a raycaster */
    mouse: IApgRprPoint2D;

    /** We don't know yet ??? */
    events: RAPIER.EventQueue;

    /** All the simulation is inside the world */
    world: RAPIER.World | null = null;

    /** Hook to interact with the simulation before each step*/
    preStepAction: Function | null = null;

    /** The current simulation step */
    stepId = 0;

    /** The current simulation step */
    runCall = 0;

    /** The simulation slowdown factor: 1 means run continuously */
    slowdown = 1;

    /** The simulation is in debug mode so we collect additional data */
    isInDebugMode = false;

    /** The last snapshot collected to be eventually stored or transmitted */
    snapshot?: Int8Array;
    /** The simulation step of the snapshot */
    snapshotStepId = 0;

    /** Used to make the simulation time indipendent */
    lastBrowserFrame = -1;

    debugInfo: IApgRprDebugInfo;

    readonly DEFAULT_VELOCITY_ITERATIONS = 4;
    readonly DEFAULT_FRICTION_ITERATIONS = 4;
    readonly MAX_SLOWDOWN = 20;

    constructor(
        awindow: IApgDomBrowserWindow,
        adocument: IApgDomDocument,
        asimulations: Map<eApgRpr_SimulationName, typeof ApgRprSim_Base>
    ) {
        this.window = awindow;
        this.document = adocument;
        this.simulations = asimulations;

        this.gui = new ApgGui(this.document);

        this.#initStats();

        this.debugInfo = {
            stepId: 0
        }

        this.viewer = new ApgRprThreeViewer(this.window, this.document);

        this.mouse = { x: 0, y: 0 };

        // @WTF What is this for??
        this.events = new RAPIER.EventQueue(true);

        // Collect continuously the mouse position in the range -1...1 both for x and y
        this.window.addEventListener("mousemove", (event: IApgDomMouseEvent) => {
            this.mouse.x = (event.clientX / this.window.innerWidth) * 2 - 1;
            this.mouse.y = 1 - (event.clientY / this.window.innerHeight) * 2;
        });

        // Set the first simulation
        this.setSimulation({ simulation: eApgRpr_SimulationName.A_PYRAMID });
    }


    #initStats() {

        const pixelRatio = this.window.devicePixelRatio;
        const statsPanelWidth = 80;

        this.stats = new ApgGuiStats(this.document, pixelRatio, statsPanelWidth);

        this.stepStatsPanel = new ApgGuiRprStepStatsPanel(this.document, pixelRatio, statsPanelWidth);
        this.stepStatsPanel.updateInMainLoop = false;
        this.stats.addPanel(this.stepStatsPanel);

        this.collidersStatsPanel = new ApgGuiRprCollidersStatsPanel(this.document, pixelRatio, statsPanelWidth);
        this.collidersStatsPanel.updateInMainLoop = false;
        this.stats.addPanel(this.collidersStatsPanel);
        
    }


    /** Hook to attach a function that will execute before the simulation step  */
    setPreStepAction(action: Function | null) {
        this.preStepAction = action;
    }


    /**
     * All the colliders and bodies must be already in place
     */
    addWorld(aworld: RAPIER.World) {

        this.preStepAction = null;

        // @MAYBE  we should delete the old stuff explicitly-- APG 20230814
        this.world = aworld;

        this.world.maxVelocityIterations = this.DEFAULT_VELOCITY_ITERATIONS;

        this.stepId = 0;

        // @MAYBE  these are too hidden side effect change name -- APG 20230814
        this.stepStatsPanel.begin();
        this.collidersStatsPanel.begin();

        // @NOTE This means that all the colliders are already in place
        this.world.forEachCollider((coll: RAPIER.Collider) => {
            // Add a draw stub to all the colliders in the simulation
            this.viewer.addCollider(coll);
        });
    }



    /** If we call this it means that the camera is locked */
    resetCamera(acameraPosition: IApgRpr_CameraPosition) {

        this.viewer.setCamera(acameraPosition);

    }


    setSimulation(aparams: IApgRprSim_Params) {

        const simulation = aparams.simulation!;
        const simulationType = this.simulations.get(simulation);
        if (!simulationType) {
            const errorMessage = `Simulation for ${simulation} is not yet available`
            alert(errorMessage);
            throw new Error(errorMessage);
        }

        this.gui.clearControls();

        this.viewer.reset();

        // TODO Semantically this seems not good. We should store this somewhere and
        // dispose everyting when we change the simulation -- APG 20230812
        const newSimulation = new simulationType(this, aparams);

    }


    takeSnapshot() {
        if (this.world) {
            this.snapshot = this.world.takeSnapshot();
            this.snapshotStepId = this.stepId;
        }
    }


    restoreSnapshot() {
        if (this.world && this.snapshot) {
            this.world.free();
            this.world = RAPIER.World.restoreSnapshot(this.snapshot);
            this.stepId = this.snapshotStepId;
        }
    }


    run() {
        this.runCall++;

        let canRun = false; 
        if (this.runCall % this.slowdown == 0) { 
            this.runCall = 0;
            if (this.slowdown != this.MAX_SLOWDOWN) { 
                canRun = true;
            }
        }

        if (this.preStepAction) {
            // @MAYBE  And if we want to pass some arguments?? -- APG 20230812
            // @WARNING be a aware that in a game all the simulation logic has to run here -- APG 20230814 
            this.preStepAction();
        }
        
        if (this.world && canRun) {

            // @NOTE Here we update the RAPIER world!!!!
            this.stepStatsPanel.begin();
            this.world.step(this.events); // WTF ???
            this.stepId++;
            this.stepStatsPanel.end();

            this.debugInfo.stepId = this.stepId;

            // @NOTE Here we update THREE.js only when the world changes!!! 
            if (this.world) {
                this.stats.begin();
                this.viewer.render(this.world, this.isInDebugMode);
                this.stats.end();
            }

            this.#collectDebugInfo();
        }


        // @NOTE Were is the main loop of the simulation !!!
        this.window.requestAnimationFrame((frame: number) => {

            if (this.lastBrowserFrame !== -1) {
                // TODO make the animation time independent -- APG 20230814
                // this.world?.step(frame - this.lastBrowserStep);
            }
            this.lastBrowserFrame = frame;

            this.run();
        })

    }


    #collectDebugInfo() {

        if (this.world && this.isInDebugMode) {

            // TODO move all this stuff under a dedicated takeSnapshot flag -- APG 20230814
            if ( /*this.settings.isTakingSnapshots*/ true) {

                this.snapshotStepId = this.stepId;

                let t0 = (performance || Date).now();
                const snapshot = this.world.takeSnapshot();
                let t1 = (performance || Date).now();
                const snapshotTime = t1 - t0;

                t0 = (performance || Date).now();
                const worldHash = md5(snapshot);
                t1 = (performance || Date).now();
                const worldHashTime = t1 - t0;

                this.debugInfo.snapshotTime = snapshotTime;
                this.debugInfo.worldHash = worldHash;
                this.debugInfo.worldHashTime = worldHashTime;
                this.debugInfo.snapshotStepId = this.snapshotStepId;

            }

            // TODO restore this -- APG 20230817
            // this.stats.setDebugInfos(debugInfos);
        }
    }
}
