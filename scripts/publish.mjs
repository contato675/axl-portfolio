/* Publish only the generated, noindex preview. Source main is never merged. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {root} from './content.mjs';
import {build} from './build.mjs';
const repo='contato675/axl-portfolio',remote='https://github.com/'+repo+'.git';
const git=(cwd,...args)=>execFileSync('git',['-C',cwd,...args],{encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
if(!process.argv.includes('--confirm-preview'))throw new Error('Explicit preview confirmation required');
if(git(root,'branch','--show-current')!=='feat/axl-portfolio'||git(root,'status','--porcelain'))throw new Error('Expected clean reviewed feature branch');
const source=git(root,'rev-parse','HEAD'),main=git(root,'ls-remote','origin','refs/heads/main').split(/\s/)[0];
if(git(root,'ls-remote','origin','refs/heads/feat/axl-portfolio').split(/\s/)[0]!==source)throw new Error('Push reviewed source first');
await build();const temp=await fs.mkdtemp(path.join(os.tmpdir(),'axl-preview-'));let commit;
try{
 const existing=git(root,'ls-remote','origin','refs/heads/pages-preview');
 if(existing){git(root,'clone','--single-branch','--branch','pages-preview','--depth','1',remote,temp);const receipt=JSON.parse(await fs.readFile(path.join(temp,'preview-build.json'),'utf8'));if(receipt.repo!==repo)throw new Error('Unowned deployment branch');for(const n of await fs.readdir(temp))if(n!=='.git')await fs.rm(path.join(temp,n),{recursive:true,force:true});}
 else{git(temp,'init','--initial-branch=pages-preview');git(temp,'remote','add','origin',remote);}
 git(temp,'config','user.name','contato675');git(temp,'config','user.email','249978315+contato675@users.noreply.github.com');
 const list=JSON.parse(await fs.readFile(path.join(root,'dist/.build-manifest.json'),'utf8')),hashes={};
 for(const rel of list){if(rel.includes('..')||rel.includes('\\')||path.isAbsolute(rel)||/^(artifacts|docs|scripts|tests)\//.test(rel))throw new Error('Unsafe output');const bytes=await fs.readFile(path.join(root,'dist',rel));if(rel.endsWith('.html')&&!bytes.toString().includes('noindex,follow'))throw new Error('Preview noindex missing');const dest=path.join(temp,rel);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);hashes[rel]=createHash('sha256').update(bytes).digest('hex');}
 await fs.writeFile(path.join(temp,'preview-build.json'),JSON.stringify({repo,source,mode:'noindex-preview',files:list.length,hashes},null,2));git(temp,'add','--all');git(temp,'commit','-m','deploy: A.X.L. preview at '+source.slice(0,8));commit=git(temp,'rev-parse','HEAD');git(temp,'push','origin','HEAD:pages-preview');if(git(root,'ls-remote','origin','refs/heads/main').split(/\s/)[0]!==main)throw new Error('Main changed externally');console.log(JSON.stringify({source,deploy:commit,files:list.length,mainUnchanged:true}));
}finally{await fs.rm(temp,{recursive:true,force:true,maxRetries:3});}
