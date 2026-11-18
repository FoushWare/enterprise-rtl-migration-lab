import {build} from 'esbuild';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({entryPoints:[path.join(root,'App.tsx')],outfile:path.join(root,'build/app.js'),bundle:true,minify:false,sourcemap:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});
