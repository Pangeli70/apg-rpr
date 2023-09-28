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
    ApgGui_Stats,
    ApgRpr_Colliders_StatsPanel, ApgRpr_Step_StatsPanel
} from "./ApgGuiStats.ts";
import { RAPIER, md5 } from './ApgRprDeps.ts';
import {
    IApgRpr_CameraPosition, IApgRpr_DebugInfo, IApgRpr_Point2D
} from "./ApgRprInterfaces.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings, IApgRprSim_Params
} from "./ApgRprSimulationBase.ts";
import { ApgRprViewer } from "./ApgRprViewer.ts";
import { ApgRpr_eSimulationName } from "./ApgRpr_Simulations.ts";
import { IApgWglOrbitControlsParams } from "./ApgWglViewer.ts";


export class ApgRpr_Simulator {

    /** Used to interact with the browser we don't like global variables */
    window: IApgDomBrowserWindow;
    /** Used to interact with the DOM we don't like global variables */
    document: IApgDomDocument;

    /** The current set of simulations */
    simulations: Map<ApgRpr_eSimulationName, typeof ApgRprSim_Base>;
    /** Default simulation */
    defaultSim: ApgRpr_eSimulationName;

    /** Gui */
    gui: ApgGui;

    /** Stats objects */
    stats!: ApgGui_Stats;
    stepStatsPanel!: ApgRpr_Step_StatsPanel;
    collidersStatsPanel!: ApgRpr_Colliders_StatsPanel;

    /** The THREE viewer attached to the simulation */
    viewer: ApgRprViewer;

    /** Eventually used for picking objects with a raycaster */
    mouse: IApgRpr_Point2D;

    /** We don't know yet ??? */
    events: RAPIER.EventQueue;

    /** All the simulation is inside the world */
    world: RAPIER.World | null = null;

    /** Hook to interact with the simulation before each step*/
    preStepAction: Function | null = null;


    /** This is used to count the number of times is called and to manage the slow down */
    runCall = 0;

    /** The simulation slowdown factor: 1 means run continuously. 
     * When set to MAX_SLOWDOWN the simulation is stopped */
    slowdown = 1;

    /** Used to keep track of requestAnimationFrame timings and 
     * make the simulation time indipendent */
    lastBrowserFrame = -1;

    /** We run the simulation only if the document has the focus */
    documentHasFocus = false;


    /** The simulation is in debug mode so we collect additional data */
    isInDebugMode = false;
    /** The current debug info contain the simulation step counter */
    debugInfo: IApgRpr_DebugInfo;


    /** The last snapshot collected to be eventually stored or transmitted */
    snapshot?: Int8Array;
    /** The simulation step of the snapshot */
    snapshotStepId = 0;

    readonly DEFAULT_GRAVITY = 9.81;

    readonly DEFAULT_GRAVITY_X = 0;
    readonly DEFAULT_GRAVITY_Y = -this.DEFAULT_GRAVITY;
    readonly DEFAULT_GRAVITY_Z = 0;

    readonly DEFAULT_VELOCITY_ITERATIONS = 4;
    readonly DEFAULT_FRICTION_ITERATIONS = 7;
    readonly DEFAULT_STABILIZATION_ITERATIONS = 1;
    readonly DEFAULT_LINEAR_ERROR = 0.001;
    readonly DEFAULT_ERR_REDUCTION_RATIO = 0.8;
    readonly DEFAULT_PREDICTION_DISTANCE = 0.002;

    readonly DEFAULT_SIMULATION_RATE = 1 / 60;

    readonly MAX_SLOWDOWN = 20;

    readonly LOCALSTORAGE_KEY__LAST_SIMULATION = "ApgRprLocalStorage_LastSimulation";
    readonly LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS = "ApgRprLocalStorage_SimulationSettingsFor_";


    constructor(
        awindow: IApgDomBrowserWindow,
        adocument: IApgDomDocument,
        aguiPanelElementId: string,
        aviewerElementId: string,
        asimulations: Map<ApgRpr_eSimulationName, typeof ApgRprSim_Base>,
        adefaultSim: ApgRpr_eSimulationName
    ) {
        this.window = awindow;
        this.document = adocument;
        this.simulations = asimulations;
        this.defaultSim = adefaultSim;

        this.gui = new ApgGui(this.document, aguiPanelElementId, aviewerElementId);

        this.#initStats();

        this.debugInfo = {
            stepId: 0
        }

        this.viewer = new ApgRprViewer(this.window, this.document, this.gui.viewerElement);
        this.gui.log(`ApgRprThreeViewer created`);

        this.mouse = { x: 0, y: 0 };

        // @WTF What is this for??
        this.events = new RAPIER.EventQueue(true);

        // Collect continuously the mouse position in the range -1...1 both for x and y
        this.window.addEventListener("mousemove", (event: IApgDomMouseEvent) => {
            this.mouse.x = (event.clientX / this.window.innerWidth) * 2 - 1;
            this.mouse.y = 1 - (event.clientY / this.window.innerHeight) * 2;
        });


    }


