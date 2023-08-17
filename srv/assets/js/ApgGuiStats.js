export class ApgGuiStatsPanel {
  current = 0;
  min = 1e4;
  max = 0;
  history = [];
  historySize = 500;
  beginTime = 0;
  endTime = 0;
  prevTime = 0;
  name;
  measureUnit;
  text = "";
  container;
  // canvas: IApgDomCanvas;
  //context: IApgDom2DRenderingContext;
  /*    
      DOT_SIZE: number;
      WIDTH: number;
      HEIGHT: number;
      TEXT_X: number;
      TEXT_Y: number;
      GRAPH_X: number;
      GRAPH_Y: number;
      GRAPH_WIDTH: number;
      GRAPH_HEIGHT: number;
      */
  foreGroundFillStyle;
  backGroundFillStyle;
  updateInMainLoop = true;
  constructor(adocument, adevicePixelRatio, awidth, aname, ameasureUnit, aforeGroundFillStyle, abackGroundFillStyle) {
    this.name = aname;
    this.measureUnit = ameasureUnit;
    this.foreGroundFillStyle = aforeGroundFillStyle;
    this.backGroundFillStyle = abackGroundFillStyle;
    this.container = adocument.createElement("div");
    this.container.id = this.name.replaceAll(" ", "_") + "_Container";
  }
  begin(abeginTime) {
    this.beginTime = abeginTime || (performance || Date).now();
  }
  end(aendTime) {
    this.endTime = aendTime || (performance || Date).now();
  }
  update(avalue) {
    this.current = avalue;
    this.history.push(this.current);
    if (this.history.length > this.historySize) {
      this.history.shift();
    }
    this.min = Math.min(this.min, this.current);
    this.max = Math.max(this.max, this.current);
    this.text = Math.round(this.current) + " " + this.measureUnit + " (" + Math.round(this.min) + "/" + Math.round(this.max) + ")";
    this.container.innerText = this.text;
  }
}
export class ApgGuiMsStatsPanel extends ApgGuiStatsPanel {
  constructor(adocument, adevicePixelRatio, awidth, aname = "Frame time", ameasureUnit = "ms", aforeGroundFillStyle = "#f08", abackGroundFillStyle = "#201") {
    super(
      adocument,
      adevicePixelRatio,
      awidth,
      aname,
      ameasureUnit,
      aforeGroundFillStyle,
      abackGroundFillStyle
    );
  }
  end(aendTime) {
    super.end(aendTime);
    const ms = this.endTime - this.beginTime;
    this.update(ms);
  }
}
export class ApgGuiFpsStatsPanel extends ApgGuiStatsPanel {
  frames = 0;
  constructor(adocument, adevicePixelRatio, awidth, aname = "Frames per second", ameasureUnit = "fps", aforeGroundFillStyle = "#0ff", abackGroundFillStyle = "#002") {
    super(
      adocument,
      adevicePixelRatio,
      awidth,
      aname,
      ameasureUnit,
      aforeGroundFillStyle,
      abackGroundFillStyle
    );
  }
  end(aendTime) {
    super.end(aendTime);
    this.frames++;
    const deltaTime = this.endTime - this.prevTime;
    if (deltaTime >= 1e3) {
      this.prevTime = this.endTime;
      const fps = this.frames / deltaTime * 1e3;
      this.frames = 0;
      this.update(fps);
    }
  }
}
export class ApgGuiMemStatsPanel extends ApgGuiStatsPanel {
  constructor(adocument, adevicePixelRatio, awidth, aname = "Memory usage", ameasureUnit = "Mb", aforeGroundFillStyle = "#0f0", abackGroundFillStyle = "#020") {
    super(
      adocument,
      adevicePixelRatio,
      awidth,
      aname,
      ameasureUnit,
      aforeGroundFillStyle,
      abackGroundFillStyle
    );
  }
  end(aendTime) {
    super.end(aendTime);
    const deltaTime = this.endTime - this.prevTime;
    if (deltaTime >= 1e3) {
      this.prevTime = this.endTime;
      const memory = performance.memory;
      const mb = memory.usedJSHeapSize / 1048576;
      this.update(mb);
    }
  }
}
export class ApgGuiRprStepStatsPanel extends ApgGuiStatsPanel {
  constructor(adocument, adevicePixelRatio, awidth, aname = "Simulation time", ameasureUnit = "ms (step)", aforeGroundFillStyle = "#ff8", abackGroundFillStyle = "#221") {
    super(
      adocument,
      adevicePixelRatio,
      awidth,
      aname,
      ameasureUnit,
      aforeGroundFillStyle,
      abackGroundFillStyle
    );
  }
  end(aendTime) {
    super.end(aendTime);
    const ms = this.endTime - this.beginTime;
    this.update(ms);
  }
}
export class ApgGuiRprCollidersStatsPanel extends ApgGuiStatsPanel {
  constructor(adocument, adevicePixelRatio, awidth, aname = "Num. of colliders", ameasureUnit = "pcs", aforeGroundFillStyle = "#f08", abackGroundFillStyle = "#921") {
    super(
      adocument,
      adevicePixelRatio,
      awidth,
      aname,
      ameasureUnit,
      aforeGroundFillStyle,
      abackGroundFillStyle
    );
  }
  end(aendTime) {
    super.end(aendTime);
    const ms = this.endTime - this.beginTime;
    this.update(ms);
  }
}
export class ApgGuiStats {
  document;
  currentPanelIndex = 0;
  panels = /* @__PURE__ */ new Map();
  currentPanel;
  containerId = "statContainerDivControl";
  container;
  width;
  pixelRatio;
  constructor(adocument, adevicePixelRatio, awidth) {
    this.document = adocument;
    this.width = awidth;
    this.pixelRatio = adevicePixelRatio;
    this.container = this.document.createElement("div");
    this.container.id = this.containerId;
    this.#addDefaultPanels(adocument);
  }
  #addDefaultPanels(adocument) {
    const fpsPanel = new ApgGuiFpsStatsPanel(
      adocument,
      this.pixelRatio,
      this.width
    );
    this.addPanel(fpsPanel);
    this.currentPanel = fpsPanel;
    const msPanel = new ApgGuiMsStatsPanel(
      adocument,
      this.pixelRatio,
      this.width
    );
    this.addPanel(msPanel);
    if (self.performance && self.performance.memory) {
      const memPanel = new ApgGuiMemStatsPanel(
        adocument,
        this.pixelRatio,
        this.width
      );
      this.addPanel(memPanel);
    }
  }
  addPanel(apanel) {
    this.container.appendChild(apanel.container);
    this.panels.set(apanel.name, apanel);
  }
  showPanel(apanelIndex) {
    const panelsNames = Array.from(this.panels.keys());
    if (apanelIndex >= panelsNames.length) {
      const message = `Out of bounds: We can't show the panel with index: ${apanelIndex}`;
      alert(message);
      throw new Error(message);
    }
    this.currentPanelIndex = apanelIndex;
    const panelName = panelsNames[this.currentPanelIndex];
    for (const [key, value] of this.panels) {
      let display = "none";
      if (panelName === key) {
        display = "block";
        this.currentPanel = value;
      }
      value.container.style.display = display;
    }
  }
  begin() {
    const beginTime = (performance || Date).now();
    for (const [_key, panel] of this.panels) {
      panel.begin(beginTime);
    }
  }
  end() {
    const endTime = (performance || Date).now();
    for (const [_key, panel] of this.panels) {
      if (panel.updateInMainLoop) {
        panel.end(endTime);
      }
    }
  }
}
