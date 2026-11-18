export const fps = 30;
export type SceneId = 'cli'|'orchestrator'|'parsing'|'detection'|'coverage'|'reporting'|'overview';
export interface SceneTiming {id:SceneId;duration:number;entrance:number;transition:number;hold:number;pause:number;markers:Record<string,number>}
// Seconds, provisional preview pacing only. Markers are local scene times.
export const timing:SceneTiming[]=[
 {id:'cli',duration:6,entrance:.65,transition:.45,hold:.5,pause:.2,markers:{'cli.command.start':.6,'cli.command.complete':2.8}},
 {id:'orchestrator',duration:7,entrance:.65,transition:.45,hold:.5,pause:.2,markers:{'scan.dispatch':1,'scan.audit':3.5,'scan.final':5}},
 {id:'parsing',duration:7,entrance:.65,transition:.45,hold:.5,pause:.2,markers:{'parser.evidence.highlight':1,'parser.evidence.extracted':3}},
 {id:'detection',duration:7,entrance:.65,transition:.45,hold:.5,pause:.2,markers:{'detection.rules.applied':1.5,'detection.finding.created':3.5}},
 {id:'coverage',duration:7,entrance:.65,transition:.45,hold:.5,pause:.2,markers:{'coverage.incomplete.warning':3}},
 {id:'reporting',duration:6,entrance:.65,transition:.45,hold:.5,pause:.2,markers:{'report.generated':2.5}},
 {id:'overview',duration:8,entrance:.8,transition:.5,hold:1,pause:.2,markers:{'overview.reveal':.4,'overview.connections':2}},
];
export const length=(s:SceneTiming)=>s.duration+s.hold+s.pause;
export const totalDuration=timing.reduce((n,s)=>n+length(s),0);
export function atTime(time:number){let start=0;for(const s of timing){if(time<start+length(s))return {scene:s,local:Math.max(0,time-start),start};start+=length(s)}const s=timing.at(-1)!;return {scene:s,local:length(s)-1/fps,start:start-length(s)}}
export const clamp=(v:number)=>Math.min(1,Math.max(0,v));
export const ease=(v:number)=>1-Math.pow(1-clamp(v),3);
