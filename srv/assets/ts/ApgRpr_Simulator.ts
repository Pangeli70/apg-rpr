/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomBrowserWindow,
    IApgDomDocument,
    IApgDomMouseEvent
} from "./ApgDom.ts";

import {
    ApgGui
} from "./ApgGui.ts";

import {
    ApgGui_Stats} from "./ApgGui_StatsPanel.ts";
import {
  ApgRpr_Colliders_StatsPanel,
  ApgRpr_Step_StatsPanel
} from "./ApgRpr_StatsPanels.ts";

import {
    RAPIER, md5
} from './ApgRpr_Deps.ts';

import {
    ApgRpr_ICameraPosition,
    ApgRpr_IDebugInfo,
    IApgRpr_Point2D
} from "./ApgRpr_Interfaces.ts";

import {
    ApgRpr_Simulation,
    ApgRpr_ISimulationSettings,
    ApgRpr_ISimulationParams
} from "./ApgRpr_Simulation.ts";

import {
    ApgRpr_Viewer
} from "./ApgRpr_Viewer.ts";

import {
    ApgRpr_eSimulationName
} from "./ApgRpr_Simulations.ts";

import {
    ApgWgl_IOrbitControlsParams
} from "./ApgWgl_Viewer.ts";
import { ApgUts_Logger } from "./ApgUts_Logger.ts";
import { ApgUts } from "./ApgUts.ts";



/**
 * The simulator controls the progress of the simulation and holds the 
 * shared objects and services
 */
export class ApgRpr_Simulator {

    /** Used to interact with the browser we don't like global variables */
    private _window: IApgDomBrowserWindow;
    /** Used to interact with the DOM we don't like global variables */
    private _document: IApgDomDocument;
    get document() { return this._document; }

    /** The current set of simulations */
    private _simulations: Map<ApgRpr_eSimulationName, typeof ApgRpr_Simulation>;
    /** Names of the loaded simulations */
    get simulationsNames() { return Array.from(this._simulations.keys()); }
    /** Default simulation */
    private _defaultSimulationName: ApgRpr_eSimulationName;

    /** Gui */
    private _gui: ApgGui;
    get gui() { return this._gui; }

    /** Logger */
    private _logger: ApgUts_Logger;
    get logger() { return this._logger; }

    /** Stats objects */
    private _stats: ApgGui_Stats | null = null;
    get stats() { return this._stats; }
    private _stepStatsPanel: ApgRpr_Step_StatsPanel | null = null;;
    private _collidersStatsPanel: ApgRpr_Colliders_StatsPanel | null = null;;

    /** The THREE viewer attached to the simulation */
    viewer: ApgRpr_Viewer;

    /** Eventually used for picking objects with a raycaster */
    mouse: IApgRpr_Point2D;

    /** We don't know yet ??? */
    private _events: RAPIER.EventQueue;

    /** All the simulation is inside the world */
    private _world: RAPIER.World | null = null;

    /** Hook to interact with the simulation before each step*/
    private _preStepAction: Function | null = null;
    /** Hook to interact with the simulation after each step*/
    private _postStepAction: Function | null = null;


    /** This is used to count the number of times the step function is called and to manage the slowdown */
    private _runCall = 0;

    /** The simulation slowdown factor: 1 means run continuously. 
     * When set to MAX_SLOWDOWN the simulation is stopped */
    private _slowdownFactor = 1;
    set slowDownFactor(a: number) { this._slowdownFactor = a; }


    /** Used to keep track of requestAnimationFrame timings and 
     * make the simulation time indipendent */
    // @WARNING this is experimental, if the simulation goes time indipendant 
    // it will be no more fully deterministic and so reproducible
    private _lastFrameTime = -1;

    /** We run the simulation only if the document has the focus */
    private _documentHasFocus = false;


    /** The simulation is in debug mode so we show collider edges and vectors and collect additional data */
    private _isInDebugMode = false;
    set debugMode(a: boolean) { this._isInDebugMode = a; }

    /** The debug info contain the simulation step counter and other data*/
    debugInfo: ApgRpr_IDebugInfo;


