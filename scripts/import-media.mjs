/* Explicit initial import. Originals are read-only; no audio is downloaded. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {fetchVideoPoster} from './video-posters.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),source=process.argv[2];
if(!source||!process.env.SHARP_MODULE)throw new Error('Pass source folder and SHARP_MODULE');
const sharp=(await import(pathToFileURL(process.env.SHARP_MODULE))).default;sharp.concurrency(2);
try{await fs.access(path.join(root,'site/content/releases.json'));throw new Error('Existing catalogue: refusing destructive re-import');}catch(e){if(e.code!=='ENOENT')throw e;}
const text=await fs.readFile(path.join(source,'Links AXL.txt'),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const files=(await fs.readdir(source)).filter(f=>/\.(png|jpe?g)$/i.test(f));
const metadata=JSON.parse(await fs.readFile(path.join(root,'artifacts/provider-metadata.json'),'utf8'));
const meta=id=>{const r=metadata.find(r=>r.id===id);if(!r||r.status!==200)throw new Error('Unverified provider '+id);return r;};
const releases=[],videos=[],provenance=[];
const spec=[
 ['barba-negra-2024','Barba Negra vs Orelha Peluda',2024,'album','5bnD4SLSWIQVdVk94QtghA',null,'Barba Negra · A.X.L.'],
 ['tudo-mudou-2022','A Vida de Axel Alberigi, parte 2 Vol. 2: Tudo Mudou',2022,'album','4aCYzqIrfiJcljWKL0xOhF','tudo mudou','A.X.L.'],
 ['rdf-vol-2-2021','RDF$$$ Vol. 2: O Vento Varre a Terra',2021,'compilation','42f9ugznRhzngOc7WxoB1I','vol. 2','RDF$$$ · A.X.L. · Câmara de Ecos'],
 ['tudo-de-novo-2020','A Vida de Axel Alberigi, parte 2: Tudo de Novo',2020,'album','7x8V3OCxvk0XMWNbVwLsJ4','tudo de novo','A.X.L.'],
 ['rdf-vol-1-2020','RDF$$$ Vol. 1: Depois da Água Antes do Fogo',2020,'compilation','746bNLG6I1RpzhTUU3Z8Kj','vol. 1','RDF$$$ · A.X.L. · Câmara de Ecos'],
 ['antes-de-tudo-2014','A Vida de Axel Alberigi: Antes de Tudo',2014,'album','6wuaijn0Wg1pDziPuhZKNe','antes de tudo','A.X.L.'],
 ['quando-e-preciso-voltar-2011','Quando É Preciso Voltar',2011,'album','0nLvIHbTPxE9aPmcP45T6D','quando e preciso','A.X.L. · Skeeter'],
 ['caos-pessoal-2010','Caos Pessoal',2010,'mixtape','4kgZ6BMJvP6Mni09OUCtrB','caos pessoal','A.X.L.'],
 ['fantasmas-2022','Fantasmas',2022,'single','3phpGituVhLMV9cPFcv2Go',null,'DJ Caique · A.X.L.'],
 ['axl-pai-guga-2020','A.X.L. & pai guga',2020,'ep','5eZjufPIUxPzAW7WnjlTXW','pai guga','A.X.L. · pai guga'],
 ['ouro-no-sangue-2019','Ouro No Sangue',2019,'single','7C1x4ET9jQfmtgzP43rHJH','ouro no sangue','A.X.L.'],
 ['heranca-verde-escuro-2017','Herança Verde Escuro',2017,'single','6DP7xZ7aankYAsW2elMhNG','heranca','A.X.L.'],
 ['triz-2016','TRIZ',2016,'ep',null,'triz','A.X.L. · Leonardo Irian'],
 ['o-bagulho-e-doidao-2012','O Bagulho É Doidão',2012,'single','2kFAQTsynDZfuMNNUCUO5r','o bagulho','A.X.L.'],
 ['nao-mano-remix-2012','Não, Mano! REMIX',2012,'single','4vzNPOoTyOojq5SS4QiGIz','nao, mano','A.X.L. · Skeeter · Flora Matos · MV Bill'],
 ['uma-lagrima-2009','Uma Lágrima',2009,'single','1pZV2pfGqY7lrfDWhwVSBd','uma lagrima','A.X.L.'],
 ['curta-metragem-2008','Curta Metragem',2008,'ep',null,'curta metragem','A.X.L.']
];
async function bytesAt(url){const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error('Media HTTP '+r.status+' '+url);return Buffer.from(await r.arrayBuffer());}
async function image(bytes,slug,origin){
 const originalHash=sha(bytes),dest='assets/images/'+slug+'.webp';await fs.mkdir(path.join(root,'site',path.dirname(dest)),{recursive:true});
 const out=await sharp(bytes).rotate().toColourspace('srgb').resize(1600,1600,{fit:'inside',withoutEnlargement:true}).webp({quality:90,effort:5}).toBuffer({resolveWithObject:true});
 await fs.writeFile(path.join(root,'site',dest),out.data);const clean=await sharp(out.data).metadata();if(clean.exif||clean.xmp||clean.iptc)throw new Error('Private metadata remains');
 const result={path:dest,width:out.info.width,height:out.info.height};
 if(out.info.width>640){const thumb=await sharp(bytes).rotate().toColourspace('srgb').resize({width:640,withoutEnlargement:true}).webp({quality:88}).toBuffer({resolveWithObject:true});result.small=dest.replace('.webp','-640.webp');await fs.writeFile(path.join(root,'site',result.small),thumb.data);result.smallWidth=thumb.info.width;}
 provenance.push({origin,sourceHash:originalHash,sourceBytes:bytes.length,output:dest,outputHash:sha(out.data),metadataRemoved:true});return result;
}
for(const [id,title,year,type,spotifyId,match,artists] of spec){
 let local=null;if(match){const matches=files.filter(f=>norm(f).includes(match));if(matches.length!==1)throw new Error('Ambiguous local cover '+match);local=matches[0];}
 const origin=local?local:meta(spotifyId).metadata.thumbnail_url;const bytes=local?await fs.readFile(path.join(source,local)):await bytesAt(origin);
 const cover=await image(bytes,'covers/'+id,origin);if(local&&sha(await fs.readFile(path.join(source,local)))!==sha(bytes))throw new Error('Original changed');
 let tracks=[],serviceTitle=null;
 if(spotifyId){if(!text.includes(spotifyId))throw new Error('Spotify link not in source');const html=await fs.readFile(path.join(root,'artifacts/spotify-'+spotifyId+'.html'),'utf8');const m=html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);if(!m)throw new Error('No Spotify data');const e=JSON.parse(m[1]).props.pageProps.state.data.entity;serviceTitle=e.name;tracks=e.trackList.map(t=>({title:t.title,artists:t.subtitle.replace(/\u00a0/g,' '),durationMs:t.duration,url:'https://open.spotify.com/track/'+t.uri.split(':').at(-1)}));}
 releases.push({id,title,year,type,artists,cover,spotifyId,serviceTitle,tracks,listen:spotifyId?'https://open.spotify.com/album/'+spotifyId:(id==='curta-metragem-2008'?'https://www.youtube.com/watch?v=w48_T5GBsG8':null),yearSource:id==='triz-2016'?'Supplied cover filename':'Links AXL.txt'});
 console.log('RELEASE',id,tracks.length);
}
const clips=[['yTs9CgrP-88','Herança Verde Escuro',true],['5nFmCqWsEYk','Nada De Novo',true],['W1M8L5p7c30','O Mundo Em Mim, Se Encontrar',true],['ShHAApg2vIc','É Nóiz!',false],['3uDp52U8LaI','Não, Mano! REMIX',false],['D2mxDysIDyw','Feito Com A Gente',false],['AE44Pg16LWY','Será Doce Morrer',false],['h6E_3ftiIQg','Ouro No Sangue',false],['VcW_-D6iWYQ','Marimbondo',false],['Q9l6wqh_wnI','Mamangava',false],['8RwGnTwzvgc','O Inimigo',false],['XY9zx6hhMug','Novo$ A$$unto$ da Família',false]];
const live=[['4eebJrp5FBc','RADIORDF 0001 · Ouro no Sangue e Eras Freestyle'],['t1nwuVbEc9Y','Ouro No Sangue · RUADOFLOW, SJC'],['kDln6f8bwuc','Herança Verde Escuro · RUADOFLOW 10 Anos']];
for(const [kind,items] of [['clip',clips],['live',live]])for(const [id,title,featured=false] of items){if(!text.includes(id))throw new Error('Video not supplied');const m=meta(id),sourcePoster=await fetchVideoPoster(id,sharp);videos.push({id,title,kind,featured,sourceTitle:m.metadata.title,url:m.url,poster:await image(sourcePoster.bytes,'videos/'+id,sourcePoster.url)});}
const profile=JSON.parse(await fs.readFile(path.join(root,'artifacts/sssom-public-profile.json'),'utf8'));if(profile.length!==1||profile[0].name!=='A.X.L.')throw new Error('Ambiguous profile');
const portrait=await image(await bytesAt(profile[0].image_url),'profile/axl',profile[0].image_url);
await fs.writeFile(path.join(root,'site/content/releases.json'),JSON.stringify(releases,null,2)+'\n');await fs.writeFile(path.join(root,'site/content/videos.json'),JSON.stringify(videos,null,2)+'\n');await fs.writeFile(path.join(root,'site/content/portrait.json'),JSON.stringify({image:portrait,source:profile[0].image_url,profileUrl:'https://sssom.com/artists/'+profile[0].id},null,2)+'\n');
await fs.writeFile(path.join(root,'artifacts/import-receipt.json'),JSON.stringify({at:new Date().toISOString(),documentHash:sha(text),releases:releases.length,clips:clips.length,live:live.length,originalsUnchanged:true,provenance},null,2));console.log('IMPORT_OK',releases.length,videos.length);
