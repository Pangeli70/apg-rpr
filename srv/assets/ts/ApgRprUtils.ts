/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/
import { RAPIER } from './ApgRprDeps.ts';

export class ApgRprUtils {

    static Round(anum: number, aprecision: number) { 

        const t = 10 ** (-1 * aprecision);
        const v = anum * t; 
        const r = Math.round(v) / t;
        return r;

    }

    static GetHeightfieldGeometryDataByHeightFieldColliderData(collider: RAPIER.Collider) {

        const heights = collider.heightfieldHeights();
        const nrows = collider.heightfieldNRows();
        const ncols = collider.heightfieldNCols();
        const scale = collider.heightfieldScale();

        if (heights == null || nrows == null || ncols == null || scale == null) {
            throw new Error('Height field Collider data is invalid');
        }

        const vertices = [];
        const indices = [];
        const eltWX = 1.0 / nrows;
        const eltWY = 1.0 / ncols;
        let i;
        let j;
        for (j = 0; j <= ncols; ++j) {
            for (i = 0; i <= nrows; ++i) {
                const x = (j * eltWX - 0.5) * scale.x;
                const y = heights[j * (nrows + 1) + i] * scale.y;
                const z = (i * eltWY - 0.5) * scale.z;
                vertices.push(x, y, z);
            }
        }
        for (j = 0; j < ncols; ++j) {
            for (i = 0; i < nrows; ++i) {
                const i1 = (i + 0) * (ncols + 1) + (j + 0);
                const i2 = (i + 0) * (ncols + 1) + (j + 1);
                const i3 = (i + 1) * (ncols + 1) + (j + 0);
                const i4 = (i + 1) * (ncols + 1) + (j + 1);
                indices.push(i1, i3, i2);
                indices.push(i3, i4, i2);
            }
        }
        return {
            vertices: new Float32Array(vertices),
            indices: new Uint32Array(indices),
        };
    }
}