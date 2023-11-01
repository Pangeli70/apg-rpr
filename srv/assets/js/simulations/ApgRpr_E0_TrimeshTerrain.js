import {
  RAPIER
} from "../ApgRpr_Deps.ts";
import {
  ApgRpr_Simulator_GuiBuilder
} from "../ApgRpr_Simulator_GuiBuilder.ts";
import {
  ApgRpr_Simulation
} from "../ApgRpr_Simulation.ts";
export class ApgRpr_E0_TrimeshTerrain_Simulation extends ApgRpr_Simulation {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRpr_E0_TrimeshTerrain_GuiBuilder);
    const settings = this.params.settings;
    this.createWorld(settings);
    asimulator.addWorld(this.world);
    this.simulator.setPreStepAction(() => {
      this.updateFromGui();
    });
  }
  createWorld(asettings) {
    const platformBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const platformBody = this.world.createRigidBody(platformBodyDesc);
    const heightMap = this.generateRandomTrimshHeightMap("Trimesh Height map", 21, 21, 70, 4, 70);
    const groundColliderDesc = RAPIER.ColliderDesc.trimesh(heightMap.vertices, heightMap.indices);
    this.world.createCollider(groundColliderDesc, platformBody);
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
  defaultSettings() {
    const r = {
      ...super.defaultSettings()
    };
    return r;
  }
}
class ApgRpr_E0_TrimeshTerrain_GuiBuilder extends ApgRpr_Simulator_GuiBuilder {
  _guiSettings;
  constructor(asimulator, asettings) {
    super(asimulator, asettings);
    this._guiSettings = asettings;
  }
  buildControls() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const simControls = super.buildControls();
    const r = this.buildPanelControl(
      `ApgRprSim_${this._guiSettings.simulation}_SettingsPanelId`,
      [
        simulationChangeControl,
        restartSimulationButtonControl,
        simControls
      ]
    );
    return r;
  }
}
