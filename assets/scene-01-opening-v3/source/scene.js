import * as THREE from './vendor/three.module.js';
// Deterministic 3D scene: all locations are latitude/longitude, not screen coordinates.
const timing=await (await fetch('./timing.json')).json();
const W=1920,H=1080,R=2;
const scene=new THREE.Scene();scene.background=new THREE.Color('#020713');
const camera=new THREE.PerspectiveCamera(39,W/H,.1,100);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.prepend(renderer.domElement);
const loader=new THREE.TextureLoader();
const [day,night]=await Promise.all(['earth-day.jpg','earth-night.png'].map(n=>loader.loadAsync('./textures/'+n)));
const earthMaterial=new THREE.ShaderMaterial({uniforms:{day:{value:day},night:{value:night}},vertexShader:`varying vec2 vUv;varying vec3 n;void main(){vUv=uv;n=normalize(normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D day;uniform sampler2D night;varying vec2 vUv;varying vec3 n;void main(){vec3 d=texture2D(day,vUv).rgb;vec3 l=texture2D(night,vUv).rgb;float light=.35+.3*max(dot(n,normalize(vec3(-.3,1.,.8))),0.);vec3 c=d*vec3(.30,.48,.72)*light + l*vec3(1.15,.78,.36)*.95;gl_FragColor=vec4(c,1.);}`});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(R,160,96),earthMaterial));
scene.add(new THREE.Mesh(new THREE.SphereGeometry(R*1.018,128,80),new THREE.ShaderMaterial({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,vertexShader:`varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 n;varying vec3 v;void main(){float f=pow(1.-max(dot(n,v),0.),3.5);gl_FragColor=vec4(.03,.36,1.,f*.45);}`})));
function geo(lat,lon,r=R){const a=THREE.MathUtils.degToRad(lat),b=THREE.MathUtils.degToRad(lon);return new THREE.Vector3(Math.cos(a)*Math.cos(b),Math.sin(a),-Math.cos(a)*Math.sin(b)).multiplyScalar(r);}
// Geography remains right-handed and identical across locales; only DOM text changes.
const lang=new URLSearchParams(location.search).get('lang')==='ar'?'ar':'en';
const ease=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*x*(x*(x*6-15)+10);};
const locations=timing.locations;
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#f1fbff');g.addColorStop(.08,'#d1f5ff');g.addColorStop(.25,'#3fbfff80');g.addColorStop(1,'#0077ff00');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
const glow=glowTexture(),layer=document.getElementById('labels');
function label(text,region=false){const el=document.createElement('div');el.className=`label ${lang} ${region?'region':''}`;el.textContent=text;el.dir=lang==='ar'?'rtl':'ltr';layer.append(el);const line=document.createElement('div');line.className='connector';layer.prepend(line);return {el,line};}
const pins=locations.map(loc=>{const group=new THREE.Group(),normal=geo(loc.lat,loc.lon,1);group.position.copy(geo(loc.lat,loc.lon,R+.006));group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
const color=loc.id==='hq'?'#71cfff':'#ffda91';
const ring=new THREE.Mesh(new THREE.TorusGeometry(.038,.0022,8,72),new THREE.MeshBasicMaterial({color}));group.add(ring);
const disk=new THREE.Mesh(new THREE.CircleGeometry(.029,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.15,depthWrite:false}));group.add(disk);
const stem=new THREE.Mesh(new THREE.CylinderGeometry(.002,.003,.105,12),new THREE.MeshBasicMaterial({color}));stem.rotation.x=Math.PI/2;stem.position.z=.052;group.add(stem);
const head=new THREE.Mesh(new THREE.SphereGeometry(.015,24,16),new THREE.MeshBasicMaterial({color:'#effbff'}));head.position.z=.11;group.add(head);
const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));halo.position.z=.11;halo.scale.set(.14,.14,1);group.add(halo);scene.add(group);
return {loc,group,normal,...label(loc[lang==='ar'?'labelAR':'labelEN'])};});
const origin=geo(locations[0].lat,locations[0].lon,1);
const arcs=locations.slice(1).map(loc=>{const dest=geo(loc.lat,loc.lon,1),angle=origin.angleTo(dest),points=[];for(let i=0;i<=160;i++){const u=i/160;const p=origin.clone().multiplyScalar(Math.sin((1-u)*angle)/Math.sin(angle)).add(dest.clone().multiplyScalar(Math.sin(u*angle)/Math.sin(angle)));points.push(p.multiplyScalar(R+.012+.38*Math.sin(Math.PI*u)));}const curve=new THREE.CatmullRomCurve3(points);const tubes=[.003,.009].map((r,k)=>{const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,200,r,8,false),new THREE.MeshBasicMaterial({color:k?'#2b9fff':'#b9eeff',transparent:true,opacity:k?.13:.95,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(mesh);return mesh;});const head=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,blending:THREE.AdditiveBlending,depthWrite:false}));head.scale.set(.12,.12,1);scene.add(head);return {loc,curve,tubes,head};});
const regional=label(timing.regionalTitle[lang],true);
function project(p){const v=p.clone().project(camera);return {x:(v.x*.5+.5)*W,y:(-.5*v.y+.5)*H,z:v.z};}
function place(obj,anchor,x,y,opacity){obj.el.style.left=x+'px';obj.el.style.top=y+'px';obj.el.style.opacity=opacity;obj.line.style.left=anchor.x+'px';obj.line.style.top=anchor.y+'px';const dx=x-anchor.x,dy=y-anchor.y;obj.line.style.width=Math.hypot(dx,dy)+'px';obj.line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;obj.line.style.opacity=opacity*.65;}
function cameraAt(t){const keys=timing.camera;let i=keys.findIndex((k,j)=>j<keys.length-1&&t>=k.t&&t<=keys[j+1].t);if(i<0)i=keys.length-2;const a=keys[i],b=keys[i+1],u=ease((t-a.t)/(b.t-a.t));const value=k=>THREE.MathUtils.lerp(a[k],b[k],u);camera.position.copy(geo(value('lat'),value('lon'),value('radius')));camera.lookAt(geo(value('lookLat'),value('lookLon'),value('lookRadius')));camera.updateMatrixWorld();}
window.seekFrame=frame=>{const t=frame/30;cameraAt(t);const projected=[];
pins.forEach((pin,i)=>{const alpha=ease((t-pin.loc.start)/.65);pin.group.visible=alpha>0;pin.group.scale.setScalar(.7+.3*alpha);const p=project(geo(pin.loc.lat,pin.loc.lon,R+.12));projected.push(p);const offset=i===1?-35:i===2?65:0;place(pin,p,Math.max(160,Math.min(W-180,p.x+offset)),Math.max(100,p.y-62),alpha);});
arcs.forEach(({loc,curve,tubes,head})=>{const u=ease((t-loc.routeStart)/(loc.routeEnd-loc.routeStart));tubes.forEach(m=>m.geometry.setDrawRange(0,Math.floor(200*u)*8*6));head.visible=u>0&&u<1;head.position.copy(curve.getPoint(u));});
const a=projected[1],b=projected[2];place(regional,{x:(a.x+b.x)/2,y:Math.min(a.y,b.y)-90},(a.x+b.x)/2,Math.max(125,Math.min(a.y,b.y)-192),ease((t-timing.regionalTitle.start)/.8));regional.line.style.opacity=0;
renderer.render(scene,camera);
window.frameState={frame,t,lang,camera:camera.position.toArray(),target:geo(timing.camera.at(-1).lookLat,timing.camera.at(-1).lookLon,timing.camera.at(-1).lookRadius).toArray(),labels:[...pins,regional].map(p=>{const r=p.el.getBoundingClientRect();return {text:p.el.textContent,opacity:Number(p.el.style.opacity),x:r.x,y:r.y,w:r.width,h:r.height};})};};
window.seekFrame(0);window.sceneReady=true;
if(!location.search.includes('render')){const start=performance.now();const play=now=>{window.seekFrame((now-start)/1000%20*30);requestAnimationFrame(play);};requestAnimationFrame(play);}
