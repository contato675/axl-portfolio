import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {root} from './content.mjs';
import {fetchVideoPoster} from './video-posters.mjs';
if (!process.argv.includes('--confirm-video-posters') || !process.env.SHARP_MODULE) throw new Error('Explicit confirmation and SHARP_MODULE required');
const sharp = (await import(pathToFileURL(process.env.SHARP_MODULE))).default;
sharp.concurrency(2);
const file = path.join(root, 'site/content/videos.json'), original = await fs.readFile(file, 'utf8'), videos = JSON.parse(original), staged = [], receipt = [];
for (const v of videos) {
  const source = await fetchVideoPoster(v.id, sharp);
  const out = await sharp(source.bytes).rotate().toColourspace('srgb').resize({width:1280,withoutEnlargement:true}).webp({quality:86,effort:5}).toBuffer({resolveWithObject:true});
  const poster = {path:v.poster.path,width:out.info.width,height:out.info.height};
  staged.push({path:poster.path,bytes:out.data});
  if (out.info.width > 640) {
    const small = await sharp(out.data).resize({width:640}).webp({quality:82,effort:5}).toBuffer({resolveWithObject:true});
    poster.small = poster.path.replace('.webp','-640.webp'); poster.smallWidth = small.info.width;
    staged.push({path:poster.small,bytes:small.data});
  }
  const clean = await sharp(out.data).metadata(); if(clean.exif||clean.xmp||clean.iptc) throw new Error('Metadata remains');
  receipt.push({id:v.id,source:source.url,sourceWidth:source.width,sourceHeight:source.height,attempts:source.attempts,output:poster,sha256:createHash('sha256').update(out.data).digest('hex')});
  v.poster=poster; console.log('WIDESCREEN_POSTER',v.id,source.width,source.height);
}
if(await fs.readFile(file,'utf8')!==original)throw new Error('Concurrent catalogue edit; no media replaced');
for(const s of staged){if(!/^assets\/images\/videos\/[A-Za-z0-9_-]+\.webp$/.test(s.path))throw new Error('Unsafe output');await fs.writeFile(path.join(root,'site',s.path),s.bytes);}
await fs.writeFile(file,JSON.stringify(videos,null,2)+'\n');
await fs.mkdir(path.join(root,'artifacts/editorial'),{recursive:true});
await fs.writeFile(path.join(root,'artifacts/editorial/posters.json'),JSON.stringify(receipt,null,2));
console.log('VIDEO_POSTERS_READY',videos.length,'Only site derivatives modified; original Desktop media untouched');
