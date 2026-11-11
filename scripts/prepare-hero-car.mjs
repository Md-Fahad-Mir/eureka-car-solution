/**
 * Prepares the homepage hero car from the Khronos "CarConcept" sample model.
 *
 * Source:  https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept
 * Licence: CC BY 4.0, © 2024 Darmstadt Graphics Group GmbH, model and textures by Eric Chadwick.
 *          The Khronos and 3D Commerce logos in the original are trademarks and NOT covered by
 *          CC BY, so this script removes them.
 *
 * Changes made (CC BY requires stating them):
 *   1. the logo texture (licence plate + emissive badges) is replaced with plain black;
 *   2. the "KHRONOS GROUP" and "3DCommerce" lettering on the tyre sidewall maps is erased;
 *   3. geometry is compressed with EXT_meshopt_compression (no mesh merging or simplification,
 *      so every named part can still be animated separately).
 *
 * Usage:
 *   curl -L -o /tmp/CarConcept.glb \
 *     https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb
 *   npm run prepare:hero-car -- /tmp/CarConcept.glb public/models/hero-car.glb
 */
import { readFileSync } from "node:fs";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, prune, quantize, reorder } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import { PNG } from "pngjs";

const [, , input, output = "public/models/hero-car.glb"] = process.argv;
if (!input) throw new Error("Usage: prepare-hero-car.mjs <CarConcept.glb> [output.glb]");

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(input);
const materials = doc.getRoot().listMaterials();

// 1. The logo texture is the licence plate's base colour (also used as emissive badges elsewhere).
const logo = materials.find((m) => m.getName() === "License")?.getBaseColorTexture();
if (!logo?.getImage()) throw new Error("Logo texture not found: is this the CarConcept model?");
{
  const src = PNG.sync.read(Buffer.from(logo.getImage()));
  const black = new PNG({ width: src.width, height: src.height });
  for (let i = 0; i < black.data.length; i += 4) black.data.set([0, 0, 0, 255], i);
  logo.setImage(PNG.sync.write(black));
}

// 2. Tyre sidewall maps: erase the two logo arcs (flat normal on the normal map,
//    the sidewall's own grey on the colour map).
const tyre = materials.find((m) => m.getName() === "Tireside");
let cleaned = 0;
for (const tex of [tyre?.getNormalTexture(), tyre?.getBaseColorTexture()]) {
  if (!tex?.getImage() || tex.getMimeType() !== "image/png") continue;
  const png = PNG.sync.read(Buffer.from(tex.getImage()));
  if (png.width !== 1024 || png.height !== 1024) continue;
  const isNormal = tex === tyre.getNormalTexture();
  const sample = ((512 + 470) * png.width + 512) * 4; // bottom of the same ring, no logo there
  const fill = isNormal ? [128, 128, 255, 255] : [...png.data.subarray(sample, sample + 4)];
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const dx = x - 512, dy = y - 512, r = Math.hypot(dx, dy);
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const left = r > 430 && r < 520 && Math.abs(Math.abs(deg) - 180) < 21; // "KHRONOS GROUP"
      const right = r > 440 && r < 520 && Math.abs(deg) < 14; // "3DCommerce"
      if (left || right) png.data.set(fill, (y * png.width + x) * 4);
    }
  }
  tex.setImage(PNG.sync.write(png));
  cleaned++;
}
if (cleaned !== 2) throw new Error(`Expected 2 tyre sidewall maps, cleaned ${cleaned}`);

// 3. Geometry compression.
await doc.transform(dedup(), prune(), reorder({ encoder: MeshoptEncoder }), quantize());
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await io.write(output, doc);
console.log(`Wrote ${output} (${Math.round(readFileSync(output).length / 1024)} KB)`);
