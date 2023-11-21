/** -----------------------------------------------------------------------
 * @module [apg-wgl]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.8 [APG 2023/11/20]
 * -----------------------------------------------------------------------
*/

import {
    ApgWgl_eEnvMapMode
} from "../enums/ApgWgl_eEnvMapMode.ts";


export interface ApgWgl_IEnvMaps {
    mode: ApgWgl_eEnvMapMode;
    maps: string[];
}
