/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/09]
 * -----------------------------------------------------------------------
 */
import { Edr, Uts, Esb } from "../deps.ts";


/** Resource to deliver js transpiled starting from ts files stored in asset folder */
export class ApgRprAssetTranspiledTsResource extends Edr.ApgEdrStaticResource {

  public override paths = [
    "/assets/ts/.*\.ts",
  ];

  public async GET(request: Edr.Drash.Request, response: Edr.Drash.Response) {

    const tsFile = Uts.Std.Path.resolve(Edr.ApgEdrService.AssetsFolder + new URL(request.url).pathname);
    const subDir = Uts.ApgUtsIs.IsDeploy() ? "/" : "\\";
    const jsFile = tsFile.replaceAll(subDir + "ts", subDir + "js").replaceAll(".ts", ".js");
    console.log(`Converting:\n  > ${tsFile} to\n  > ${jsFile}`)
    try {
      if (Uts.ApgUtsIs.IsDeploy()) {
        const jsContent = await Deno.readTextFile(jsFile);
        response.body = jsContent;
      } else {
        // TODO Rebuild only if necessary: store last transpilation date -- APG 20230815 
        // TODO Ensure paths -- APG 20230809
        const tsContent = await Deno.readTextFile(tsFile);
        const js = await Esb.transform(
          tsContent,
          { loader: 'ts' }
        );
        const jsContent = js.code;
        await Deno.writeTextFile(jsFile, jsContent);
        response.body = jsContent;
      }
    }
    catch (e) {
      console.log(e)
      response.body = "Error:" + JSON.stringify(e);
    }

    const type = 'text/javascript'
    response.headers.set("Content-Type", type);

    const maxAge = Edr.ApgEdrService.ClientTxtMaxAgeSeconds;
    response.headers.append("Cache-Control", `private, max-age=${maxAge}, immutable`)
  }

}