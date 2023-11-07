/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/22]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomElement,
    IApgDomKeyboardEvent,
    IApgDomRange,
    IApgDomSelect
} from "../ApgDom.ts";

import {
    ApgGui_IMinMaxStep
} from "../ApgGui.ts";

import {
    RAPIER
} from "../ApgRpr_Deps.ts";

import {
    ApgRpr_Simulation_GuiBuilder
} from "../ApgRpr_Simulation_GuiBuilder.ts";

import {
    ApgRpr_ISimulationParams,
    ApgRpr_ISimulationSettings,
    ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";

import {
    ApgRpr_Simulator
} from "../ApgRpr_Simulator.ts";



enum ApgRpr_A2_Domino_eCardsPatterns {
    RANDOM = 'Random',
    LINEAR = 'Linear',
    STAR = 'Star',
}



interface ApgRpr_A2_Domino_ISimulationSettings extends ApgRpr_ISimulationSettings {

    isCardsGroupOpened: boolean;

    cardsPattern: ApgRpr_A2_Domino_eCardsPatterns;
    patternTypes: ApgRpr_A2_Domino_eCardsPatterns[];

    cardsRestitution: number;
    cardsRestitutionMMS: ApgGui_IMinMaxStep;

    cardsNumber: number;
    cardsNumberMMS: ApgGui_IMinMaxStep;

    throwBallPressed: boolean;

}



export class ApgRpr_A2_Domino_Simulation extends ApgRpr_Simulation {


    private _cardWidth = 1;
    private _cardDepth = 0.5;
    private _cardHeight = 2.0;



    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: ApgRpr_ISimulationParams
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRpr_A2_Domino_GuiBuilder);

        const settings = this.params.settings as ApgRpr_A2_Domino_ISimulationSettings;
        this.createWorld(settings);
        this.simulator.addWorld(this.world);

        this.simulator.setPreStepAction(() => {
            this.updateFromGui();
        });
    }


    protected override createWorld(asettings: ApgRpr_A2_Domino_ISimulationSettings) {

        const WORLD_SIZE = 60;
        const CARDS_AREA_DIAMETER = WORLD_SIZE * 0.9;

        // Create Ground.
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(WORLD_SIZE / 2, 0.1, WORLD_SIZE / 2);
        this.world.createCollider(groundColliderDesc, groundBody);



        // Create North.
        const northBodyDesc = RAPIER.RigidBodyDesc
            .fixed()
            .setTranslation(0, 1 / 2, 20)
            .setRotation({ x: 0, y: 1, z: 0, w: 0.5 })
        const northBody = this.world.createRigidBody(northBodyDesc);
        const northColliderDesc = RAPIER.ColliderDesc.cuboid(1 / 2, 1 / 2, 1 / 2);
        this.world.createCollider(northColliderDesc, northBody);

        this.#createCards(asettings, CARDS_AREA_DIAMETER);

        this.simulator.document.onkeyup = (event: IApgDomKeyboardEvent) => {
            if (event.key == " ") {
                this.#throwBall();
            }
        }
    }



    #createRandomCards(
        asettings: ApgRpr_A2_Domino_ISimulationSettings,
        acardsAreaDiameter: number
    ) {

        const ashift = 2 * this._cardHeight;
        const r = new Array<RAPIER.Quaternion>();
        for (let i = 0; i < asettings.cardsNumber; i++) {

            const x = (this.rng.next() - 0.5) * acardsAreaDiameter;
            const y = ashift;
            const z = (this.rng.next() - 0.5) * acardsAreaDiameter;
            const w = this.rng.next() - 1;

            const quaternion = new RAPIER.Quaternion(x, y, z, w);
            r.push(quaternion);
        }
        return r;
    }



    #createLineCards(
        asettings: ApgRpr_A2_Domino_ISimulationSettings,
        acardsAreaDiameter: number
    ) {

        const deltaZ = this._cardHeight * 0.75;
        const ashift = 2 * this._cardHeight;
        const r = new Array<RAPIER.Quaternion>();
        for (let i = 0; i < asettings.cardsNumber; i++) {

            const x = 0;
            const y = ashift;
            const z = -acardsAreaDiameter / 2 + (deltaZ * i);
            const w = 0; //this.rng.next() - 1;

            const quaternion = new RAPIER.Quaternion(x, y, z, w);
            r.push(quaternion);
        }
        return r;
    }



    #createStarCards(
        asettings: ApgRpr_A2_Domino_ISimulationSettings,
        acardsAreaDiameter: number
    ) {

        const y = 2 * this._cardHeight;
        const r = new Array<RAPIER.Quaternion>();

        const K_TO_RDNS = (2 * Math.PI) / 360;
        const radious = 10;
        const deltaAngle = 360 / asettings.cardsNumber;
        const startAngle = 0;

        for (let i = 0; i < asettings.cardsNumber; i++) {

            const angle = (deltaAngle * i + startAngle) % 360;
            const angleRdns = angle * K_TO_RDNS;

            // @NOTE sin and cos are inverted to get x and z
            const x = Math.cos(angleRdns) * radious;
            const z = Math.sin(angleRdns) * radious;
            const w = angle / 360;
            const message = `${angle.toFixed(2)},${angleRdns.toFixed(2)}, x:${x.toFixed(2)} z:${z.toFixed(2)} w:${w.toFixed(2)}`;
            this.logger.log(message, ApgRpr_Simulation.RPR_SIMULATION_NAME);
            // const w = Math.cos(angleRdns);

            const quaternion = new RAPIER.Quaternion(x, y, z, w);
            r.push(quaternion);

        }

        return r;
    }



    #createCards(asettings: ApgRpr_A2_Domino_ISimulationSettings, acardsAreaDiameter: number) {

        const blocks = asettings.cardsNumber;
        let p
        switch (asettings.cardsPattern) {
            case ApgRpr_A2_Domino_eCardsPatterns.RANDOM: {
                p = this.#createRandomCards(asettings, acardsAreaDiameter);
                break;
            }
            case ApgRpr_A2_Domino_eCardsPatterns.LINEAR: {
                p = this.#createLineCards(asettings, acardsAreaDiameter);
                break;
            }
            case ApgRpr_A2_Domino_eCardsPatterns.STAR: {
                p = this.#createStarCards(asettings, acardsAreaDiameter);
                break;
            }

        }

        for (let i = 0; i < blocks; ++i) {

            const { x, y, z, w } = p[i];

            const boxBodyDesc = RAPIER.RigidBodyDesc
                .dynamic()
                .setTranslation(x, y, z)
                .setRotation({ x: 0, y: 1, z: 0, w });
            const boxBody = this.world.createRigidBody(boxBodyDesc);

            const boxColliderDesc = RAPIER.ColliderDesc.cuboid(this._cardWidth / 2, this._cardHeight / 2, this._cardDepth / 2);
            this.world.createCollider(boxColliderDesc, boxBody)
                .setRestitution(asettings.cardsRestitution);

        }
    }



    #throwBall() {

        const target = this.simulator.viewer.orbitControls.target.clone();
        target.x = Math.round(target.x * 100) / 100;
        target.y = Math.round(target.y * 100) / 100;
        target.z = Math.round(target.z * 100) / 100;

        const source = target.clone();
        this.simulator.viewer.orbitControls.object.getWorldPosition(source);
        source.x = Math.round(source.x * 100) / 100;
        source.y = Math.round(source.y * 100) / 100;
        source.z = Math.round(source.z * 100) / 100;

        const dist = source.clone();
        dist.sub(target).normalize().negate().multiplyScalar(100);
        dist.x = Math.round(dist.x * 100) / 100;
        dist.y = Math.round(dist.y * 100) / 100;
        dist.z = Math.round(dist.z * 100) / 100;

        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(source.x, source.y, source.z)
            .setLinvel(dist.x, dist.y, dist.z)
            .setLinearDamping(0.5)
        const body = this.world.createRigidBody(bodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.ball(0.5).setDensity(1.0);
        const collider = this.world.createCollider(colliderDesc, body);
        this.simulator.viewer.addCollider(collider);

        const message = `Ball spawn s:${source.x},${source.y},${source.z} / t: ${target.x},${target.y},${target.z} / d:${dist.x},${dist.y},${dist.z}`
        this.logger.log(message, ApgRpr_Simulation.RPR_SIMULATION_NAME);

    }



    override updateFromGui() {
        const settings = this.params.settings as ApgRpr_A2_Domino_ISimulationSettings;

        if (this.needsUpdate()) {

            if (settings.throwBallPressed) {
                this.#throwBall();
                settings.throwBallPressed = false;
            }

            super.updateFromGui();
        }

    }



    override defaultSettings() {

        const r: ApgRpr_A2_Domino_ISimulationSettings = {

            ...super.defaultSettings(),

            isCardsGroupOpened: false,

            cardsPattern: ApgRpr_A2_Domino_eCardsPatterns.RANDOM,
            patternTypes: Object.values(ApgRpr_A2_Domino_eCardsPatterns),

            cardsRestitution: 0.05,
            cardsRestitutionMMS: {
                min: 0.1,
                max: 0.5,
                step: 0.05
            },

            cardsNumber: 30,
            cardsNumberMMS: {
                min: 4,
                max: 250,
                step: 2
            },

            throwBallPressed: false,

        }

        r.cameraPosition.eye.x = -30;
        r.cameraPosition.eye.y = 20;
        r.cameraPosition.eye.z = -30;

        return r;
    }

}



