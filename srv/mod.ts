/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

import { Edr } from "./deps.ts";
import { ApgRprAssetTextureResource } from './resources/ApgRprAssetTextureResource.ts';
import { ApgRprAssetTranspiledTsResource } from './resources/ApgRprAssetTranspiledTsResource.ts';
import { ApgRprViewerResource } from './resources/ApgRprViewerResource.ts';

export const ApgRprResources: typeof Edr.Drash.Resource[] = [
    // Static
    Edr.ApgEdrAssetsTextFileResource,
    Edr.ApgEdrAssetBinFileResource,

    ApgRprAssetTextureResource,
    ApgRprAssetTranspiledTsResource,

    ApgRprViewerResource,
];

export const ApgRprServices: Edr.Drash.Service[] = [
    new Edr.Drash.CORSService()
];