import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {root,load,hosting} from './content.mjs';
import {build,generate} from './build.mjs';
import {startServer} from './serve.mjs';
import {browser,pause} from './audit/cdp.mjs';
const dir=path.join(root,'artifacts/editorial');await fs.mkdir(dir,{recursive:true});
const d=await load(),results=[];let c,s;
async function check(name,run){try{results.push({name,status:'PASS',value:await run()});console.log('PASS',name);}catch(e){results.push({name,status:'FAIL',error:e.message});console.log('FAIL',name,e.message);}}
async function capture(name){const shot=await c.call('Page.captureScreenshot',{format:'jpeg',quality:68,captureBeyondViewport:false});await fs.writeFile(path.join(dir,name+'.jpg'),Buffer.from(shot.data,'base64'));}
async function loadPosters(){await c.evaluate(`(async()=>{for(const image of document.querySelectorAll('.video-surface img')){image.scrollIntoView({behavior:'instant'});await image.decode();}})()`);}
try{
 await build();s=await startServer(path.join(root,'dist'));c=await browser();
 for(const locale of ['en','pt-BR'])for(const width of [320,390,768,1440])await check('full-frame posters and editorial layout '+locale+' '+width,async()=>{
  await c.go(s.url+(locale==='en'?'':'pt-br/'),width,900);await loadPosters();
  const value=await c.evaluate(`(()=>{const posters=[...document.querySelectorAll('.video-surface img')].map(im=>{const p=im.parentElement.getBoundingClientRect(),b=im.getBoundingClientRect();return {width:p.width,height:p.height,gap:Math.max(Math.abs(p.left-b.left),Math.abs(p.right-b.right),Math.abs(p.top-b.top),Math.abs(p.bottom-b.bottom)),fit:getComputedStyle(im).objectFit,background:getComputedStyle(im.parentElement).backgroundColor,naturalRatio:im.naturalWidth/im.naturalHeight,loaded:im.complete&&im.naturalWidth>0};});return {posters,open:document.querySelector('.video-more').open,iframe:document.querySelectorAll('iframe').length,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),email:document.querySelector('.contact-email').getAttribute('href'),footerHasSSSOM:document.querySelector('footer').innerText.includes('SSSOM'),badge:document.querySelector('.hero .eyebrow').textContent,subtitle:!!document.querySelector('#videos>.section-heading>.muted'),json:JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)};})()`);
  assert.equal(value.posters.length,15);assert.equal(value.open,true);assert.equal(value.iframe,0);assert.equal(value.overflow,0);assert.equal(value.email,'mailto:ruadoflow@gmail.com');assert.equal(value.footerHasSSSOM,false);assert.doesNotMatch(value.badge,/RUADOFLOW/);assert.equal(value.subtitle,false);
  for(const p of value.posters){assert.ok(p.loaded);assert.ok(p.gap<1);assert.ok(Math.abs(p.width/p.height-16/9)<.01);assert.ok(Math.abs(p.naturalRatio-16/9)<.02);assert.equal(p.fit,'cover');assert.equal(p.background,'rgb(0, 0, 0)');}
  assert.equal(value.json['@graph'][0].email,'ruadoflow@gmail.com');
  await c.evaluate('document.querySelector("#videos").scrollIntoView({behavior:"instant"})');if([390,1440].includes(width))await capture('videos-'+locale+'-'+width);
  return {...value,json:undefined};
 });
 for(const locale of ['en','pt-BR']){
  const url=s.url+(locale==='en'?'':'pt-br/');
  await check('all players keep full-frame geometry '+locale,async()=>{
   await c.go(url,locale==='en'?1440:390,900);await loadPosters();
   for(const v of d.videos){const metrics=await c.evaluate(`(()=>{const button=document.querySelector('[data-video="${v.id}"]'),surface=button.parentElement,before=surface.getBoundingClientRect();button.click();const frame=surface.querySelector('iframe'),after=frame.getBoundingClientRect();return {delta:Math.max(Math.abs(before.width-after.width),Math.abs(before.height-after.height)),url:frame.src,title:frame.title,border:getComputedStyle(frame).borderWidth,policy:frame.referrerPolicy};})()`);assert.ok(metrics.delta<1,v.id);assert.equal(metrics.url,'https://www.youtube-nocookie.com/embed/'+v.id);assert.equal(metrics.border,'0px');assert.equal(metrics.policy,'strict-origin-when-cross-origin');}
   assert.equal(await c.evaluate('document.querySelectorAll("iframe").length'),15);
  });
  await check('collapse stops hidden videos and reopening permits replay '+locale,async()=>{
   await c.evaluate('document.querySelector(".video-more>summary").click()');await pause(100);
   assert.equal(await c.evaluate('document.querySelector(".video-more").open'),false);
   assert.equal(await c.evaluate('document.querySelectorAll(".video-more iframe").length'),0);
   assert.equal(await c.evaluate('document.querySelectorAll("iframe").length'),6);
   await c.evaluate('document.querySelector(".video-more>summary").click()');await pause(60);
   assert.equal(await c.evaluate('document.querySelectorAll(".video-more [data-video]").length'),9);
   await c.evaluate('document.querySelector(".video-more [data-video]").click()');assert.equal(await c.evaluate('document.querySelectorAll(".video-more iframe").length'),1);
  });
  await check('native disclosure expanded and closable without JS '+locale,async()=>{
   await c.call('Emulation.setScriptExecutionDisabled',{value:true});try{await c.go(url,390,844);assert.equal(await c.evaluate('document.querySelector(".video-more").open'),true);assert.equal(await c.evaluate('document.querySelectorAll("iframe").length'),0);await c.evaluate('document.querySelector(".video-more>summary").click()');assert.equal(await c.evaluate('document.querySelector(".video-more").open'),false);}finally{await c.call('Emulation.setScriptExecutionDisabled',{value:false});}
  });
 }
 await check('approved-root sitemap parses as XML and pairs all 36 routes',async()=>{
  const approval={origin:'https://axl.sssom.com',editorialApproved:true,dnsVerified:true,httpsVerified:true,robotsRootVerified:true};
  const output=generate(d,hosting(true),{indexable:true,approval}),xml=output.get('sitemap.xml');
  const metrics=await c.evaluate(`(()=>{const doc=new DOMParser().parseFromString(${JSON.stringify(xml)},'application/xml');return {errors:doc.querySelectorAll('parsererror').length,urls:doc.getElementsByTagName('url').length,alternates:doc.getElementsByTagNameNS('http://www.w3.org/1999/xhtml','link').length};})()`);
  assert.deepEqual(metrics,{errors:0,urls:36,alternates:108});return {...metrics,scope:'local generation with test approval, not live indexation'};
 });
 const hashes={};for(const file of ['scripts/render.mjs','scripts/build.mjs','scripts/indexing.mjs','scripts/discovery.mjs','scripts/schema.mjs','scripts/audit-editorial.mjs','site/assets/css/style.css','site/assets/js/app.js','site/content/artist.json','site/content/videos.json'])hashes[file]=createHash('sha256').update(await fs.readFile(path.join(root,file),'utf8').then(s=>s.replace(/\r\n?/g,'\n'))).digest('hex');
 const report={date:new Date().toISOString(),browser:(await c.call('Browser.getVersion')).product,results,failures:results.filter(r=>r.status==='FAIL').length,hashes,limits:['Viewport emulation, not physical iOS/Android testing','Native cinematic letterboxing inside the video is preserved','Only poster/frame configuration tested, not every third-party playback region','Indexable sitemap tested locally with a fixture approval; no public sign-off inferred']};
 await fs.writeFile(path.join(dir,'report.json'),JSON.stringify(report,null,2));console.log('EDITORIAL_AUDIT',results.length,report.failures);if(report.failures)process.exitCode=1;
}finally{await c?.close();if(s){s.server.closeAllConnections();await new Promise(r=>s.server.close(r));}}