    /**
     * Tries to get simulation parameters in the following order 1) querystring, 2) localstorage 3) revert to defaults
     * @returns The current simulation parameters
     */
    getSimulationParams() {
        let settings: ApgRprSim_IGuiSettings | null = null;

        // Try to get the simulation settings from querystring
        const querystringParams = new URLSearchParams(this.window.location.search);
        const b64EncodedSettings = querystringParams.get('p');
        if (b64EncodedSettings != null) {
            try {
                const stringifiedSettings = atob(b64EncodedSettings);
                alert(stringifiedSettings);
                settings = JSON.parse(stringifiedSettings);
            }
            catch (e) {
                alert('Invalid querystring params: ' + e.message);
            }
        }

        // Try to get the simulation settings from local storage
        if (settings == null) {
            const lastSimulation = this.window.localStorage.getItem(this.LOCALSTORAGE_KEY__LAST_SIMULATION);
            if (lastSimulation != undefined) {
                const localStorageSettings = this.window.localStorage.getItem(this.LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS + lastSimulation);
                if (localStorageSettings != undefined) {
                    try {
                        settings = JSON.parse(localStorageSettings);
                    }
                    catch (e) {
                        alert('Invalid local storage settings: ' + e.message);
                    }
                }
            }
        }

        let params: IApgRprSim_Params;

        // Simulation settings not provided so revert to default
        if (settings === null) {
            params = { simulation: this.defaultSim };
        }
        else {
            params = { simulation: settings.name, guiSettings: settings };
        }
        return params;
    }


    #initStats() {

        const pixelRatio = this.window.devicePixelRatio;
        const statsPanelWidth = 80;

        this.stats = new ApgGui_Stats(this.document, pixelRatio, statsPanelWidth);

        this.stepStatsPanel = new ApgRpr_Step_StatsPanel(this.document, pixelRatio, statsPanelWidth);
        this.stepStatsPanel.updateInMainLoop = false;
        this.stats.addPanel(this.stepStatsPanel);

