import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSim_Base.ts";
import {
  ApgRprSim_GuiBuilder
} from "../ApgRprSim_GuiBuilder.ts";
export class ApgRprSim_PngTerrain extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_PngTerrain_GuiBuilder);
    const settings = this.params.guiSettings;
    this.#createWorld(settings);
  }
  #createWorld(asettings) {
    const pngResourceUrl = "./assets/img/png/" + asettings.heightMap + ".png";
    const image = this.simulator.document.createElement("img");
    image.src = pngResourceUrl;
    image.onload = () => {
      const numberOfColumns = asettings.sampleSize;
      const numberOfRows = asettings.sampleSize;
      const scale = new RAPIER.Vector3(200, asettings.mapHeight, 200);
      const heightsPixels = this.#sampleImagePixels(
        image,
        numberOfColumns,
        numberOfRows
      );
      const heightsRandom = this.generateRandomHeightFieldArray(
        "PNG Terrain",
        numberOfColumns,
        numberOfRows
      );
      const heightsSlope = this.generateSlopedHeightFieldArray(
        numberOfColumns,
        numberOfRows
      );
      const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
      const groundBody = this.world.createRigidBody(groundBodyDesc);
      const groundColliderDesc = RAPIER.ColliderDesc.heightfield(numberOfColumns, numberOfRows, heightsPixels, scale).setTranslation(0, -asettings.mapHeight * 2, 0);
      this.world.createCollider(groundColliderDesc, groundBody);
      this.#buildDynamicColliders(
        40,
        1,
        -asettings.sampleSize / 2,
        asettings.sampleSize / 2,
        30,
        50,
        -asettings.sampleSize / 2,
        asettings.sampleSize / 2
      );
      this.simulator.addWorld(this.world);
      if (!this.params.restart) {
        this.simulator.resetCamera(asettings.cameraPosition);
      } else {
        this.params.restart = false;
      }
      this.simulator.setPreStepAction(() => {
        this.updateFromGui();
      });
    };
  }
  #sampleImagePixels(image, anumberOfComumns, anumberOfRows) {
    const pixels = [];
    const canvas = this.simulator.document.createElement("canvas");
    this.simulator.document.body.appendChild(canvas);
    canvas.width = anumberOfComumns + 1;
    canvas.height = anumberOfRows + 1;
    const context = canvas.getContext("2d");
    context.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let column = 0; column < canvas.width; column++) {
      for (let row = 0; row < canvas.height; row++) {
        const i = (column * canvas.height + row) * 4;
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const _a = imageData[i + 3];
        const white = (r + g + b) / 3;
        const height = white / 255;
        pixels.push(height);
      }
    }
    return new Float32Array(pixels);
  }
  #buildDynamicColliders(anum, arad, aminX, amaxX, aminY, amaxY, aminZ, amaxZ) {
    const deltaX = amaxX - aminX;
    const deltaY = amaxY - aminY;
    const deltaZ = amaxZ - aminZ;
    for (let i = 0; i < anum; i++) {
      const x = this.rng.next() * deltaX + aminX;
      const y = this.rng.next() * deltaY + aminY + arad;
      const z = this.rng.next() * deltaZ + aminZ;
      const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
      const body = this.world.createRigidBody(bodyDesc);
      const colliderDesc = RAPIER.ColliderDesc.ball(arad);
      this.world.createCollider(colliderDesc, body);
    }
  }
  updateFromGui() {
    if (this.needsUpdate()) {
      super.updateFromGui();
    }
  }
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings(),
      isSamplingGroupOpened: false,
      heightMap: "HeigthMap4",
      heightMaps: ["HeigthMap1", "HeigthMap2", "HeigthMap3", "HeigthMap4"],
      sampleSize: 100,
      sampleSizeMMS: {
        min: 10,
        max: 200,
        step: 5
      },
      mapHeight: 10,
      mapHeightMMS: {
        min: 1,
        max: 25,
        step: 1
      }
    };
    return r;
  }
}
class ApgRprSim_PngTerrain_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildPanel() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const latticeGroupControl = this.#buildSampligGroupControl();
    const simControls = super.buildPanel();
    const r = this.buildPanelControl(
      `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
      [
        simulationChangeControl,
        restartSimulationButtonControl,
        latticeGroupControl,
        simControls
      ]
    );
    return r;
  }
  #buildSampligGroupControl() {
    const keyValues = /* @__PURE__ */ new Map();
    for (const map of this.guiSettings.heightMaps) {
      keyValues.set(map, map);
    }
    const MAP_SELECT_CNT = "mapSelectControl";
    const simulationSelectControl = this.buildSelectControl(
      MAP_SELECT_CNT,
      "Map",
      this.guiSettings.heightMap,
      keyValues,
      () => {
        const select = this.gui.controls.get(MAP_SELECT_CNT).element;
        this.guiSettings.heightMap = select.value;
        this.params.restart = true;
      }
    );
    const SAMPLES_SIZE_CNT = "samplesSizeControl";
    const samplesSizeControl = this.buildRangeControl(
      SAMPLES_SIZE_CNT,
      "Samples",
      this.guiSettings.sampleSize,
      this.guiSettings.sampleSizeMMS,
      () => {
        const range = this.gui.controls.get(SAMPLES_SIZE_CNT).element;
        this.guiSettings.sampleSize = parseFloat(range.value);
        const output = this.gui.controls.get(`${SAMPLES_SIZE_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const MAP_HEIGHT_CNT = "mapHeightControl";
    const mapHeightControl = this.buildRangeControl(
      MAP_HEIGHT_CNT,
      "Height",
      this.guiSettings.mapHeight,
      this.guiSettings.mapHeightMMS,
      () => {
        const range = this.gui.controls.get(MAP_HEIGHT_CNT).element;
        this.guiSettings.mapHeight = parseFloat(range.value);
        const output = this.gui.controls.get(`${MAP_HEIGHT_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildDetailsControl(
      "samplingGroupControl",
      "Sampling:",
      [
        simulationSelectControl,
        samplesSizeControl,
        mapHeightControl
      ],
      this.guiSettings.isSamplingGroupOpened,
      () => {
        if (!this.gui.isRefreshing) {
          this.guiSettings.isSamplingGroupOpened = !this.guiSettings.isSamplingGroupOpened;
          this.gui.logNoTime("Sampling group toggled");
        }
      }
    );
    return r;
  }
}