    /** The last snapshot collected to be eventually stored or transmitted */
    snapshot?: Int8Array;
    /** The simulation step of the snapshot */
    private _snapshotStepId = 0;

    readonly DEFAULT_GRAVITY = 9.81;

    readonly DEFAULT_GRAVITY_X = 0;
    readonly DEFAULT_GRAVITY_Y = -this.DEFAULT_GRAVITY;
    readonly DEFAULT_GRAVITY_Z = 0;

    /** This sets the viewer and the world*/
    readonly DEFAULT_SCENE_SIZE = 10;

    // default RAPIER settings
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

    static readonly RPR_SIMULATOR_NAME = "Rapier simulator";

    constructor(
        awindow: IApgDomBrowserWindow,
        adocument: IApgDomDocument,
        aguiElementId: string,
        aviewerElementId: string,
        asimulations: Map<ApgRpr_eSimulationName, typeof ApgRpr_Simulation>,
        adefaultSim: ApgRpr_eSimulationName
    ) {

        this._window = awindow;
        this._document = adocument;
        this._simulations = asimulations;
        this._defaultSimulationName = adefaultSim;
        this._logger = new ApgUts_Logger();
        this._logger.addLogger(ApgRpr_Simulator.RPR_SIMULATOR_NAME);

        this._gui = new ApgGui(
            this._document, aguiElementId, aviewerElementId, this._logger
        );

        this.#initStats();

        this.debugInfo = {
            stepId: 0
        }

        this.viewer = new ApgRpr_Viewer(
            this._window, this._document, this._gui.viewerElement, this._logger, this.DEFAULT_SCENE_SIZE
        );


        this.mouse = { x: 0, y: 0 };

        // @WTF What is this for??
        this._events = new RAPIER.EventQueue(true);

        // Collect continuously the mouse position in the range -1...1 both for x and y
        this._window.addEventListener("mousemove", (event: IApgDomMouseEvent) => {
            this.mouse.x = (event.clientX / this._window.innerWidth) * 2 - 1;
            this.mouse.y = 1 - (event.clientY / this._window.innerHeight) * 2;
        });

        this._logger.devLog('Rpr simulator created', ApgRpr_Simulator.RPR_SIMULATOR_NAME);

    }



    /**
     * Tries to get simulation parameters in the following order 1) querystring, 2) localstorage 3) revert to defaults
     * @returns The current simulation parameters
     */
    getSimulationParams() {

        let settings: ApgRpr_ISimulationSettings | null = null;

        // Try to get the simulation settings from querystring
        const querystringParams = new URLSearchParams(this._window.location.search);
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
            const lastSimulation = this._window.localStorage.getItem(this.LOCALSTORAGE_KEY__LAST_SIMULATION);
            if (lastSimulation != undefined) {
                const localStorageSettings = this._window.localStorage.getItem(this.LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS + lastSimulation);
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

        let params: ApgRpr_ISimulationParams;

        // Simulation settings not provided so revert to default
        if (settings === null) {
            params = {
                simulation: this._defaultSimulationName,
                settings: undefined as unknown as ApgRpr_ISimulationSettings
            };
        }
        else {
            params = {
                simulation: settings.simulation,
                settings: settings
            };
        }

        return params;
    }



    #initStats() {

        const pixelRatio = this._window.devicePixelRatio;
        const statsPanelWidth = 80;

        this._stats = new ApgGui_Stats(this._document, pixelRatio, statsPanelWidth);

        this._stepStatsPanel = new ApgRpr_Step_StatsPanel(this._document, pixelRatio, statsPanelWidth);
        this._stepStatsPanel.updateInMainLoop = false;
        this._stats.addPanel(this._stepStatsPanel);

        this._collidersStatsPanel = new ApgRpr_Colliders_StatsPanel(this._document, pixelRatio, statsPanelWidth);
        this._collidersStatsPanel.updateInMainLoop = false;
        this._stats.addPanel(this._collidersStatsPanel);

    }



