/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/
import {
    IApgDom2DRenderingContext,
    IApgDomCanvas,
    IApgDomDocument,
    IApgDomElement
} from "./ApgDom.ts";



export class ApgGui_StatsPanel {

    current = 0;
    min = 10000;
    max = 0;
    history: number[] = [];
    historySize = 500;

    beginTime = 0;
    endTime = 0;
    prevTime = 0;

    name: string;
    measureUnit: string;

    text = "";

    container: IApgDomElement;

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
    foreGroundFillStyle: string;
    backGroundFillStyle: string;

    updateInMainLoop = true;

    constructor(
        adocument: IApgDomDocument,
        adevicePixelRatio: number,
        awidth: number,
        aname: string,
        ameasureUnit: string,
        aforeGroundFillStyle: string,
        abackGroundFillStyle: string
    ) {

        this.name = aname;
        this.measureUnit = ameasureUnit;
        this.foreGroundFillStyle = aforeGroundFillStyle;
        this.backGroundFillStyle = abackGroundFillStyle;

        this.container = adocument.createElement('div') as IApgDomElement;
        this.container.id = this.name.replaceAll(' ', '_') + "_Container";

        // const PIXEL_RATIO = Math.round(adevicePixelRatio || 1);
        // this.DOT_SIZE = PIXEL_RATIO;

        // this.WIDTH = awidth * PIXEL_RATIO;
        // const height = awidth / 16 * 9;
        // this.HEIGHT = height * PIXEL_RATIO;

        // const borderSize = Math.round(this.HEIGHT * 0.02) * PIXEL_RATIO;

        // this.TEXT_X = borderSize;
        // this.TEXT_Y = borderSize;

        // const fontSize = Math.round(this.HEIGHT * 0.20) * PIXEL_RATIO;

        // this.GRAPH_X = borderSize;
        // this.GRAPH_Y = borderSize + fontSize + borderSize;
        // this.GRAPH_WIDTH = this.WIDTH - borderSize - borderSize;
        // this.GRAPH_HEIGHT = this.HEIGHT - this.GRAPH_Y - borderSize;

        // this.canvas = adocument.createElement('canvas') as IApgDomCanvas;
        // this.canvas.id = this.container.id + "_Canvas";
        // this.container.appendChild(this.canvas);
        // this.canvas.width = this.WIDTH;
        // this.canvas.height = this.HEIGHT;
        // this.canvas.style.cssText = `width:${awidth}px;height:${height}px`;

        //const context = this.canvas.getContext('2d');
        //this.context = context;

        // context.font = `bold ${fontSize}px Helvetica,Arial,sans-serif`;
        // context.textBaseline = 'top';

        // context.fillStyle = this.backGroundFillStyle;
        // context.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // context.fillStyle = this.foreGroundFillStyle;
        // context.fillText(this.measureUnit, this.TEXT_X, this.TEXT_Y);

        // context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);

        //context.fillStyle = abackGroundFillStyle;
        //context.globalAlpha = 0.9;
        //context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);

    }


    begin(abeginTime?: number) {

        this.beginTime = abeginTime || (performance || Date).now();

    }


    end(aendTime?: number) {

        this.endTime = aendTime || (performance || Date).now();

    }


    update(avalue: number) {

        this.current = avalue;

        this.history.push(this.current);
        if (this.history.length > this.historySize) {
            this.history.shift();
        }

        this.min = Math.min(this.min, this.current);
        this.max = Math.max(this.max, this.current);

        this.text =
            Math.round(this.current) + ' ' +
            this.measureUnit + ' (' +
            Math.round(this.min) + '/' +
            Math.round(this.max) + ')';

        this.container.innerText = this.text;
        /*
            this.context.fillStyle = this.backGroundFillStyle;
            this.context.globalAlpha = 1;
            let x = 0;
            let y = 0;
            let w = this.WIDTH;
            let h = this.GRAPH_Y;
            this.context.fillRect(x, y, w, h);

            this.context.fillStyle = this.foreGroundFillStyle;

            this.context.fillText(text, this.TEXT_X, this.TEXT_Y);

            // Clip rectangle of the current canavs content
            x = this.GRAPH_X + this.DOT_SIZE;
            y = this.GRAPH_Y;
            w = this.GRAPH_WIDTH - this.DOT_SIZE;
            h = this.GRAPH_HEIGHT;
            const x1 = this.GRAPH_X;
            // Blt the clipped rectangle
            this.context.drawImage(this.canvas, x, y, w, h, x1, y, w, h);

            // Draw the last dot istogram bar
            x = this.GRAPH_X + this.GRAPH_WIDTH - this.DOT_SIZE;
            w = this.DOT_SIZE;
            this.context.fillRect(x, y, w, h);

            this.context.fillStyle = this.backGroundFillStyle;
            this.context.globalAlpha = 0.9;

            h = Math.round((1 - (this.current / this.max)) * this.GRAPH_HEIGHT);
            this.context.fillRect(x, y, w, h);
            */
    }

}


export class ApgGui_Ms_StatsPanel extends ApgGui_StatsPanel {

    constructor(
        adocument: IApgDomDocument,
        adevicePixelRatio: number,
        awidth: number,
        aname = 'Frame time',
        ameasureUnit = 'ms',
        aforeGroundFillStyle = '#f08',
        abackGroundFillStyle = '#201'
    ) {
        super(
            adocument, adevicePixelRatio, awidth,
            aname, ameasureUnit,
            aforeGroundFillStyle, abackGroundFillStyle
        );
    }


