import { RAPIER } from "../ApgRprDeps.ts";
import { eApgRpr_SimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
  ApgRprSim_Base
} from "../ApgRprSimulationBase.ts";
export class ApgRprSimPlatform extends ApgRprSim_Base {
  platformBody;
  t = 0;
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_Platform_GuiBuilder);
    const settings = this.params.guiSettings;
    this.createWorld(settings);
    asimulator.addWorld(this.world);
    if (!this.params.restart) {
      const cameraPosition = {
        eye: { x: -80, y: 50, z: -80 },
        target: { x: 0, y: 0, z: 0 }
      };
      asimulator.resetCamera(cameraPosition);
    } else {
      this.params.restart = false;
    }
    asimulator.setPreStepAction(() => {
      this.updateFromGui();
      this.movePlatform();
    });
  }
  createWorld(asettings) {
    const platformBodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
    this.platformBody = this.world.createRigidBody(platformBodyDesc);
    const randomHeightMap = this.generateRandomHeightMap("Platform", 10, 10, 50, 5, 50);
    const groundColliderDesc = RAPIER.ColliderDesc.trimesh(randomHeightMap.vertices, randomHeightMap.indices);
    this.world.createCollider(groundColliderDesc, this.platformBody);
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
  movePlatform() {
    if (this && this.platformBody) {
      this.t += 2 * Math.PI / 360;
      const deltaY = Math.sin(this.t) * 12.5;
      const deltaAngle = Math.sin(this.t) * 0.25;
      this.platformBody.setLinvel({ x: 0, y: deltaY, z: 0 }, true);
      this.platformBody.setAngvel({ x: 0, y: deltaAngle, z: 0 }, true);
    }
  }
  updateFromGui() {
    if (this.needsUpdate()) {
      super.updateFromGui();
    }
  }
  defaultGuiSettings() {
    const r = {
      ...super.defaultGuiSettings()
    };
    return r;
  }
}
export class ApgRprSim_Platform_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  build() {
    const simControls = super.build();
    const r = this.buildPanelControl(
      "ApgRprSim_Platform_PanelControl",
      eApgRpr_SimulationName.I_PLATFORM,
      [
        simControls
      ]
    );
    return r;
  }
}
