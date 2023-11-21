/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.1 [APG 2023/08/09]
 * @version 0.0.8 [APG 2023/11/12]
 * -----------------------------------------------------------------------
 */

import {
    ApgGui_eInputType
} from "../enums/ApgGui_eInputType.ts";


//------------------------------------------------------------------------------
// #region Style


export interface ApgGui_IStyle {

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

    fontSize?: string;

    cssText?: string;
}


// #endregion
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// #region Browser elements


export interface ApgGui_IBrowserWindow {

    devicePixelRatio: number;
    innerWidth: number;
    innerHeight: number;
    localStorage: ApgGui_IBrowserLocalStorage,

    location: ApgGui_IBrowserLocation,

    addEventListener(aevent: string, acallBack: Function, aflag?: boolean): void;

    requestAnimationFrame(acallBack: Function): void;
    setTimeout(acallback: () => void, amilliseconds: number): unknown;
}



export interface ApgGui_IBrowserLocalStorage {

    getItem(akey: string): string;
    setItem(akey: string, avalue: string): void;

}


// #endregion
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// #region Basic Html elements


export interface ApgGui_IElement {

    id: string;
    clientWidth: number;
    clientHeight: number;

    innerHTML: string;
    innerText: string;

    ownerDocument: ApgGui_IDocument;

    style: ApgGui_IStyle;

    type?: string;

    appendChild(achild: ApgGui_IElement): void;

    addEventListener(
        aevent: string,
        acallback: ApgGui_TEventCallback,
        auseCapture?: boolean
    ): void;

    requestFullscreen(): void;
}



export interface ApgGui_IDocument extends ApgGui_IElement {

    getElementById(aid: string): ApgGui_IElement;

    createElement(atag: string): ApgGui_IElement;
    createTextNode(atext: string): ApgGui_IElement;

    hasFocus(): boolean;

    onkeydown: ApgGui_TKeyboardEventCallback;
    onkeyup: ApgGui_TKeyboardEventCallback;

    body: ApgGui_IBody

    fullscreenElement?: ApgGui_IElement;
    exitFullscreen(): void;

    documentElement: ApgGui_IElement;
}



export interface ApgGui_IBody extends ApgGui_IElement {

    requestFullscreen(): void;
    cancelFullscreen(): void;

}



export interface ApgGui_IAnchor extends ApgGui_IElement {

    href: string;

    download: string;

    click(): void;

}



export interface ApgGui_IButton extends ApgGui_IElement {

    disabled: boolean;

    click(): void;

}



export interface ApgGui_IUl extends ApgGui_IElement {

    firstElementChild: ApgGui_IElement;
    children: ApgGui_IElement[];

    insertBefore(alement: ApgGui_IElement, anextElement: ApgGui_IElement): void;
    removeChild(alement: ApgGui_IElement): void;

}



export interface ApgGui_IImage extends ApgGui_IElement {
    width: string | number;
    height: string | number;
    onload: Function;
    src: string;

}



export interface ApgGui_ICanvas extends ApgGui_IElement {
    width: string | number;
    height: string | number;

    // deno-lint-ignore no-explicit-any
    toBlob(af: Function): any;

    getContext(atype: "2d"): ApgGui_I2DRenderingContext;
}



export interface ApgGui_IDetails extends ApgGui_IElement {

    open: boolean;

}



export interface ApgGui_IDialog extends ApgGui_IElement {

    close(): void;
    showModal(): void;

}

// #endregion
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// #region Special



export interface ApgGui_IBrowserLocation {
    search: string
}



export interface ApgGui_IImageData {

    data: Uint8ClampedArray,
    colorSpace: string,
    width: number,
    height: number,
}



export interface ApgGui_I2DRenderingContext {
    font: string;
    textBaseline: string;
    fillStyle: string;

    globalAlpha: number;

    fillRect(x: number, y: number, w: number, h: number): void;

    fillText(t: string, x: number, y: number): void;

    drawImage(
        image: ApgGui_ICanvas,
        x: number, y: number, width?: number, height?: number,
        destX?: number, destY?: number, destWidth?: number, destHeight?: number
    ): void;

    getImageData(sourceX: number, sourceY: number, sourceW: number, sourceH: number): ApgGui_IImageData;

}


// #endregion
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// #region Form elements


export interface ApgGui_IFormElement extends ApgGui_IElement {

    name: string;

    disabled: boolean;

}



export interface ApgGui_ISelect extends ApgGui_IFormElement {

    value: string;

}



export interface ApgGui_IInput extends ApgGui_IFormElement {

    type: ApgGui_eInputType;

}



export interface ApgGui_ICheckBox extends ApgGui_IInput {

    checked: boolean;

    click(): void;

}



export interface ApgGui_IColorPicker extends ApgGui_IInput {

    value: string;

}



export interface ApgGui_IRange extends ApgGui_IInput {

    min: string;
    max: string;
    step: string;
    value: string;

}



export interface ApgGui_IOutput extends ApgGui_IElement {

    textContent: string;

}

// #endregion
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// #region Events



export interface ApgGui_IEvent {
    isEvent: true;
}

export type ApgGui_TEventCallback = (aevent: ApgGui_IEvent) => void;



export interface ApgGui_IMouseEvent extends ApgGui_IEvent {
    clientX: number;
    clientY: number;

    preventDefault(): void;
}

export type ApgGui_TMouseEventCallback = (aevent: ApgGui_IMouseEvent) => void;



export interface ApgGui_IKeyboardEvent extends ApgGui_IEvent {
    key: string;

}

export type ApgGui_TKeyboardEventCallback = (aevent: ApgGui_IKeyboardEvent) => void;

// #endregion
//------------------------------------------------------------------------------