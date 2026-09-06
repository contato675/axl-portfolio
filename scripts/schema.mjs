import {prefix} from './content.mjs';
import {route} from './render.mjs';
const url=(h,p='')=>h.origin+h.base+p;
const artists=value=>value.split(/ · |,\s*/).map(name=>({'@type':['RDF$$$','Câmara de Ecos'].includes(name)?'MusicGroup':'Person',name}));
export function structured(d,l,h){
 const person={'@type':'Person','@id':url(h,'#artist'),name:d.artist.name,alternateName:d.artist.fullName,description:d.artist.bio[l].join('\n\n'),url:url(h,prefix(l)),image:url(h,d.portrait.image.path),email:d.artist.email,nationality:{'@type':'Country',name:l==='en'?'Brazil':'Brasil'},memberOf:{'@type':'Organization',name:'RUADOFLOW',description:l==='en'?'Brazilian cultural collective':'Coletivo cultural brasileiro'},subjectOf:d.artist.sources.map(s=>({'@type':'CreativeWork',name:s.label,url:s.url}))};
 const records=d.releases.map(r=>{
  const album={'@type':'MusicAlbum','@id':url(h,route(l,r)),name:r.title,datePublished:String(r.year),albumReleaseType:'https://schema.org/'+(r.type==='ep'?'EPRelease':r.type==='single'?'SingleRelease':'AlbumRelease'),byArtist:artists(r.artists),image:url(h,r.cover.path),url:url(h,route(l,r))};
  if(['mixtape','compilation'].includes(r.type))album.albumProductionType='https://schema.org/'+(r.type==='mixtape'?'MixtapeAlbum':'CompilationAlbum');
  if(r.listen)album.sameAs=r.listen;
  if(r.tracks.length){album.numTracks=r.tracks.length;album.track=r.tracks.map(t=>({'@type':'MusicRecording',name:t.title,url:t.url,byArtist:artists(t.artists),duration:'PT'+Math.round(t.durationMs/1000)+'S'}));}
  return album;
 });
 return {'@context':'https://schema.org','@graph':[person,...records]};
}