    override end(aendTime?: number) {
        super.end(aendTime);
        const ms = this.endTime - this.beginTime;
        this.update(ms);
    }

}


export class ApgGui_Fps_StatsPanel extends ApgGui_StatsPanel {

    frames = 0;

    constructor(
        adocument: IApgDomDocument,
        adevicePixelRatio: number,
        awidth: number,
        aname = 'Frames per second',
        ameasureUnit = 'fps',
        aforeGroundFillStyle = '#0ff',
        abackGroundFillStyle = '#002'
    ) {
        super(
            adocument, adevicePixelRatio, awidth,
            aname, ameasureUnit,
            aforeGroundFillStyle, abackGroundFillStyle
        );
    }


    override end(aendTime?: number) {

        super.end(aendTime);

        this.frames++;
        const deltaTime = this.endTime - this.prevTime;
        if (deltaTime >= 1000) {

            this.prevTime = this.endTime;

            const fps = this.frames / deltaTime * 1000;
            this.frames = 0;
            this.update(fps);

        }

    }

}


export class ApgGui_Mem_StatsPanel extends ApgGui_StatsPanel {

    constructor(
        adocument: IApgDomDocument,
        adevicePixelRatio: number,
        awidth: number,
        aname = 'Memory usage',
        ameasureUnit = 'Mb',
        aforeGroundFillStyle = '#0f0',
        abackGroundFillStyle = '#020'
    ) {
        super(
            adocument, adevicePixelRatio, awidth,
            aname, ameasureUnit,
            aforeGroundFillStyle, abackGroundFillStyle
        );

    }


    override end(aendTime?: number) {

        super.end(aendTime);
        const deltaTime = this.endTime - this.prevTime;
        if (deltaTime >= 1000) {

            this.prevTime = this.endTime;

            const memory = (performance as any).memory;
            const mb = (memory.usedJSHeapSize / 1048576);
            this.update(mb);

        }

    }

}


export class ApgRpr_Step_StatsPanel extends ApgGui_StatsPanel {

    constructor(
        adocument: IApgDomDocument,
        adevicePixelRatio: number,
        awidth: number,
        aname = 'Simulation time',
        ameasureUnit = 'ms (step)',
        aforeGroundFillStyle = '#ff8',
        abackGroundFillStyle = '#221'
    ) {
        super(
            adocument, adevicePixelRatio, awidth,
            aname, ameasureUnit,
            aforeGroundFillStyle, abackGroundFillStyle
        );
    }

    override end(aendTime?: number) {
        super.end(aendTime);
        const ms = this.endTime - this.beginTime;
        this.update(ms);
    }

}


export class ApgRpr_Colliders_StatsPanel extends ApgGui_StatsPanel {

    constructor(
        adocument: IApgDomDocument,
        adevicePixelRatio: number,
        awidth: number,
        aname = 'Num. of colliders',
        ameasureUnit = 'pcs',
        aforeGroundFillStyle = '#f08',
        abackGroundFillStyle = '#921'
    ) {
        super(
            adocument, adevicePixelRatio, awidth,
            aname, ameasureUnit,
            aforeGroundFillStyle, abackGroundFillStyle
        );
    }

}


export class ApgGui_Stats {

    document: IApgDomDocument;

    currentPanelIndex = 0;
    panels: Map<string, ApgGui_StatsPanel> = new Map();

    currentPanel!: ApgGui_StatsPanel;

    containerId = 'statContainerDivControl';
    container: IApgDomElement;

    width: number;
    pixelRatio: number;

    constructor(
        adocument: IApgDomDocument,
        adevicePixelRatio: number,
        awidth: number,
    ) {
        this.document = adocument
        this.width = awidth;
        this.pixelRatio = adevicePixelRatio;

        this.container = this.document.createElement('div');
        this.container.id = this.containerId;

        this.#addDefaultPanels(adocument);
    }


    #addDefaultPanels(adocument: IApgDomDocument) {
        const fpsPanel = new ApgGui_Fps_StatsPanel(
            adocument,
            this.pixelRatio,
            this.width
        );
        this.addPanel(fpsPanel);
        this.currentPanel = fpsPanel;

        const msPanel = new ApgGui_Ms_StatsPanel(
            adocument,
            this.pixelRatio,
            this.width
        );
        this.addPanel(msPanel);

        if (self.performance && (self.performance as any).memory) {
            const memPanel = new ApgGui_Mem_StatsPanel(
                adocument,
                this.pixelRatio,
                this.width
            );
            this.addPanel(memPanel);
        }
    }


    addPanel(apanel: ApgGui_StatsPanel) {

        this.container.appendChild(apanel.container);
        this.panels.set(apanel.name, apanel);

    }


    showPanel(apanelIndex: number) {

        const panelsNames = Array.from(this.panels.keys());

        if (apanelIndex >= panelsNames.length) {
            const message = `Out of bounds: We can't show the panel with index: ${apanelIndex}`;
            alert(message);
            throw new Error(message);
        }
        this.currentPanelIndex = apanelIndex;

        const panelName = panelsNames[this.currentPanelIndex];

        for (const [key, value] of this.panels) {
            let display = 'none';
            if (panelName === key) {
                display = 'block';
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






