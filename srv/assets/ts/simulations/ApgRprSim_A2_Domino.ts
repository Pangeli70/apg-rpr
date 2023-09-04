/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/22]
 * -----------------------------------------------------------------------
*/

import { IApgDomElement, IApgDomKeyboardEvent, IApgDomRange, IApgDomSelect } from "../ApgDom.ts";
import { ApgGui, ApgGui_IMinMaxStep } from "../ApgGui.ts";
import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


enum ApgRprSim_Domino_eCardsPatterns {
    RANDOM = 'Random',
    LINEAR = 'Linear',

    STAR = 'Star',
}

interface ApgRprSim_Domino_IGuiSettings extends ApgRprSim_IGuiSettings {

    isCardsGroupOpened: boolean;

    cardsPattern: ApgRprSim_Domino_eCardsPatterns;
    patternTypes: ApgRprSim_Domino_eCardsPatterns[];

    cardsRestitution: number;
    cardsRestitutionMMS: ApgGui_IMinMaxStep;

    cardsNumber: number;
    cardsNumberMMS: ApgGui_IMinMaxStep;

    throwBallPressed: boolean;

}


export class ApgRprSim_Domino extends ApgRprSim_Base {


    private _cardWidth = 1;
    private _cardDepth = 0.5;
    private _cardHeight = 2.0;

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRprSim_Domino_GuiBuilder);

        const settings = this.params.guiSettings as ApgRprSim_Domino_IGuiSettings;
        this.#createWorld(settings);
        this.simulator.addWorld(this.world);

        if (!this.params.restart) {
            this.simulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => {
            this.updateFromGui();
        });
    }


    #createWorld(asettings: ApgRprSim_Domino_IGuiSettings) {

        const WORLD_SIZE = 60;
        const CARDS_AREA_DIAMETER = WORLD_SIZE * 0.9;

        // Create Ground.
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(WORLD_SIZE / 2, 0.1, WORLD_SIZE / 2);
        this.world.createCollider(groundColliderDesc, groundBody);

        this.#createCards(asettings, CARDS_AREA_DIAMETER);

        this.simulator.document.onkeyup = (event: IApgDomKeyboardEvent) => {
            if (event.key == " ") {
                this.#throwBall();
            }
        }
    };


    #createRandomCards(
        asettings: ApgRprSim_Domino_IGuiSettings,
        acardsAreaDiameter: number
    ) {

        const ashift = 2 * this._cardHeight;
        const r = new Array<RAPIER.Quaternion>();
        for (let i = 0; i < asettings.cardsNumber; ++i) {

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
        asettings: ApgRprSim_Domino_IGuiSettings,
        acardsAreaDiameter: number
    ) {

        const deltaZ = this._cardHeight * 0.75;
        const ashift = 2 * this._cardHeight;
        const r = new Array<RAPIER.Quaternion>();
        for (let i = 0; i < asettings.cardsNumber; ++i) {

            const x = 0;
            const y = ashift;
            const z = -acardsAreaDiameter / 2 + (deltaZ * i);
            const w = 0; //this.rng.next() - 1;

            const quaternion = new RAPIER.Quaternion(x, y, z, w);
            r.push(quaternion);
        }
        return r;
    }

    #createCards(asettings: ApgRprSim_Domino_IGuiSettings, acardsAreaDiameter: number) {

        const blocks = asettings.cardsNumber;
        let p
        switch (asettings.cardsPattern) {
            case ApgRprSim_Domino_eCardsPatterns.RANDOM: {
                p = this.#createRandomCards(asettings, acardsAreaDiameter);
                break;
            }
            case ApgRprSim_Domino_eCardsPatterns.LINEAR: {
                p = this.#createLineCards(asettings, acardsAreaDiameter);
                break;
            }
            case ApgRprSim_Domino_eCardsPatterns.STAR: {
                p = this.#createRandomCards(asettings, acardsAreaDiameter);
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

        const target = this.simulator.viewer.controls.target.clone();
        target.x = Math.round(target.x * 100) / 100;
        target.y = Math.round(target.y * 100) / 100;
        target.z = Math.round(target.z * 100) / 100;

        const source = target.clone();
        this.simulator.viewer.controls.object.getWorldPosition(source);
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
        this.simulator.gui.log(`Ball spawn s:${source.x},${source.y},${source.z} / t: ${target.x},${target.y},${target.z} / d:${dist.x},${dist.y},${dist.z}`);

    }


    override updateFromGui() {
        const settings = this.params.guiSettings as ApgRprSim_Domino_IGuiSettings;

        if (this.needsUpdate()) {

            if (settings.throwBallPressed) {
                this.#throwBall();
                settings.throwBallPressed = false;
            }

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: ApgRprSim_Domino_IGuiSettings = {

            ...super.defaultGuiSettings(),

            isCardsGroupOpened: false,

            cardsPattern: ApgRprSim_Domino_eCardsPatterns.RANDOM,
            patternTypes: Object.values(ApgRprSim_Domino_eCardsPatterns),

            cardsRestitution: 0.05,
            cardsRestitutionMMS: {
                min: 0.1,
                max: 0.5,
                step: 0.05
            },

            cardsNumber: 30,
            cardsNumberMMS: {
                min: 10,
                max: 250,
                step: 5
            },

            throwBallPressed: false,

        }

        r.cameraPosition.eye.x = -30;
        r.cameraPosition.eye.y = 20;
        r.cameraPosition.eye.z = -30;

        return r;
    }

}


class ApgRprSim_Domino_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_Domino_IGuiSettings;

    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_Domino_IGuiSettings;
    }


    override buildHtml() {

        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const cubesGroupControl = this.#buildCardsGroupControl();

        const simControls = super.buildHtml();

        const r = this.buildPanelControl(
            `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
            [
                simulationChangeControl,
                restartSimulationButtonControl,
                cubesGroupControl,
                simControls
            ]
        );

        return r;

    }


    #buildCardsGroupControl() {


        const THROW_BALL_BTN = 'throwBallControl';
        const throwBallControl = this.buildButtonControl(
            THROW_BALL_BTN,
            'Throw ball',
            () => {
                this.guiSettings.throwBallPressed = true;
            }
        )

        const CARDS_REST_CNT = 'cardsRestitutionControl';
        const cardsRestitutionControl = this.buildRangeControl(
            CARDS_REST_CNT,
            'Restitution',
            this.guiSettings.cardsRestitution,
            this.guiSettings.cardsRestitutionMMS.min,
            this.guiSettings.cardsRestitutionMMS.max,
            this.guiSettings.cardsRestitutionMMS.step,
            () => {
                const range = this.gui.controls.get(CARDS_REST_CNT)!.element as IApgDomRange;
                this.guiSettings.cardsRestitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${CARDS_REST_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const CARD_HGT_CNT = 'cardHeightControl';
        const cardHeightControl = this.buildRangeControl(
            CARD_HGT_CNT,
            'Cards number',
            this.guiSettings.cardsNumber,
            this.guiSettings.cardsNumberMMS.min,
            this.guiSettings.cardsNumberMMS.max,
            this.guiSettings.cardsNumberMMS.step,
            () => {
                const range = this.gui.controls.get(CARD_HGT_CNT)!.element as IApgDomRange;
                this.guiSettings.cardsNumber = parseFloat(range.value);
                const output = this.gui.controls.get(`${CARD_HGT_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const keyValues = new Map<string, string>();
        for (const pattern of this.guiSettings.patternTypes) {
            keyValues.set(pattern, pattern);
        }
        const PATTERN_SELECT_CNT = 'patternSelectControl';
        const patternSelectControl = this.buildSelectControl(
            PATTERN_SELECT_CNT,
            'Pattern',
            this.guiSettings.cardsPattern,
            keyValues,
            () => {
                const select = this.gui.controls.get(PATTERN_SELECT_CNT)!.element as IApgDomSelect;
                this.guiSettings.cardsPattern = select.value as ApgRprSim_Domino_eCardsPatterns;
                this.params.restart = true;
            }
        );


        const r = this.buildGroupControl(
            "cardsGroupControl",
            "Domino Cards:",
            [
                throwBallControl,
                cardsRestitutionControl,
                cardHeightControl,
                patternSelectControl
            ],
            this.guiSettings.isCardsGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.guiSettings.isCardsGroupOpened = !this.guiSettings.isCardsGroupOpened;
                    this.gui.log('Cards group toggled')
                }
            }

        );
        return r;
    }



    

}