    /** 
     * Hook to attach a function that will execute before the simulation step
     */
    setPreStepAction(action: Function | null) {

        this._preStepAction = action;

    }



    /** 
     * Hook to attach a function that will execute after the simulation step
     */
    setPostStepAction(action: Function | null) {

        this._postStepAction = action;

    }



    /**
     * All the colliders and bodies must be already in place
     */
    addWorld(aworld: RAPIER.World) {

        this._preStepAction = null;
        this._postStepAction = null;

        // @MAYBE  we should delete the old stuff explicitly-- APG 20230814
        this._world = aworld;


        // @MAYBE  these are too hidden side effect change name -- APG 20230814
        this._stepStatsPanel!.begin();
        this._collidersStatsPanel!.begin();
        this.debugInfo.stepId = 0;
        this.debugInfo.integrationParams = this._world.integrationParameters;

        // @NOTE This means that all the colliders are already in place
        this._world.forEachCollider((coll: RAPIER.Collider) => {
            // Add a draw stub to all the colliders in the simulation
            this.viewer.addCollider(coll);
        });

        this._logger.devLog('Rapier world added', ApgRpr_Simulator.RPR_SIMULATOR_NAME);
    }



    /** 
     * Called to allow the DOM to refresh when is changed diamically.
     * It delays the event loop calling setTimeout
     */
    updateViewerPanel(ahtml: string) {

        this._gui.isRefreshing = true;

        this._gui.panelElement.innerHTML = ahtml;

        // @WARNING This is a hack that could be useful to allow to run everything asynchronously -- APG 20230916
        setTimeout(() => {
            this._gui.isRefreshing = false;
        }, 0);
    }



    /** 
     * Called to allow the DOM to refresh when is changed dinamically.
     * It delays the event loop calling setTimeout
     */
    updateViewerHud(ahtml: string) {

        this._gui.isRefreshing = true;

        this._gui.hudElement.innerHTML = ahtml;

        setTimeout(() => {
            this._gui.isRefreshing = false;
        }, 0);
    }



    /** 
     * If we call this it means that the camera is locked
     */
    resetCamera(acameraPosition: ApgRpr_ICameraPosition) {

        // @TODO this cast is a bad hack, works only because the two interfaces overlap -- APG 20230930

        this.viewer.moveCamera(acameraPosition as ApgWgl_IOrbitControlsParams);

    }



    /**
     * Allows to restart the current simulation or to change another one
     * @param aparams
     */
    setSimulation(aparams: ApgRpr_ISimulationParams) {

        const simulation = aparams.simulation;
        const simulationType = this._simulations.get(simulation);
        ApgUts.Assert(
            simulationType != undefined,
            `Simulation for (${simulation}) is not yet available`
        )

        // @TODO this should detach the previous event listeners and remove all the elements from the dom -- APG 20230922
        this._gui.clearControls();

        // @TODO this should freeze ther THREE viewer updates and remove all the meshes from the scene -- APG 20230922
        this.viewer.reset();

        if (aparams.settings) { 
            aparams.settings.doRestart = false;
        }

        // @TODO Semantically this seems not good. We should store this somewhere and
        // dispose everyting explicitly when we change the simulation instead than let 
        // the garbage collector to do it on its own -- APG 20230812
        const _newSimulation = new simulationType!(this, aparams);


        // Save data to local storage
        this._window.localStorage.setItem(this.LOCALSTORAGE_KEY__LAST_SIMULATION, simulation);
        const settingsKey = this.LOCALSTORAGE_KEY_HEADER__SIMULATION_SETTINGS + simulation;
        const localStorageSettings = JSON.stringify(aparams.settings!, undefined, "  ");
        this._window.localStorage.setItem(settingsKey, localStorageSettings);

        this._logger.devLog(simulation + ' simulation changed', ApgRpr_Simulator.RPR_SIMULATOR_NAME);

    }