class ApgRpr_A2_Domino_GuiBuilder extends ApgRpr_Simulation_GuiBuilder {

    private _guiSettings: ApgRpr_A2_Domino_ISimulationSettings;

    constructor(
        asimulator: ApgRpr_Simulator,
        asettings: ApgRpr_ISimulationSettings
    ) {
        super(asimulator, asettings);

        this._guiSettings = asettings as ApgRpr_A2_Domino_ISimulationSettings;
    }


    override buildControls() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const cubesGroupControl = this.#buildCardsGroupControl();

        const simControls = super.buildControls();

        const r = this.buildPanelControl(
            `ApgRprSim_${this._guiSettings.simulation}_SettingsPanelId`,
            [
                simulationChangeControl,
                restartSimulationButtonControl,
                cubesGroupControl,
                simControls
            ]
        );

        return r;

    }

    override buildControlsToContainer(): string {
        const THROW_BALL_HUD_BTN = 'throwBallHudControl';
        const throwBallControl = this.buildButtonControl(
            THROW_BALL_HUD_BTN,
            'Throw ball',
            () => {
                this._guiSettings.throwBallPressed = true;
            }
        )
        return throwBallControl;
    }


    #buildCardsGroupControl() {


        const THROW_BALL_BTN = 'throwBallControl';
        const throwBallControl = this.buildButtonControl(
            THROW_BALL_BTN,
            'Throw ball',
            () => {
                this._guiSettings.throwBallPressed = true;
            }
        )

        const CARDS_REST_CNT = 'cardsRestitutionControl';
        const cardsRestitutionControl = this.buildRangeControl(
            CARDS_REST_CNT,
            'Restitution',
            this._guiSettings.cardsRestitution,
            this._guiSettings.cardsRestitutionMMS,
            () => {
                const range = this.gui.controls.get(CARDS_REST_CNT)!.element as IApgDomRange;
                this._guiSettings.cardsRestitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${CARDS_REST_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const CARD_HGT_CNT = 'cardHeightControl';
        const cardHeightControl = this.buildRangeControl(
            CARD_HGT_CNT,
            'Cards number',
            this._guiSettings.cardsNumber,
            this._guiSettings.cardsNumberMMS,
            () => {
                const range = this.gui.controls.get(CARD_HGT_CNT)!.element as IApgDomRange;
                this._guiSettings.cardsNumber = parseFloat(range.value);
                const output = this.gui.controls.get(`${CARD_HGT_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const keyValues = new Map<string, string>();
        for (const pattern of this._guiSettings.patternTypes) {
            keyValues.set(pattern, pattern);
        }
        const PATTERN_SELECT_CNT = 'patternSelectControl';
        const patternSelectControl = this.buildSelectControl(
            PATTERN_SELECT_CNT,
            'Pattern',
            this._guiSettings.cardsPattern,
            keyValues,
            () => {
                const select = this.gui.controls.get(PATTERN_SELECT_CNT)!.element as IApgDomSelect;
                this._guiSettings.cardsPattern = select.value as ApgRpr_A2_Domino_eCardsPatterns;
                this._guiSettings.doRestart = true;
            }
        );


        const r = this.buildDetailsControl(
            "cardsGroupControl",
            "Domino Cards:",
            [
                throwBallControl,
                cardsRestitutionControl,
                cardHeightControl,
                patternSelectControl
            ],
            this._guiSettings.isCardsGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this._guiSettings.isCardsGroupOpened = !this._guiSettings.isCardsGroupOpened;
                    this.gui.logNoTime('Cards group toggled')
                }
            }

        );
        return r;
    }





}