        this.collidersStatsPanel = new ApgRpr_Colliders_StatsPanel(this.document, pixelRatio, statsPanelWidth);
        this.collidersStatsPanel.updateInMainLoop = false;
        this.stats.addPanel(this.collidersStatsPanel);

    }


    /** 
     * Hook to attach a function that will execute before the simulation step
     */
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


        // @MAYBE  these are too hidden side effect change name -- APG 20230814
        this.stepStatsPanel.begin();
        this.collidersStatsPanel.begin();
        this.debugInfo.stepId = 0;
        this.debugInfo.integrationParams = this.world.integrationParameters;

        // @NOTE This means that all the colliders are already in place
        this.world.forEachCollider((coll: RAPIER.Collider) => {
            // Add a draw stub to all the colliders in the simulation
            this.viewer.addCollider(coll);
        });

        this.gui.log('RAPIER world added');
    }


    /** 
     * Called to allow the DOM to refresh when is changed diamically.
     * It delays the event loop calling setTimeout
     */
    updateViewerPanel(ahtml: string) {

        this.gui.isRefreshing = true;

        this.gui.panelElement.innerHTML = ahtml;

        // @WARNING This is a hack that could be useful to allow to run everything asynchronously -- APG 20230916
        setTimeout(() => {
            this.gui.isRefreshing = false;
        }, 0);
    }


    /** 
     * Called to allow the DOM to refresh when is changed diamically.
     * It delays the event loop calling setTimeout
     */
    updateViewerHud(ahtml: string) {

        // @WARNING This is a stub we don't have a hud yet -- APG 20230916

        setTimeout(() => {
            this.gui.isRefreshing = false;
        }, 0);
    }


    /** 
     * If we call this it means that the camera is locked
     */
    resetCamera(acameraPosition: IApgRpr_CameraPosition) {

        this.viewer.setOrbControlsParams(acameraPosition as IApgWglOrbitControlsParams);

    }


    /**
     * Allows to restart the current simulation or to change another one
     * @param aparams
     */
    setSimulation(aparams: IApgRprSim_Params) {

        const simulation = aparams.simulation;
        const simulationType = this.simulations.get(simulation);
        if (!simulationType) {
            const errorMessage = `Simulation for (${simulation}) is not yet available`
            alert(errorMessage);
            throw new Error(errorMessage);
        }

        // TODO this should detach the previous event listeners and remove all the elements from the dom -- APG 20230922
        this.gui.clearControls();

        // TODO this should freeze ther THREE viewer updates and remove all the meshes from the scene -- APG 20230922
        this.viewer.reset();

        // TODO Semantically this seems not good. We should store this somewhere and
        // dispose everyting explicitly when we change the simulation instead than let 
        // the garbage collector to do it on its own -- APG 20230812
        const newSimulation = new simulationType(this, aparams);
        this.gui.log(`${aparams.simulation} simulation created`);

        // Save data to local storage
        this.window.localStorage.setItem(this.LOCALSTORAGE_KEY__LAST_SIMULATION, simulation);
        const settingsKey = this.LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS + simulation;
        const localStorageSettings = JSON.stringify(aparams.guiSettings!, undefined, "  ");
        this.window.localStorage.setItem(settingsKey, localStorageSettings);

    }


    takeSnapshot() {
        if (this.world) {
            this.snapshot = this.world.takeSnapshot();
            this.snapshotStepId = this.debugInfo.stepId;
        }
    }


    restoreSnapshot() {
        if (this.world && this.snapshot) {
            this.world.free();
            this.world = RAPIER.World.restoreSnapshot(this.snapshot);
            this.debugInfo.stepId = this.snapshotStepId;
        }
    }


    run() {
        this.runCall++;

        let canRun = false;
        // The simulation is not paused
        if (this.slowdown != this.MAX_SLOWDOWN) {
            if (this.runCall % this.slowdown == 0) {
                this.runCall = 0;
                canRun = true;
            }
        }


        if (this.world && canRun) {

            if (this.preStepAction) {
                // @MAYBE  And if we want to pass some arguments?? -- APG 20230812
                // @WARNING be a aware that in a game all the simulation logic has to run here -- APG 20230814 
                this.preStepAction();
            }

            // @NOTE Here we update the RAPIER world!!!!
            this.stepStatsPanel.begin();
            this.world.step(this.events); // WTF ???
            this.debugInfo.stepId++;
            this.stepStatsPanel.end();
            this.collidersStatsPanel.update(this.world.colliders.len());

            // @NOTE Here we update THREE.js only when the world changes!!! 
            if (this.world) {
                this.stats.begin();
                this.viewer.render(this.world, this.isInDebugMode);
                this.stats.end();
            }

            this.#collectDebugInfo();
        }


        // @NOTE Here is the main loop of the simulation !!!
        // We try to run at constant speed 
        this.window.setTimeout(() => {

            const frameTime = performance.now();
            const deltaTime1 = (frameTime - this.lastBrowserFrame) / 1000;


            if (this.world) {
                if (!this.document.hasFocus()) {

                    this.world!.integrationParameters.dt = 0;
                    if (this.documentHasFocus != false) {
                        this.gui.logNoTime('Document lost focus: sim. paused');
                        this.documentHasFocus = false;
                    }
                }
                else {
                    this.world!.integrationParameters.dt = this.DEFAULT_SIMULATION_RATE;
                    if (this.documentHasFocus != true) {
                        this.gui.logNoTime('Document has focus: sim. active');
                        this.documentHasFocus = true;
                    }
                }
            }


            if (this.lastBrowserFrame !== -1) {
                // TODO make the animation time independent -- APG 20230814
                if (this.world) {
                    //this.world.timestep = deltaTime1;
                    // console.log(deltaTime1.toFixed(5), deltaTime2.toFixed(5));
                }
            }
            this.lastBrowserFrame = frameTime;

            this.run();

        }, this.DEFAULT_SIMULATION_RATE);

    }


    #collectDebugInfo() {

        if (this.world && this.isInDebugMode) {

            // TODO move all this stuff under a dedicated takeSnapshot flag -- APG 20230814
            if ( /*this.settings.isTakingSnapshots*/ true) {

                this.snapshotStepId = this.debugInfo.stepId;

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

        }
    }
}
