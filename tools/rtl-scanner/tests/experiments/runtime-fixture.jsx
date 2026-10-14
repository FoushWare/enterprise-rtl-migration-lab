// Isolated browser fixture only. Never imported by either production application.
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CacheProvider, Global } from '@emotion/react';
import createCache from '@emotion/cache';
import styled from '@emotion/styled';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { ThemeProvider, createTheme, CssBaseline, TextField, Dialog, DialogTitle, useTheme } from '@mui/material';
const ltrCache = createCache({key: 'css', stylisPlugins: [prefixer]});
const rtlCache = createCache({key: 'atlas-rtl', stylisPlugins: [prefixer, rtlPlugin]});
const ltrTheme = createTheme({direction:'ltr'});
const rtlTheme = createTheme({direction:'rtl'});
// Same directional declarations and responsive structure as SidebarFrame, with proposed exclusions.
const Shell = styled.aside`
 position: fixed;
 /* @noflip */ left: 0;
 top: 0; bottom: 0; width: 238px;
 background: #fff;
 /* @noflip */ border-right: 1px solid #e9edf4;
 padding: 30px 18px; z-index:30; display:flex; flex-direction:column;
 @media (max-width:900px) {
  /* @noflip */ transform:translateX(-100%);
  &.is-open { /* @noflip */ transform:translateX(0); }
 }
`;
window.fixtureMounts = 0;
function StateProbe(){
 const [value,setValue] = useState('retained-value');
 const theme = useTheme();
 useLayoutEffect(()=>{window.fixtureThemeDirection=theme.direction;},[theme]);
 useEffect(()=>{ window.fixtureMounts++; },[]);
 return <TextField id="preserved-input" value={value} onChange={e=>setValue(e.target.value)} label="اسم"/>;
}
function Fixture({direction,open}) {
 useLayoutEffect(()=>{document.documentElement.dir=direction;},[direction]);
 return <CacheProvider value={direction==='rtl'?rtlCache:ltrCache}>
  <ThemeProvider theme={direction==='rtl'?rtlTheme:ltrTheme}>
   <CssBaseline/><Global styles={{body:{borderLeft:'3px solid rgb(1, 2, 3)'}}}/>
   <Shell id="shell" className={open?'is-open':''}><span>shell</span></Shell>
   <main id="gutter" className="app-main"><StateProbe/><span id="physical">physical</span></main>
   <Dialog open><DialogTitle>عنوان</DialogTitle></Dialog>
  </ThemeProvider>
 </CacheProvider>;
}
const root=createRoot(document.getElementById('root'));
window.fixtureRender=(direction,open=false)=>root.render(<React.StrictMode><Fixture direction={direction} open={open}/></React.StrictMode>);
window.fixtureDispose=()=>root.unmount();
window.fixtureCaches={ltr:ltrCache,rtl:rtlCache};
window.fixtureRender('ltr');
