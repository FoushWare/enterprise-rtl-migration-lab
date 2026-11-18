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
const earthMaterial=new THREE.ShaderMaterial({uniforms:{day:{value:day},night:{value:night}},vertexShader:`varying vec2 vUv;varying vec3 n;void main(){vUv=uv;n=normalize(normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D day;uniform sampler2D night;varying vec2 vUv;varying vec3 n;void main(){vec3 d=texture2D(day,vUv).rgb;vec3 l=texture2D(night,vUv).rgb;float light=.35+.3*max(dot(n,normalize(vec3(-.3,1.,.8))),0.);vec3 c=d*vec3(.18,.32,.52)*light + l*vec3(1.15,.78,.36)*1.55;gl_FragColor=vec4(c,1.);}`});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(R,160,96),earthMaterial));
scene.add(new THREE.Mesh(new THREE.SphereGeometry(R*1.018,128,80),new THREE.ShaderMaterial({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,vertexShader:`varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 n;varying vec3 v;void main(){float f=pow(1.-max(dot(n,v),0.),3.5);gl_FragColor=vec4(.03,.36,1.,f*.8);}`})));
function geo(lat,lon,r=R){const a=THREE.MathUtils.degToRad(lat),b=THREE.MathUtils.degToRad(lon);return new THREE.Vector3(Math.cos(a)*Math.cos(b),Math.sin(a),-Math.cos(a)*Math.sin(b)).multiplyScalar(r);}
// Fictional headquarters anchored in central Europe; destination coordinates are city centers.
const locations=[{id:'hq',lat:50.11,lon:8.68,start:3.0},{id:'cairo',lat:30.0444,lon:31.2357,start:6.0},{id:'riyadh',lat:24.7136,lon:46.6753,start:7.1},{id:'dubai',lat:25.2048,lon:55.2708,start:8.2}];
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.1,'#b8eeff');g.addColorStop(.25,'#209dffb0');g.addColorStop(1,'#0077ff00');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
locations.forEach((loc,i)=>loc.start=timing.pin_starts[i]);
const glow=glowTexture();
const pins=locations.map(loc=>{const group=new THREE.Group(),p=geo(loc.lat,loc.lon,R+.008),normal=p.clone().normalize();group.position.copy(p);group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
const ring=new THREE.Mesh(new THREE.TorusGeometry(.045,.0025,8,64),new THREE.MeshBasicMaterial({color:'#69d9ff',transparent:true}));group.add(ring);
const stem=new THREE.Mesh(new THREE.CylinderGeometry(.0025,.0025,.1,8),new THREE.MeshBasicMaterial({color:'#76d8ff'}));stem.rotation.x=Math.PI/2;stem.position.z=.05;group.add(stem);
const dot=new THREE.Mesh(new THREE.SphereGeometry(.014,16,12),new THREE.MeshBasicMaterial({color:'#e4faff'}));dot.position.z=.11;group.add(dot);
const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,blending:THREE.AdditiveBlending,depthWrite:false}));sprite.position.z=.11;sprite.scale.set(.23,.23,1);group.add(sprite);scene.add(group);return {loc,group,ring};});
const origin=geo(locations[0].lat,locations[0].lon,1);
const arcs=locations.slice(1).map(loc=>{const dest=geo(loc.lat,loc.lon,1),angle=origin.angleTo(dest);const points=[];for(let i=0;i<=120;i++){const u=i/120;const v=origin.clone().multiplyScalar(Math.sin((1-u)*angle)/Math.sin(angle)).add(dest.clone().multiplyScalar(Math.sin(u*angle)/Math.sin(angle)));points.push(v.multiplyScalar(R+.015+.27*Math.sin(Math.PI*u)));}const curve=new THREE.CatmullRomCurve3(points);const group=new THREE.Group();const tubes=[.004,.012].map((r,k)=>{const g=new THREE.TubeGeometry(curve,160,r,8,false);const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:k?'#167fff':'#9ee9ff',transparent:true,opacity:k?.15:.95,blending:THREE.AdditiveBlending,depthWrite:false}));group.add(mesh);return mesh;});const head=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,blending:THREE.AdditiveBlending,depthWrite:false}));head.scale.set(.11,.11,1);group.add(head);scene.add(group);return {loc,curve,tubes,head};});
// Sparse procedural star field uses a fixed seed, so frame renders are reproducible.
let seed=42;function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
const stars=[];for(let i=0;i<1100;i++){const a=rand()*Math.PI*2,z=rand()*2-1,s=Math.sqrt(1-z*z);stars.push(35*s*Math.cos(a),35*z,35*s*Math.sin(a));}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:'#8eb7e6',size:.026,transparent:true,opacity:.45})));
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
window.seekFrame=(frame)=>{const t=frame/30,travel=ease((t-timing.camera_travel_start)/timing.camera_travel_duration);const center=geo(49+(31-49)*travel,12+(34-12)*travel,1);camera.position.copy(center.multiplyScalar(6.1-.08*ease(t/4.5)-.27*travel));camera.lookAt(new THREE.Vector3(0,.16,0));
pins.forEach(({loc,group,ring})=>{const a=ease((t-loc.start)/.7);group.visible=a>0;group.scale.setScalar(Math.max(.001,a));ring.material.opacity=.65+.3*Math.sin(t*3);});
arcs.forEach(({loc,curve,tubes,head})=>{const u=ease((t-(loc.start-.4))/1.45);tubes.forEach(m=>m.geometry.setDrawRange(0,Math.floor(160*u)*8*6));head.visible=u>0&&u<1;head.position.copy(curve.getPoint(u));});
renderer.render(scene,camera);};
window.seekFrame(0);window.sceneReady=true;
if(!location.search.includes('render')){let start=performance.now();function play(now){window.seekFrame(((now-start)/1000%10)*30);requestAnimationFrame(play);}requestAnimationFrame(play);}
