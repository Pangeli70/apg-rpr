import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulation_GuiBuilder
} from "../ApgRpr_Simulation_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
var ApgRpr_A2_Domino_eCardsPatterns = /* @__PURE__ */ ((ApgRpr_A2_Domino_eCardsPatterns2) => {
  ApgRpr_A2_Domino_eCardsPatterns2["RANDOM"] = "Random";
  ApgRpr_A2_Domino_eCardsPatterns2["LINEAR"] = "Linear";
  ApgRpr_A2_Domino_eCardsPatterns2["STAR"] = "Star";
  return ApgRpr_A2_Domino_eCardsPatterns2;
})(ApgRpr_A2_Domino_eCardsPatterns || {});
export class ApgRpr_A2_Domino_Simulation extends ApgRpr_Simulation {
  _cardWidth = 1;
  _cardDepth = 0.5;
  _cardHeight = 2;
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRpr_A2_Domino_GuiBuilder);
    const settings = this.params.settings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    const WORLD_SIZE = 60;
    const CARDS_AREA_DIAMETER = WORLD_SIZE * 0.9;
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(WORLD_SIZE / 2, 0.1, WORLD_SIZE / 2);
    this.world.createCollider(groundColliderDesc, groundBody);
    const northBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 1 / 2, 20).setRotation({ x: 0, y: 1, z: 0, w: 0.5 });
    const northBody = this.world.createRigidBody(northBodyDesc);
    const northColliderDesc = RAPIER.ColliderDesc.cuboid(1 / 2, 1 / 2, 1 / 2);
    this.world.createCollider(northColliderDesc, northBody);
    this.#createCards(asettings, CARDS_AREA_DIAMETER);
    this.simulator.document.onkeyup = (event) => {
      if (event.key == " ") {
        this.#throwBall();
      }
    };
  }
  #createRandomCards(asettings, acardsAreaDiameter) {
    const ashift = 2 * this._cardHeight;
    const r = new Array();
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
  #createLineCards(asettings, acardsAreaDiameter) {
    const deltaZ = this._cardHeight * 0.75;
    const ashift = 2 * this._cardHeight;
    const r = new Array();
    for (let i = 0; i < asettings.cardsNumber; i++) {
      const x = 0;
      const y = ashift;
      const z = -acardsAreaDiameter / 2 + deltaZ * i;
      const w = 0;
      const quaternion = new RAPIER.Quaternion(x, y, z, w);
      r.push(quaternion);
    }
    return r;
  }
  #createStarCards(asettings, acardsAreaDiameter) {
    const y = 2 * this._cardHeight;
    const r = new Array();
    const K_TO_RDNS = 2 * Math.PI / 360;
    const radious = 10;
    const deltaAngle = 360 / asettings.cardsNumber;
    const startAngle = 0;
    for (let i = 0; i < asettings.cardsNumber; i++) {
      const angle = (deltaAngle * i + startAngle) % 360;
      const angleRdns = angle * K_TO_RDNS;
      const x = Math.cos(angleRdns) * radious;
      const z = Math.sin(angleRdns) * radious;
      const w = angle / 360;
      const message = `${angle.toFixed(2)},${angleRdns.toFixed(2)}, x:${x.toFixed(2)} z:${z.toFixed(2)} w:${w.toFixed(2)}`;
      this.logger.log(message, ApgRpr_Simulation.RPR_SIMULATION_NAME);
      const quaternion = new RAPIER.Quaternion(x, y, z, w);
      r.push(quaternion);
    }
    return r;
  }
  #createCards(asettings, acardsAreaDiameter) {
    const blocks = asettings.cardsNumber;
    let p;
    switch (asettings.cardsPattern) {
      case "Random" /* RANDOM */: {
        p = this.#createRandomCards(asettings, acardsAreaDiameter);
        break;
      }
      case "Linear" /* LINEAR */: {
        p = this.#createLineCards(asettings, acardsAreaDiameter);
        break;
      }
      case "Star" /* STAR */: {
        p = this.#createStarCards(asettings, acardsAreaDiameter);
        break;
      }
    }
    for (let i = 0; i < blocks; ++i) {
      const { x, y, z, w } = p[i];
      const boxBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z).setRotation({ x: 0, y: 1, z: 0, w });
      const boxBody = this.world.createRigidBody(boxBodyDesc);
      const boxColliderDesc = RAPIER.ColliderDesc.cuboid(this._cardWidth / 2, this._cardHeight / 2, this._cardDepth / 2);
      this.world.createCollider(boxColliderDesc, boxBody).setRestitution(asettings.cardsRestitution);
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
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(source.x, source.y, source.z).setLinvel(dist.x, dist.y, dist.z).setLinearDamping(0.5);
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.ball(0.5).setDensity(1);
    const collider = this.world.createCollider(colliderDesc, body);
    this.simulator.viewer.addCollider(collider);
    const message = `Ball spawn s:${source.x},${source.y},${source.z} / t: ${target.x},${target.y},${target.z} / d:${dist.x},${dist.y},${dist.z}`;
    this.logger.log(message, ApgRpr_Simulation.RPR_SIMULATION_NAME);
  }
  updateFromGui() {
    const settings = this.params.settings;
    if (this.needsUpdate()) {
      if (settings.throwBallPressed) {
        this.#throwBall();
        settings.throwBallPressed = false;
      }
      super.updateFromGui();
    }
  }
  defaultSettings() {
    const r = {
      ...super.defaultSettings(),
      isCardsGroupOpened: false,
      cardsPattern: "Random" /* RANDOM */,
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
      throwBallPressed: false
    };
    r.cameraPosition.eye.x = -30;
    r.cameraPosition.eye.y = 20;
    r.cameraPosition.eye.z = -30;
    return r;
  }
}
class ApgRpr_A2_Domino_GuiBuilder extends ApgRpr_Simulation_GuiBuilder {
  _guiSettings;
  constructor(asimulator, asettings) {
    super(asimulator, asettings);
    this._guiSettings = asettings;
  }
  buildControls() {
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
  buildControlsToContainer() {
    const THROW_BALL_HUD_BTN = "throwBallHudControl";
    const throwBallControl = this.buildButtonControl(
      THROW_BALL_HUD_BTN,
      "Throw ball",
      () => {
        this._guiSettings.throwBallPressed = true;
      }
    );
    return throwBallControl;
  }
  #buildCardsGroupControl() {
    const THROW_BALL_BTN = "throwBallControl";
    const throwBallControl = this.buildButtonControl(
      THROW_BALL_BTN,
      "Throw ball",
      () => {
        this._guiSettings.throwBallPressed = true;
      }
    );
    const CARDS_REST_CNT = "cardsRestitutionControl";
    const cardsRestitutionControl = this.buildRangeControl(
      CARDS_REST_CNT,
      "Restitution",
      this._guiSettings.cardsRestitution,
      this._guiSettings.cardsRestitutionMMS,
      () => {
        const range = this.gui.controls.get(CARDS_REST_CNT).element;
        this._guiSettings.cardsRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${CARDS_REST_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const CARD_HGT_CNT = "cardHeightControl";
    const cardHeightControl = this.buildRangeControl(
      CARD_HGT_CNT,
      "Cards number",
      this._guiSettings.cardsNumber,
      this._guiSettings.cardsNumberMMS,
      () => {
        const range = this.gui.controls.get(CARD_HGT_CNT).element;
        this._guiSettings.cardsNumber = parseFloat(range.value);
        const output = this.gui.controls.get(`${CARD_HGT_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const keyValues = /* @__PURE__ */ new Map();
    for (const pattern of this._guiSettings.patternTypes) {
      keyValues.set(pattern, pattern);
    }
    const PATTERN_SELECT_CNT = "patternSelectControl";
    const patternSelectControl = this.buildSelectControl(
      PATTERN_SELECT_CNT,
      "Pattern",
      this._guiSettings.cardsPattern,
      keyValues,
      () => {
        const select = this.gui.controls.get(PATTERN_SELECT_CNT).element;
        this._guiSettings.cardsPattern = select.value;
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
          this.gui.logNoTime("Cards group toggled");
        }
      }
    );
    return r;
  }
}
