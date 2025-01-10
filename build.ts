// deno-lint-ignore-file no-explicit-any
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.0";
import { build, stop } from "npm:esbuild@0.24.0";

/** 
 * builds and bundles an entrypoint into a single ESM output. 
 * @param {Config} cfg - the configuration to build from, object that contains:        
 *    - Out: string - the folder to place the bundle in (defaults to 'dist')   
 *    - Entry: string[] - the entry points to build from (defaults to ["./src/main.ts"])   
 *    - Minify: boolean - whether or not to minify the bundle
 */
export async function buildIt() {
   await build({
      plugins: [...denoPlugins()],
      entryPoints: ['./src/mod.ts'],
      outfile: "./dist/kvKeyCodec.js",
      bundle: true,
      minify: false,
      keepNames: true,
      banner: { js: '// deno-lint-ignore-file' },
      format: "esm"
   }).catch((e: any) => console.info(e));
   console.log("Built ./bundle.js")
   stop();
}

buildIt()