import type { Finding } from './model.js';

/** Verified Atlas example bindings, deliberately separate from reusable preview transport. */
export type PreviewApplication = string;
export interface ContextRoute { id: string; application: PreviewApplication; path: string; label: string; urls?: {ltr:string;rtl:string}; prepare?: 'customer-menu' | 'customer-dialog' | 'invoice-confirm' | 'sidebar'; }
export interface ContextMapping {
  configured?:boolean; sourceSelector?:string;
  kind: 'targets' | 'document' | 'nonvisual' | 'unresolved'; label: string; selector: string; routes: ContextRoute[];
  evidence: string[]; limitation?: string; preferredMode?: 'ltr' | 'rtl'; preferredViewport?: number;
  css?: { property: string; value: string; selector?: string; inline?: boolean; media?: string; rtlOnly?: boolean };
}
const route=(application:PreviewApplication,path:string,prepare?:ContextRoute['prepare']):ContextRoute=>({id:application+':'+path+(prepare?':'+prepare:''),application,path,label:application+' · '+path+(prepare?' · '+prepare:''),...(prepare?{prepare}:{})});
const invoice=route('invoicing','/invoices'),overview=route('invoicing','/'),orders=route('procurement','/');
const detail=route('invoicing','/invoices/INV-2026-1048'),orderDetail=route('procurement','/orders/PO-2026-402');
const customers=route('invoicing','/customers'),customerDialog=route('invoicing','/customers','customer-dialog');
const create=route('invoicing','/invoices/new'),confirm=route('invoicing','/invoices/new','invoice-confirm');
const shared=[invoice,orders];
export function exampleContextMapping(f:Pick<Finding,'id'|'path'|'ruleId'|'context'|'original'>):ContextMapping {
  const evidence=[f.path+' · '+f.context, 'Verified example route/component imports; selectors refer to the existing rendered markup.'];
  const target=(label:string,selector:string,routes:ContextRoute[],extra:Partial<ContextMapping>={}):ContextMapping=>({kind:'targets',label,selector,routes,evidence,...extra});
  if(f.ruleId==='RTL.DOCUMENT.INITIAL')return {kind:'document',label:'Initial HTML direction · whole document; runtime direction is reported separately',selector:'html',routes:[f.path.includes('procurement')?orders:invoice],evidence};
  if(f.path.endsWith('/InvoiceTable.tsx')){
    if(f.ruleId==='RTL.ICON.PROGRESSION')return target('Invoice row navigation icon',f.context.endsWith('/ArrowBack')?'tbody [data-testid="ArrowBackIcon"]':'tbody [data-testid="ArrowForwardIcon"]',[invoice,overview],{preferredMode:f.context.endsWith('/ArrowBack')?'rtl':'ltr'});
    if(f.original==='{i.id}')return target('Invoice identifier · containing link',f.id==='RTL.BIDI.ISOLATION:1c1265d83508cd495927ae75'?'.review-extra-id':'.invoice-link',[invoice,overview]);
    if(f.original==='{c.name}')return target('Invoice customer name','.customer-cell strong',[invoice,overview]);
    if(f.original==='{c.email}')return target('Invoice customer email','.customer-cell small',[invoice,overview]);
    if(f.original.includes('money('))return target('Invoice amount','.amount',[invoice,overview]);
  }
  // Only the existing workflow regression fixture imports these two named spans.
  if(f.path.endsWith('/ReviewTokens.tsx'))return target('Regression fixture identifier span',f.id==='RTL.BIDI.ISOLATION:9abfb96bb050e95f51ed573b'?'.token-one':'.token-two',[invoice],{limitation:'Workflow fixture only; not present in the 47-finding checkout.'});
  if(f.path.endsWith('/CreateInvoice.tsx')){
    if(f.original==='{c.name}')return target('Customer menu option','[role="listbox"] [role="option"]',[route('invoicing','/invoices/new','customer-menu')]);
    if(f.original.includes('customers.find'))return target('Confirmation customer name','.MuiDialogContent-root p:first-child strong:first-of-type',[confirm]);
    if(f.original.includes('money('))return target('Invoice total',f.id==='RTL.BIDI.ISOLATION:f452c219f31ee6379007a4e9'?'.MuiDialogContent-root p:first-child strong:last-of-type':'.form-total strong',[f.id==='RTL.BIDI.ISOLATION:f452c219f31ee6379007a4e9'?confirm:create]);
  }
  if(f.path.endsWith('/Customers.tsx')){
    if(f.original==='{c.name}')return target('Customer card name','.customer-card h3',[customers]);
    if(f.original==='{c.address}')return target('Customer dialog address','.MuiDialogContent-root p.hint',[customerDialog]);
    if(f.original==='{c.email}')return target('Customer email',f.id==='RTL.BIDI.ISOLATION:75fcb34b4ca84b10731b3272'?'.MuiDialogContent-root p:nth-of-type(2)':'.customer-card p:first-of-type',[f.id==='RTL.BIDI.ISOLATION:75fcb34b4ca84b10731b3272'?customerDialog:customers]);
  }
  if(f.path.endsWith('/Dashboard.tsx')){
    if(f.ruleId==='RTL.CHART.LABEL_FLOW')return target('Revenue chart and its real labels','.chart-wrap svg',[overview]);
    if(f.ruleId==='RTL.ICON.LITERAL')return target('View all invoices link','.section-title a',[overview]);
    if(f.ruleId==='RTL.CSS.PHYSICAL')return target('Payment breakdown percentage','.breakdown-row strong > span',[overview],{css:{property:'margin-left',value:'10px',inline:true}});
  }
  if(f.path.endsWith('/InvoiceDetails.tsx')){
    if(f.original==='{c.name}')return target('Bill-to customer name','.detail-grid h3',[detail]);
    if(f.original==='{c.address}'||f.original==='{c.email}')return target('Bill-to address/email · containing paragraph','.detail-grid p.hint',[detail],{limitation:'Both text expressions share one paragraph; the containing rendered element is highlighted.'});
    if(f.original.includes('money('))return target('Invoice total due','.form-total strong',[detail]);
  }
  if(f.path.endsWith('/Invoices.tsx')){
    if(f.ruleId==='RTL.RUNTIME.PAGINATION')return target('Invoice pagination','.pagination nav',[invoice]);
    if(f.ruleId==='RTL.CSS.PHYSICAL')return target('Invoice count alignment','.toolbar > .hint',[invoice],{css:{property:'margin-left',value:'auto',inline:true}});
  }
  if(f.path==='apps/procurement/src/App.tsx'){
    if(f.context==='Orders')return target(f.original==='{o.id}'?'Purchase order identifier':'Purchase order amount',f.original==='{o.id}'?'.invoice-link':'.amount',[orders]);
    if(f.context==='Details')return target(f.original==='{order.id}'?'Purchase order heading':'Purchase order total',f.original==='{order.id}'?'.page-heading h1':'.form-total strong',[orderDetail]);
  }
  if(f.path==='libs/design-system/src/index.tsx'){
    if(f.ruleId==='RTL.FORM.DIRECTION')return target('Shared FormField instances','.MuiFormControl-root',[invoice,orders,create,customers]);
    if(f.ruleId==='RTL.GEOMETRY.EDGE')return target('Shared Modal close control','.MuiDialogTitle-root button',[customerDialog,confirm],{css:{property:'right',value:'12px',inline:true}});
    if(f.ruleId==='RTL.TABLE.ALIGNMENT')return target('Shared table '+(f.id==='RTL.TABLE.ALIGNMENT:9e76dea095ca377d5e42c677'?'header':'body')+' cells',f.id==='RTL.TABLE.ALIGNMENT:9e76dea095ca377d5e42c677'?'thead th':'tbody td',[invoice,orders,overview,detail,orderDetail]);
    if(f.ruleId==='RTL.GEOMETRY.ORDER')return target('Shared responsive sidebar · actual off-canvas geometry','aside',shared,{preferredViewport:1,preferredMode:f.original.includes('translateX(100%)')?'rtl':'ltr',css:{property:'transform',value:f.original.includes('translateX(100%)')?'translateX(100%)':'translateX(-100%)',media:'(max-width: 900px)',rtlOnly:f.original.includes('translateX(100%)')},limitation:'A collapsed sidebar can be intentionally outside the viewport. Target geometry and active/overridden CSS are reported; use Reveal navigation to inspect the open component.'});
    if(f.ruleId==='RTL.BRAND.ISLAND')return target('Shared brand link','aside .brand',shared.map(r=>route(r.application,r.path,'sidebar')));
    if(f.ruleId==='RTL.ICON.PROGRESSION'||f.ruleId==='RTL.CSS.PHYSICAL')return target('Shared application-switch arrow','.app-link [data-testid="ArrowForwardIcon"]',shared.map(r=>route(r.application,r.path,'sidebar')),f.ruleId==='RTL.CSS.PHYSICAL'?{css:{property:'margin-left',value:'auto',inline:true}}:{});
  }
  if(f.path==='libs/design-system/src/runtime.tsx'&&f.ruleId==='RTL.DOCUMENT.RUNTIME')return {kind:'document',label:'Shared Provider · document direction/lang and theme context',selector:'html',routes:shared,evidence};
  if(f.path==='libs/design-system/src/styles.css'){
    const selector=f.context.replace(/^stylesheet\//,'');const declaration=f.original.match(/^([\w-]+):\s*(.*?);?$/);
    if(declaration){const routes=selector==='.chart-labels'||selector==='.kpi-note b'?[overview]:selector.startsWith('.header')?shared:shared.map(r=>route(r.application,r.path,'sidebar'));return target('Shared stylesheet · '+selector,selector,routes,{css:{selector,property:declaration[1],value:declaration[2].replace(/;$/,'')}})}
  }
  if(f.path==='libs/shared/src/index.ts'&&f.ruleId==='RTL.RUNTIME.LOCALE')return target('Shared money formatter output · locale semantics require review','.amount',[invoice,orders],{limitation:'These consumers call the real money() formatter. A target match does not establish a locale defect or authorize changing currency data.'});
  return {kind:'unresolved',label:'Unresolved example mapping',selector:'',routes:[],evidence:[f.path+' · '+f.context,'No configured source-to-route binding was found.'],limitation:'No verified route/target binding for this source expression. Add a verified example mapping; do not substitute an unrelated page.'};
}
