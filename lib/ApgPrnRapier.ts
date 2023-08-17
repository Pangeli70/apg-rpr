import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';



export class ApgPrnWorldSimulator {
    static world: RAPIER.World | null = null;
    static gravity: RAPIER.Vector3 = { x: 0.0, y: -9.81, z: 0.0 };

    static groundColliderDesc: RAPIER.ColliderDesc | null = null;
    static groundCollider: RAPIER.Collider | null = null;


    static dynRigidBodyDesc: RAPIER.RigidBodyDesc | null = null;
    static dynRigidBody: RAPIER.RigidBody | null = null;


    static dynRigidBodyColliderDesc: RAPIER.ColliderDesc | null = null;
    static dynRigidBodyCollider: RAPIER.Collider | null = null;



    static async Run() {
        await RAPIER.init();

        this.world = new RAPIER.World(this.gravity);

        // Create the ground
        this.groundColliderDesc = RAPIER.ColliderDesc
            .cuboid(10.0, 0.1, 10.0);
        this.groundCollider = this.world.createCollider(this.groundColliderDesc);

        // Create a dynamic rigid-body.
        this.dynRigidBodyDesc = RAPIER.RigidBodyDesc
            .dynamic()
            .setTranslation(0.0, 1.0, 0.0);
        this.dynRigidBody = this.world.createRigidBody(this.dynRigidBodyDesc);

        // Create a cuboid collider attached to the dynamic rigidBody.
        this.dynRigidBodyColliderDesc = RAPIER.ColliderDesc
            .cuboid(0.5, 0.5, 0.5);
        this.dynRigidBodyCollider = this.world.createCollider(this.dynRigidBodyColliderDesc, this.dynRigidBody);

        this.GameLoop();
    }

    static GameLoop() { 
        if (this.world != null) { 
            // Step the simulation forward.  
            this.world.step();

            // Get and print the rigid-body's position.
            if (this.dynRigidBody != null) { 
                const position = this.dynRigidBody.translation();
                if (position != null) { 
                    console.log("Rigid-body position: ", position.x, position.y, position.z);
                }
            } 

            setTimeout(this.GameLoop, 16);
        }
    }
} 