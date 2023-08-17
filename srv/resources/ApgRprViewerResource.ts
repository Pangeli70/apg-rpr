/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/09]
 * -----------------------------------------------------------------------
 */
import { version } from "https://cdn.skypack.dev/@dimforge/rapier3d-compat";
import { Edr, Dir, Tng } from "../deps.ts";

/** Resource to deliver the page that contains the various Rapier tests */
export class ApgRprViewerResource extends Edr.ApgEdrLoggableResource {
  public override paths = ["/"];

  public async GET(_request: Edr.Drash.Request, response: Edr.Drash.Response) {

    const serverInfo = Dir.ApgDirServer.GetInfo(Dir.eApgDirEntriesIds.rpr);

    const templateData = {
      $site: {
        name: serverInfo.caption,
        version: serverInfo.version,
        title: serverInfo.title
      },
      $page: {
        released: "2023/08/09"
      }
    };

    const html = await Tng.ApgTngService.Render("/ApgRprViewerPage.html", templateData) as string;

    response.html(html);

  }






}
