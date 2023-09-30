/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/24]
 * -----------------------------------------------------------------------
*/

import { IApgDomElement, IApgDomKeyboardEvent, IApgDomRange } from "../ApgDom.ts";
import { ApgGui, ApgGui_IMinMaxStep } from "../ApgGui.ts";
import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSim_Base.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface ApgRprSim_CharacterController_IGuiSettings extends ApgRprSim_IGuiSettings {

    isCubesGroupOpened: boolean;

    cubesRestitution: number;
    cubesRestitutionMMS: ApgGui_IMinMaxStep;

    size: number;
    sizeMMS: ApgGui_IMinMaxStep;

}


export class ApgRprSim_CharacterController extends ApgRprSim_Base {

    character!: RAPIER.RigidBody;
    characterCollider!: RAPIER.Collider;
    characterController!: RAPIER.KinematicCharacterController;
    movementDirection!: RAPIER.Vector3;

    characterGravity = 0.1;
    characterSpeed = 0.1;



    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {

        super(asimulator, aparams);

        this.buildGui(ApgRprSim_CharacterController_GuiBuilder);

        const settings = this.params.guiSettings! as ApgRprSim_CharacterController_IGuiSettings;
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
            this.updateCharacter();
        });
    }


    #createWorld(asettings: ApgRprSim_CharacterController_IGuiSettings) {

        // Create Ground.
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(30.0, 0.1, 30.0);
        this.world.createCollider(groundColliderDesc, groundBody);


        // Dynamic cubes.
        const rad = 0.5;
        const num = 5;
        const shift = rad * 2.5;
        const center = num * rad;
        const height = 5.0;

        for (let i = 0; i < num; i++) {
            for (let j = i; j < num; j++) {
                for (let k = i; k < num; k++) {
                    const x = (i * shift) / 2.0 + (k - i) * shift - center;
                    const y = (i * shift) / 2.0 + height;
                    const z = (i * shift) / 2.0 + (j - i) * shift - center;

                    // Create dynamic cube.
                    const bodyDesc = RAPIER.RigidBodyDesc
                        .dynamic()
                        .setTranslation(x, y, z,);
                    const body = this.world
                        .createRigidBody(bodyDesc);
                    const colliderDesc = RAPIER.ColliderDesc
                        .cuboid(rad, rad / 2.0, rad,);
                    this.world
                        .createCollider(colliderDesc, body);
                }
            }
        }

        // Character.
        const characterDesc =
            RAPIER.RigidBodyDesc
                .kinematicPositionBased()
                .setTranslation(-10.0, 4.0, -10.0,);
        this.character = this.world.createRigidBody(characterDesc);
        const characterColliderDesc = RAPIER.ColliderDesc
            .cylinder(1.2, 0.6);
        this.characterCollider = this.world.createCollider(
            characterColliderDesc,
            this.character,
        );

        this.characterController = this.world.createCharacterController(0.1);
        this.characterController.enableAutostep(0.7, 0.3, true);
        this.characterController.enableSnapToGround(0.7);

        this.movementDirection = { x: 0.0, y: -this.characterGravity, z: 0.0 };

        this.simulator.document.onkeydown = (event: IApgDomKeyboardEvent) => {
            if (event.key == "ArrowUp" || event.key == "w") this.movementDirection.x = this.characterSpeed;
            if (event.key == "ArrowDown" || event.key == "s") this.movementDirection.x = -this.characterSpeed;
            if (event.key == "ArrowLeft" || event.key == "a") this.movementDirection.z = -this.characterSpeed;
            if (event.key == "ArrowRight" || event.key == "d") this.movementDirection.z = this.characterSpeed;
            if (event.key == " ") this.movementDirection.y = this.characterGravity;
        };

        this.simulator.document.onkeyup = (event: IApgDomKeyboardEvent) => {
            if (event.key == "ArrowUp" || event.key == "w") this.movementDirection.x = 0.0;
            if (event.key == "ArrowDown" || event.key == "s") this.movementDirection.x = 0.0;
            if (event.key == "ArrowLeft" || event.key == "a") this.movementDirection.z = 0.0;
            if (event.key == "ArrowRight" || event.key == "d") this.movementDirection.z = 0.0;
            if (event.key == " ") this.movementDirection.y = -this.characterGravity;
        };

    }


    updateCharacter() {
        this.characterController.computeColliderMovement(
            this.characterCollider,
            this.movementDirection,
        );

        const movement = this.characterController.computedMovement()!;
        const newPos = this.character.translation()!;
        newPos.x += movement.x;
        newPos.y += movement.y;
        newPos.z += movement.z;
        this.character.setNextKinematicTranslation(newPos);
    };


    override updateFromGui() {

        if (this.needsUpdate()) {

            // TODO implement Pyramid settings

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: ApgRprSim_CharacterController_IGuiSettings = {

            ...super.defaultGuiSettings(),

            isCubesGroupOpened: false,

            cubesRestitution: 0.5,
            cubesRestitutionMMS: {
                min: 0.05,
                max: 1,
                step: 0.05
            },

            size: 8,
            sizeMMS: {
                min: 5,
                max: 12,
                step: 1
            },

        }

        r.cameraPosition.eye.x = -40;
        r.cameraPosition.eye.y = 20;
        r.cameraPosition.eye.z = 0;

        return r;
    }

}


export class ApgRprSim_CharacterController_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_CharacterController_IGuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_CharacterController_IGuiSettings;
    }


    override buildHtml() {


        const simulationChangeControl = this.buildSimulationChangeControl();
        const restartSimulationButtonControl = this.buildRestartButtonControl();

        const cubesGroupControl = this.#buildCubesGroupControl();

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


    #buildCubesGroupControl() {
        const CUBES_REST_CNT = 'blocksRestitutionControl';
        const cubesRestitutionControl = this.buildRangeControl(
            CUBES_REST_CNT,
            'Restitution',
            this.guiSettings.cubesRestitution,
            this.guiSettings.cubesRestitutionMMS.min,
            this.guiSettings.cubesRestitutionMMS.max,
            this.guiSettings.cubesRestitutionMMS.step,
            () => {
                const range = this.gui.controls.get(CUBES_REST_CNT)!.element as IApgDomRange;
                this.guiSettings.cubesRestitution = parseFloat(range.value);
                const output = this.gui.controls.get(`${CUBES_REST_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );

        const PYR_SIZE_CNT = 'pyramidSizeControl';
        const pyramidSizeControl = this.buildRangeControl(
            PYR_SIZE_CNT,
            'Size',
            this.guiSettings.size,
            this.guiSettings.sizeMMS.min,
            this.guiSettings.sizeMMS.max,
            this.guiSettings.sizeMMS.step,
            () => {
                const range = this.gui.controls.get(PYR_SIZE_CNT)!.element as IApgDomRange;
                this.guiSettings.size = parseFloat(range.value);
                const output = this.gui.controls.get(`${PYR_SIZE_CNT}Value`)!.element as IApgDomElement;
                output.innerHTML = range.value;
                //alert(range.value);
            }
        );


        const r = this.buildGroupControl(
            "cubesGroupControl",
            "Cubes:",
            [
                cubesRestitutionControl,
                pyramidSizeControl,
            ],
            this.guiSettings.isCubesGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.guiSettings.isCubesGroupOpened = !this.guiSettings.isCubesGroupOpened;
                    this.gui.logNoTime('Cubes group toggled')
                }
            }

        );
        return r;
    }


}

