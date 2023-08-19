/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { IApgDomElement, IApgDomRange } from "../ApgDom.ts";
import { ApgGui, ApgGui_IMinMaxStep } from "../ApgGui.ts";
import { RAPIER, PRANDO } from "../ApgRprDeps.ts";
import { ApgRpr_eSimulationName } from "../ApgRprEnums.ts";
import { ApgRprSim_GuiBuilder } from "../ApgRprSimGuiBuilder.ts";
import {
    ApgRprSim_Base, ApgRprSim_IGuiSettings,
    IApgRprSim_Params
} from "../ApgRprSimulationBase.ts";
import { ApgRpr_Simulator } from "../ApgRpr_Simulator.ts";


export interface ApgRprSim_ConvexPolyhedrons_IGuiSettings extends ApgRprSim_IGuiSettings {


}

export class ApgRprSim_ConvexPolyhedron extends ApgRprSim_Base {

    constructor(
        asimulator: ApgRpr_Simulator,
        aparams: IApgRprSim_Params
    ) {
        super(asimulator, aparams);

        const settings = this.params.guiSettings! as ApgRprSim_ConvexPolyhedrons_IGuiSettings;

        this.buildGui(ApgRprSim_ConvexPolyhedrons_GuiBuilder);

        this.#createWorld(settings);
        asimulator.addWorld(this.world);

        if (!this.params.restart) {
            this.simulator.resetCamera(settings.cameraPosition);
        }
        else {
            this.params.restart = false;
        }

        this.simulator.setPreStepAction(() => { this.updateFromGui(); });
    }


    #createWorld(asettings: ApgRprSim_ConvexPolyhedrons_IGuiSettings) {

        // Create ground
        const groudBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = this.world.createRigidBody(groudBodyDesc);

        const heightMap = this.generateRandomHeightMap('Convex Polyhedron 1', 20, 20, 40.0, 4.0, 40.0);
        const groundColliderDesc = RAPIER.ColliderDesc.trimesh(
            heightMap.vertices,
            heightMap.indices
        );
        this.world.createCollider(groundColliderDesc, groundBody);

        /*
         * Create the polyhedra
         */
        const num = 5;
        const scale = 2.0;
        const border_rad = 0.1;

        const shift = border_rad * 2.0 + scale;
        const centerx = shift * (num / 2);
        const centery = shift / 2.0;
        const centerz = shift * (num / 2);

        const rng = new PRANDO("Convex Polyhedron 2");
        let l;

        for (let j = 0; j < 15; ++j) {
            for (let i = 0; i < num; ++i) {
                for (let k = 0; k < num; ++k) {
                    const x = i * shift - centerx;
                    const y = j * shift + centery + 3.0;
                    const z = k * shift - centerz;

                    const randomVertices = [];
                    for (l = 0; l < 10; ++l) {
                        const x1 = rng.next() * scale;
                        const y1 = rng.next() * scale;
                        const z1 = rng.next() * scale;

                        randomVertices.push(x1, y1, z1);
                    }
                    const vertices = new Float32Array(randomVertices);

                    // Build the rigid body.
                    const polyhedronBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                        .setTranslation(x, y, z);
                    const polyhedronBody = this.world.createRigidBody(polyhedronBodyDesc);
                    const polyhedronColliderDesc = RAPIER.ColliderDesc.roundConvexHull(vertices, border_rad);
                    this.world.createCollider(polyhedronColliderDesc, polyhedronBody);
                }
            }
        }
    }

    #pipo(nsubdivs: number, wx: number, wy: number, wz: number) {
        let vertices = [];
        let indices = [];

        let elementWidth = 1.0 / nsubdivs;
        let rng = new PRANDO("trimesh");

        let i, j;
        for (i = 0; i <= nsubdivs; ++i) {
            for (j = 0; j <= nsubdivs; ++j) {
                let x = (j * elementWidth - 0.5) * wx;
                let y = rng.next() * wy;
                let z = (i * elementWidth - 0.5) * wz;

                vertices.push(x, y, z);
            }
        }

        for (i = 0; i < nsubdivs; ++i) {
            for (j = 0; j < nsubdivs; ++j) {
                let i1 = (i + 0) * (nsubdivs + 1) + (j + 0);
                let i2 = (i + 0) * (nsubdivs + 1) + (j + 1);
                let i3 = (i + 1) * (nsubdivs + 1) + (j + 0);
                let i4 = (i + 1) * (nsubdivs + 1) + (j + 1);

                indices.push(i1, i3, i2);
                indices.push(i3, i4, i2);
            }
        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint32Array(indices),
        };
    }

    override updateFromGui() {

        if (this.needsUpdate()) {

            // TODO implement Pyramid settings

            super.updateFromGui();
        }

    }


    override defaultGuiSettings() {

        const r: ApgRprSim_ConvexPolyhedrons_IGuiSettings = {

            ...super.defaultGuiSettings(),
        }

        return r;
    }
}



export class ApgRprSim_ConvexPolyhedrons_GuiBuilder extends ApgRprSim_GuiBuilder {

    guiSettings: ApgRprSim_ConvexPolyhedrons_IGuiSettings;


    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params
    ) {
        super(agui, aparams);

        this.guiSettings = this.params.guiSettings as ApgRprSim_ConvexPolyhedrons_IGuiSettings;
    }


    override buildHtml() {

        const simControls = super.buildHtml();

        const r = this.buildPanelControl(
            "ApgRprSim_ConvexPolyHedron_SettingsPanel",
            ApgRpr_eSimulationName.A_PYRAMID,
            [
                simControls
            ]
        );

        return r;

    }


}

