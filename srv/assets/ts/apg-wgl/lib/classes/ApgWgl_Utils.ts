/** -----------------------------------------------------------------------
 * @module [apg-wgl]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.8 [APG 2023/11/20]
 * -----------------------------------------------------------------------
*/

import {
    THREE
} from "../../deps.ts";



export class ApgWgl_Utils {

    static readonly RAD90 = Math.PI * .5;


    //--------------------------------------------------------------------------
    //#region Extruded Profile Along Path Geometry


    static ProfileAlongPathGeometry(
        aprofile: THREE.Vector2[],
        apath: THREE.Vector2[],
        aclosed = true
    ) {

        const r = new THREE.BufferGeometry();

        const profilePositionsAttribute = this.#getPositionsAttributeForExtrudedProfileAlongPath(
            aprofile,
            apath,
            aclosed
        );

        r.setAttribute(
            "position",
            new THREE.BufferAttribute(profilePositionsAttribute, 3)
        );

        const triangleIndexes = this.#getIndexesForExtrudedProfileAlongPath(
            aprofile,
            apath,
            aclosed,
        );

        r.setIndex(triangleIndexes);
        r.computeVertexNormals();

        return r;
    }



    static #getPositionsAttributeForExtrudedProfileAlongPath(
        aprofile: THREE.Vector2[],
        apath: THREE.Vector2[],
        aclosed: boolean
    ) {
        const ashape = new THREE.Shape(aprofile);

        const profileGeometry = new THREE.ShapeGeometry(ashape);

        profileGeometry.rotateX(this.RAD90); // @WTF Why do we do this? -- APG 20231110 

        const profilePositions = profileGeometry.attributes.position.clone();

        const r = new Float32Array(profilePositions.count * apath.length * 3);

        for (let i = 0; i < apath.length; i++) {

            const iv1 = (i - 1 < 0) ? apath.length - 1 : i - 1;
            const v1 = new THREE.Vector2()
                .subVectors(apath[iv1], apath[i]);

            const iv2 = (i + 1 == apath.length) ? 0 : i + 1;
            const v2 = new THREE.Vector2()
                .subVectors(apath[iv2], apath[i]);

            const angle = v2.angle() - v1.angle();

            let halfAngle = angle / 2;
            let stepAngle = v2.angle() + this.RAD90; // +90°

            if (!aclosed) {
                if (i == 0 || i == apath.length - 1) {
                    halfAngle = this.RAD90;
                }
                if (i == apath.length - 1) {
                    stepAngle = v1.angle() - this.RAD90;
                }
            }

            const contourPoint = apath[i];

            const stepProfile = this.#getStepProfile(
                profilePositions,
                contourPoint,
                halfAngle,
                stepAngle
            );

            r.set(stepProfile.array, stepProfile.count * i * 3);
        }

        return r;
    }



    static #getStepProfile(
        aprofile: THREE.BufferAttribute,
        apathPoint: THREE.Vector2,
        ahalfAngle: number,
        stepAngle: number
    ) {

        const r = aprofile.clone();

        const shift = Math.tan(ahalfAngle - this.RAD90);
        const shifting = new THREE.Matrix4()
            .set(
                1, 0, 0, 0,
                -shift, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
        r.applyMatrix4(shifting);

        const rotation = new THREE.Matrix4()
            .set(
                Math.cos(stepAngle), -Math.sin(stepAngle), 0, 0,
                Math.sin(stepAngle), Math.cos(stepAngle), 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
        r.applyMatrix4(rotation);

        const translation = new THREE.Matrix4()
            .set(
                1, 0, 0, apathPoint.x,
                0, 1, 0, apathPoint.y,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
        r.applyMatrix4(translation);

        return r;
    }



    static #getIndexesForExtrudedProfileAlongPath(
        aprofile: THREE.Vector2[],
        apath: THREE.Vector2[],
        aclosed: boolean,
    ) {

        const r: number[] = [];

        const lastCorner = aclosed == false ? apath.length - 1 : apath.length;

        const count = aprofile.length;

        for (let i = 0; i < lastCorner; i++) {

            for (let j = 0; j < count; j++) {

                const currCorner = i;
                const nextCorner = i + 1 == apath.length ? 0 : i + 1;
                const currPoint = j;
                const nextPoint = j + 1 == count ? 0 : j + 1;

                const a = nextPoint + count * currCorner;
                const b = currPoint + count * currCorner;
                const c = currPoint + count * nextCorner;
                const d = nextPoint + count * nextCorner;


                r.push(a, b, d);
                r.push(b, c, d);
            }
        }

        return r;
    }


    //#endregion
    //--------------------------------------------------------------------------

}