/* Assets-only Cloudflare build. No credentials, runtime code or automatic indexation. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {root} from './content.mjs';
import {build} from './build.mjs';
export const hostname='axl.sssom.com';
export function assertCloudflareConfig(config){
 assert.deepEqual(config,{
  name:'axl-portfolio',account_id:'1f18614781ebde72c3509947d904032e',compatibility_date:'2026-09-06',
  workers_dev:false,preview_urls:false,routes:[{pattern:hostname,custom_domain:true}],
  assets:{directory:'./dist-cloudflare',html_handling:'force-trailing-slash',not_found_handling:'404-page'},
  observability:{enabled:false}
 },'Cloudflare deployment must target only the approved assets-only portfolio');
}
export async function buildCloudflare({indexable=false,approval=null,output=path.join(root,'dist-cloudflare')}={}){
 assertCloudflareConfig(JSON.parse(await fs.readFile(path.join(root,'wrangler.jsonc'),'utf8')));
 const source=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const base=await build({domain:true,indexable,approval,output});
 const files=JSON.parse(await fs.readFile(path.join(output,'.build-manifest.json'),'utf8'));
 const ignored=['CNAME','.nojekyll','.build-manifest.json','.assetsignore','_headers'];
 const hashes={};
 for(const file of files.filter(f=>!ignored.includes(f)))hashes[file]=createHash('sha256').update(await fs.readFile(path.join(output,file))).digest('hex');
 const receipt={repo:'contato675/axl-portfolio',source,hostname,platform:'Cloudflare Workers Static Assets',mode:indexable?'release':'noindex-preview',files:Object.keys(hashes).length,hashes};
 const metadata={
  '.assetsignore':ignored.filter(f=>!['.assetsignore','_headers'].includes(f)).map(f=>'/'+f).join('\n')+'\n',
  '_headers':'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Strict-Transport-Security: max-age=86400\n\n/*.md\n  Content-Type: text/markdown; charset=utf-8\n',
  'deployment.json':JSON.stringify(receipt,null,2)+'\n'
 };
 for(const [file,content] of Object.entries(metadata))await fs.writeFile(path.join(output,file),content);
 await fs.writeFile(path.join(output,'.build-manifest.json'),JSON.stringify([...files,...Object.keys(metadata)])+'\n');
 return {...base,platform:receipt.platform,source,publicFiles:receipt.files+1,receipt};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const indexable=process.argv.includes('--release');
 const approval=indexable?JSON.parse(await fs.readFile(path.join(root,'artifacts/cloudflare/approval.json'),'utf8')):null;
 const r=await buildCloudflare({indexable,approval});console.log('CLOUDFLARE_BUILD_OK',JSON.stringify({...r,receipt:undefined}));
}
