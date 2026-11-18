import { describe,it,expect } from 'vitest';
import { exampleContextMapping } from '../src/example-preview-mappings.js';
import { scan } from '../src/scan.js';
import { resolve } from 'node:path';

describe('bounded example contextual mappings',()=>{
  it('accounts for each real checkout finding without inventing nonvisual coverage',async()=>{
    const report=await scan(resolve(import.meta.dirname,'../../..'));
    expect(report.complete).toBe(true);expect(report.findings.length).toBeGreaterThan(40);
    for(const f of report.findings){const m=exampleContextMapping(f);expect(m.kind,f.id).not.toBe('unresolved');expect(m.kind,f.id).not.toBe('nonvisual');expect(m.routes.length,f.id).toBeGreaterThan(0);expect(m.evidence.length).toBeGreaterThan(0)}
    const shared=report.findings.filter(f=>f.path.startsWith('libs/'));
    expect(shared.some(f=>exampleContextMapping(f).routes.some(r=>r.application==='procurement'))).toBe(true);
    expect(shared.some(f=>exampleContextMapping(f).routes.some(r=>r.application==='invoicing'))).toBe(true);
  });
  it('keeps conditional UI and responsive declaration conditions explicit',()=>{
    const map=(path:string,ruleId:string,context:string,original:string,id='')=>exampleContextMapping({id,path,ruleId,context,original});
    const modal=map('apps/invoicing/src/pages/CreateInvoice.tsx','RTL.BIDI.ISOLATION','CreateInvoice','{customers.find((c) => c.id === customer)?.name}');
    expect(modal.routes[0].prepare).toBe('invoice-confirm');
    const sidebar=map('libs/design-system/src/index.tsx','RTL.GEOMETRY.ORDER','SidebarFrame','transform: translateX(100%);');
    expect(sidebar.css).toMatchObject({media:'(max-width: 900px)',rtlOnly:true});expect(sidebar.preferredMode).toBe('rtl');
  });
  it('returns an actionable mapping gap for unknown visual source rather than an unrelated route',()=>{
    const mapping=exampleContextMapping({id:'unknown',path:'apps/other/Card.tsx',ruleId:'RTL.BIDI.ISOLATION',context:'Other',original:'{item.id}'});
    expect(mapping.kind).toBe('unresolved');expect(mapping.routes).toEqual([]);expect(mapping.limitation).toContain('verified');
  });
});

import { runInNewContext } from 'node:vm';
import { contextualBridgeSource } from '../src/contextual-preview-bridge.js';
it('rejects contextual commands from the wrong parent, origin, application, source hash, finding or session before initializing storage',()=>{
  let listener:(event:any)=>Promise<void>=async()=>{};let writes=0;const messages:any[]=[];
  const parent={postMessage:(value:any)=>messages.push(value)};
  const finding={id:'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea',path:'apps/invoicing/src/components/InvoiceTable.tsx'};
  const mapping=exampleContextMapping({...finding,ruleId:'RTL.BIDI.ISOLATION',context:'InvoiceTable',original:'{i.id}'});
  const identity={role:'original',sessionId:'original',projectRoot:'/owned',application:'invoicing'};
  const context={MutationObserver:class{observe(){}},document:{addEventListener:()=>undefined},window:{parent,name:'rtl-preview:12345678-1234-1234-1234-123456789012',addEventListener:(type:string,fn:any)=>{if(type==='message')listener=fn}},localStorage:{getItem:()=>null,setItem:()=>writes++}};
  runInNewContext(contextualBridgeSource+';installContextPreview('+JSON.stringify({identity,dashboardOrigin:'http://127.0.0.1:4320',sourceHashes:{[finding.path]:'hash'},bindings:[{finding,mapping}]})+');',context);
  const data={type:'rtl-context-probe',version:2,nonce:'nonce',role:'original',application:'invoicing',runtimeSessionId:'original',sessionId:'before-only',projectRoot:'/owned',sourcePath:finding.path,sourceSha256:'hash',findingId:finding.id,routeId:mapping.routes[0].id,instance:0};
  for(const event of [{origin:'http://evil.invalid',source:parent,data},{origin:'http://127.0.0.1:4320',source:{},data},...['application','runtimeSessionId','projectRoot','sourceSha256','findingId','routeId'].map(key=>({origin:'http://127.0.0.1:4320',source:parent,data:{...data,[key]:'wrong'}}))])void listener(event);
  expect(writes).toBe(0);expect(messages).toEqual([]);
});
