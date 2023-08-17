import { RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSimPngTerrain extends ApgRprSim_Base {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    const settings = this.params.guiSettings;
    const guiBuilder = new ApgRprSimPngTerrainGuiBuilder(
      this.simulator.gui,
      this.params
    );
    const gui = guiBuilder.build();
    this.simulator.viewer.panels.innerHTML = gui;
    guiBuilder.bindControls();
    this.createWorld(settings);
  }
  updateFromGui2() {
    alert("Needs update");
    if (this.needsUpdate()) {
      super.updateFromGui();
    }
  }
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings(),
      heightMap: "HeigthMap2",
      heightMaps: ["HeigthMap1", "HeigthMap2"],
      sampleSize: 100,
      sampleSizeMin: 10,
      sampleSizeMax: 100,
      sampleSizeStep: 5,
      mapHeight: 5,
      mapHeightMin: 1,
      mapHeightMax: 25,
      mapHeightStep: 1
    };
    return r;
  }
  createWorld(asettings) {
    this.buildWorld(
      "./assets/img/png/" + asettings.heightMap + ".png",
      asettings.sampleSize,
      asettings.sampleSize,
      100,
      asettings.mapHeight,
      100
    );
  }
  buildWorld(aimageResourceUrl, awidthXDivisions, adepthZDivisions, awidthX, aheightY, adepthZ) {
    const image = this.simulator.document.createElement("img");
    image.src = aimageResourceUrl;
    image.onload = () => {
      const pixels = this.sampleImagePixels(image, awidthXDivisions, adepthZDivisions);
      const heightMap = this.generateHeightMap(
        awidthXDivisions,
        adepthZDivisions,
        awidthX,
        aheightY,
        adepthZ,
        pixels
      );
      const heightMap1 = this.generateRandomHeightMap(
        "Pippo",
        awidthXDivisions,
        adepthZDivisions,
        awidthX,
        aheightY / 2,
        adepthZ
      );
      const platformBodyDesc = RAPIER.RigidBodyDesc.fixed();
      const platformBody = this.world.createRigidBody(platformBodyDesc);
      const groundColliderDesc = RAPIER.ColliderDesc.trimesh(heightMap.vertices, heightMap.indices);
      this.world.createCollider(groundColliderDesc, platformBody);
      this.buildDynamicColliders();
      this.simulator.addWorld(this.world);
      if (!this.params.restart) {
        const cameraPosition = {
          eye: { x: -80, y: 50, z: -80 },
          target: { x: 0, y: 0, z: 0 }
        };
        this.simulator.resetCamera(cameraPosition);
      } else {
        this.params.restart = false;
      }
      this.simulator.setPreStepAction(() => {
        this.updateFromGui();
      });
    };
  }
  sampleImagePixels(image, awidthXDivisions, adepthZDivisions) {
    const r = [];
    const canvas = this.simulator.document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    context.drawImage(
      image,
      0,
      0,
      +canvas.width,
      +canvas.height,
      0,
      0,
      +canvas.width,
      +canvas.height
    );
    const imageData = context.getImageData(0, 0, +canvas.width, +canvas.height);
    const widthSamples = +canvas.width / awidthXDivisions;
    const depthSamples = +canvas.height / adepthZDivisions;
    for (let i = 0; i < awidthXDivisions; i++) {
      for (let j = 0; j < adepthZDivisions; j++) {
        const xpixel = Math.round(i * widthSamples);
        const zpixel = Math.round(j * depthSamples);
        const startIndex = (xpixel * +canvas.width + zpixel) * 4;
        const pixelRedComponent = imageData.data[startIndex];
        const pixelGreenComponent = imageData.data[startIndex + 1];
        const pixelBlueComponent = imageData.data[startIndex + 2];
        const _pixelAlphaComponent = imageData.data[startIndex + 3];
        const pixelWhiteComponent = (pixelRedComponent + pixelGreenComponent + pixelBlueComponent) / 3;
        r.push(pixelWhiteComponent / 255);
      }
    }
    return r;
  }
  buildDynamicColliders() {
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
}
export class ApgRprSimPngTerrainGuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  build() {
    const latticeGroupControl = this.#buildLatticeGroupControl();
    const simControls = super.build();
    const r = this.buildPanelControl(
      "ApgRprSimPngTerrainSettingsPanel",
      eApgRpr_SimulationName.G_PNG_MESH_TERRAIN,
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
      this.guiSettings.sampleSizeMin,
      this.guiSettings.sampleSizeMax,
      this.guiSettings.sampleSizeStep,
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
      this.guiSettings.mapHeightMin,
      this.guiSettings.mapHeightMax,
      this.guiSettings.mapHeightStep,
      () => {
        const range = this.gui.controls.get(MAP_HEIGHT_CNT).element;
        this.guiSettings.mapHeight = parseFloat(range.value);
        const output = this.gui.controls.get(`${MAP_HEIGHT_CNT}Value`).element;
        output.innerHTML = range.value;
      }
    );
    const r = this.buildGroupControl(
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
