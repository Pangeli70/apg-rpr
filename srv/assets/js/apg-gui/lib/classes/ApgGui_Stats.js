import {
  ApgGui
} from "./ApgGui.ts";
export class ApgGui_StatsPanel {
  current = 0;
  min = 1e5;
  max = -1e5;
  history = [];
  historySize = 500;
  beginTime = 0;
  endTime = 0;
  prevTime = 0;
  name;
  measureUnit;
  precision = 0;
  text = "";
  container;
  graphicPanel;
  updateInMainLoop = true;
  constructor(adocument, adevicePixelRatio, awidth, aname, ameasureUnit, aprecision, aforeGroundFillStyle, abackGroundFillStyle) {
    this.name = aname;
    this.measureUnit = ameasureUnit;
    this.precision = aprecision;
    this.container = adocument.createElement("div");
    this.container.id = this.name.replaceAll(" ", "_") + "_Container";
    this.container.style.fontSize = "0.75rem";
    this.graphicPanel = this.#initGrahicPanel(
      adocument,
      this.container,
      awidth,
      adevicePixelRatio,
      aforeGroundFillStyle,
      abackGroundFillStyle,
      ameasureUnit
    );
  }
  #initGrahicPanel(adocument, acontainer, awidth, adevicePixelRatio, aforeGroundFillStyle, abackGroundFillStyle, ameasureUnit) {
    const foreGroundFillStyle = aforeGroundFillStyle;
    const backGroundFillStyle = abackGroundFillStyle;
    const PIXEL_RATIO = Math.round(adevicePixelRatio || 1);
    const DOT_SIZE = PIXEL_RATIO;
    const WIDTH = awidth * PIXEL_RATIO;
    const height = awidth / 16 * 9;
    const HEIGHT = height * PIXEL_RATIO;
    const borderSize = Math.round(HEIGHT * 0.02) * PIXEL_RATIO;
    const TEXT_X = borderSize;
    const TEXT_Y = borderSize;
    const fontSize = Math.round(HEIGHT * 0.2) * PIXEL_RATIO;
    const GRAPH_X = borderSize;
    const GRAPH_Y = borderSize + fontSize + borderSize;
    const GRAPH_WIDTH = WIDTH - borderSize - borderSize;
    const GRAPH_HEIGHT = HEIGHT - GRAPH_Y - borderSize;
    const canvas = adocument.createElement("canvas");
    canvas.id = acontainer.id + "_Canvas";
    acontainer.appendChild(canvas);
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = `width:${awidth}px;height:${height}px`;
    const context = canvas.getContext("2d");
    context.font = `bold ${fontSize}px Helvetica,Arial,sans-serif`;
    context.textBaseline = "top";
    context.fillStyle = abackGroundFillStyle;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = foreGroundFillStyle;
    context.fillText(ameasureUnit, TEXT_X, TEXT_Y);
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    context.fillStyle = abackGroundFillStyle;
    context.globalAlpha = 0.9;
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    const r = {
      canvas,
      context,
      DOT_SIZE,
      WIDTH,
      HEIGHT,
      TEXT_X,
      TEXT_Y,
      GRAPH_X,
      GRAPH_Y,
      GRAPH_WIDTH,
      GRAPH_HEIGHT,
      foreGroundFillStyle,
      backGroundFillStyle
    };
    return r;
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
    const exponent = 10 ** this.precision;
    const value = Math.round(this.current / exponent) * exponent;
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);
    const toFixed = this.precision < 0 ? Math.abs(this.precision) : 0;
    this.text = `${value.toFixed(toFixed)} (${this.min.toFixed(toFixed)}/${this.max.toFixed(toFixed)}) ${this.measureUnit}`;
    this.container.innerText = this.text;
    this.#updateGraphics(this.text);
  }
  #updateGraphics(atext) {
    const gd = this.graphicPanel;
    gd.context.fillStyle = gd.backGroundFillStyle;
    gd.context.globalAlpha = 1;
    let x = 0;
    let y = 0;
    let w = gd.WIDTH;
    let h = gd.GRAPH_Y;
    gd.context.fillRect(x, y, w, h);
    gd.context.fillStyle = gd.foreGroundFillStyle;
    gd.context.fillText(atext, gd.TEXT_X, gd.TEXT_Y);
    x = gd.GRAPH_X + gd.DOT_SIZE;
    y = gd.GRAPH_Y;
    w = gd.GRAPH_WIDTH - gd.DOT_SIZE;
    h = gd.GRAPH_HEIGHT;
    const x1 = gd.GRAPH_X;
    gd.context.drawImage(gd.canvas, x, y, w, h, x1, y, w, h);
    x = gd.GRAPH_X + gd.GRAPH_WIDTH - gd.DOT_SIZE;
    w = gd.DOT_SIZE;
    gd.context.fillRect(x, y, w, h);
    gd.context.fillStyle = gd.backGroundFillStyle;
    gd.context.globalAlpha = 0.9;
    h = Math.round((1 - this.current / this.max) * gd.GRAPH_HEIGHT);
    gd.context.fillRect(x, y, w, h);
  }
}
export class ApgGui_Ms_StatsPanel extends ApgGui_StatsPanel {
  constructor(adocument, adevicePixelRatio, awidth, aname = "Frame time", ameasureUnit = "ms", aprecision = -2, aforeGroundFillStyle = "#f08", abackGroundFillStyle = "#201") {
    super(
      adocument,
      adevicePixelRatio,
      awidth,
      aname,
      ameasureUnit,
      aprecision,
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
export class ApgGui_Fps_StatsPanel extends ApgGui_StatsPanel {
  frames = 0;
  constructor(adocument, adevicePixelRatio, awidth, aname = "Frames per second", ameasureUnit = "fps", aprecision = -1, aforeGroundFillStyle = "#0ff", abackGroundFillStyle = "#002") {
    super(
      adocument,
      adevicePixelRatio,
      awidth,
      aname,
      ameasureUnit,
      aprecision,
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
export class ApgGui_Mem_StatsPanel extends ApgGui_StatsPanel {
  constructor(adocument, adevicePixelRatio, awidth, aname = "Memory usage", ameasureUnit = "Mb", aprecision = -1, aforeGroundFillStyle = "#0f0", abackGroundFillStyle = "#020") {
    super(
      adocument,
      adevicePixelRatio,
      awidth,
      aname,
      ameasureUnit,
      aprecision,
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
export class ApgGui_Stats {
  SHOW_ALL_PANELS = -1;
  document;
  currentPanelIndex = this.SHOW_ALL_PANELS;
  get currentPanelKey() {
    return this.currentPanelIndex.toString();
  }
  panels = /* @__PURE__ */ new Map();
  get panelsNames() {
    return Array.from(this.panels.keys());
  }
  containerId = "statContainerDivControl";
  container;
  get element() {
    return this.container;
  }
  width;
  pixelRatio;
  isStatsPanelOpened = true;
  constructor(adocument, adevicePixelRatio, awidth) {
    this.document = adocument;
    this.width = awidth;
    this.pixelRatio = adevicePixelRatio;
    this.container = this.document.createElement("div");
    this.container.id = this.containerId;
    this.#addDefaultPanels(adocument);
  }
  #addDefaultPanels(adocument) {
    const fpsPanel = new ApgGui_Fps_StatsPanel(
      adocument,
      this.pixelRatio,
      this.width
    );
    this.addPanel(fpsPanel);
    const msPanel = new ApgGui_Ms_StatsPanel(
      adocument,
      this.pixelRatio,
      this.width
    );
    this.addPanel(msPanel);
    if (self.performance && self.performance.memory) {
      const memPanel = new ApgGui_Mem_StatsPanel(
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
    const panelsKeys = Array.from(this.panels.keys());
    ApgGui.Assert(
      apanelIndex < panelsKeys.length,
      `Out of bounds: We can't show the panel with index: ${apanelIndex}`
    );
    this.currentPanelIndex = apanelIndex;
    if (this.currentPanelIndex != this.SHOW_ALL_PANELS) {
      const newKey = panelsKeys[this.currentPanelIndex];
      for (const [key, value] of this.panels) {
        const display = newKey === key ? "inherit" : "none";
        value.container.style.display = display;
      }
    } else {
      for (const [_key, value] of this.panels) {
        value.container.style.display = "inherit";
      }
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
