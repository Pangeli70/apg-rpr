/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

export * as Esb from "https://deno.land/x/esbuild@v0.18.0/mod.js"

export * as Rpr from "../lib/mod.ts"

// Apg github repos
export * as Uts from "https://raw.githubusercontent.com/Pangeli70/apg-uts/master/mod.ts";
export * as Rst from "https://raw.githubusercontent.com/Pangeli70/apg-rst/master/mod.ts";
export * as Lgr from "https://raw.githubusercontent.com/Pangeli70/apg-lgr/master/mod.ts";
export * as Dir from "https://raw.githubusercontent.com/Pangeli70/apg-dir/master/mod.ts";
export * as Edr from "https://raw.githubusercontent.com/Pangeli70/apg-edr/master/mod.ts";
export * as Tng from "https://raw.githubusercontent.com/Pangeli70/apg-tng/master/mod.ts";

// Apg Local Monorepo
// export * as Uts from "../../apg-uts/mod.ts";
// export * as Lgr from "../../apg-lgr/mod.ts";
// export * as Rst from "../../apg-rst/mod.ts";
// export * as Dir from "../../apg-dir/mod.ts";
// export * as Edr from "../../apg-edr/mod.ts";
// export * as Tng from "../../apg-tng/mod.ts";

// External repos needed by the client that we want to cache in deno
export { default as PRANDO } from "https://esm.sh/prando@6.0.1";
export { default as md5 } from "https://esm.sh/md5@2.3.0";

//export * as RAPIER from "https://cdn.skypack.dev/@dimforge/rapier3d-compat";
//export * as RAPIER from "https://unpkg.com/@dimforge/rapier3d-compat@0.11.2";
//export * as RAPIER from "https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.11.2";