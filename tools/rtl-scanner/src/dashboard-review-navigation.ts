/** Pure review progress model. Explorer selection and presentation filters never narrow scope. */
export function reviewNavigationModel(input: {
 findings: {id:string;path:string}[]; visibleIds:string[]; currentId?:string;
 decisions:Record<string,string>;
}) {
 const {findings,decisions,currentId}=input,visible=new Set(input.visibleIds),current=findings.find(f=>f.id===currentId);
 const decision=(id:string)=>decisions[id]||'Pending';
 const pending=findings.filter(f=>decision(f.id)==='Pending');
 const unresolved=findings.filter(f=>['Pending','Deferred','Flagged'].includes(decision(f.id)));
 const file=findings.filter(f=>f.path===current?.path&&visible.has(f.id)),at=file.findIndex(f=>f.id===currentId);
 const following=at>=0?file[at+1]:undefined;
 const paths=[...new Set(findings.map(f=>f.path))],pathAt=paths.indexOf(current?.path||'');
 const orderedPaths=[...paths.slice(pathAt+1),...paths.slice(0,pathAt+1)];
 const destination=orderedPaths.flatMap(path=>pending.filter(f=>f.path===path&&path!==current?.path));
 const target=pending.length?(following||destination.find(f=>visible.has(f.id))||destination[0]||pending.find(f=>visible.has(f.id))||pending[0]):undefined;
 const outsideFilters=!!target&&!visible.has(target.id),crossFile=!!target&&target.path!==current?.path;
 const label=!target?'Review summary':crossFile?'Continue to next file':outsideFilters?'Continue outside filters':'Next finding';
 return {file,at,previous:file[at-1],target,label,crossFile,outsideFilters,pending,unresolved,
 accepted:findings.filter(f=>decision(f.id)==='Accepted'),rejected:findings.filter(f=>decision(f.id)==='Rejected'),
 hiddenPending:pending.filter(f=>!visible.has(f.id)),hiddenUnresolved:unresolved.filter(f=>!visible.has(f.id)),
 destinationPending:target?pending.filter(f=>f.path===target.path).length:0,total:findings.length};
}
