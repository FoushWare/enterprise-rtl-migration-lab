import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Mechanism, Category } from './model.js';
export interface Binding { ruleId:string; path:string; contextIncludes:string; originalIncludes?:string; issueId:string }
export interface Approval { path:string; context:string; property:string; value:string; owner:string; logicalProperty:string; reason:string; reviewedBy:string; sourceDigest:string }
export interface Exception { ruleId:string; path:string; context:string; category:'INTENTIONAL_LTR'|'INFORMATIONAL'; reason:string; reviewedBy:string; originalDigest:string }
export interface Policy { schemaVersion:1; generatedStyleOwner:string; ownership:Partial<Record<Mechanism,string>>; ownerOverrides?:{path:string;context:string;owner:string;reason:string}[]; approvals:Approval[]; exceptions:Exception[]; issueBindings:Binding[]; dynamicExceptions:{path:string; property:string; valueDigest:string; sourceDigest:string; reason:string}[]; roles:{kind:'brand';path:string;className:string}[] }
export const emptyPolicy:Policy={schemaVersion:1,generatedStyleOwner:'unknown',ownership:{},approvals:[],exceptions:[],issueBindings:[],dynamicExceptions:[],roles:[]};
export async function loadPolicy(root:string):Promise<Policy>{
 let text:string;try{text=await readFile(join(root,'rtl-scanner.config.json'),'utf8');}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return emptyPolicy;throw e;}
 const p=JSON.parse(text) as Policy;
 if(p.schemaVersion!==1||!p.ownership||!['approvals','exceptions','issueBindings','dynamicExceptions','roles'].every(k=>Array.isArray(p[k as keyof Policy])))throw new Error('Invalid scanner policy schema');
 const categories:Category[]=['INTENTIONAL_LTR','INFORMATIONAL'];
 for(const a of p.approvals)if(!a.path||!a.context||!a.property||!a.value||!a.owner||!a.logicalProperty||!a.reason||!a.reviewedBy||!a.sourceDigest)throw new Error('Invalid semantic approval');
 for(const x of p.exceptions)if(!x.ruleId||!x.path||!x.context||!categories.includes(x.category)||!x.reason||!x.reviewedBy||!x.originalDigest)throw new Error('Invalid exception');
 for(const b of p.issueBindings)if(!b.ruleId||!b.path||!b.contextIncludes||!/^RTL-0[1-9]$/.test(b.issueId))throw new Error('Invalid issue binding');
 for(const d of p.dynamicExceptions)if(!d.path||!d.property||!d.reason||!d.valueDigest||!d.sourceDigest)throw new Error('Invalid dynamic exception');
 return p;
}
