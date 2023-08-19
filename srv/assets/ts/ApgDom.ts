/** -----------------------------------------------------------------------
 * @module [apg-dom]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/09]
 * -----------------------------------------------------------------------
 */

export type HTMLCanvasElement = /*unresolved*/ any;
export type TApgDomEventCallback = (aevent: any) => void;


export enum eApgDomFormElementType {

    PARAGRAPH = 'paragraph',
    DIV = 'div',
    DETAILS = 'details',
    INPUT = "input",
    LABEL ="label",
    SELECT ="select",
    TEXT_AREA ="textarea",
    BUTTON ="button",
    FIELD_SET ="fieldset",
    LEGEND ="legend",
    DATA_LIST ="datalist",
    OUTPUT ="output",
    OPTION ="option",
    OPT_GROUP = "optgroup",
    DIALOG = "dialog"

}

export enum eApgDomInputType {
    BUTTON = "button",
    CHECK_BOX = "checkbox",
    COLOR = "color",
    DATE = "date",
    DATETIME_LOCAL = "datetime-local",
    EMAIL = "email",
    FILE = "file",
    HIDDEN = "hidden",
    IMAGE = "image",
    MONTH = "month",
    NUMBER = "number",
    PASSWORD = "password",
    RADIO = "radio",
    RANGE = "range",
    RESET = "reset",
    SEARCH = "search",
    SUBMIT = "submit",
    TEL = "tel",
    TEXT = "text",
    TIME = "time",
    URL = "url",
    WEEK = "week"
}


export interface IApgDomStyle {
    visibility?: string;

    position?: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;

    color?: string;
    display?: string;

    width?: string;
    height?: string;

    cssText?: string;
}


export interface IApgDomBrowserWindow {

    devicePixelRatio: number;
    innerWidth: number;
    innerHeight: number;
    localStorage: IApgDomBrowserLocalStorage,

    addEventListener(aevent: string, acallBack: Function, aflag?: boolean): void;

    requestAnimationFrame(acallBack: Function): void;
}


export interface IApgDomBrowserLocalStorage {
    getItem(akey: string): unknown;
    setItem(akey: string, avalue: unknown): void;
}


export interface IApgDomElement {
    id: string;
    clientWidth: number;
    clientHeight: number;

    innerHTML: string;
    innerText: string;

    ownerDocument: IApgDomDocument;

    style: IApgDomStyle;

    type?: string;

    appendChild(achild: IApgDomElement | HTMLCanvasElement): void;

    addEventListener(aevent: string, acallback: TApgDomEventCallback, auseCapture?: boolean): void;
}


export interface IApgDomDocument extends IApgDomElement {

    getElementById(aid: string): IApgDomElement;

    createElement(atag: string): IApgDomElement;
    createTextNode(atext: string): IApgDomElement;

    body: IApgDomBody

    fullscreenElement?: IApgDomElement;
}


export interface IApgDomBody extends IApgDomElement {

    requestFullscreen(): void;
    cancelFullscreen(): void;

}


export interface IApgDomAnchor extends IApgDomElement {

    href: string;

    download: string;

    click(): void;

}

export interface IApgDomButton extends IApgDomElement {

    disabled: boolean;

    click(): void;

}

export interface IApgDomUl extends IApgDomElement {

    firstElementChild: IApgDomElement;
    children: IApgDomElement[];

    insertBefore(alement: IApgDomElement, anextElement: IApgDomElement): void;
    removeChild(alement: IApgDomElement): void;

}

export interface IApgDomImageData {

    data: Uint8ClampedArray,
    colorSpace: string,
    width: number,
    height: number,
}


export interface IApgDomImage extends IApgDomElement {
    width: string | number;
    height: string | number;
    onload: Function;
    src: string;

}


export interface IApgDomCanvas extends IApgDomElement {
    width: string | number;
    height: string | number;

    toBlob(af: Function): any;

    getContext(atype: "2d"): IApgDom2DRenderingContext;
}


export interface IApgDom2DRenderingContext {
    font: string;
    textBaseline: string;
    fillStyle: string;

    globalAlpha: number;

    fillRect(x: number, y: number, w: number, h: number): void;

    fillText(t: string, x: number, y: number): void;

    drawImage(
        image: IApgDomCanvas,
        x: number, y: number, width?: number, height?: number,
        destX?: number, destY?: number, destWidth?: number, destHeight?: number
    ): void;

    getImageData(sourceX: number, sourceY: number, sourceW: number, sourceH: number): IApgDomImageData;

}


export interface IApgDomDialog extends IApgDomElement {

    close(): void;
    showModal(): void;

}


export interface IApgDomFormElement extends IApgDomElement {

    name: string;

    disabled: boolean;

}

export interface IApgDomSelect extends IApgDomFormElement {

    value: string;

}

export interface IApgDomInput extends IApgDomFormElement {

    type: eApgDomInputType;

}

export interface IApgDomCheckBox extends IApgDomInput {

    checked: boolean;

    click(): void;

}

export interface IApgDomColorPicker extends IApgDomInput {
    value: string;
}
export interface IApgDomRange extends IApgDomInput {

    min: string;
    max: string;
    step: string;
    value: string;
}

export interface IApgDomOutput extends IApgDomElement {
    textContent: string;
}


export interface IApgDomEvent {
}


export interface IApgDomMouseEvent extends IApgDomEvent {
    clientX: number;
    clientY: number;

    preventDefault(): void;
}