import test from 'node:test';
import assert from 'node:assert/strict';
import {load,hosting,validate} from '../scripts/content.mjs';
import {generate} from '../scripts/build.mjs';
const d=await load(),out=generate(d,hosting(false));
const text={en:'Beyond songwriting, A.X.L. also directs music videos.','pt-BR':'Além da composição, A.X.L. também assina a direção de videoclipes.'};
for(const locale of ['en','pt-BR']){
 const pre=locale==='en'?'':'pt-br/',html=out.get(pre+'index.html'),statement=text[locale];
 test('Director subtitle appears under featured films '+locale,()=>{
  assert.equal(d.artist.filmsIntro[locale],statement);
  const heading=html.match(/<section id="videos"><div class="section-heading">([\s\S]*?)<\/div>/)?.[1];
  assert.ok(heading.includes('<p class="muted">'+statement+'</p>'));
  assert.doesNotMatch(html,/O player carrega|The player loads only/);
 });
 test('Director statement also appears in text and AI-readable representations '+locale,()=>{
  assert.ok(out.get(pre+'index.md').includes(statement));assert.ok(out.get('llms-full.txt').includes(statement));
  const data=JSON.parse(out.get(pre+'portfolio.json'));
  assert.ok(data['@graph'][0].description.includes(statement));
  if(locale==='en')assert.ok(out.get('llms.txt').includes(statement));
 });
 test('General directing role does not invent individual directing credits '+locale,()=>{
  const graph=JSON.parse(out.get(pre+'portfolio.json'))['@graph'];
  assert.equal(graph.length,18);assert.ok(graph.every(item=>!('director' in item)));assert.ok(d.videos.every(v=>!('director' in v)));
 });
}
test('Director subtitle requires both localized values',()=>{for(const locale of ['en','pt-BR']){const data=structuredClone(d);delete data.artist.filmsIntro[locale];assert.throws(()=>validate(data),/localized film introduction/);}});
test('Director subtitle escapes HTML without changing the text model',()=>{const data=structuredClone(d);data.artist.filmsIntro.en='<img src=x onerror=alert(1)>';const html=generate(data,hosting(false)).get('index.html');assert.doesNotMatch(html,/<img src=x/);assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));});
