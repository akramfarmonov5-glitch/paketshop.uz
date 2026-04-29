import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
// Asl logo faylidan foydalanamiz
const sourceImage = resolve(publicDir, 'logo.png');

async function generateFavicons() {
  console.log('🔄 PWA uchun atrofiga joy tashlangan (padding) ikonkalarni generatsiya qilish...');

  // Rasmni 75% hajmda qilib, atrofiga 25% bo'sh joy tashlaymiz
  const padScale = 0.75; 

  // PWA 512x512 (padding bilan)
  await sharp(sourceImage)
    .resize(Math.round(512 * padScale), Math.round(512 * padScale), { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: Math.round(512 * ((1 - padScale) / 2)),
      bottom: Math.round(512 * ((1 - padScale) / 2)),
      left: Math.round(512 * ((1 - padScale) / 2)),
      right: Math.round(512 * ((1 - padScale) / 2)),
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png({ quality: 100 })
    .toFile(resolve(publicDir, 'pwa-512x512.png'));
  console.log('✅ pwa-512x512.png (padding bilan)');

  // PWA 192x192 (padding bilan)
  await sharp(sourceImage)
    .resize(Math.round(192 * padScale), Math.round(192 * padScale), { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: Math.round(192 * ((1 - padScale) / 2)),
      bottom: Math.round(192 * ((1 - padScale) / 2)),
      left: Math.round(192 * ((1 - padScale) / 2)),
      right: Math.round(192 * ((1 - padScale) / 2)),
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png({ quality: 100 })
    .toFile(resolve(publicDir, 'pwa-192x192.png'));
  console.log('✅ pwa-192x192.png (padding bilan)');

  // Apple Touch Icon 180x180
  await sharp(sourceImage)
    .resize(Math.round(180 * padScale), Math.round(180 * padScale), { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: Math.round(180 * ((1 - padScale) / 2)),
      bottom: Math.round(180 * ((1 - padScale) / 2)),
      left: Math.round(180 * ((1 - padScale) / 2)),
      right: Math.round(180 * ((1 - padScale) / 2)),
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(resolve(publicDir, 'apple-touch-icon.png'));
  console.log('✅ apple-touch-icon.png (padding bilan)');

  // Qolgan kichik favicons uchun ham shu yangi 512x512 asos qilib olinadi
  const paddedSource = resolve(publicDir, 'pwa-512x512.png');
  
  await sharp(paddedSource).resize(16, 16).png().toFile(resolve(publicDir, 'favicon-16x16.png'));
  await sharp(paddedSource).resize(32, 32).png().toFile(resolve(publicDir, 'favicon-32x32.png'));
  await sharp(paddedSource).resize(48, 48).png().toFile(resolve(publicDir, 'favicon-48x48.png'));
  await sharp(paddedSource).resize(32, 32).png().toFile(resolve(publicDir, 'favicon.png'));
  
  console.log('\n🎉 Barcha ikonkalarga bo`sh joy (padding) qo`shildi va yangilandi!');
}

generateFavicons().catch(console.error);
