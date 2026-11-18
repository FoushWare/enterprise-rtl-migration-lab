const lang=new URLSearchParams(location.search).get('lang')==='ar'?'ar':'en';
const config=await (await fetch('/source/presenter.json')).json();
const copy=(await (await fetch('/layers/graphics.json')).json())[lang];
const $=id=>document.getElementById(id);document.body.className=lang;
for(const key of ['task','headline','apps','experience','question'])$(key).textContent=copy[key];
$('placeholderText').append(document.createTextNode(copy.placeholder));const small=document.createElement('small');small.textContent=copy.replace;$('placeholderText').append(small);
for(const id of ['presenter','presenterVideo'])Object.assign($(id).style,Object.fromEntries(Object.entries(config.box).map(([k,v])=>[k,v+'px'])));
const presenterVideo=$('presenterVideo');if(config.mode==='video'){presenterVideo.src='/layers/presenter-replacement.mp4';$('placeholderText').style.display='none';await new Promise((res,rej)=>{presenterVideo.onloadeddata=res;presenterVideo.onerror=()=>rej(Error('Presenter replacement video unavailable'));});}
const base=$('base');base.src=`/media/base-${lang.toUpperCase()}.mp4`;await new Promise((resolve,reject)=>{base.onloadeddata=resolve;base.onerror=()=>reject(Error('Real base video could not load'));});await document.fonts.ready;
const ease=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
const fade=(t,a,b,d=.3)=>ease((t-a)/d)*ease((b-t)/d);
function visible(el){let opacity=1;for(let e=el;e&&e!==document.body;e=e.parentElement){const s=getComputedStyle(e);if(s.display==='none')return false;opacity*=Number(s.opacity);}return opacity>.05;}
async function seek(video,t){if(Math.abs(video.currentTime-t)<.00001&&video.readyState>=2)return;await new Promise((resolve,reject)=>{video.addEventListener('seeked',resolve,{once:true});video.addEventListener('error',reject,{once:true});video.currentTime=t;});}
window.seekFrame=async frame=>{const t=frame/30;await seek(base,Math.min(49.98,t));const p=fade(t,17,29,.4),q=fade(t,44,50,.5);$('shade').style.opacity=Math.max(p*.92,q*.84);base.style.filter=`blur(${Math.max(p*7,q*3)}px)`;
const invoicing=fade(t,8.15,12.3,.25),procurement=fade(t,12.65,16.8,.25);const product=Math.max(invoicing,procurement);const zoomSwitch=fade(t,29.15,35,.9)*.16;const gentle=t>=8&&t<17?.012*ease((t-(t<12.5?8:12.5))/4.5):0;base.style.transformOrigin=zoomSwitch?'450px 45px':'center';base.style.transform=`scale(${1+zoomSwitch+gentle+p*.018})`;
$('presenter').style.opacity=config.mode==='silhouette'?p:0;$('presenterVideo').style.opacity=config.mode==='video'?p:0;if(config.mode==='video'&&p>0)await seek(presenterVideo,Math.max(0,t-17));$('placeholderText').style.opacity=p;
$('request').style.opacity=p;$('request').style.transform=`translateY(${(1-p)*18}px)`;for(const [id,start] of [['task',17.5],['headline',22.6],['apps',23.3],['experience',24]])$(id).style.opacity=fade(t,start,28.7,.32);
const selector=t>=29&&t<38;let alpha=product;if(selector)alpha=t<31?fade(t,29.15,30.8,.2):fade(t,32,37.7,.3);
$('product').textContent=selector?(t<31?'ENGLISH — LTR':'ARABIC — RTL'):(t<12.5?'INVOICING':'PROCUREMENT');
$('product').style.background=selector?'#086783':t<12.5?'#1263ff':'#7c2fe9';$('product').style.boxShadow=`0 0 28px ${selector?'#0ad1ff55':t<12.5?'#1263ff66':'#8a36f466'}`;$('product').style.left=selector?'auto':'355px';$('product').style.right=selector?'95px':'auto';$('product').style.top=selector?'98px':'150px';$('product').style.opacity=alpha;$('product').style.transform=`scale(${.94+.06*alpha})`;
$('spotlight').style.opacity=product*.23;$('focus').style.opacity=fade(t,29.1,33.8,.45)*.8;$('question').style.opacity=q;$('question').style.transform=`scale(${.97+.03*q})`;
$('next').style.opacity=0;let pulse=0;for(const cut of [12.5,29,38,40,42])pulse=Math.max(pulse,Math.max(0,1-Math.abs(t-cut)/.1)*.07);$('flash').style.opacity=pulse;
window.frameState={frame,t,lang,presenterAlpha:p,visibleText:[...document.querySelectorAll('#product,#task,#headline,#apps,#experience,#placeholderText,#question')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return {id:e.id,text:e.textContent,x:r.x,y:r.y,w:r.width,h:r.height};})};};
await window.seekFrame(0);window.sceneReady=true;
