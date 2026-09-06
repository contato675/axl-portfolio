/* Public GET-only verification; never writes production approval or touches DNS. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve4,resolve6} from 'node:dns/promises';
import {root,load} from './content.mjs';
const base='https://axl.sssom.com/',d=await load();
const source=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const mode=process.argv.includes('--release')?'release':'noindex-preview';
const get=rel=>fetch(base+rel+(rel.includes('?')?'&':'?')+'verify='+source,{signal:AbortSignal.timeout(25000),redirect:'error',cache:'no-store'});
const response=await get('deployment.json');assert.equal(response.status,200);
const receipt=await response.json();assert.equal(receipt.source,source);assert.equal(receipt.repo,'contato675/axl-portfolio');assert.equal(receipt.hostname,'axl.sssom.com');assert.equal(receipt.mode,mode);
const local=JSON.parse(await fs.readFile(path.join(root,'dist-cloudflare/deployment.json'),'utf8'));assert.deepEqual(receipt,local);
const entries=Object.entries(receipt.hashes),results=[];let cursor=0;
async function worker(){while(cursor<entries.length){const [file,hash]=entries[cursor++];assert.ok(file&&!file.includes('..')&&!file.startsWith('/')&&!file.includes('\\'));
 const notFound=file==='404.html',route=notFound?'_missing-page-for-deployment-verification/':file.endsWith('index.html')?file.slice(0,-10):file;
 try{const r=await get(route),bytes=Buffer.from(await r.arrayBuffer());results.push({file,route,status:r.status,ok:r.status===(notFound?404:200)&&createHash('sha256').update(bytes).digest('hex')===hash});}
 catch(e){results.push({file,route,ok:false,error:e.message});}
}}
await Promise.all([worker(),worker(),worker(),worker()]);
const checks={};
for(const [locale,pre] of [['en',''],['pt-BR','pt-br/']]){const r=await get(pre),html=await r.text();checks[locale]={status:r.status===200,language:html.includes('lang="'+locale+'"'),canonical:html.includes('rel="canonical" href="'+base+pre+'"'),indexing:html.includes('content="'+(mode==='release'?'index,follow,max-image-preview:large':'noindex,follow')+'"'),director:html.includes(d.artist.filmsIntro[locale]),email:html.includes('mailto:ruadoflow@gmail.com'),moreClips:html.includes('<details class="video-more" open>'),nosniff:r.headers.get('x-content-type-options')==='nosniff',https:r.url.startsWith(base)};}
const [robots,llms,full,sitemap]=await Promise.all(['robots.txt','llms.txt','llms-full.txt','sitemap.xml'].map(async rel=>{const r=await get(rel);assert.equal(r.status,200);return r.text();}));
checks.discovery={rootRobots:robots.includes('User-agent: GPTBot\nDisallow: /')&&robots.includes('User-agent: OAI-SearchBot\nAllow: /'),llms:llms.startsWith('# A.X.L.')&&llms.includes(base+'index.md'),text:full.includes(d.artist.filmsIntro.en)&&full.includes(d.artist.filmsIntro['pt-BR']),sitemapCount:(sitemap.match(/<url>/g)||[]).length===(mode==='release'?36:0),sitemapOrigin:!sitemap.includes('contato675.github.io')};
checks.privateFiles={};for(const rel of ['CNAME','.build-manifest.json','.assetsignore','_headers','docs/cloudflare-hosting.md','scripts/build.mjs','artifacts/cloudflare/approval.json']){const r=await get(rel);checks.privateFiles[rel]=r.status===404;}
const redirect=await fetch('http://axl.sssom.com/',{redirect:'manual',signal:AbortSignal.timeout(15000)});
const http={status:redirect.status,location:redirect.headers.get('location'),redirectsToHTTPS:[301,302,307,308].includes(redirect.status)&&redirect.headers.get('location')?.startsWith(base)};
const dns={ipv4:await resolve4('axl.sssom.com').catch(()=>[]),ipv6:await resolve6('axl.sssom.com').catch(()=>[])};
const failures=results.filter(r=>!r.ok).length+Object.values(checks).flatMap(Object.values).filter(v=>v!==true).length;
const report={date:new Date().toISOString(),source,base,mode,verifiedAssets:entries.length,receiptVerified:true,failures,checks,http,dns,results};
await fs.mkdir(path.join(root,'artifacts/cloudflare'),{recursive:true});await fs.writeFile(path.join(root,'artifacts/cloudflare/live-'+mode+'.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,results:undefined}));if(failures)process.exitCode=1;
