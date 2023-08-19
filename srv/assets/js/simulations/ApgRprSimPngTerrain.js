import { RAPIER } from "../ApgRprDeps.ts";
import { ApgRpr_eSimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSim_PngTerrain extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    const settings = this.params.guiSettings;
    this.buildGui(ApgRprSim_PngTerrain_GuiBuilder);
    this.#createWorld(settings);
  }
  #createWorld(asettings) {
    const pngResourceUrl = "./assets/img/png/" + asettings.heightMap + ".png";
    const image = this.simulator.document.createElement("img");
    image.src = pngResourceUrl;
    image.onload = () => {
      const pixels = this.#sampleImagePixels(image, asettings.sampleSize, asettings.sampleSize);
      const heightMap = this.generateHeightMap(
        asettings.sampleSize,
        asettings.sampleSize,
        100,
        asettings.mapHeight,
        100,
        pixels
      );
      const heightMap1 = this.generateRandomHeightMap(
        "Pippo",
        asettings.sampleSize,
        asettings.sampleSize,
        100,
        asettings.mapHeight,
        100
      );
      const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
      const groundBody = this.world.createRigidBody(groundBodyDesc);
      const groundColliderDesc = RAPIER.ColliderDesc.trimesh(heightMap.vertices, heightMap.indices);
      this.world.createCollider(groundColliderDesc, groundBody);
      this.#buildDynamicColliders();
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
  #sampleImagePixels(image, awidthXDivisions, adepthZDivisions) {
    const pixels = [];
    const canvas = this.simulator.document.createElement("canvas");
    this.simulator.document.body.appendChild(canvas);
    canvas.width = awidthXDivisions + 1;
    canvas.height = adepthZDivisions + 1;
    const context = canvas.getContext("2d");
    context.drawImage(
      image,
      0,
      0,
      +canvas.width,
      +canvas.height
      //         0, 0, +image.width, +image.height,
    );
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = x + y * canvas.width * 4;
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const _a = imageData[i + 3];
        const white = (r + g + b) / 3;
        const height = white / 255;
        pixels.push(height);
      }
    }
    return pixels;
  }
  #buildDynamicColliders() {
    const num = 4;
    const numy = 10;
    const rad = 1;
    const shift = rad * 2 + rad;
    const centery = shift / 2;
    let offset = -num * (rad * 2 + rad) * 0.5;
    let i, j, k;
    for (j = 0; j < numy; ++j) {
      for (i = 0; i < num; ++i) {
        for (k = 0; k < num; ++k) {
          const x = i * shift + offset;
          const y = j * shift + centery + 3;
          const z = k * shift + offset;
          const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
          const body = this.world.createRigidBody(bodyDesc);
          let colliderDesc;
          switch (j % 5) {
            case 0:
              colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
              break;
            case 1:
              colliderDesc = RAPIER.ColliderDesc.ball(rad);
              break;
            case 2:
              colliderDesc = RAPIER.ColliderDesc.cylinder(rad, rad);
              break;
            case 3:
              colliderDesc = RAPIER.ColliderDesc.cone(rad, rad);
              break;
            case 4:
              colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2, rad / 2, rad / 2);
              this.world.createCollider(colliderDesc, body);
              colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2, rad, rad / 2).setTranslation(rad, 0, 0);
              this.world.createCollider(colliderDesc, body);
              colliderDesc = RAPIER.ColliderDesc.cuboid(rad / 2, rad, rad / 2).setTranslation(-rad, 0, 0);
              break;
          }
          this.world.createCollider(colliderDesc, body);
        }
      }
      offset -= 0.05 * rad * (num - 1);
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
      heightMap: "HeigthMap1",
      heightMaps: ["HeigthMap1", "HeigthMap2"],
      sampleSize: 50,
      sampleSizeMMS: {
        min: 10,
        max: 100,
        step: 5
      },
      mapHeight: 5,
      mapHeightMMS: {
        min: 1,
        max: 25,
        step: 1
      }
    };
    return r;
  }
}
export class ApgRprSim_PngTerrain_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildHtml() {
    const latticeGroupControl = this.#buildLatticeGroupControl();
    const simControls = super.buildHtml();
    const r = this.buildPanelControl(
      "ApgRprSimPngTerrainSettingsPanel",
      ApgRpr_eSimulationName.G_PNG_MESH_TERRAIN,
      [
        latticeGroupControl,
        simControls
      ]
    );
    return r;
  }
  #buildLatticeGroupControl() {
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
      this.guiSettings.sampleSizeMMS.min,
      this.guiSettings.sampleSizeMMS.max,
      this.guiSettings.sampleSizeMMS.step,
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
      this.guiSettings.mapHeightMMS.min,
      this.guiSettings.mapHeightMMS.max,
      this.guiSettings.mapHeightMMS.step,
      () => {
        const range = this.gui.controls.get(MAP_HEIGHT_CNT).element;
        this.guiSettings.mapHeight = parseFloat(range.value);
        const output = this.gui.controls.get(`${MAP_HEIGHT_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildGroupControl(
      "samplingGroupControl",
      "Sampling:",
      [
        simulationSelectControl,
        samplesSizeControl,
        mapHeightControl
      ]
    );
    return r;
  }
}
