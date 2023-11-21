/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

//--------------------------------------------------------------------------
// #region Imports

import {
    ApgRpr_Layers
} from "../ApgRpr_Viewer.ts";

import {
    ApgGui
} from "../apg-gui/mod.ts";

import {
    ApgWgl_Viewer
} from "../apg-wgl/lib/classes/ApgWgl_Viewer.ts";

import {
    ApgWgl_Viewer_GuiBuilder
} from "../apg-wgl/lib/classes/ApgWgl_Viewer_GuiBuilder.ts";


// #endregion
//--------------------------------------------------------------------------

/**
 * This is the basic Web GL gui Builder that contains the viewer settings.
 */
export class ApgRpr_Viewer_GuiBuilder extends ApgWgl_Viewer_GuiBuilder {

    constructor(
        agui: ApgGui,
        aname: string,
        aviewer: ApgWgl_Viewer,
    ) {
        super(agui, aname, aviewer);
        this.#getAdditionalLayers();
    }

    #getAdditionalLayers() {

        this.settings.layers[ApgRpr_Layers.instancedColliders.toString()] = {
            index: ApgRpr_Layers.instancedColliders,
            visible: true,
            name: "Instanced colliders"
        };
        this.settings.layers[ApgRpr_Layers.meshColliders.toString()] = {
            index: ApgRpr_Layers.meshColliders,
            visible: true,
            name: "Mesh colliders"
        };
        this.settings.layers[ApgRpr_Layers.characters.toString()] = {
            index: ApgRpr_Layers.characters,
            visible: true,
            name: "Characters colliders"
        };

    }
}
