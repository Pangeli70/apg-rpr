import { RAPIER } from "../ApgRpr_Deps.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSim_GuiBuilder.ts";
import {
  ApgRprSimulation
} from "../ApgRpr_Simulation.ts";
export class ApgRprSim_Joints extends ApgRprSimulation {
  constructor(asimulator, aparams) {
    super(asimulator, aparams);
    this.buildGui(ApgRprSim_Joints_GuiBuilder);
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
    this.#createPrismaticJoints(new RAPIER.Vector3(20, 10, 0), 9);
    this.#createFixedJoints(new RAPIER.Vector3(0, 10, 0), 9);
    this.#createRevoluteJoints(new RAPIER.Vector3(20, 0, 0), 3);
    this.#createBallJoints(9);
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
    r.cameraPosition.eye.x = 15;
    r.cameraPosition.eye.y = 5;
    r.cameraPosition.eye.z = 42;
    r.cameraPosition.target.x = 13;
    r.cameraPosition.target.y = 1;
    r.cameraPosition.target.z = 1;
    return r;
  }
  #createPrismaticJoints(origin, num) {
    const rad = 0.4;
    const shift = 1;
    const groundDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      origin.x,
      origin.y,
      origin.z
    );
    let currParent = this.world.createRigidBody(groundDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
    this.world.createCollider(colliderDesc, currParent);
    for (let i = 0; i < num; ++i) {
      let z = origin.z + (i + 1) * shift;
      const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
        origin.x,
        origin.y,
        z
      );
      const currChild = this.world.createRigidBody(rigidBodyDesc);
      const colliderDesc2 = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
      this.world.createCollider(colliderDesc2, currChild);
      let axis;
      if (i % 2 == 0) {
        axis = new RAPIER.Vector3(1, 1, 0);
      } else {
        axis = new RAPIER.Vector3(-1, 1, 0);
      }
      z = new RAPIER.Vector3(0, 0, 1);
      const prism = RAPIER.JointData.prismatic(
        new RAPIER.Vector3(0, 0, 0),
        new RAPIER.Vector3(0, 0, -shift),
        axis
      );
      prism.limitsEnabled = true;
      prism.limits = [-2, 2];
      this.world.createImpulseJoint(prism, currParent, currChild, true);
      currParent = currChild;
    }
  }
  #createRevoluteJoints(origin, num) {
    const rad = 0.4;
    const shift = 2;
    const groundDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      origin.x,
      origin.y,
      0
    );
    let currParent = this.world.createRigidBody(groundDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
    this.world.createCollider(colliderDesc, currParent);
    for (let i = 0; i < num; ++i) {
      let z = origin.z + i * shift * 2 + shift;
      const positions = [
        new RAPIER.Vector3(origin.x, origin.y, z),
        new RAPIER.Vector3(origin.x + shift, origin.y, z),
        new RAPIER.Vector3(origin.x + shift, origin.y, z + shift),
        new RAPIER.Vector3(origin.x, origin.y, z + shift)
      ];
      const parents = [currParent, currParent, currParent, currParent];
      for (let k = 0; k < 4; ++k) {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
          positions[k].x,
          positions[k].y,
          positions[k].z
        );
        const rigidBody = this.world.createRigidBody(rigidBodyDesc);
        const colliderDesc2 = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
        this.world.createCollider(colliderDesc2, rigidBody);
        parents[k] = rigidBody;
      }
      const o = new RAPIER.Vector3(0, 0, 0);
      const x = new RAPIER.Vector3(1, 0, 0);
      z = new RAPIER.Vector3(0, 0, 1);
      const revs = [
        RAPIER.JointData.revolute(
          o,
          new RAPIER.Vector3(0, 0, -shift),
          z
        ),
        RAPIER.JointData.revolute(
          o,
          new RAPIER.Vector3(-shift, 0, 0),
          x
        ),
        RAPIER.JointData.revolute(
          o,
          new RAPIER.Vector3(0, 0, -shift),
          z
        ),
        RAPIER.JointData.revolute(
          o,
          new RAPIER.Vector3(shift, 0, 0),
          x
        )
      ];
      this.world.createImpulseJoint(revs[0], currParent, parents[0], true);
      this.world.createImpulseJoint(revs[1], parents[0], parents[1], true);
      this.world.createImpulseJoint(revs[2], parents[1], parents[2], true);
      this.world.createImpulseJoint(revs[3], parents[2], parents[3], true);
      currParent = parents[3];
    }
  }
  #createFixedJoints(origin, num) {
    const rad = 0.4;
    const shift = 1;
    const parents = [];
    for (let k = 0; k < num; ++k) {
      for (let i = 0; i < num; ++i) {
        const fk = k;
        const fi = i;
        let bodyType;
        if (i == 0 && (k % 4 == 0 && k != num - 2 || k == num - 1)) {
          bodyType = RAPIER.RigidBodyType.Fixed;
        } else {
          bodyType = RAPIER.RigidBodyType.Dynamic;
        }
        const rigidBody = new RAPIER.RigidBodyDesc(bodyType).setTranslation(
          origin.x + fk * shift,
          origin.y,
          origin.z + fi * shift
        );
        const child = this.world.createRigidBody(rigidBody);
        const colliderDesc = RAPIER.ColliderDesc.ball(rad);
        this.world.createCollider(colliderDesc, child);
        if (i > 0) {
          const parent = parents[parents.length - 1];
          const params = RAPIER.JointData.fixed(
            new RAPIER.Vector3(0, 0, 0),
            new RAPIER.Quaternion(0, 0, 0, 1),
            new RAPIER.Vector3(0, 0, -shift),
            new RAPIER.Quaternion(0, 0, 0, 1)
          );
          this.world.createImpulseJoint(params, parent, child, true);
        }
        if (k > 0) {
          const parent_index = parents.length - num;
          const parent = parents[parent_index];
          const params = RAPIER.JointData.fixed(
            new RAPIER.Vector3(0, 0, 0),
            new RAPIER.Quaternion(0, 0, 0, 1),
            new RAPIER.Vector3(-shift, 0, 0),
            new RAPIER.Quaternion(0, 0, 0, 1)
          );
          this.world.createImpulseJoint(params, parent, child, true);
        }
        parents.push(child);
      }
    }
  }
  #createBallJoints(num) {
    const rad = 0.4;
    const shift = 1;
    const parents = [];
    for (let k = 0; k < num; ++k) {
      for (let i = 0; i < num; ++i) {
        const fk = k;
        const fi = i;
        let bodyType;
        if (i == 0 && (k % 4 == 0 || k == num - 1)) {
          bodyType = RAPIER.RigidBodyType.Fixed;
        } else {
          bodyType = RAPIER.RigidBodyType.Dynamic;
        }
        const bodyDesc = new RAPIER.RigidBodyDesc(bodyType).setTranslation(
          fk * shift,
          0,
          fi * shift
        );
        const child = this.world.createRigidBody(bodyDesc);
        const colliderDesc = RAPIER.ColliderDesc.ball(rad);
        this.world.createCollider(colliderDesc, child);
        const o = new RAPIER.Vector3(0, 0, 0);
        if (i > 0) {
          const parent = parents[parents.length - 1];
          const params = RAPIER.JointData.spherical(
            o,
            new RAPIER.Vector3(0, 0, -shift)
          );
          this.world.createImpulseJoint(params, parent, child, true);
        }
        if (k > 0) {
          const parent_index = parents.length - num;
          const parent = parents[parent_index];
          const params = RAPIER.JointData.spherical(
            o,
            new RAPIER.Vector3(-shift, 0, 0)
          );
          this.world.createImpulseJoint(params, parent, child, true);
        }
        parents.push(child);
      }
    }
  }
}
export class ApgRprSim_Joints_GuiBuilder extends ApgRprSim_GuiBuilder {
  guiSettings;
  constructor(agui, aparams) {
    super(agui, aparams);
    this.guiSettings = this.params.guiSettings;
  }
  buildPanel() {
    const simulationChangeControl = this.buildSimulationChangeControl();
    const restartSimulationButtonControl = this.buildRestartButtonControl();
    const simControls = super.buildPanel();
    const r = this.buildPanelControl(
      `ApgRprSim_${this.guiSettings.name}_SettingsPanelId`,
      [
        simulationChangeControl,
        restartSimulationButtonControl,
        simControls
      ]
    );
    return r;
  }
}
