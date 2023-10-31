import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
  ApgRprSimulation
} from "../ApgRpr_Simulation.ts";
var ApgRprSim_Domino_eCardsPatterns = /* @__PURE__ */ ((ApgRprSim_Domino_eCardsPatterns2) => {
  ApgRprSim_Domino_eCardsPatterns2["RANDOM"] = "Random";
  ApgRprSim_Domino_eCardsPatterns2["LINEAR"] = "Linear";
  ApgRprSim_Domino_eCardsPatterns2["STAR"] = "Star";
  return ApgRprSim_Domino_eCardsPatterns2;
})(ApgRprSim_Domino_eCardsPatterns || {});
export class ApgRprSim_Domino extends ApgRprSimulation {
  _cardWidth = 1;
  _cardDepth = 0.5;
  _cardHeight = 2;
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_Domino_GuiBuilder);
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    this.simulator.addWorld(this.world);
    if (!this.params.restart) {
      this.simulator.resetCamera(settings.cameraPosition);
    } else {
      this.params.restart = false;
    }
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
      this.simulator.gui.log(`${angle.toFixed(2)},${angleRdns.toFixed(2)}, x:${x.toFixed(2)} z:${z.toFixed(2)} w:${w.toFixed(2)}`);
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
    this.simulator.gui.log(`Ball spawn s:${source.x},${source.y},${source.z} / t: ${target.x},${target.y},${target.z} / d:${dist.x},${dist.y},${dist.z}`);
  }
  updateFromGui() {
    const settings = this.params.guiSettings;
    if (this.needsUpdate()) {
      if (settings.throwBallPressed) {
        this.#throwBall();
        settings.throwBallPressed = false;
      }
      super.updateFromGui();
    }
  }
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings(),
      isCardsGroupOpened: false,
      cardsPattern: "Random" /* RANDOM */,
      patternTypes: Object.values(ApgRprSim_Domino_eCardsPatterns),
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
class ApgRprSim_Domino_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildPanel() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const cubesGroupControl = this.#buildCardsGroupControl();
    const simControls = super.buildPanel();
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
  buildHud() {
    const THROW_BALL_HUD_BTN = "throwBallHudControl";
    const throwBallControl = this.buildButtonControl(
      THROW_BALL_HUD_BTN,
      "Throw ball",
      () => {
        this.guiSettings.throwBallPressed = true;
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
        this.guiSettings.throwBallPressed = true;
      }
    );
    const CARDS_REST_CNT = "cardsRestitutionControl";
    const cardsRestitutionControl = this.buildRangeControl(
      CARDS_REST_CNT,
      "Restitution",
      this.guiSettings.cardsRestitution,
      this.guiSettings.cardsRestitutionMMS,
      () => {
        const range = this.gui.controls.get(CARDS_REST_CNT).element;
        this.guiSettings.cardsRestitution = parseFloat(range.value);
        const output = this.gui.controls.get(`${CARDS_REST_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const CARD_HGT_CNT = "cardHeightControl";
    const cardHeightControl = this.buildRangeControl(
      CARD_HGT_CNT,
      "Cards number",
      this.guiSettings.cardsNumber,
      this.guiSettings.cardsNumberMMS,
      () => {
        const range = this.gui.controls.get(CARD_HGT_CNT).element;
        this.guiSettings.cardsNumber = parseFloat(range.value);
        const output = this.gui.controls.get(`${CARD_HGT_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const keyValues = /* @__PURE__ */ new Map();
    for (const pattern of this.guiSettings.patternTypes) {
      keyValues.set(pattern, pattern);
    }
    const PATTERN_SELECT_CNT = "patternSelectControl";
    const patternSelectControl = this.buildSelectControl(
      PATTERN_SELECT_CNT,
      "Pattern",
      this.guiSettings.cardsPattern,
      keyValues,
      () => {
        const select = this.gui.controls.get(PATTERN_SELECT_CNT).element;
        this.guiSettings.cardsPattern = select.value;
        this.params.restart = true;
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
      this.guiSettings.isCardsGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.guiSettings.isCardsGroupOpened = !this.guiSettings.isCardsGroupOpened;
          this.gui.logNoTime("Cards group toggled");
        }
      }
    );
    return r;
  }
}
