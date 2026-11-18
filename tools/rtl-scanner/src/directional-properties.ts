import valueParser from 'postcss-value-parser';

/** These mappings assume horizontal-tb and LTR-authored reading edges, never physical coordinates. */
export function directionalProperty(property:string,value:string,react=false):{logical:string;value:string;family:string}|undefined {
 const length=(v:string,negative=true,auto=false)=>{
  if(auto&&v==='auto')return true;
  if(!/^-?(?:\d*\.)?\d+(?:px|em|rem|%|vw|vh|ch|ex)?$/.test(v)||!negative&&v.startsWith('-'))return false;
  return react||/[a-z%]$/.test(v)||Number(v)===0;
 };
 const alignmentTokens=valueParser(value).nodes.filter(n=>n.type!=='space'&&n.type!=='comment');
 if(property==='text-align'&&alignmentTokens.length===1&&alignmentTokens[0].type==='word'&&/^(left|right)$/.test(alignmentTokens[0].value))return {logical:property,value:alignmentTokens[0].value==='left'?'start':'end',family:'alignment'};
 if(/^(left|right)$/.test(property)&&length(value,true,true))return {logical:'inset-inline-'+(property==='left'?'start':'end'),value,family:'positioning'};
 const spacing=/^(margin|padding)-(left|right)$/.exec(property);
 if(spacing&&length(value,spacing[1]==='margin',spacing[1]==='margin'))return {logical:spacing[1]+'-inline-'+(spacing[2]==='left'?'start':'end'),value,family:'spacing'};
 const corner=/^border-(top|bottom)-(left|right)-radius$/.exec(property);
 if(corner){const words=valueParser(value).nodes.filter(n=>n.type!=='space');if(words.length>=1&&words.length<=2&&words.every(n=>n.type==='word'&&length(n.value,false)))return {logical:'border-'+(corner[1]==='top'?'start':'end')+'-'+(corner[2]==='left'?'start':'end')+'-radius',value,family:'corners'};return;}
 const border=/^border-(left|right)(-(width|style|color))?$/.exec(property);
 if(border){
  const width=(v:string)=>length(v,false)||/^(thin|medium|thick)$/.test(v);
  const style=(v:string)=>/^(none|hidden|solid|dashed|dotted|double|groove|ridge|inset|outset)$/.test(v);
  const color=(v:string)=>/^(#[a-fA-F0-9]{3}|#[a-fA-F0-9]{4}|#[a-fA-F0-9]{6}|#[a-fA-F0-9]{8}|transparent|currentColor|black|white|red|green|blue|gray)$/.test(v);
  const words=valueParser(value).nodes.filter(n=>n.type!=='space');
  const valid=border[3]==='width'?width(value):border[3]==='style'?style(value):border[3]==='color'?color(value):words.length===3&&words.every(n=>n.type==='word')&&width(words[0].value)&&style(words[1].value)&&color(words[2].value);
  if(valid)return {logical:'border-inline-'+(border[1]==='left'?'start':'end')+(border[2]??''),value,family:'borders'};
 }
 return;
}
export function propertyConflict(property:string,other:string,family:string):boolean {
 if(['all','direction','writing-mode'].includes(other)||other===property)return true;
 if(family==='alignment')return other==='text-align';
 if(family==='positioning')return /^(inset(?:-|$)|transform|translate|rotate|scale|float|clear|animation(?:-|$))/.test(other);
 if(family==='spacing'){const kind=property.split('-')[0];return other===kind||other.startsWith(kind+'-inline')||other.startsWith(kind+'-block');}
 if(family==='corners')return other==='border-radius'||/^border-(start|end)-/.test(other);
 return /^(border$|border-(width|style|color)$|border-(inline|block)(-|$))/.test(other)||other!==property&&other.startsWith(property+'-')||property.startsWith(other+'-');
}
export const readingEdgeReason='Requires semantic review: horizontal-tb, LTR-authored reading-start/end intent. RTL intentionally changes the side; inspect inherited direction, writing mode, cross-stylesheet cascade and product semantics. Values, comments and !important are preserved.';
