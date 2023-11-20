# APG-RPR Help

An enhanced testbed for experimentations with the WASM version of the
[Rapier.rs](https://rapier.rs/) physics engine library.

[Demo site](https://apg-rpr.deno.dev/).

## Why this ?

This github repo has the aim to provide a smooth experience while learning the
Rapier physics engine.

Many examples are ported directly from the official documentation.

The development is based on the [Deno](https://deno.land) runtime and of course
using the Typescript language. The only other knowledges required are HTML and
CSS.

Deno empowers a minimal web-server built upon an extended version of
[Drash V2.x](https://drash.land/drash/v2.x/getting-started/introduction "Drash")
designed to work seamlessly with [Deno-Deploy](https://deno.com/deploy).

The stack is minimal, so nothing strictly necessary is used. We don't use
anything like a bundler or transpiler like Vite, Webpack, Parcel, Babel, etc.

Transpilation of client side Typescript is made on the fly if necessary via
[esbuild](https://esbuild.github.io/) using a dedicated resource of the Drash
server.

No HTML framework like React, Vue, Angular, Svelte, Preact, etc. is used.

No CSS framework like Tailwind, Bootstrap, Foundation, etc. is used.
Minimalistic CSS styling is made via [Pico](https://picocss.com/) classless
semantic stylesheet.

All the visualization part is managed by a customizable 3D viewer based on
[THREE.js](https://threejs.org/).

For experimenting with the physics engine a deep knowledge of THREE.js is not
required.

We don't use [lil-gui](https://lil-gui.georgealways.com/) and
[stats](https://github.com/mrdoob/stats.js/blob/master/README.md) or similar but
a naive-quick-and-dirty implementation of a custom dynamic gui builder with a
simplified stats module.

## How to install?

If you haven't yet, install deno.

> [Official website](https://docs.deno.com/runtime/manual/getting_started/installation)

Goto to the github repo

> https://github.com/Pangeli70/apg-rpr

Clone the repo using the github Cli

> gh repo clone Pangeli70/apg-rpr

Or fork it or download it as zip or use VScode or whatever you prefer

Move to the folder on your machine where you have copied the repo and run the
command from the console:

> deno task run

A Drash webserver is now running in watch mode on the port 5689 on your machine
showing something similar to the following.

```
+------------------------------------------------------------------------------+
|                                   Apg-Rpr                                    |
|                         Rapier Physics engine tests                          |
|                                Version 0.1.8                                 |
|                    Started 2023-11-11T15:12:40.415Z (ISO)                    |
|                            http://localhost:5689                             |
|                    Drash Server ready to receive requests                    |
+------------------------------------------------------------------------------+
```

Click the link in the console or open the page in your browser and enter ther
url.

> http://localhost:5689

The web application should start in your browser.

## How to start some experimentation?

Open the subfolder simulations.

Clone and rename the file named:

> ApgRpr_00_EmptyExample.ts

Open the new file and rename the settings interface:

>

rename the simulation class:

>

rename the gui guilder class:

>

Use the provided example simulations to take inspiration and create your own
versions of the .createWorld() method ad GuiBuilder class.

Then update the file named:

> ApgRpr_Simulations.ts

Including your simulation source file.

```typescript

...

import { ApgRpr_A0_Pyramid_Simulation } from "./simulations/ApgRpr_A0_Pyramid.ts";
import { ApgRpr_A1_Column_Simulation } from "./simulations/ApgRpr_A1_Column.ts";
import { ApgRpr_A2_Domino_Simulation } from "./simulations/ApgRpr_A2_Domino.ts";
...
// Your simulation file import here

```

Add a name for your simulation in the enumeration (this is not mandatory but convenient):

```typescript
export enum ApgRpr_eSimulationName {
    A0_PYRAMID = 'Pyramid',
    A1_COLUMN = 'Column',
    A2_DOMINO = 'Domino',
    ...
    // Your simulation name here

    Z_NONE = '',
}
```

And finally add your simulation to the global map in the
ApgRpr_PrepareSimulations() entry point function.

```typescript
export function ApgRpr_PrepareSimulations() {
    const simulations: Map<ApgRpr_eSimulationName, typeof ApgRpr_Simulation> = new Map();

    simulations.set(ApgRpr_eSimulationName.A0_PYRAMID, ApgRpr_A0_Pyramid_Simulation);
    simulations.set(ApgRpr_eSimulationName.A1_COLUMN, ApgRpr_A1_Column_Simulation);
    simulations.set(ApgRpr_eSimulationName.A2_DOMINO, ApgRpr_A2_Domino_Simulation);
    ...
    // Your simulation here

    return simulations;
}
```

That's it!

Have some happy testing.


