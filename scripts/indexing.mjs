/* Static portfolio metadata only. Does not change DNS, access permissions or publish a site. */
import {escape,locales,prefix} from './content.mjs';
const absolute=(h,p='')=>h.origin+h.base+p;
const relative=(locale,r=null)=>prefix(locale)+(r?'releases/'+r.id+'/':'');
export function assertHosting(h) {
  const allowed=(h.origin==='https://contato675.github.io'&&h.base==='/axl-portfolio/')||(h.origin==='https://axl.sssom.com'&&h.base==='/');
  if(!allowed)throw new Error('Unsupported portfolio origin or base path');
}
export function assertIndexationApproval(h,approval) {
  assertHosting(h);
  if(h.origin!=='https://axl.sssom.com'||h.base!=='/')throw new Error('Indexation is reserved for the custom-domain root');
  if(approval?.origin!==h.origin)throw new Error('Indexation approval must name the exact origin');
  for(const key of ['editorialApproved','dnsVerified','httpsVerified','robotsRootVerified'])if(approval[key]!==true)throw new Error('Indexation approval missing: '+key);
}
export function robotsText(h,{indexable=false}={}) {
  assertHosting(h);
  const header='# Effective only at '+h.origin+'/robots.txt; a project-subpath copy is a deployment reference.\n# Crawling is not a licence to reuse music/artwork. Training and search controls are separate.\n';
  const preview=indexable?'':'# Preview: allow reading so HTML noindex can be observed; no sitemap is advertised.\n';
  return header+preview+`User-agent: GPTBot\nDisallow: ${h.base}\n\nUser-agent: OAI-SearchBot\nAllow: ${h.base}\n\nUser-agent: *\nAllow: ${h.base}\n`+(indexable?'\nSitemap: '+absolute(h,'sitemap.xml')+'\n':'');
}
export function sitemap(d,h,{indexable=false}={}) {
  assertHosting(h);
  const entries=[];
  if(indexable)for(const r of [null,...d.releases])for(const locale of locales){
    const alternates=[...locales,'x-default'].map(l=>`    <xhtml:link rel="alternate" hreflang="${l}" href="${escape(absolute(h,relative(l==='x-default'?'en':l,r)))}"/>`).join('\n');
    entries.push('  <url>\n    <loc>'+escape(absolute(h,relative(locale,r)))+'</loc>\n'+alternates+'\n  </url>');
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+entries.join('\n')+'\n</urlset>\n';
}
