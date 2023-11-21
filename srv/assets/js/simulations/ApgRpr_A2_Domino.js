import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulator_GuiBuilder
} from "../gui-builders/ApgRpr_Simulation_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
import {
  THREE
} from "../apg-wgl/deps.ts";
var ApgRpr_A2_Domino_eCardsPatterns = /* @__PURE__ */ ((ApgRpr_A2_Domino_eCardsPatterns2) => {
  ApgRpr_A2_Domino_eCardsPatterns2["RANDOM"] = "Random";
  ApgRpr_A2_Domino_eCardsPatterns2["LINEAR"] = "Linear";
  ApgRpr_A2_Domino_eCardsPatterns2["CIRCLE"] = "Circle";
  ApgRpr_A2_Domino_eCardsPatterns2["SPIRAL"] = "Spiral";
  ApgRpr_A2_Domino_eCardsPatterns2["STAR"] = "Star";
  ApgRpr_A2_Domino_eCardsPatterns2["SINUSOID"] = "Sinusoid";
  return ApgRpr_A2_Domino_eCardsPatterns2;
})(ApgRpr_A2_Domino_eCardsPatterns || {});
export class ApgRpr_A2_Domino_Simulation extends ApgRpr_Simulation {
  _cardWidth = 0.02;
  _cardDepth = 5e-3;
  _cardHeight = 0.05;
  _K_TO_RDNS = 2 * Math.PI / 360;
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
  defaultSettings() {
    const r = {
      ...super.defaultSettings(),
      isCardsGroupOpened: false,
      cardsNumber: 30,
      cardsNumberMMS: { min: 4, max: 250, step: 2 },
      cardsPattern: "Random" /* RANDOM */,
      patternTypes: Object.values(ApgRpr_A2_Domino_eCardsPatterns),
      throwBallPressed: false
    };
    return r;
  }
  createWorld(asettings) {
    this.createGround();
    this.createSimulationTable(
      asettings.table.width,
      asettings.table.depth,
      asettings.table.height,
      asettings.table.thickness
    );
    const playGroundDiameter = asettings.table.depth * 0.9;
    const northBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, asettings.table.height, asettings.table.depth / 2 * 0.9).setRotation({ x: 0, y: 1, z: 0, w: 0.5 });
    const northBody = this.world.createRigidBody(northBodyDesc);
    const northColliderDesc = RAPIER.ColliderDesc.cuboid(0.01, 0.01, 0.01);
    this.world.createCollider(northColliderDesc, northBody);
    this.#createCards(asettings, playGroundDiameter);
  }
  #createRandomCards(asettings, aplaygroundDiameter) {
    const fallHeight = asettings.table.height + 0.5 * this._cardHeight;
    const r = new Array();
    for (let i = 0; i < asettings.cardsNumber; i++) {
      const x = (this.rng.next() - 0.5) * aplaygroundDiameter;
      const y = fallHeight;
      const z = (this.rng.next() - 0.5) * aplaygroundDiameter;
      const w = this.rng.next() * 360 * this._K_TO_RDNS;
      const quaternion = new RAPIER.Quaternion(x, y, z, w);
      r.push(quaternion);
    }
    return r;
  }
  #createLineCards(asettings, aplaygroundDiameter) {
    const fallHeight = asettings.table.height + 0.5 * this._cardHeight;
    const deltaX = this._cardHeight * 0.75;
    const r = new Array();
    for (let i = 0; i < asettings.cardsNumber; i++) {
      const x = -aplaygroundDiameter / 2 + deltaX * i;
      ;
      const y = fallHeight;
      const z = 0;
      const w = 0;
      const quaternion = new RAPIER.Quaternion(x, y, z, w);
      r.push(quaternion);
    }
    return r;
  }
  #createCircleCards(asettings, aplaygroundDiameter) {
    const fallHeight = asettings.table.height + 0.5 * this._cardHeight;
    const radious = aplaygroundDiameter / 2;
    const deltaAngle = 360 / asettings.cardsNumber;
    const r = new Array();
    for (let i = 0; i < asettings.cardsNumber; i++) {
      const angle = deltaAngle * i % 360;
      const angleRdns = angle * this._K_TO_RDNS;
      const x = -Math.cos(angleRdns) * radious;
      const y = fallHeight;
      const z = Math.sin(angleRdns) * radious;
      const w = angleRdns;
      const message = `${angle.toFixed(2)},${angleRdns.toFixed(2)}, x:${x.toFixed(2)} z:${z.toFixed(2)} w:${w.toFixed(2)}`;
      this.logger.log(message, ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME);
      const quaternion = new RAPIER.Quaternion(x, y, z, w);
      r.push(quaternion);
    }
    return r;
  }
  #createSpiralCards(asettings, aplaygroundDiameter) {
    const fallHeight = asettings.table.height + 0.5 * this._cardHeight;
    const initialRadious = aplaygroundDiameter / 20;
    let currentRadious = initialRadious;
    let currentAngle = 0;
    const kIncr = 0.01;
    const distance = this._cardHeight * 0.75;
    const isConstantGrow = true;
    const r = new Array();
    for (let i = 0; i < asettings.cardsNumber; i++) {
      const angleRdns = currentAngle * this._K_TO_RDNS;
      const x = Math.cos(angleRdns) * currentRadious;
      const y = fallHeight;
      const z = -Math.sin(angleRdns) * currentRadious;
      const w = angleRdns;
      const pit = Math.sqrt(distance ** 2 + currentRadious ** 2);
      const newPit = isConstantGrow ? pit + initialRadious * kIncr : pit * (1 + kIncr);
      const sin = distance / newPit;
      const newAngleRdns = Math.asin(sin);
      const newAngle = newAngleRdns / this._K_TO_RDNS;
      currentAngle += newAngle;
      currentRadious = newPit;
      const message = `${currentAngle.toFixed(2)}, x:${x.toFixed(2)} z:${z.toFixed(2)} w:${w.toFixed(2)}`;
      this.logger.log(message, ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME);
      const quaternion = new RAPIER.Quaternion(x, y, z, w);
      r.push(quaternion);
    }
    return r;
  }
  #createCards(asettings, aplaygroundDiameter) {
    let qs;
    switch (asettings.cardsPattern) {
      case "Linear" /* LINEAR */: {
        qs = this.#createLineCards(asettings, aplaygroundDiameter);
        break;
      }
      case "Circle" /* CIRCLE */: {
        qs = this.#createCircleCards(asettings, aplaygroundDiameter);
        break;
      }
      case "Spiral" /* SPIRAL */: {
        qs = this.#createSpiralCards(asettings, aplaygroundDiameter);
        break;
      }
      case "Random" /* RANDOM */:
      default: {
        qs = this.#createRandomCards(asettings, aplaygroundDiameter);
        break;
      }
    }
    for (let i = 0; i < qs.length; ++i) {
      const { x, y, z, w } = qs[i];
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), w);
      const boxBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z).setRotation(q);
      const boxBody = this.world.createRigidBody(boxBodyDesc);
      const boxColliderDesc = RAPIER.ColliderDesc.cuboid(this._cardWidth / 2, this._cardHeight / 2, this._cardDepth / 2);
      this.world.createCollider(boxColliderDesc, boxBody).setRestitution(0.05);
    }
  }
  #throwBall() {
    const target = this.simulator.viewer.orbitControls.target.clone();
    const source = target.clone();
    this.simulator.viewer.orbitControls.object.getWorldPosition(source);
    const speedFactor = 10;
    const speedVector = source.clone();
    speedVector.sub(target).normalize().negate().multiplyScalar(speedFactor);
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(source.x, source.y, source.z).setLinvel(speedVector.x, speedVector.y, speedVector.z).setLinearDamping(0.5).setCcdEnabled(true);
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.ball(this._cardWidth * 2).setDensity(1);
    const collider = this.world.createCollider(colliderDesc, body);
    this.simulator.viewer.addCollider(collider);
    const message = `Ball spawn s:${source.x.toFixed(2)},${source.y.toFixed(2)},${source.z.toFixed(2)} / t: ${target.x.toFixed(2)},${target.y.toFixed(2)},${target.z.toFixed(2)} / d:${speedVector.x.toFixed(2)},${speedVector.y.toFixed(2)},${speedVector.z.toFixed(2)}`;
    this.logger.log(message, ApgRpr_Simulation.RPR_SIMULATION_LOGGER_NAME);
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
}
class ApgRpr_A2_Domino_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {
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
  buildHudControls() {
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