    run() {

        if (this._world && this.#canRun()) {

            if (this._preStepAction) {
                // @MAYBE  And if we want to pass some arguments?? -- APG 20230812
                // @WARNING be a aware that in a game all the simulation logic has to run here -- APG 20230814 
                this._preStepAction();
            }

            // @NOTE Here we update the RAPIER world!!!!
            this._stepStatsPanel!.begin();
            this._world.step(this._events); // WTF ???
            this._stepStatsPanel!.end();

            this._collidersStatsPanel!.update(this._world.colliders.len());

            // @NOTE Here we update THREE.js after the world update!!! 
            this._stats!.begin();
            this.viewer.updateAndRender(this._world, this._isInDebugMode);
            this._stats!.end();

            this.debugInfo.stepId++;

            this.#collectDebugInfo();

            if (this._postStepAction) {
                this._postStepAction();
            }
        }


        // @NOTE Here is the main loop of the simulation !!!
        // We try to run at constant speed and detect slowdowns
        this._window.setTimeout(() => {

            this.#focusDetection();

            this.#timeoutMetering();

            this.run();

        }, this.DEFAULT_SIMULATION_RATE);

    }



    #canRun() {

        this._runCall++;

        let r = false;

        if (this._runCall % this._slowdownFactor == 0) {
            this._runCall = 0;
            r = true;
        }

        // The simulation is paused
        if (this._slowdownFactor == this.MAX_SLOWDOWN) {
            r = false;
        }
        return r;
    }




    #timeoutMetering() {

        const frameTime = performance.now();

        // Detect and log the slowdown if it is larger than 10%
        if (this._lastFrameTime !== -1) {
            const framesPerSecExpected = 1 / this.DEFAULT_SIMULATION_RATE;
            const framesPerSec = 1 / ((frameTime - this._lastFrameTime) / 1000);
            const frameDifference = Math.abs(framesPerSec - framesPerSecExpected);

            if (frameDifference > (framesPerSecExpected / 10)) {
                this._logger.devLog(
                    `Simulation rate is lower than expected ${framesPerSec} vs ${framesPerSecExpected}`,
                    ApgRpr_Simulator.RPR_SIMULATOR_NAME
                );
            }

        }
        this._lastFrameTime = frameTime;
    }



    #focusDetection() {

        if (this._world) {
            if (!this._document.hasFocus()) {

                this._world!.integrationParameters.dt = 0;
                if (this._documentHasFocus != false) {
                    this._logger.devLog('Document lost focus: simulation paused', ApgRpr_Simulator.RPR_SIMULATOR_NAME);
                    this._documentHasFocus = false;
                }
            }
            else {
                this._world!.integrationParameters.dt = this.DEFAULT_SIMULATION_RATE;
                if (this._documentHasFocus != true) {
                    this._logger.devLog('Document has focus: simulation active', ApgRpr_Simulator.RPR_SIMULATOR_NAME);
                    this._documentHasFocus = true;
                }
            }
        }
    }




    #collectDebugInfo() {

        if (this._world && this._isInDebugMode) {

            // @TODO move all this stuff under a dedicated takeSnapshot flag -- APG 20230814
            if ( /*this.settings.isTakingSnapshots*/ true) {

                this._snapshotStepId = this.debugInfo.stepId;

                let t0 = (performance || Date).now();
                const snapshot = this._world.takeSnapshot();
                let t1 = (performance || Date).now();
                const snapshotTime = t1 - t0;

                this.debugInfo.snapshotTime = snapshotTime;

                t0 = (performance || Date).now();
                const worldHash = md5(snapshot);
                t1 = (performance || Date).now();
                const worldHashTime = t1 - t0;

                this.debugInfo.worldHash = worldHash;
                this.debugInfo.worldHashTime = worldHashTime;
                this.debugInfo.snapshotStepId = this._snapshotStepId;

            }

        }
    }



    takeSnapshot() {
        if (this._world) {
            this.snapshot = this._world.takeSnapshot();
            this._snapshotStepId = this.debugInfo.stepId;
        }
    }



    restoreSnapshot() {
        if (this._world && this.snapshot) {
            this._world.free();
            this._world = RAPIER.World.restoreSnapshot(this.snapshot);
            this.debugInfo.stepId = this._snapshotStepId;
        }
    }


}
