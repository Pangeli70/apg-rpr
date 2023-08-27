
## APG-RPR

A simple and easy testbed for experimentations with the WASM version of the [Rapier.rs](https://rapier.rs/) physics engine library.

You can find a [demo site here](https://apg-rpr.deno.dev/).

### Why this tool
This platform has the aim to provide a smooth experience while learning the use of the physics engine. Many examples are ported directly from the official documentation.
It is based on [Deno](https://deno.land) and of course Typescript. The only other knowledges required are HTML and CSS.

The stack is minimal, so nothing strictly necessary is used. We don't use anything like a bundler or transpiler like: Vite, Webpack, Parcel, Babel, etc. No HTML framework like: React, Vue, Angular, Svelte, Preact,  etc. No CSS framework like: Tailwind, Bootstrap, Foundation, etc.

All the visualization part is managed by a customizable 3D viewer based upon [THREE.js](https://threejs.org/). For experimenting with the physics engine a knowledge of THREE.js is not required.

Deno empowers a minimal web-server built upon an extended version of [Drash](https://drash.land/drash/v2.x/getting-started/introduction "Drash") designed to work seamlessly with [Deno-Deploy](https://deno.com/deploy).

Transpilation of Typescript is made on the fly if necessary via [esbuild](https://esbuild.github.io/) using a dedicated resource of the Drash server.

Minimalistic CSS styling is made via [Pico](https://picocss.com/) classless semantic stylesheet.

We don't use [lil-gui](https://lil-gui.georgealways.com/) and [stats](https://github.com/mrdoob/stats.js/blob/master/README.md) or similar but a naive-quick-and-dirty implementation of a custom dynamic gui builder.

So to start writing your tests you only need to fork the repo, install deno, clone one of the simulations already provided and tweak a bit the server.ts file to avoid the apg ecosystem dependencies. 