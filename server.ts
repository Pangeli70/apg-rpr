/** -----------------------------------------------------------------------
 * @module [apg-rpr] Rapier Phisics Engine Tests
 * @author [APG] ANGELI Paolo Giusto
 * 
 * -----------------------------------------------------------------------
 */
import { Edr, Dir, Lgr, Tng } from "./srv/deps.ts";
import { ApgRprResources, ApgRprServices } from "./srv/mod.ts";

Edr.ApgEdrService.Init({
  assetsFolder: "./srv",
  clientTxtMaxAgeSeconds: 0
});

Lgr.ApgLgr.AddConsoleTransport();

Tng.ApgTngService.Init('./srv/templates', "");

const serverInfo = Dir.ApgDirServer.GetInfo(Dir.eApgDirEntriesIds.rpr);

const server = new Edr.Drash.Server({
  hostname: '0.0.0.0',
  port: serverInfo.localPort,
  resources: ApgRprResources,
  services: ApgRprServices,
  protocol: "http"
});

server.run();

Dir.ApgDirServer.StartupResume(serverInfo);


