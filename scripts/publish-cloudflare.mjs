/* Explicit deployment to one Cloudflare hostname; never changes GitHub Pages or main. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {root} from './content.mjs';
import {buildCloudflare} from './build-cloudflare.mjs';
if(!process.argv.includes('--confirm-domain'))throw new Error('Explicit domain deployment confirmation required');
const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
if(git('branch','--show-current')!=='feat/axl-portfolio'||git('status','--porcelain'))throw new Error('Expected clean reviewed feature branch');
const source=git('rev-parse','HEAD');
if(git('ls-remote','origin','refs/heads/feat/axl-portfolio').split(/\s/)[0]!==source)throw new Error('Publish the reviewed source to GitHub first');
const before=git('ls-remote','origin','refs/heads/main','refs/heads/pages-preview');
const indexable=process.argv.includes('--release');
if(!indexable){
 const response=await fetch('https://axl.sssom.com/deployment.json',{signal:AbortSignal.timeout(15000)});
 if(response.ok&&(await response.json()).mode==='release')throw new Error('Refusing to downgrade an indexed site to preview; use --release with publication approval');
}
const approval=indexable?JSON.parse(await fs.readFile(path.join(root,'artifacts/cloudflare/approval.json'),'utf8')):null;
await buildCloudflare({indexable,approval});
const windows=process.platform==='win32';
const args=windows?['/d','/s','/c','npx --yes wrangler@4.129.0 deploy --config wrangler.jsonc']:['--yes','wrangler@4.129.0','deploy','--config','wrangler.jsonc'];
const result=spawnSync(windows?'cmd.exe':'npx',args,{cwd:root,stdio:'inherit',env:{...process.env,WRANGLER_SEND_METRICS:'false'},timeout:240000});
if(result.error||result.status!==0)throw new Error('Cloudflare deployment not confirmed; inspect provider state before any retry');
if(git('ls-remote','origin','refs/heads/main','refs/heads/pages-preview')!==before)throw new Error('GitHub main or preview changed externally during deployment');
console.log('CLOUDFLARE_DEPLOYED',JSON.stringify({source,hostname:'axl.sssom.com',indexable,githubUnchanged:true}));
