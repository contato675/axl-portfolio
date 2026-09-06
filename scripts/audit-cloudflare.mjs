/* Test the public site in a fresh browser; do not follow provider-injected bot links. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,load} from './content.mjs';
import {browser,pause} from './audit/cdp.mjs';
const d=await load(),results=[];let c;
async function check(name,fn){try{const value=await fn();results.push({name,status:'PASS',value});console.log('PASS',name);}catch(e){results.push({name,status:'FAIL',error:e.message});console.log('FAIL',name,e.message);}}
try{
 c=await browser();await c.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const locale of ['en','pt-BR'])for(const width of [390,1440])await check('public HTTPS layout and content '+locale+' '+width,async()=>{
  await c.go('https://axl.sssom.com/'+(locale==='en'?'':'pt-br/'),width,900);
  const info=await c.evaluate(`({secure:isSecureContext,language:document.documentElement.lang,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),h1:document.querySelector('h1').textContent,records:document.querySelectorAll('[data-release]').length,videoButtons:document.querySelectorAll('.video-surface [data-video]:not([hidden])').length,subtitle:document.querySelector('#videos .section-heading .muted').textContent,email:document.querySelector('.contact-email').getAttribute('href'),portrait:document.querySelector('.portrait img').complete&&document.querySelector('.portrait img').naturalWidth>0,menuVisible:document.querySelector('[data-menu-open]').checkVisibility(),openMore:document.querySelector('.video-more').open})`);
  assert.ok(info.secure&&info.portrait&&info.openMore);assert.equal(info.language,locale);assert.equal(info.overflow,0);assert.equal(info.h1,'A.X.L.');assert.equal(info.records,17);assert.equal(info.videoButtons,15);assert.equal(info.subtitle,d.artist.filmsIntro[locale]);assert.equal(info.email,'mailto:ruadoflow@gmail.com');assert.equal(info.menuVisible,width<1024);
  await fs.mkdir(path.join(root,'artifacts/cloudflare'),{recursive:true});const shot=await c.call('Page.captureScreenshot',{format:'jpeg',quality:60,captureBeyondViewport:false});await fs.writeFile(path.join(root,'artifacts/cloudflare',locale+'-'+width+'.jpg'),Buffer.from(shot.data,'base64'));return info;
 });
 await check('public release dialog and Escape',async()=>{await c.evaluate("document.querySelector('[data-release]').click()");assert.equal(await c.evaluate("document.querySelector('#release-viewer').open"),true);await c.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(120);assert.equal(await c.evaluate("document.querySelector('#release-viewer').open"),false);});
 await check('public Portuguese mobile navigation',async()=>{await c.go('https://axl.sssom.com/pt-br/',390,844);await c.evaluate("document.querySelector('[data-menu-open]').click()");assert.equal(await c.evaluate("document.querySelector('#navigation').open"),true);assert.equal(await c.evaluate("document.querySelectorAll('#navigation .languages a').length"),2);await c.evaluate("document.querySelector('[data-menu-close]').click()");assert.equal(await c.evaluate("document.querySelector('#navigation').open"),false);});
 await check('public clip player and disclosure',async()=>{await c.evaluate("document.querySelector('.video-more [data-video]').click()");assert.equal(await c.evaluate("document.querySelectorAll('.video-more iframe.video-frame').length"),1);await c.evaluate("document.querySelector('.video-more summary').click()");await pause(120);assert.equal(await c.evaluate("document.querySelectorAll('.video-more iframe.video-frame').length"),0);});
 const report={date:new Date().toISOString(),browser:(await c.call('Browser.getVersion')).product,url:'https://axl.sssom.com/',results,failures:results.filter(x=>x.status==='FAIL').length,limits:['Desktop browser with viewport emulation, not physical-device certification','Cloudflare security additions remain active; no bot-trap links followed','Video embed configuration tested, not full playback']};
 await fs.writeFile(path.join(root,'artifacts/cloudflare/browser-live.json'),JSON.stringify(report,null,2));console.log('PUBLIC_BROWSER_AUDIT',results.length,report.failures);if(report.failures)process.exitCode=1;
}finally{await c?.close();}
