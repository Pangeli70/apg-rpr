/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/09]
 * -----------------------------------------------------------------------
 */
import {
    Edr, Tng
} from "../deps.ts";

import {
    ApgRprServerInfo
} from "../ApgRprServerInfo.ts";


/**
 * Resource to deliver the main page af the web application with the various Rapier tests
 */
export class ApgRprViewerResource extends Edr.ApgEdrLoggableResource {


    override paths = ["/"];



    async GET(_request: Edr.Drash.Request, response: Edr.Drash.Response) {

        const serverInfo = ApgRprServerInfo.info;

        const templateData = {
            $site: {
                name: serverInfo.caption,
                version: serverInfo.version,
                title: serverInfo.title
            },
            $page: {
                released: serverInfo.released
            }
        };

        const html = await Tng.ApgTngService.Render("/ApgRprViewerPage.html", templateData) as string;

        response.html(html);

    }

}
