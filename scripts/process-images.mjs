// Turns raw screenshots into optimized web images.
//
// Drop a screenshot named after the vehicle id from the sheet into images-src/vehicles/
//   e.g. images-src/vehicles/grotti-cheetah.png   (png / jpg / jpeg / webp all work)
// On build this writes:
//   public/images/vehicles/grotti-cheetah.webp      (1280px wide, page hero / og:image)
//   public/images/vehicles/grotti-cheetah-640.webp  (640px wide, cards)
// and src/data/images.json, the list of ids that have a screenshot.
import { readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SRC = 'images-src/vehicles';
const OUT = 'public/images/vehicles';
mkdirSync(OUT, { recursive: true });

const files = existsSync(SRC)
  ? readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  : [];

const ids = [];
for (const file of files) {
  const id = parse(file).name.toLowerCase();
  const input = join(SRC, file);
  const big = join(OUT, `${id}.webp`);
  const small = join(OUT, `${id}-640.webp`);
  const fresh =
    existsSync(big) && existsSync(small) && statSync(big).mtimeMs >= statSync(input).mtimeMs;
  if (!fresh) {
    // 16:9 crop centred on the car, matching the card and hero frames.
    const base = sharp(input).resize(1280, 720, { fit: 'cover', position: 'attention' });
    await base.clone().webp({ quality: 80 }).toFile(big);
    await base.clone().resize(640, 360).webp({ quality: 75 }).toFile(small);
  }
  ids.push(id);
}

mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/images.json', JSON.stringify(ids.sort(), null, 2) + '\n');
console.log(`[process-images] ${ids.length} vehicle screenshot(s) ready`);
