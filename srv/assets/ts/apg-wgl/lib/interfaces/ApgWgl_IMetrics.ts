/** -----------------------------------------------------------------------
 * @module [apg-wgl]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.8 [APG 2023/11/20]
 * -----------------------------------------------------------------------
*/


export interface ApgWgl_IMetrics {

    /** Radious of the scene */
    sceneSize: number;

    /** Radious of the walkable space */
    worldSize: number;

    /** Radious of the sight size to control fog */
    sightSize: number;

    /** Radious of the universe */
    universeSize: number;

    /** Default first person view heigth from ground */
    eyeHeight: number;

}
