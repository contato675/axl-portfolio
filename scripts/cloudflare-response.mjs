/* Verification only: classify reviewed Cloudflare additions, never alter served content or security. */
import {createHash} from 'node:crypto';
const digest=value=>createHash('sha256').update(value).digest('hex');
const jsTemplateHash='6d6461bd4913a7ca818f91936d4eac138eba3a8fd68f90a74203f65c7f4b29cf';
const robotsPreambleHash='842b34303164ead41bccb7c05d1707422e98d108753b397b6dcc19683eb02101';
export function verifyOriginAsset(file,bytes,expectedHash){
 const rawHash=digest(bytes),transforms=[];
 if(rawHash===expectedHash)return {ok:true,rawMatch:true,originMatch:true,rawHash,transforms};
 let text=bytes.toString('utf8');
 if(file.endsWith('.html')){
  const trap=/<body>(<a href="https:\/\/axl\.sssom\.com\/cdn-cgi\/content\?id=[A-Za-z0-9_.~=-]{1,512}" aria-hidden="true" rel="nofollow noopener" style="display: none !important; visibility: hidden !important"><\/a>)/;
  if(trap.test(text)){text=text.replace(trap,'<body>');transforms.push('Cloudflare AI Labyrinth nofollow link');}
  const tail=/(<script>\(function\(\)\{function c\(\)[\s\S]{0,1800}?<\/script>)(?=<\/body><\/html>\s*$)/;
  const candidate=text.match(tail)?.[1];
  if(candidate){
   const normalized=candidate.replace(/r:'[a-f0-9]{16}',t:'[A-Za-z0-9+/=]{8,80}'/,"r:'<ray>',t:'<time>'");
   if(digest(normalized)===jsTemplateHash){text=text.replace(tail,'');transforms.push('Cloudflare JavaScript Detections bootstrap');}
  }
 }
 if(file==='robots.txt'){
  const marker='# END Cloudflare Managed Content\n\n',at=text.indexOf(marker);
  if(at>=0){const end=at+marker.length,prefix=text.slice(0,end);if(digest(prefix)===robotsPreambleHash){text=text.slice(end);transforms.push('Cloudflare managed robots preamble');}}
 }
 const originMatch=digest(text)===expectedHash;
 return {ok:originMatch,rawMatch:false,originMatch,rawHash,transforms};
}
