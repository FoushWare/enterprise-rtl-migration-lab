// Real prerecorded video is the full-frame base. Presenter and copy remain separate layers.
const lang=new URLSearchParams(location.search).get('lang')==='ar'?'ar':'en';
const config=await (await fetch('/source/presenter.json')).json();
const copy=(await (await fetch('/layers/graphics.json')).json())[lang];
const $=id=>document.getElementById(id);document.body.className=lang;
for(const key of ['task','headline','apps','experience','question'])$(key).textContent=copy[key];
$('placeholderText').append(document.createTextNode(copy.placeholder));const small=document.createElement('small');small.textContent=copy.replace;$('placeholderText').append(small);
$('next').append(document.createTextNode(copy.next));const strong=document.createElement('strong');strong.textContent=copy.title;$('next').append(strong);
for(const id of ['presenter','presenterVideo'])Object.assign($(id).style,Object.fromEntries(Object.entries(config.box).map(([k,v])=>[k,v+'px'])));
const presenterVideo=$('presenterVideo');if(config.mode==='video'){presenterVideo.src='/layers/presenter-replacement.mp4';$('placeholderText').style.display='none';}
const base=$('base');base.src=`/media/base-${lang.toUpperCase()}.mp4`;
await new Promise((resolve,reject)=>{base.onloadeddata=resolve;base.onerror=()=>reject(Error('Real base video could not load'));});
await document.fonts.ready;
const ease=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
const fade=(t,a,b,d=.3)=>ease((t-a)/d)*ease((b-t)/d);
function visible(el){let opacity=1;for(let e=el;e&&e!==document.body;e=e.parentElement){const style=getComputedStyle(e);if(style.display==='none')return false;opacity*=Number(style.opacity);}return opacity>.05;}
async function seek(video,t){if(Math.abs(video.currentTime-t)<.00001&&video.readyState>=2)return;await new Promise((resolve,reject)=>{video.addEventListener('seeked',resolve,{once:true});video.addEventListener('error',reject,{once:true});video.currentTime=t;});}
window.seekFrame=async frame=>{const t=20+frame/30;await seek(base,Math.min(29.98,frame/30));const p=fade(t,26,32,.35);const q=fade(t,46,48,.22),n=fade(t,48,50,.22);$('shade').style.opacity=Math.max(p*.94,q*.87,n*.90);base.style.filter=`blur(${p*7}px)`;base.style.transform=`scale(${1+p*.025})`;
$('presenter').style.opacity=config.mode==='silhouette'?p:0;$('presenterVideo').style.opacity=config.mode==='video'?p:0;if(config.mode==='video'&&p>0)await seek(presenterVideo,Math.max(0,t-26));$('placeholderText').style.opacity=p;
$('request').style.opacity=p;$('request').style.transform=`translateY(${(1-p)*18}px)`;for(const [id,start] of [['task',26.25],['headline',27],['apps',27.8],['experience',28.6]])$(id).style.opacity=fade(t,start,31.9,.3);
const prod=t<23?copy.invoicing:copy.procurement;$('product').textContent=prod;$('product').style.opacity=t<23?fade(t,20.15,22.8):fade(t,23.15,25.8);
$('question').style.opacity=q;$('question').style.transform=`scale(${.98+.02*q})`;$('next').style.opacity=n;$('next').style.transform=`translateY(${(1-n)*16}px)`;
let pulse=0;for(const cut of [23,32,38,40,42,44])pulse=Math.max(pulse,Math.max(0,1-Math.abs(t-cut)/.10)*.09);$('flash').style.opacity=pulse;
window.frameState={frame,sceneTime:t,lang,presenterAlpha:p,visibleText:[...document.querySelectorAll('#product,#task,#headline,#apps,#experience,#placeholderText,#question,#next')].filter(e=>visible(e)&&e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return {id:e.id,text:e.textContent,x:r.x,y:r.y,w:r.width,h:r.height};})};};
await window.seekFrame(0);window.sceneReady=true;
