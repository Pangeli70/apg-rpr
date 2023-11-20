/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.8 [APG 2023/11/11]
 * -----------------------------------------------------------------------
*/

import { Uts } from "./deps.ts";


interface IServerInfo {
    caption: string,
    title: string,
    version: string,
    released: string,
    localPort: number,
}

export class ApgRprServerInfo {

    static readonly info: IServerInfo = {
        caption: "Apg-Rpr",
        title: "Rapier Physics engine tests",
        version: "0.0.8",
        released: "2023/11/11",
        localPort: 5689
    }

    static StartupResume() {
        const now = new Date().toISOString();
        console.log(`\n`);
        console.log(Uts.ApgUtsStr.FilledCentered('', 80, "+", "-"));
        console.log(Uts.ApgUtsStr.FilledCentered(this.info.caption, 80, "|", " "));
        console.log(Uts.ApgUtsStr.FilledCentered(this.info.title, 80, "|", " "));
        console.log(Uts.ApgUtsStr.FilledCentered(`Version ${this.info.version}`, 80, "|", " "));
        console.log(Uts.ApgUtsStr.FilledCentered(`Started ${now} (ISO)`, 80, "|", " "));
        console.log(Uts.ApgUtsStr.FilledCentered(`http://localhost:${this.info.localPort}`, 80, "|", " "));
        console.log(Uts.ApgUtsStr.FilledCentered(`Drash Server ready to receive requests`, 80, "|", " "));
        console.log(Uts.ApgUtsStr.FilledCentered('', 80, "+", "-"));
    }
}