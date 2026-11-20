import {expect,it} from 'vitest';
import {reviewNavigationModel as model} from '../src/dashboard-review-navigation.js';
const findings=[{id:'name',path:'main.tsx'},{id:'email',path:'main.tsx'},{id:'css1',path:'reading.css'},{id:'css2',path:'reading.css'}];
it('keeps file navigation distinct from project progress',()=>{
 const input={findings,visibleIds:findings.map(f=>f.id),currentId:'email',decisions:{name:'Accepted',email:'Accepted'}};
 const n=model(input);expect(n.label).toBe('Continue to next file');expect(n.target?.id).toBe('css1');expect(n.destinationPending).toBe(2);expect(n.total).toBe(4);expect(n.file).toHaveLength(2);
});
it('reveals hidden pending work only through explicit continuation',()=>{
 const n=model({findings,visibleIds:['email'],currentId:'email',decisions:{name:'Accepted',email:'Accepted'}});expect(n.outsideFilters).toBe(true);expect(n.hiddenPending).toHaveLength(2);expect(n.target?.path).toBe('reading.css');
});
it('does not cycle deferred or flagged items and counts rejected separately',()=>{
 const n=model({findings,visibleIds:findings.map(f=>f.id),currentId:'email',decisions:{name:'Accepted',email:'Rejected',css1:'Deferred',css2:'Flagged'}});expect(n.label).toBe('Review summary');expect(n.target).toBeUndefined();expect(n.pending).toHaveLength(0);expect(n.unresolved.map(f=>f.id)).toEqual(['css1','css2']);expect(n.rejected).toHaveLength(1);
});
it('uses supplied scope only and retains within-file ordering',()=>{
 const n=model({findings:findings.slice(2),visibleIds:['css1','css2'],currentId:'css1',decisions:{}});expect(n.label).toBe('Next finding');expect(n.target?.id).toBe('css2');expect(n.total).toBe(2);
});
