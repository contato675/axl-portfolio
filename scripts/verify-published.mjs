/* Verify the reviewed GitHub preview, without modifying hosting or DNS. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {root} from './content.mjs';
const base='https://contato675.github.io/axl-portfolio/';
const source=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const get=rel=>fetch(base+rel+'?verify='+source,{signal:AbortSignal.timeout(25000),redirect:'error',cache:'no-store'});
const response=await get('preview-build.json');assert.equal(response.status,200);
const receipt=await response.json();assert.equal(receipt.repo,'contato675/axl-portfolio');assert.equal(receipt.source,source);assert.equal(receipt.mode,'noindex-preview');
const files=JSON.parse(await fs.readFile(path.join(root,'dist/.build-manifest.json'),'utf8'));
assert.deepEqual(Object.keys(receipt.hashes).sort(),[...files].sort());
const results=[],checks={};let cursor=0;
async function worker(){while(cursor<files.length){const rel=files[cursor++];if(!rel||rel.startsWith('/')||rel.includes('..')||rel.includes('\\'))throw new Error('Unsafe manifest path');const r=await get(rel),bytes=Buffer.from(await r.arrayBuffer());results.push({path:rel,status:r.status,hashMatch:r.status===200&&createHash('sha256').update(bytes).digest('hex')===receipt.hashes[rel]});}}
await Promise.all([worker(),worker(),worker(),worker()]);
for(const [locale,pre] of [['en',''],['pt-BR','pt-br/']]){
 const html=await(await get(pre)).text(),footer=html.match(/<footer[\s\S]*?<\/footer>/)?.[0]||'';
 checks[locale]={language:html.includes('lang="'+locale+'"'),noindex:html.includes('noindex,follow'),moreClipsOpen:html.includes('<details class="video-more" open>'),email:footer.includes('mailto:ruadoflow@gmail.com'),noSSSOMLink:!footer.includes('sssom.com'),noPlayerSubtitle:!html.includes('O player carrega')&&!html.includes('The player loads only'),rollingStone:html.includes('https://rollingstone.com.br/blog-cultura-de-rua/'),jsonLD:html.includes('type="application/ld+json"'),collective:html.includes(locale==='en'?'RUADOFLOW collective':'coletivo RUADOFLOW')};
}
const llms=await(await get('llms.txt')).text(),full=await(await get('llms-full.txt')).text(),robots=await(await get('robots.txt')).text(),sitemap=await(await get('sitemap.xml')).text();
checks.discovery={llms:llms.startsWith('# A.X.L.')&&llms.includes('index.md'),consolidatedEmail:full.includes('ruadoflow@gmail.com'),consolidatedSource:full.includes('https://rollingstone.com.br/'),searchBot:robots.includes('User-agent: OAI-SearchBot\nAllow:'),trainingBot:robots.includes('User-agent: GPTBot\nDisallow:'),sitemapPreviewEmpty:!sitemap.includes('<url>')};
const failures=results.filter(r=>!r.hashMatch).length+Object.values(checks).flatMap(Object.values).filter(v=>!v).length;
const report={date:new Date().toISOString(),source,url:base,files:files.length,failures,checks,results,robotsScope:'Subpath reference only; does not govern github.io host root'};
await fs.mkdir(path.join(root,'artifacts/editorial'),{recursive:true});await fs.writeFile(path.join(root,'artifacts/editorial/live.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,results:undefined}));if(failures)process.exitCode=1;
