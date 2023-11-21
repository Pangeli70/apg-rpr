/** -----------------------------------------------------------------------
 * @module [apg-wgl]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.1 [APG 2023/08/11]
 * @version 0.0.8 [APG 2023/11/20]
 * -----------------------------------------------------------------------
*/

import {
    THREE
} from '../../deps.ts';


export interface ApgWgl_IOrbitControlsParams {
    eye: THREE.Vector3;
    target: THREE.Vector3;
}
