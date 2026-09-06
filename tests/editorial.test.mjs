import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {load,hosting,ui,root} from '../scripts/content.mjs';
import {generate} from '../scripts/build.mjs';
import {fetchVideoPoster} from '../scripts/video-posters.mjs';
const d=await load(),h=hosting(false),preview=generate(d,h);
const approval={origin:'https://axl.sssom.com',editorialApproved:true,dnsVerified:true,httpsVerified:true,robotsRootVerified:true};
const released=generate(d,hosting(true),{indexable:true,approval});
const ld=html=>html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
for(const locale of ['en','pt-BR']){
 const pre=locale==='en'?'':'pt-br/',html=preview.get(pre+'index.html');
 test('Artist badge is focused on rapper/songwriter '+locale,()=>{assert.doesNotMatch(ui[locale].role,/RUADOFLOW/);assert.ok(html.includes(ui[locale].role));});
 test('Collective and Brazilian identity are explicit '+locale,()=>{assert.match(d.artist.intro[locale],locale==='en'?/RUADOFLOW collective/:/coletivo RUADOFLOW/);for(const i of [0,3])assert.match(d.artist.bio[locale][i],locale==='en'?/Brazilian/:/brasileiro/);});
 test('More clips starts expanded and remains a native disclosure '+locale,()=>{assert.match(html,/<details class="video-more" open><summary>/);assert.equal((html.match(/data-video=/g)||[]).length,15);});
 test('Player subtitle and SSSOM footer link removed '+locale,()=>{assert.doesNotMatch(html,/O player carrega|The player loads only/);const footer=html.match(/<footer[\s\S]*?<\/footer>/)[0];assert.doesNotMatch(footer,/SSSOM|sssom\.com/);assert.match(footer,/mailto:ruadoflow@gmail.com/);});
 test('Rolling Stone reference is shared by HTML, Markdown and structured data '+locale,()=>{const url=d.artist.sources[0].url;for(const key of [pre+'index.html',pre+'index.md',pre+'portfolio.json'])assert.ok(preview.get(key).includes(url));});
 test('Embedded JSON-LD is the same source as the text API '+locale,()=>{const json=ld(html);assert.deepEqual(JSON.parse(json),JSON.parse(preview.get(pre+'portfolio.json')));const hash=createHash('sha256').update(json).digest('base64');assert.ok(html.includes("'sha256-"+hash+"'"));assert.doesNotMatch(html,/unsafe-inline/);});
 test('Each release embeds only its own record plus the artist '+locale,()=>{for(const r of d.releases){const graph=JSON.parse(ld(preview.get(pre+'releases/'+r.id+'/index.html')))['@graph'];assert.equal(graph.length,2);assert.equal(graph[1].name,r.title);assert.equal(graph[1].datePublished,String(r.year));}});
}
test('Exact approved Portuguese intro',()=>assert.equal(d.artist.intro['pt-BR'],'Rapper e compositor de Jacareí. Discos autobiográficos, audiovisual independente e uma vida na música. Fundador do coletivo RUADOFLOW.'));
test('New email consistent across every generated representation',()=>{for(const [name,content] of preview)if(/\.html$|\.md$|portfolio\.json$|llms-full/.test(name)){assert.ok(content.includes('ruadoflow@gmail.com'),name);assert.doesNotMatch(content,/contato@ruadoflow.com/);}});
test('All 15 posters have genuine widescreen intrinsic dimensions',()=>{assert.equal(d.videos.length,15);for(const v of d.videos){assert.ok(Math.abs(v.poster.width/v.poster.height-16/9)<0.02,v.id);assert.ok(v.poster.width>=320);}});
test('Covers retain contain; only video posters fill their cards',async()=>{const css=await fs.readFile(path.join(root,'site/assets/css/style.css'),'utf8');assert.match(css,/\.cover img\{[^}]*object-fit:contain/);assert.match(css,/\.video-surface img\{[^}]*object-fit:cover/);assert.match(css,/\.video-surface\{[^}]*background:#000/);});
test('Preview can be read without advertising its noindex URLs in a sitemap',()=>{
 const robots=preview.get('robots.txt');assert.match(robots,/User-agent: \*\nAllow: \/axl-portfolio\//);assert.match(robots,/User-agent: OAI-SearchBot\nAllow:/);assert.match(robots,/User-agent: GPTBot\nDisallow:/);assert.doesNotMatch(robots,/\nSitemap:/);assert.doesNotMatch(preview.get('sitemap.xml'),/<url>/);assert.match(preview.get('index.html'),/noindex,follow/);
});
test('Approved-root sitemap has exactly 36 canonical URLs with reciprocal languages',()=>{
 const xml=released.get('sitemap.xml'),locs=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(locs.length,36);assert.equal(new Set(locs).size,36);assert.ok(locs.every(u=>u.startsWith('https://axl.sssom.com/')));assert.equal((xml.match(/hreflang="x-default"/g)||[]).length,36);assert.equal((xml.match(/hreflang="pt-BR"/g)||[]).length,36);assert.doesNotMatch(xml,/404|\.md|\.json|<lastmod>|contato675/);assert.match(released.get('robots.txt'),/Sitemap: https:\/\/axl.sssom.com\/sitemap.xml/);
});
test('Root indexation is opt-in and refuses missing or partial sign-off',()=>{
 assert.throws(()=>generate(d,hosting(true),{indexable:true}),/approval/);
 for(const key of ['editorialApproved','dnsVerified','httpsVerified','robotsRootVerified'])assert.throws(()=>generate(d,hosting(true),{indexable:true,approval:{...approval,[key]:false}}),new RegExp(key));
 assert.throws(()=>generate(d,h,{indexable:true,approval}),/custom-domain root/);
 assert.throws(()=>generate(d,{origin:'https://unrelated.example',base:'/'}),/Unsupported/);
 assert.match(generate(d,hosting(true)).get('index.html'),/noindex,follow/);
 assert.match(released.get('index.html'),/index,follow,max-image-preview:large/);
 assert.match(released.get('404.html'),/noindex,follow/);assert.equal(ld(released.get('404.html')),undefined);
});
test('JSON-LD cannot break out of its non-executable script element',()=>{
 const malicious=structuredClone(d);malicious.artist.intro.en='Text </script><script>alert(1)</script>';malicious.artist.bio.en[0]=malicious.artist.intro.en;
 const html=generate(malicious,h).get('index.html'),json=ld(html);
 assert.ok(!json.includes('<'));assert.ok(JSON.parse(json)['@graph'][0].description.includes(malicious.artist.intro.en));assert.equal(JSON.parse(json)['@graph'][0].name,'A.X.L.');assert.doesNotMatch(html,/<script>alert/);
});
test('Poster selector refuses invalid ids before any request',async()=>{
 let requested=false;await assert.rejects(()=>fetchVideoPoster('../private',null,async()=>{requested=true;}),/Invalid/);assert.equal(requested,false);
});
test('Poster selector rejects 200 placeholder image and picks a real 16:9 fallback',async()=>{
 const requests=[],fakeSharp=b=>({metadata:async()=>JSON.parse(b)});
 const fetcher=async url=>{requests.push(url);return new Response(JSON.stringify(url.includes('maxresdefault')?{width:120,height:90}:{width:320,height:180}),{headers:{'content-type':'image/jpeg'}});};
 const selected=await fetchVideoPoster('yTs9CgrP-88',fakeSharp,fetcher);assert.equal(requests.length,2);assert.equal(selected.width,320);assert.ok(selected.url.endsWith('hq720.jpg'));
});
