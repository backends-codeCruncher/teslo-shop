import{_ as l,o as s,c as i,a as e,d,e as a,k as p,l as g,m as c,p as u}from"./index-CbKUW8k9.js";import{g as h}from"./get-product-image.action-B4odG85w.js";const f={},w={width:"20px",height:"20px",viewBox:"-5.5 0 26 26",version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","xmlns:sketch":"http://www.bohemiancoding.com/sketch/ns",fill:"#000000",transform:"matrix(-1, 0, 0, 1, 0, 0)"};function m(o,t){return s(),i("svg",w,t[0]||(t[0]=[e("g",{id:"SVGRepo_bgCarrier","stroke-width":"0"},null,-1),e("g",{id:"SVGRepo_tracerCarrier","stroke-linecap":"round","stroke-linejoin":"round"},null,-1),e("g",{id:"SVGRepo_iconCarrier"},[e("title",null,"chevron-right"),e("desc",null,"Created with Sketch Beta."),e("defs"),e("g",{id:"Page-1",stroke:"none","stroke-width":"1",fill:"none","fill-rule":"evenodd","sketch:type":"MSPage"},[e("g",{id:"Icon-Set-Filled","sketch:type":"MSLayerGroup",transform:"translate(-474.000000, -1196.000000)",fill:"#ffffff"},[e("path",{d:"M488.404,1207.36 L477.637,1197.6 C476.806,1196.76 475.459,1196.76 474.629,1197.6 C473.798,1198.43 473.798,1199.77 474.629,1200.6 L483.885,1209 L474.629,1217.4 C473.798,1218.23 473.798,1219.57 474.629,1220.4 C475.459,1221.24 476.806,1221.24 477.637,1220.4 L488.404,1210.64 C488.854,1210.19 489.052,1209.59 489.015,1209 C489.052,1208.41 488.854,1207.81 488.404,1207.36",id:"chevron-right","sketch:type":"MSShapeGroup"})])])],-1)]))}const k=l(f,[["render",m]]),b={},x={width:"20px",height:"20px",viewBox:"-5.5 0 26 26",version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","xmlns:sketch":"http://www.bohemiancoding.com/sketch/ns",fill:"#000000"};function C(o,t){return s(),i("svg",x,t[0]||(t[0]=[e("g",{id:"SVGRepo_bgCarrier","stroke-width":"0"},null,-1),e("g",{id:"SVGRepo_tracerCarrier","stroke-linecap":"round","stroke-linejoin":"round"},null,-1),e("g",{id:"SVGRepo_iconCarrier"},[e("title",null,"chevron-right"),e("desc",null,"Created with Sketch Beta."),e("defs"),e("g",{id:"Page-1",stroke:"none","stroke-width":"1",fill:"none","fill-rule":"evenodd","sketch:type":"MSPage"},[e("g",{id:"Icon-Set-Filled","sketch:type":"MSLayerGroup",transform:"translate(-474.000000, -1196.000000)",fill:"#ffffff"},[e("path",{d:"M488.404,1207.36 L477.637,1197.6 C476.806,1196.76 475.459,1196.76 474.629,1197.6 C473.798,1198.43 473.798,1199.77 474.629,1200.6 L483.885,1209 L474.629,1217.4 C473.798,1218.23 473.798,1219.57 474.629,1220.4 C475.459,1221.24 476.806,1221.24 477.637,1220.4 L488.404,1210.64 C488.854,1210.19 489.052,1209.59 489.015,1209 C489.052,1208.41 488.854,1207.81 488.404,1207.36",id:"chevron-right","sketch:type":"MSShapeGroup"})])])],-1)]))}const y=l(b,[["render",C]]),_={class:"flex justify-center py-10 bg-gray-100 space-x-3"},v=["disabled"],S=["disabled"],G=d({__name:"PaginationButton",props:{page:{},hasMoreData:{type:Boolean}},setup(o){return(t,r)=>(s(),i("div",_,[e("button",{disabled:t.page===1,onClick:r[0]||(r[0]=n=>t.$router.push({query:{page:t.page-1}})),class:"flex items-center space-x-1.5 rounded-lg px-4 py-1.5 bg-blue-500 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-all"},[a(k),r[2]||(r[2]=e("span",null,"Anteriores",-1))],8,v),e("button",{disabled:t.hasMoreData,onClick:r[1]||(r[1]=n=>t.$router.push({query:{page:t.page+1}})),class:"flex items-center space-x-1.5 rounded-lg px-4 py-1.5 bg-blue-500 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-all"},[r[3]||(r[3]=e("span",null,"Siguientes",-1)),a(y)],8,S)]))}}),M=()=>{const o=c(),t=p(Number(o.query.page||1));return g(()=>o.query.page,r=>{t.value=Number(r||1),window.scrollTo({top:0,behavior:"smooth"})}),{page:t}},B=async(o=1,t=10)=>{try{const{data:r}=await u.get(`/products?limit=${t}&offset=${(o-1)*t}`);return r.map(n=>({...n,images:n.images.map(h)}))}catch(r){throw console.error(r),new Error("Error getting products")}};export{G as _,B as g,M as u};
