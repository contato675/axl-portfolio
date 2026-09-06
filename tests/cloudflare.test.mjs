import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {root} from '../scripts/content.mjs';
import {buildCloudflare,assertCloudflareConfig} from '../scripts/build-cloudflare.mjs';
const config=JSON.parse(await fs.readFile(path.join(root,'wrangler.jsonc'),'utf8'));
test('Cloudflare configuration targets only axl.sssom.com',()=>{assert.doesNotThrow(()=>assertCloudflareConfig(config));assert.throws(()=>assertCloudflareConfig({...config,routes:[{pattern:'sssom.com',custom_domain:true}]}));});
test('Cloudflare deploy has no runtime, secrets, bindings or workers.dev',()=>{for(const key of ['main','vars','kv_namespaces','r2_buckets','d1_databases','ai','secrets'])assert.equal(config[key],undefined);assert.equal(config.workers_dev,false);assert.throws(()=>assertCloudflareConfig({...config,main:'src/worker.js'}));});
test('Cloudflare routes use trailing slashes and genuine 404 responses',()=>{assert.equal(config.assets.html_handling,'force-trailing-slash');assert.equal(config.assets.not_found_handling,'404-page');});
test('Cloudflare build excludes private and GitHub-only metadata from public receipt',async()=>{
 const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'axl-cf-test-')),output=path.join(tmp,'site');
 try{const result=await buildCloudflare({output});assert.equal(result.publicFiles,143);assert.equal(result.receipt.mode,'noindex-preview');assert.equal(result.receipt.hostname,'axl.sssom.com');
  for(const file of ['CNAME','.nojekyll','.build-manifest.json','_headers','.assetsignore'])assert.equal(result.receipt.hashes[file],undefined);
  const ignore=await fs.readFile(path.join(output,'.assetsignore'),'utf8');assert.ok(ignore.includes('/.build-manifest.json'));assert.ok(ignore.includes('/CNAME'));
  assert.match(await fs.readFile(path.join(output,'index.html'),'utf8'),/noindex,follow/);
  assert.ok(Object.keys(result.receipt.hashes).every(f=>!f.startsWith('artifacts/')&&!f.startsWith('docs/')));
  await buildCloudflare({output});
 }finally{await fs.rm(tmp,{recursive:true,force:true});}
});
test('Cloudflare release still requires exact root publication approval',async()=>{await assert.rejects(()=>buildCloudflare({indexable:true}),/approval/);});
test('Cloudflare does not replace the functioning GitHub preview publisher',async()=>{const p=await fs.readFile(path.join(root,'scripts/publish-cloudflare.mjs'),'utf8');assert.doesNotMatch(p,/push.*pages-preview|repos\/.*\/pages|--force/);assert.match(p,/wrangler@4\.129\.0/);});
