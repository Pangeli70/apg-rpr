export class ApgGui {
  controls = /* @__PURE__ */ new Map();
  document;
  constructor(adocument) {
    this.document = adocument;
  }
  clearControls() {
    this.controls.clear();
  }
}
