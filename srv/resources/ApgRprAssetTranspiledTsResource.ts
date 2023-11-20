/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.1 [APG 2023/08/09]
 * -----------------------------------------------------------------------
 */
import {
    Edr, Uts, Esb
} from "../deps.ts";



/**
 * Resource to deliver transpiled ts files stored in asset folder
 */
export class ApgRprAssetTranspiledTsResource extends Edr.ApgEdrStaticResource {

    private static _transpilations: Map<string, Date> = new Map();



    override paths = [
        "/assets/ts/.*\.ts",
    ];



    async GET(request: Edr.Drash.Request, response: Edr.Drash.Response) {

        const tsFile = Uts.Std.Path.resolve(Edr.ApgEdrService.AssetsFolder + new URL(request.url).pathname);
        const subDir = Uts.ApgUtsIs.IsDeploy() ? "/" : "\\";
        const jsFile = tsFile.replaceAll(subDir + "ts", subDir + "js").replaceAll(".ts", ".js");
        try {

            if (Uts.ApgUtsIs.IsDeploy()) {

                const jsContent = await Deno.readTextFile(jsFile);
                console.log(`Serving:\n  > ${jsFile}`);
                response.body = jsContent;

            }
            else {


                // @DONE Rebuild only if necessary: store last transpilation date -- APG 20230815/20230824
                const tsInfo = Deno.statSync(tsFile);
                const lastTsFileDate = tsInfo.mtime || tsInfo.birthtime!
                const lastTranspilationDate = ApgRprAssetTranspiledTsResource._transpilations.get(tsFile);

                // @NOTE If the file was already compiled and meanwhile was not changed
                if (lastTranspilationDate != undefined && lastTsFileDate.valueOf() == lastTranspilationDate.valueOf()) {
                    const jsContent = await Deno.readTextFile(jsFile);
                    response.body = jsContent;
                    console.log(`Serving:\n  > ${jsFile}`);
                }
                else {
                    console.log(`Converting:\n  > ${tsFile} to\n  > ${jsFile}`);
                    const tsContent = await Deno.readTextFile(tsFile);
                    const js = await Esb.transform(
                        tsContent,
                        { loader: 'ts' }
                    );
                    const jsContent = js.code;
                    // @DONE Ensure paths of js files for subfolders ts files  -- APG 20230809/20230824
                    const jsDir = Uts.Std.Path.dirname(jsFile);
                    await Uts.Std.Fs.ensureDir(jsDir);

                    await Deno.writeTextFile(jsFile, jsContent);
                    response.body = jsContent;
                    ApgRprAssetTranspiledTsResource._transpilations.set(tsFile, lastTsFileDate);
                }
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