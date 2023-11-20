/** -----------------------------------------------------------------------
 * @module [apg-rpr] Rapier Phisics Engine Tests
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.1 [APG 2023/08/11]
 * -----------------------------------------------------------------------
 */
import {
  Edr, Tng
} from "./srv/deps.ts";

import {
  ApgRprResources,
  ApgRprServerInfo,
  ApgRprServices
} from "./srv/mod.ts";



Edr.ApgEdrService.Init({
  assetsFolder: "./srv",
  clientTxtMaxAgeSeconds: 0
});


Tng.ApgTngService.Init('./srv/templates', "");

const server = new Edr.Drash.Server({
  hostname: '0.0.0.0',
  port: ApgRprServerInfo.info.localPort,
  resources: ApgRprResources,
  services: ApgRprServices,
  protocol: "http"
});

server.run();

ApgRprServerInfo.StartupResume();


