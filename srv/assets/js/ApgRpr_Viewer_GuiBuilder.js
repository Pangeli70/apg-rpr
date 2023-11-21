import {
  ApgRpr_Layers
} from "./ApgRpr_Viewer.ts";
import {
  ApgWgl_Viewer_GuiBuilder
} from "./apg-wgl/lib/classes/ApgWgl_Viewer_GuiBuilder.ts";
export class ApgRpr_Viewer_GuiBuilder extends ApgWgl_Viewer_GuiBuilder {
  constructor(agui, aname, aviewer) {
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
