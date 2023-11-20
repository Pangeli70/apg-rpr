import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulator_GuiBuilder
} from "../ApgRpr_Simulation_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
export class ApgRpr_I0_CharacterController_Simulation extends ApgRpr_Simulation {
  character;
  characterCollider;
  characterController;
  movementDirection;
  characterGravity = 0.25;
  characterSpeed = 0.1;
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_CharacterController_GuiBuilder);
    const settings = this.params.settings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
      this.updateCharacter();
    });
  }
  createWorld(asettings) {
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(30, 0.1, 30);
    this.world.createCollider(groundColliderDesc, groundBody);
    const rad = 0.5;
    const num = 5;
    const shift = rad * 2.5;
    const center = num * rad;
    const height = 5;
    for (let i = 0; i < num; i++) {
      for (let j = i; j < num; j++) {
        for (let k = i; k < num; k++) {
          const x = i * shift / 2 + (k - i) * shift - center;
          const y = i * shift / 2 + height;
          const z = i * shift / 2 + (j - i) * shift - center;
          const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
          const body = this.world.createRigidBody(bodyDesc);
          const colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad / 2, rad);
          this.world.createCollider(colliderDesc, body);
        }
      }
    }
    const characterDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-10, 4, -10);
    this.character = this.world.createRigidBody(characterDesc);
    const characterColliderDesc = RAPIER.ColliderDesc.cylinder(1.2, 0.6);
    this.characterCollider = this.world.createCollider(
      characterColliderDesc,
      this.character
    );
    this.characterController = this.world.createCharacterController(0.1);
    this.characterController.enableAutostep(0.7, 0.3, true);
    this.characterController.enableSnapToGround(0.7);
    this.movementDirection = { x: 0, y: -this.characterGravity, z: 0 };
    this.simulator.document.onkeydown = (event) => {
      if (event.key == "ArrowUp" || event.key == "w")
        this.movementDirection.x = this.characterSpeed;
      if (event.key == "ArrowDown" || event.key == "s")
        this.movementDirection.x = -this.characterSpeed;
      if (event.key == "ArrowLeft" || event.key == "a")
        this.movementDirection.z = -this.characterSpeed;
      if (event.key == "ArrowRight" || event.key == "d")
        this.movementDirection.z = this.characterSpeed;
      if (event.key == " ")
        this.movementDirection.y = this.characterGravity;
    };
    this.simulator.document.onkeyup = (event) => {
      if (event.key == "ArrowUp" || event.key == "w")
        this.movementDirection.x = 0;
      if (event.key == "ArrowDown" || event.key == "s")
        this.movementDirection.x = 0;
      if (event.key == "ArrowLeft" || event.key == "a")
        this.movementDirection.z = 0;
      if (event.key == "ArrowRight" || event.key == "d")
        this.movementDirection.z = 0;
      if (event.key == " ")
        this.movementDirection.y = -this.characterGravity;
    };
  }
  updateCharacter() {
    this.characterController.computeColliderMovement(
      this.characterCollider,
      this.movementDirection
    );
    const movement = this.characterController.computedMovement();
    const newPos = this.character.translation();
    newPos.x += movement.x;
    newPos.y += movement.y;
    newPos.z += movement.z;
    this.character.setNextKinematicTranslation(newPos);
  }
  updateFromGui() {
    if (this.needsUpdate()) {
      super.updateFromGui();
    }
  }
  defaultSettings() {
    const r = {
      ...super.defaultSettings(),
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
      }
    };
    r.cameraPosition.eye.x = -40;
    r.cameraPosition.eye.y = 20;
    r.cameraPosition.eye.z = 0;
    return r;
  }
}
export class ApgRprSim_CharacterController_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {
  _guiSettings;
  constructor(asimulator, asettings) {
    super(asimulator, asettings);
    this._guiSettings = asettings;
  }
  buildControls() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const cubesGroupControl = this.#buildCubesGroupControl();
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
  #buildCubesGroupControl() {
    const CUBES_REST_CNT = "cubesRestitutionControl";
    const cubesRestitutionControl = this.buildRangeControl(
      CUBES_REST_CNT,
      "Restitution",
      this._guiSettings.cubesRestitution,
      this._guiSettings.cubesRestitutionMMS,
      () => {
        const range = this.gui.controls.get(CUBES_REST_CNT).element;
        this._guiSettings.cubesRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${CUBES_REST_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const PYR_SIZE_CNT = "pyramidSizeControl";
    const pyramidSizeControl = this.buildRangeControl(
      PYR_SIZE_CNT,
      "Size",
      this._guiSettings.size,
      this._guiSettings.sizeMMS,
      () => {
        const range = this.gui.controls.get(PYR_SIZE_CNT).element;
        this._guiSettings.size = parseFloat(range.value);
        const output = this.gui.controls.get(`${PYR_SIZE_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildDetailsControl(
      "cubesGroupControl",
      "Cubes:",
      [
        cubesRestitutionControl,
        pyramidSizeControl
      ],
      this._guiSettings.isCubesGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this._guiSettings.isCubesGroupOpened = !this._guiSettings.isCubesGroupOpened;
          this.gui.logNoTime("Cubes group toggled");
        }
      }
    );
    return r;
  }
}
