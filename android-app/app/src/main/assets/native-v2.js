(function(){
if(window.__bikiAppV2)return;
if(typeof window.bikiPublicOpenBilling==='function')window.bikiPublicOpenBilling();
const d=document,app=d.querySelector('.app'),dash=d.getElementById('dashboard'),top=app&&app.querySelector('.top'),menu=app&&app.querySelector('.nav');
if(!app||!dash||!top||!menu)return;
window.__bikiAppV2=true;
const by=id=>d.getElementById(id),q=(s,r=d)=>r.querySelector(s);
d.documentElement.classList.add('nativev2');
const css=d.createElement('style');
css.textContent=[
'html.nativev2,html.nativev2 body{margin:0!important;padding:0!important;max-width:100%!important;overflow-x:hidden!important;background:#f1f5fa}',
'.nativev2 #bikiPublicBack,.nativev2 #bikiPublicHome,.nativev2 .nvwelcome{display:none!important}',
'.nativev2 .app,.nativev2 .app>main{width:100%!important;min-height:100dvh!important;max-width:100%!important;padding-bottom:0!important}',
'.nativev2 .app .content{padding:14px 13px 78px!important;background:#f1f5fa!important;min-height:calc(100dvh - 64px)!important;max-width:100%!important}',
'.nativev2 .app .top{position:sticky!important;top:0!important;z-index:80!important;display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:9px!important;min-height:64px!important;height:auto!important;padding:10px 13px!important;background:#102951!important;color:white!important;border:0!important;box-shadow:none!important}',
'.nativev2 .top-business-brand{flex:1 1 auto!important;min-width:0!important;gap:10px!important}.nativev2 .top-business-brand .logo{width:41px!important;height:41px!important;min-width:41px!important;border-radius:12px!important;box-shadow:none!important}.nativev2 .top-business-brand>div:last-child{min-width:0!important;overflow:hidden!important}.nativev2 #topBusinessName{font-size:10px!important;color:#bfd0e9!important;white-space:nowrap!important;display:block!important;overflow:hidden!important;text-overflow:ellipsis!important}.nativev2 #topBusinessContact,.nativev2 .top>.actions{display:none!important}',
'.nativev2 .nvhead{display:flex;gap:7px;flex-shrink:0}.nativev2 .nvhead button{width:36px;height:36px;border:0;border-radius:11px;background:#ffffff18;color:white;font-size:17px;padding:0!important}.nativev2 .nvhead button:last-child{background:#dceaff;color:#1b51aa;border-radius:50%;font-size:12px;font-weight:bold}',
'.nativev2 .app .page .head{margin:0 0 13px!important;gap:8px!important}.nativev2 .app .page .head h1{font-size:23px!important;line-height:1.25!important;color:#142d51!important}.nativev2 .app .page .head p{font-size:12px!important;color:#6c809a!important}',
'.nativev2 .app .panel,.nativev2 .app .billing-preview,.nativev2 .app .biki-pro-card{border-radius:16px!important;border:1px solid #e0e8f3!important;box-shadow:0 4px 16px #14345908!important;padding:14px!important;max-width:100%!important;min-width:0!important}',
'.nativev2 .app .field label{font-size:12px!important;color:#435a77!important}.nativev2 .app .field input,.nativev2 .app .field select,.nativev2 .app .field textarea{min-height:44px!important;border-radius:10px!important;font-size:16px!important;max-width:100%!important}.nativev2 .app .primary{border-radius:11px!important;min-height:43px!important}',
'.nativev2 .nvsummary{margin:0 0 12px;padding:18px 17px 15px;border-radius:20px;color:white;background:linear-gradient(125deg,#153e9d,#1766eb);box-shadow:0 5px 16px #1d57c525}.nativev2 .nvsummary small{color:#d4e2ff;font-size:11px}.nativev2 .nvsales{font-size:34px;font-weight:800;margin:7px 0 14px;color:white}.nativev2 .nvfooter{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #ffffff3a;padding-top:12px}.nativev2 .nvfooter strong{display:block;font-size:18px;color:white}.nativev2 .nvfooter button{background:#ffffff24;color:white;border:0;border-radius:10px;padding:10px;font-size:12px}',
'.nativev2 .nvmini,.nativev2 .nvquick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:17px}.nativev2 .nvmini button{min-width:0;background:white;border:1px solid #e0e8f3;border-radius:14px;padding:11px 9px;text-align:left;color:#1559cd}.nativev2 .nvmini small{display:block;color:#71839a;font-size:11px}.nativev2 .nvmini strong{display:block;font-size:20px;margin-top:5px;overflow-wrap:anywhere}',
'.nativev2 .nvquick button{display:flex;align-items:center;flex-direction:column;gap:7px;border:1px solid #e0e8f3;background:white;color:#25456e;border-radius:14px;min-height:80px;padding:10px 4px;font-size:11px;font-weight:700;text-align:center}.nativev2 .nvicon{width:39px;height:39px;display:grid;place-items:center;color:#1b5fd3;background:#e8f0ff;border-radius:11px;font-size:22px;flex-shrink:0}',
'.nativev2 #dashboard .biki-v2-hero,.nativev2 #dashboard .biki-v2-kpis,.nativev2 #dashboard .biki-mv3-quick,.nativev2 #dashboard>.head>button,.nativev2 .biki-mv3-nav{display:none!important}',
'.nativev2 .nvnav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;left:0;right:0;bottom:0;z-index:8999;background:white;border-top:1px solid #dce5f0;padding:6px 5px 7px;gap:3px;box-shadow:0 -4px 18px #1434590c}.nativev2 .nvnav button{display:flex;align-items:center;flex-direction:column;gap:4px;background:white;color:#637890;font-size:11px;padding:5px 1px;border:0;border-radius:13px;font-weight:650;min-width:0}.nativev2 .nvnav button.active{color:#155bd8}.nativev2 .nvnav button:nth-child(3){background:#155bd8;color:white}.nativev2 .nvnav svg,.nativev2 .nvicon svg{width:22px;height:22px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}',
'.nativev2 .nvmore{display:none;position:fixed;inset:0 0 63px;z-index:8998;background:#f1f5fa;overflow:auto;padding:16px 13px 14px;color:#152d4d}.nativev2 .nvmore.open{display:block}.nativev2 .nvmore h2{margin:0;font-size:23px}.nativev2 .nvmore h3{font-size:14px;margin:18px 0 8px;color:#526981}.nativev2 .nvmore input{width:100%;border:1px solid #d6e1ef;border-radius:12px;min-height:44px;background:white;padding:10px;margin:12px 0 4px;font-size:16px}.nativev2 .nvcard{border:1px solid #e0e8f3;background:white;border-radius:15px;padding:0 12px}.nativev2 .nvcard button{background:white;border:0;border-bottom:1px solid #edf1f6;border-radius:0;color:#183454;width:100%;text-align:left;display:flex;align-items:center;gap:11px;padding:12px 0;font-size:13px;font-weight:700}.nativev2 .nvcard button:last-child{border-bottom:0}.nativev2 .nvcard button small{display:block;font-weight:400;color:#7b8ca1;font-size:11px;margin-top:3px}',
'.nativev2:not(.nvlogged) .nvnav,.nativev2:not(.nvlogged) .nvmore{display:none!important}.nativev2 .login-card{max-width:min(440px,calc(100vw - 26px))!important;border-radius:22px!important;padding:22px!important}',
'html.nativev2 body #bikiCloudTools.biki-cloud-compact.biki-cloud-open:not([style*="display: none"]){display:block!important;position:fixed!important;bottom:76px!important;right:10px!important;max-height:70dvh!important;overflow:auto!important;z-index:1000002!important}',
'html.nativev2.nvtelegram body #bikiTelegramPanel,html.nativev2.nvtelegram body #bikiTelegramToggle{display:block!important;bottom:76px!important;z-index:1000003!important}html.nativev2.nvtelegram body #bikiTelegramBox:not([style*="display: none"]){display:block!important;position:relative!important;bottom:0!important;top:auto!important;max-height:65dvh!important;overflow:auto!important}',
'@media print{.nativev2 .nvnav,.nativev2 .nvmore,.nativev2 .nvhead{display:none!important}}'
].join('\n');d.head.appendChild(css);
css.textContent += 'html.nativev2 body .nvmore #bikiCloudTools.nv-mounted-tool,html.nativev2 body .nvmore #bikiTelegramPanel.nv-mounted-tool{display:block!important;position:static!important;inset:auto!important;width:100%!important;max-width:100%!important;max-height:none!important;overflow:visible!important;visibility:visible!important;opacity:1!important;box-sizing:border-box!important}html.nativev2 .nvmore{box-sizing:border-box!important}';
css.textContent += "\nhtml.nativev2{--nv-bg:#f1f5fa;--nv-card:#fff;--nv-text:#142d51;--nv-muted:#647b95;--nv-line:#e0e8f3;--nv-accent:#155bd8;--nv-header:#102951;--nv-grad:#1766eb;--nv-input:#f9fbfe}\nhtml.nativev2[data-nvtheme=soft]{--nv-bg:#e7f3fc;--nv-card:#f9fdff;--nv-text:#163d5e;--nv-muted:#5c7c96;--nv-line:#cce4f5;--nv-accent:#2679c7;--nv-header:#215780;--nv-grad:#4397d8;--nv-input:#f0f9ff}\nhtml.nativev2[data-nvtheme=classic]{--nv-bg:#f2f3f5;--nv-card:#fff;--nv-text:#263443;--nv-muted:#667483;--nv-line:#dce1e6;--nv-accent:#315e99;--nv-header:#293e58;--nv-grad:#315e99;--nv-input:#fff}\nhtml.nativev2[data-nvtheme=dark]{--nv-bg:#101b2b;--nv-card:#1b2c42;--nv-text:#e3efff;--nv-muted:#aec0d9;--nv-line:#344c65;--nv-accent:#7fb1ff;--nv-header:#101e35;--nv-grad:#2356a0;--nv-input:#20364e}\nhtml.nativev2 .nvhide{display:none!important}\nhtml.nativev2 .app .content{background:var(--nv-bg)!important;color:var(--nv-text)!important}\nhtml.nativev2 .app .top{background:var(--nv-header)!important}\nhtml.nativev2 .app .page .head h1,html.nativev2 .app .page h3,html.nativev2 .app .page .field label{color:var(--nv-text)!important}\nhtml.nativev2 .app .page .head p,html.nativev2 .app .page .sub,html.nativev2 .app .page .muted{color:var(--nv-muted)!important}\nhtml.nativev2 .app .page .panel,html.nativev2 .app .page .biki-pro-box,html.nativev2 .app .page .stat,html.nativev2 .nvcard,html.nativev2 .nvcard button,html.nativev2 .nvmini button,html.nativev2 .nvquick button{background:var(--nv-card)!important;color:var(--nv-text)!important;border-color:var(--nv-line)!important}\nhtml.nativev2 .nvmore,html.nativev2 body,html.nativev2 .nvwelcome{background:var(--nv-bg)!important;color:var(--nv-text)!important}\nhtml.nativev2 .nvmore h2,html.nativev2 .nvmore h3,html.nativev2 .nvmini small,html.nativev2 .nvcard button small{color:var(--nv-muted)!important}\nhtml.nativev2 .nvnav,html.nativev2 .nvnav button{background:var(--nv-card)!important;color:var(--nv-muted)!important;border-color:var(--nv-line)!important}\nhtml.nativev2 .nvnav button.active{color:var(--nv-accent)!important}\nhtml.nativev2 .nvnav button:nth-child(3){background:var(--nv-grad)!important;color:#fff!important}\nhtml.nativev2 .nvsummary{background:linear-gradient(125deg,var(--nv-header),var(--nv-grad))!important}\nhtml.nativev2 .app .field input:not([type=checkbox]):not([type=radio]):not([type=color]),html.nativev2 .app .field select,html.nativev2 .app .field textarea,html.nativev2 .nvmore input,html.nativev2 .biki-pro-box input,html.nativev2 .biki-pro-box select{background:var(--nv-input)!important;color:var(--nv-text)!important;border-color:var(--nv-line)!important}\nhtml.nativev2 .app .field input[type=checkbox],html.nativev2 .app .field input[type=radio]{min-height:0!important;width:auto!important}\nhtml.nativev2 .app .biki-pro-box{padding:15px!important;border-radius:16px!important;min-width:0!important}\nhtml.nativev2 .app .page .head{display:none!important}\nhtml.nativev2 #dashboard.active .head{display:flex!important}\nhtml.nativev2 .nvback{display:none;border:0;background:#ffffff15;color:white;width:35px;height:38px;border-radius:10px;font-size:29px;line-height:1;padding:0;flex-shrink:0}\nhtml.nativev2.nvsub .nvback{display:block}\nhtml.nativev2.nvsub .top-business-brand .logo{display:none!important}\nhtml.nativev2.nvsub .nvhead button:first-child{display:none!important}\nhtml.nativev2 .app footer{display:none!important}\nhtml.nativev2 .nvwelcome{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;overflow:auto;text-align:center}\nhtml.nativev2 .nvwelcome[hidden]{display:none!important}\nhtml.nativev2 .nvwelcome-inner{width:min(100%,360px);padding:28px 14px}\nhtml.nativev2 .nvwelcome-inner img{width:92px;height:92px;object-fit:contain;border-radius:22px;background:white;box-shadow:0 8px 24px #12345a20}\nhtml.nativev2 .nvwelcome-title{font-size:30px;font-weight:850;letter-spacing:-1px;margin-top:22px;color:var(--nv-text)}\nhtml.nativev2 .nvwelcome-title span{font-size:13px;letter-spacing:1px;color:var(--nv-accent)}\nhtml.nativev2 .nvwelcome-inner p{font-size:13px;color:var(--nv-muted);margin:10px 0}\nhtml.nativev2 .nvwelcome-inner h2{margin:35px 0 8px;color:var(--nv-text);font-size:23px}\nhtml.nativev2 .nvwelcome-button{display:block;width:100%;margin-top:28px;background:var(--nv-grad);color:#fff;border:0;border-radius:14px;padding:15px;font-weight:750}\nhtml.nativev2 .nvthemeback{background:transparent;color:var(--nv-accent);border:0;padding:0 0 14px;font-weight:bold}\nhtml.nativev2[data-nvtheme=dark] .app table,html.nativev2[data-nvtheme=dark] .app td,html.nativev2[data-nvtheme=dark] .app th{background:var(--nv-card)!important;color:var(--nv-text)!important;border-color:var(--nv-line)!important}\n@media print{html.nativev2 .nvwelcome,html.nativev2 .nvback{display:none!important}}\n";
css.textContent += "html.nativev2[data-nvbackground=image] .app .content{background-image:linear-gradient(rgba(255,255,255,var(--biki-overlay,.65)),rgba(255,255,255,var(--biki-overlay,.65))),var(--biki-image)!important;background-position:center!important;background-size:cover!important;background-attachment:fixed!important}html.nativev2[data-nvtheme=dark][data-nvbackground=image] .app .content{background-image:linear-gradient(rgba(16,27,43,var(--biki-overlay,.65)),rgba(16,27,43,var(--biki-overlay,.65))),var(--biki-image)!important}html.nativev2 .nvscreen-tabs{display:flex;gap:7px;margin:0 0 13px;overflow:auto}html.nativev2 .nvscreen-tabs button{background:var(--nv-card);color:var(--nv-text);border:1px solid var(--nv-line);padding:10px 12px;border-radius:10px;white-space:nowrap;font-size:12px;font-weight:bold;flex:1}html.nativev2 .nvscreen-tabs button.selected{background:var(--nv-grad);color:white;border-color:transparent}html.nativev2 .nvscreen-tabs[hidden]{display:none!important}html.nativev2 .nvmore{bottom:var(--nv-nav-height,63px)!important}html.nativev2 .app .content{padding-bottom:calc(var(--nv-nav-height,63px) + 14px)!important}@media print{html.nativev2 .nvscreen-tabs{display:none!important}}";
css.textContent += 'html.nativev2.nvlogged.nvcloud body #bikiCloudTools.biki-cloud-compact.biki-cloud-open{display:block!important;position:fixed!important;inset:100px 13px auto!important;width:auto!important;max-width:none!important;max-height:calc(100dvh - 185px)!important;overflow:auto!important;z-index:1000004!important}html.nativev2.nvlogged.nvtelegram body #bikiTelegramPanel{display:block!important;position:fixed!important;inset:100px 13px auto!important;width:auto!important;max-width:none!important;z-index:1000004!important}html.nativev2.nvlogged.nvtelegram body #bikiTelegramBox:not([style*="display: none"]){position:relative!important;inset:auto!important;width:100%!important;max-width:none!important;max-height:calc(100dvh - 230px)!important;overflow:auto!important}';
const paths={home:'<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3z"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',plus:'<path d="M12 4v16M4 12h16"/>',due:'<path d="M5 4h14M5 9h14M7 4c10 0 10 11 0 11H5l10 7"/>',menu:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',sale:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM9 8h6M9 12h6"/>',ticket:'<path d="M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4zM15 7v3m0 3v1m0 3v2"/>',wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8V5l15-3v3m-3 7h6v5h-6z"/>',chart:'<path d="M3 3v18h18M8 16v-4m5 4V7m5 9V4"/>',box:'<path d="m3 7 9-4 9 4v11l-9 4-9-4zM3 7l9 5 9-5M12 12v10"/>',cloud:'<path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11zM12 11v6m-3-3 3 3 3-3"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'};
const icon=k=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+(paths[k]||paths.sale)+'</svg>';
const btn=(s,fn)=>{let b=d.createElement('button');b.type='button';b.textContent=s;b.onclick=fn;return b;};
const visible=e=>e&&!e.hidden&&getComputedStyle(e).display!=='none';
const logged=()=>!(by('bikiPublicHome')&&!by('bikiPublicHome').hidden)&&sessionStorage.getItem('biki_logged_in')==='yes'&&!visible(by('loginOverlay'))&&!visible(by('bikiCloudGate'))&&!visible(by('bikiPinOverlay'));
const allowed=id=>{let b=menu.querySelector('button[data-page="'+id+'"]');return b&&!b.hidden&&b.style.display!=='none'&&!b.disabled;};
let route=null, lastMenu=null, entering=true;
const defaultScreen={customers:['customerRows','Customers'],dues:['dueRows','Due Management'],products:['productRows','Products & Stock'],ticketBooking:['v2TicketOut','Booking History'],transactions:['txRows','Income & Expense']};
function clearRoute(){d.querySelectorAll('.nvhide').forEach(x=>x.classList.remove('nvhide'));route=null;}
function go(id,target,title,from){
 if(!logged())return;
 close();closeTools();clearRoute();
 if(!allowed(id)){alert('This option is unavailable for your account.');return;}
 menu.querySelector('button[data-page="'+id+'"]').click();
 if(q('.page.active')?.id!==id)return;
 const page=by(id), selected=[];
 if(!target&&defaultScreen[id]){target=defaultScreen[id][0];title=title||defaultScreen[id][1];}
 if(target){for(const key of target.split(',')){const e=by(key);if(e&&page.contains(e)){let panel=e.closest('.panel,.biki-pro-box,.billing-layout,.billing-preview');if(!panel||!page.contains(panel))panel=e;selected.push(panel);}}}
 if(id==='sales'&&!target){const layout=q('.billing-layout',page);if(layout)selected.push(layout);}
 if(target&&!selected.length){target=null;title='All '+id+' settings';}
 if(selected.length){
   const filter=(node)=>{for(const child of node.children){if(child.classList.contains('head')||child.classList.contains('nvscreen-tabs'))continue;if(selected.includes(child))continue;if(selected.some(x=>child.contains(x)))filter(child);else child.classList.add('nvhide');}};
   filter(page);
 }
 route={id,target:target||null,title:title||({dashboard:'Home',sales:'New Sale',customers:'Customers',dues:'Due Management',products:'Products & Stock',transactions:'Income & Expense',services:'Online Services',ticketBooking:'Ticket Booking Register',reports:'Business Reports',businessPro:'Business Pro',settings:'Settings'})[id]||id,from:from||null};
 window.scrollTo(0,0);sync();
}
let name=by('topBusinessName');if(name){let title=d.createElement('strong');title.id='nvScreenTitle';title.textContent='BIKI Billing';title.style.cssText='display:block;font-size:18px;color:white;line-height:1.2';name.before(title);}
let back=btn('‹',()=>backScreen());back.className='nvback';back.setAttribute('aria-label','Back');top.prepend(back);
let head=d.createElement('div');head.className='nvhead';let bell=btn('♧',()=>go('dashboard','v2NoticeList','Notifications'));bell.setAttribute('aria-label','Notifications');let profile=btn('AD',()=>open(true));head.append(bell,profile);top.appendChild(head);
let sum=d.createElement('div');sum.className='nvsummary';sum.innerHTML='<small>TODAY’S INVOICE SALES</small><div class="nvsales" id="nvSales">₹0</div><div class="nvfooter"><div><small>Today’s net income</small><strong id="nvProfit">₹0</strong><small>Income received: <span id="nvIncome">₹0</span></small></div></div>';q('.nvfooter',sum).append(btn('View report ›',()=>go('reports')));
let mini=d.createElement('div');mini.className='nvmini';[['Bills today','nvBills','sales'],['Total due','nvDue','dues'],['Low stock','nvStock','products']].forEach(([n,i,p])=>{let b=btn('',()=>go(p));b.innerHTML='<small>'+n+'</small><strong id="'+i+'">0</strong>';mini.append(b);});
let quick=d.createElement('div');quick.className='nvquick';[['New Sale','plus','sales'],['Customer','user','customers'],['Ticket','ticket','ticketBooking'],['Expense','wallet','transactions']].forEach(([n,k,p])=>{let b=btn('',()=>go(p,p==='ticketBooking'?'v2TicketCustomer':p==='transactions'?'txForm':null,n));b.innerHTML='<span class="nvicon">'+icon(k)+'</span>'+n;quick.append(b);});
let label=d.createElement('h3');label.textContent='Quick Actions';label.style.cssText='font-size:16px;margin:12px 0 10px;color:#173454';
let anchor=q('.biki-v2-kpis',dash);if(anchor)anchor.after(sum,mini,label,quick);else dash.prepend(sum,mini,label,quick);
let nav=d.createElement('div');nav.className='nvnav';nav.setAttribute('role','navigation');[['Home','home','dashboard'],['Sale','plus','sales'],['Due','due','dues'],['More','menu','more']].forEach(([n,k,p])=>{let b=btn('',()=>p==='more'?open(false):go(p));b.dataset.page=p;b.innerHTML=icon(k)+'<span>'+n+'</span>';nav.append(b);});app.append(nav);
let more=d.createElement('section');more.className='nvmore';app.append(more);
const screenTabs={
sales:[['New Sale',null],['Sales History','historyReset']],
customers:[['Customers','customerRows'],['Add Customer','customerForm']],
dues:[['Due List','dueRows'],['Add New Due','dueForm']],
products:[['Inventory','productRows'],['Add Product','productForm']],
transactions:[['Transactions','txRows'],['New Entry','txForm']],
ticketBooking:[['Booking History','v2TicketOut'],['New Booking','v2TicketCustomer']]
};
Object.entries(screenTabs).forEach(([id,items])=>{const page=by(id);if(!page)return;const bar=d.createElement('div');bar.className='nvscreen-tabs';items.forEach(([name,target])=>{let b=btn(name,()=>go(id,target,name));b.dataset.target=target||'';bar.append(b);});page.prepend(bar);});
// Preserve original edit action, then reveal the existing editor when a list is isolated.
d.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button||button.closest('.nvscreen-tabs,.nvmore,.nvnav'))return;
 const page=button.closest('.page');if(!page||!route||route.id!==page.id)return;
 if(!/edit|modify|change/i.test(button.textContent)&&!button.hasAttribute('data-edit'))return;
 const forms={sales:'saleFormTitle',customers:'customerForm',dues:'dueForm',products:'productForm',ticketBooking:'v2TicketCustomer'};
 const target=forms[page.id];if(!target)return;
 setTimeout(()=>{if(!logged()||q('.page.active')?.id!==page.id)return;const f=by(target);if(!f)return;clearRoute();window.scrollTo(0,0);f.scrollIntoView({block:'start',behavior:'smooth'});},100);
});
function close(){closeTools();more.classList.remove('open');sync();}
let toolMount=null,moreScreen='menu';
function closeTools(){if(toolMount){const {panel,placeholder,style}=toolMount;panel.classList.remove('nv-mounted-tool');placeholder.replaceWith(panel);if(style===null)panel.removeAttribute('style');else panel.setAttribute('style',style);toolMount=null;}moreScreen='menu';let t=by('bikiCloudMenuToggle');if(t&&t.getAttribute('aria-expanded')==='true')t.click();let b=by('bikiTelegramBox');if(b)b.style.display='none';d.documentElement.classList.remove('nvtelegram','nvcloud');}
function tools(k){
 if(!logged())return;closeTools();
 const toggle=by(k==='cloud'?'bikiCloudMenuToggle':'bikiTelegramToggle'),panel=by(k==='cloud'?'bikiCloudTools':'bikiTelegramPanel');
 more.replaceChildren();const back=btn('‹ Back to settings',()=>open(lastMenu==='account'));back.className='nvthemeback';const h=d.createElement('h2');h.textContent=k==='cloud'?'Cloud Tools':'Telegram Alerts';more.append(back,h);more.classList.add('open');moreScreen='tools';
 if(panel&&toggle){
  if(toggle.getAttribute('aria-expanded')!=='true')toggle.click();
  const placeholder=d.createComment('native tool location');panel.before(placeholder);toolMount={panel,placeholder,style:panel.getAttribute('style')};
  more.append(panel);panel.classList.add('nv-mounted-tool');
  for(const [key,val] of Object.entries({display:'block',position:'static',inset:'auto',width:'100%',maxWidth:'100%',maxHeight:'none',overflow:'visible',visibility:'visible',opacity:'1'}))panel.style.setProperty(key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),val,'important');
  panel.classList.add('biki-cloud-open');
  if(k==='telegram'){const box=by('bikiTelegramBox');if(box)box.style.setProperty('display','block','important');}
 }
 const fallback=btn('Open all website settings',()=>go('settings',null,'Settings',lastMenu));fallback.style.cssText='display:block;margin:16px 0;padding:12px;width:100%;border-radius:10px';more.append(fallback);
 if(!panel||!toggle){const msg=d.createElement('p');msg.textContent='Cloud controls are unavailable on this page. Open website settings below.';more.insertBefore(msg,fallback);}
 more.scrollTop=0;sync();
}
function action(a){location.href='bikiapp://'+a;}
function open(account){
 if(!logged())return;lastMenu=account?'account':'more';closeTools();more.replaceChildren();
 let h=d.createElement('div');h.style.cssText='display:flex;justify-content:space-between;align-items:center';let t=d.createElement('h2');t.textContent=account?'My Account':'All Services';let c=btn('Close',close);c.style.cssText='background:#e4edff;color:#155bd8;border:0;border-radius:10px;padding:10px';h.append(t,c);more.append(h);
 let search=d.createElement('input');search.type='search';search.placeholder='Find an option…';more.append(search);
 const item=(n,k,desc,p,target)=>allowed(p)?[n,k,desc,()=>go(p,target,n,account?'account':'more')]:null;
 function group(n,items){let section=d.createElement('section');section.className='nvgroup';let title=d.createElement('h3');title.textContent=n;let card=d.createElement('div');card.className='nvcard';items.filter(Boolean).forEach(([n,k,desc,f])=>{let b=btn('',f);b.innerHTML='<span class="nvicon">'+icon(k)+'</span><span style="flex:1">'+n+'<small>'+desc+'</small></span>›';card.append(b);});if(card.children.length){section.append(title,card);more.append(section);}}
 if(account&&allowed('settings'))group('Cloud & Backup',[['Cloud Tools','cloud','Firebase sync and backup',()=>tools('cloud')],['Telegram Alerts','sale','Notification settings',()=>tools('telegram')],item('Daily Backup','cloud','Download backup','businessPro','proDownloadBackup')]);
 if(!account){
 group('Billing & Customers',[item('New Sale','plus','Create invoice','sales'),item('Sales History','sale','View saved invoices','sales','historyReset'),item('Customers','user','Customer management','customers','customerRows'),item('Add Customer','plus','Create customer','customers','customerForm'),item('Due Management','due','Payments and balances','dues','dueRows'),item('Add New Due','plus','Create due entry','dues','dueForm')]);
 group('Services & Travel',[item('Ticket Booking Register','ticket','Bookings and original PDF','ticketBooking','v2TicketOut'),item('New Ticket Booking','plus','Passenger, journey and PDF','ticketBooking','v2TicketCustomer'),item('Online Services','sale','Service management','services')]);
 group('Stock & Accounts',[item('Products & Stock','box','Manage inventory','products','productRows'),item('Add Product','plus','Create stock item','products','productForm'),item('Income & Expense','wallet','Cash transactions','transactions','txRows'),item('New Entry','plus','Record income or expense','transactions','txForm'),item('Cash Drawer','wallet','Opening balance','businessPro','proOpening'),item('Service Commission','wallet','Service earnings','businessPro','proCommissionService'),item('Expense Categories','wallet','Expense summary','businessPro','proExpenseSummary')]);
 group('Reports',[item('Business Reports','chart','Business performance','reports'),item('Business Pro','chart','Advanced management','businessPro'),item('Advanced Profit','chart','Profit calculator','businessPro','proProfitMonth'),item('Daily Closing','chart','Daily accounts','businessPro','proClosingDate'),item('Customer History','user','Customer transactions','businessPro','proCustomerQuery'),item('Invoice WhatsApp Share','sale','Find and share invoices','businessPro','proInvoiceSearch'),item('Advanced Search','sale','Search records','businessPro','proSearchQuery'),item('Audit Log','lock','Activity history','businessPro','proAuditRows')]);
 if(allowed('settings'))group('Cloud & Backup',[item('Daily Backup','cloud','Download backup','businessPro','proDownloadBackup'),['Cloud Tools','cloud','Firebase sync and backup',()=>tools('cloud')],['Telegram Alerts','sale','Notification settings',()=>tools('telegram')]]);
 }
 group('Settings & Security',[item('Business Profile','user','Name, address, logo','settings','businessName'),item('Invoice Designer','sale','Receipt templates','settings','bikiInvoiceDesigner'),item('UPI QR Code','due','Payment settings','settings','upiQrSettings'),item('Staff Management','user','Staff accounts','settings','staffManagementPanel'),item('PIN Settings','lock','Change PIN','settings','pinSettingsForm'),item('All Settings','menu','Language, security and backup','settings')]);
 group('App controls',[['Fingerprint Login','lock','Enable or disable device biometric login',()=>{close();action('biometric-settings');}],['Screen Lock','lock','Lock current session',()=>{close();if(typeof window.bikiManualLock==='function')window.bikiManualLock();}],['Refresh','home','Reload website',()=>action('reload')],['Print current page','sale','Android print service',()=>{close();setTimeout(()=>action('print'),100);}],['Logout','user','Sign out',()=>{close();if(typeof window.logout==='function')window.logout();}]]);
 search.oninput=()=>{let s=search.value.toLowerCase();more.querySelectorAll('.nvgroup').forEach(g=>{let count=0;g.querySelectorAll('button').forEach(b=>{let ok=b.textContent.toLowerCase().includes(s);b.style.display=ok?'flex':'none';if(ok)count++;});g.style.display=count?'block':'none';});};
 more.classList.add('open');more.scrollTop=0;sync();
}
function nativeDailyStats(){
 const fmt=n=>'₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
 const day=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T ])/);return m?m[1]+'-'+m[2]+'-'+m[3]:'';};
 const today=typeof bikiLocalToday==='function'?bikiLocalToday():new Date().toLocaleDateString('en-CA');
 let records;try{records=typeof data!=='undefined'?data:JSON.parse(localStorage.getItem('biki_accounting_v1')||'null');}catch(e){return;}
 if(!records||!Array.isArray(records.sales)||!Array.isArray(records.transactions))return;
 const sales=records.sales.filter(x=>day(x.date)===today);
 const tx=records.transactions.filter(x=>day(x.date)===today);
 const sum=(xs,key)=>xs.reduce((a,x)=>a+(Number(x[key])||0),0);
 const values={nvSales:fmt(sum(sales,'total')),nvBills:String(sales.length),nvProfit:fmt(sum(tx.filter(x=>x.kind==='income'),'amount')-sum(tx.filter(x=>x.kind==='expense'),'amount')),nvIncome:fmt(sum(tx.filter(x=>x.kind==='income'),'amount'))};
 Object.entries(values).forEach(([id,value])=>{const el=by(id);if(el&&el.textContent!==value)el.textContent=value;});
}
function invoiceDay(value){const v=String(value||'').trim();const iso=v.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T ])/);if(iso)return iso[1]+'-'+iso[2]+'-'+iso[3];const local=v.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);return local?local[3]+'-'+local[2].padStart(2,'0')+'-'+local[1].padStart(2,'0'):'';}
function invoiceStats(records,today){const days=Array.from({length:7},(_,i)=>{const d=new Date(today+'T12:00:00');d.setDate(d.getDate()-6+i);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');});const sums=days.map(()=>0),counts=days.map(()=>0);for(const sale of records){const i=days.indexOf(invoiceDay(sale.date));if(i<0)continue;const n=Number(sale.total||0);if(Number.isFinite(n))sums[i]+=n;counts[i]++;}return {days,sums,counts};}
let invoiceSignature='';
function refreshInvoiceDashboard(){
 if(!logged())return;
 let records;try{records=typeof data!=='undefined'&&Array.isArray(data.sales)?data.sales:JSON.parse(localStorage.getItem('biki_accounting_v1')||'{}').sales;}catch(e){return;}
 if(!Array.isArray(records))return;
 const now=new Date(),today=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
 const {days,sums,counts}=invoiceStats(records,today),format=n=>'₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
 for(const [id,value] of [['nvSales',format(sums[6])],['nvBills',String(counts[6])]]){const el=by(id);if(el&&el.textContent!==value)el.textContent=value;}
 const old=by('v2SalesChart');if(!old)return;
 let chart=by('nvIndependentSalesChart');
 if(!chart){chart=d.createElement('div');chart.id='nvIndependentSalesChart';old.after(chart);}
 old.style.setProperty('display','none','important');
 chart.style.cssText='display:block!important;width:100%!important;height:auto!important;min-height:190px!important;visibility:visible!important;opacity:1!important;background:#101f33;border-radius:12px;padding:8px;box-sizing:border-box';
 const signature=JSON.stringify([days,sums]);if(chart.dataset.nvInvoiceSignature===signature&&chart.firstElementChild)return;
 const max=Math.max(1,...sums);
 const svg=d.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 350 190');svg.setAttribute('width','100%');svg.setAttribute('height','190');svg.style.cssText='display:block!important;visibility:visible!important;opacity:1!important';
 function node(tag,attrs,value){const el=d.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));if(value!==undefined)el.textContent=value;svg.append(el);}
 node('line',{x1:8,y1:153,x2:342,y2:153,stroke:'#94a3b8'});
 days.forEach((day,i)=>{const x=25+i*50,h=Math.max(3,Math.max(0,sums[i])/max*105);node('rect',{x:x-14,y:153-h,width:28,height:h,rx:4,fill:'#dfb65d'});node('text',{x,y:145-h,'text-anchor':'middle','font-size':10,fill:'#eed08a'},Math.round(sums[i]).toLocaleString('en-IN'));node('text',{x,y:172,'text-anchor':'middle','font-size':11,fill:'#a6b4c5'},day.slice(8)+'/'+day.slice(5,7));});
 chart.replaceChildren(svg);chart.dataset.nvInvoiceSignature=signature;

}

function sync(){
 let activePage=q('.page.active');
 if(route&&route.id!==activePage?.id)clearRoute();
 const signed=sessionStorage.getItem('biki_logged_in')==='yes';
 const publicHome=by('bikiPublicHome');
 if(publicHome&&!publicHome.hidden&&typeof window.bikiPublicOpenBilling==='function')window.bikiPublicOpenBilling();
 const publicShown=publicHome&&!publicHome.hidden;
 let ok=logged()&&!publicShown;
 d.documentElement.classList.toggle('nvsub',!!(ok&&activePage&&activePage.id!=='dashboard'||ok&&route&&route.title==='Notifications'));
 let ttl=by('nvScreenTitle');if(ttl){let v=route?.title||({dashboard:'BIKI Billing',sales:'New Sale',customers:'Customers',dues:'Due Management',products:'Products & Stock',transactions:'Income & Expense',services:'Online Services',ticketBooking:'Ticket Booking Register',reports:'Business Reports',businessPro:'Business Pro',settings:'Settings'})[activePage?.id]||'BIKI Billing';if(v==='Home')v='BIKI Billing';if(ttl.textContent!==v)ttl.textContent=v;}
 profile.textContent=d.body.classList.contains('biki-staff-mode')?'ST':'AD';if(nav.offsetHeight)d.documentElement.style.setProperty('--nv-nav-height',nav.offsetHeight+'px');d.querySelectorAll('.nvscreen-tabs button').forEach(b=>b.classList.toggle('selected',!!route&&b.closest('.page')?.id===route.id&&b.dataset.target===(route.target||'')));
 welcome.hidden=true;
 if(!signed&&wasSigned){entering=true;clearRoute();}
 wasSigned=signed;
 applyTheme();
d.documentElement.classList.toggle('nvlogged',ok);if(!ok){more.classList.remove('open');d.documentElement.classList.remove('nvtelegram');}let active=q('.page.active');nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',more.classList.contains('open')?b.dataset.page==='more':b.dataset.page===active?.id));[['nvDue','totalDue'],['nvStock','v2LowStock']].forEach(([a,b])=>{let x=by(a),y=by(b);if(x&&y&&x.textContent!==y.textContent)x.textContent=y.textContent;});if(ok){try{nativeDailyStats();}catch(e){console.warn('Daily stats',e);}try{refreshInvoiceDashboard();}catch(e){console.warn('Sales chart',e);}}}
function backScreen(){
 if(more.classList.contains('open')){if(moreScreen!=='menu'){open(lastMenu==='account');return true;}close();return true;}
 if(d.documentElement.classList.contains('nvtelegram')||by('bikiCloudMenuToggle')?.getAttribute('aria-expanded')==='true'){closeTools();return true;}
 if(logged()&&(q('.page.active')?.id!=='dashboard'||route?.title==='Notifications')){const from=route?.from;go('dashboard');if(from)open(from==='account');return true;}
 if(!logged()&&entering&&sessionStorage.getItem('biki_logged_in')!=='yes'){entering=true;welcome.hidden=true;return true;}
 return true;
}
window.__bikiNativeBack=backScreen;
let wasSigned=sessionStorage.getItem('biki_logged_in')==='yes';
const welcome=d.createElement('section');welcome.className='nvwelcome';welcome.hidden=wasSigned;
welcome.innerHTML='<div class="nvwelcome-inner"><img src="./favicon.png" alt="BIKI" onerror="this.style.display=\'none\'"><div class="nvwelcome-title">BIKI Billing <span>PRO</span></div><p>BIKI ONLINE SERVICE CENTER</p><h2>Manage your business</h2><p>Sales, customers, payments and reports — all in one place.</p></div>';
const start=btn('Continue to secure login',()=>{entering=true;welcome.hidden=true;if(typeof window.bikiPublicOpenBilling==='function')window.bikiPublicOpenBilling();});start.className='nvwelcome-button';welcome.firstElementChild.append(start);
d.body.append(welcome);
if(typeof window.bikiPublicOpenBilling==='function')window.bikiPublicOpenBilling();
function applyTheme(){let root=d.documentElement;if(root.dataset.nvtheme!=='signature')root.dataset.nvtheme='signature';if(root.dataset.nvbackground!=='default')root.dataset.nvbackground='default';}
function themeScreen(account){open(account);}

let bioAvailable=false,bioEnabled=false;
const bioStart=btn('Sign in with fingerprint',()=>action('biometric-login'));
bioStart.className='nvwelcome-button';bioStart.hidden=true;
bioStart.style.cssText='margin-top:12px;background:var(--nv-card);color:var(--nv-text);border:1px solid var(--nv-line)';
welcome.firstElementChild.append(bioStart);
const bioCloud=btn('Sign in with fingerprint',()=>action('biometric-login'));
bioCloud.hidden=true;bioCloud.style.cssText='display:none;width:100%;margin-top:12px;border-radius:12px;padding:13px;background:#eaf1ff;color:#155bd8;font-weight:bold;border:1px solid #cdddf8';
function attachBioCloud(){let form=by('bikiCloudForm');if(form&&!bioCloud.isConnected)form.after(bioCloud);bioCloud.hidden=!bioEnabled||!bioAvailable;bioCloud.style.display=bioEnabled&&bioAvailable?'block':'none';}
window.__bikiBiometricStatus=(enabled,available)=>{bioEnabled=enabled;bioAvailable=available;bioStart.hidden=!enabled||!available;bioStart.style.display=enabled&&available?'block':'none';attachBioCloud();};
window.__bikiFingerprintSubmit=(email,password)=>{
 if(!bioEnabled||!bioAvailable)return false;
 if(typeof window.bikiPublicOpenBilling==='function')window.bikiPublicOpenBilling();
 entering=true;welcome.hidden=true;
 try{
  const form=by('bikiCloudForm'),u=by('bikiCloudEmail'),p=by('bikiCloudPassword');
  if(!form||!u||!p||typeof firebase==='undefined')return false;
  const current=firebase.auth().currentUser;
  if(current&&current.email!==email)return false;
  if(current&&sessionStorage.getItem('biki_logged_in')==='yes'&&!visible(by('bikiCloudGate')))return true;
  u.value=email;p.value=password;
  form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  setTimeout(()=>{if(p.value===password)p.value='';},1500);
  return true;
 }catch(e){return false;}
};
attachBioCloud();


const sigStyle=d.createElement('style');sigStyle.id='signature-app-style';sigStyle.textContent="\nhtml.nativev2[data-nvtheme=signature]{--nv-bg:#071322;--nv-card:#101f33;--nv-text:#f4f7fc;--nv-muted:#a6b7cd;--nv-line:#30455c;--nv-accent:#f1c970;--nv-header:#09192c;--nv-grad:#d7ab52;--nv-input:#14243a;color-scheme:dark}\nhtml.nativev2[data-nvtheme=signature],html.nativev2[data-nvtheme=signature] body,html.nativev2[data-nvtheme=signature] .app,html.nativev2[data-nvtheme=signature] .app>main,html.nativev2[data-nvtheme=signature] .app .content,html.nativev2[data-nvtheme=signature] .app .page{background:#071322!important;background-image:none!important;color:#f4f7fc!important;max-width:100%!important}\nhtml.nativev2[data-nvtheme=signature] body:before,html.nativev2[data-nvtheme=signature] body:after,html.nativev2[data-nvtheme=signature] .app:before,html.nativev2[data-nvtheme=signature] .app .content:before{background:none!important;background-image:none!important}\nhtml.nativev2[data-nvtheme=signature] .app .top{background:#09192c!important;border-bottom:1px solid #765e31!important;color:#fff!important}\nhtml.nativev2[data-nvtheme=signature] .nvhead button,html.nativev2[data-nvtheme=signature] .nvicon{background:#203044!important;color:#efc873!important}\nhtml.nativev2[data-nvtheme=signature] .nvnav{grid-template-columns:repeat(4,minmax(0,1fr))!important;background:#0d1a2c!important;border-top:1px solid #68522d!important}\nhtml.nativev2[data-nvtheme=signature] .nvnav button{background:transparent!important;color:#a6b4c5!important;min-height:52px!important}\nhtml.nativev2[data-nvtheme=signature] .nvnav button.active{background:#293349!important;color:#f2cb77!important}\nhtml.nativev2[data-nvtheme=signature] .nvsummary{background:linear-gradient(140deg,#17283f,#0c1b2b)!important;border:1px solid #b99549!important;box-shadow:none!important}\nhtml.nativev2[data-nvtheme=signature] .nvsales,html.nativev2[data-nvtheme=signature] .nvsummary small,html.nativev2[data-nvtheme=signature] .nvfooter strong{color:#f2cf82!important}\nhtml.nativev2[data-nvtheme=signature] .nvmini{grid-template-columns:repeat(2,minmax(0,1fr))!important}\nhtml.nativev2[data-nvtheme=signature] .nvquick{grid-template-columns:repeat(4,minmax(0,1fr))!important}\nhtml.nativev2[data-nvtheme=signature] .nvmini button,html.nativev2[data-nvtheme=signature] .nvquick button,html.nativev2[data-nvtheme=signature] .nvcard button{color:#f2f6fb!important;background:#101f33!important;border-color:#30455c!important}\nhtml.nativev2[data-nvtheme=signature] .nvcard,html.nativev2[data-nvtheme=signature] .app .page .panel,html.nativev2[data-nvtheme=signature] .app .page .stat,html.nativev2[data-nvtheme=signature] .app .page .biki-pro-box{background:#101f33!important;background-image:none!important;color:#f5f7fb!important;border-color:#30455c!important;box-shadow:none!important}\nhtml.nativev2[data-nvtheme=signature] .app .page input:not([type=checkbox]):not([type=radio]):not([type=color]),html.nativev2[data-nvtheme=signature] .app .page select,html.nativev2[data-nvtheme=signature] .app .page textarea,html.nativev2[data-nvtheme=signature] .nvmore input{background:#14243a!important;color:#f4f7fc!important;border:1px solid #40566d!important;border-radius:10px!important}\nhtml.nativev2[data-nvtheme=signature] .app .page input::placeholder,html.nativev2[data-nvtheme=signature] .app .page textarea::placeholder{color:#9eafc4!important}\nhtml.nativev2[data-nvtheme=signature] .app .page .btn.primary,html.nativev2[data-nvtheme=signature] .app .page button.primary,html.nativev2[data-nvtheme=signature] .nvscreen-tabs button.selected{background:linear-gradient(135deg,#f6d589,#c89a42)!important;color:#081526!important;border-color:#ddb660!important}\nhtml.nativev2[data-nvtheme=signature] .app .page h1,html.nativev2[data-nvtheme=signature] .app .page h2,html.nativev2[data-nvtheme=signature] .app .page h3,html.nativev2[data-nvtheme=signature] .app .page label{color:#f0f4f9!important}\nhtml.nativev2[data-nvtheme=signature] .app .page table,html.nativev2[data-nvtheme=signature] .app .page tbody,html.nativev2[data-nvtheme=signature] .app .page tr,html.nativev2[data-nvtheme=signature] .app .page td{background:#101f33!important;color:#eef3f8!important;border-color:#30455c!important}\nhtml.nativev2[data-nvtheme=signature] .app .page th{background:#1d3049!important;color:#eac77e!important;border-color:#30455c!important}\nhtml.nativev2[data-nvtheme=signature] #appearanceSettings,html.nativev2[data-nvtheme=signature] #bikiV2Settings{display:none!important}\nhtml.nativev2 #bikiPublicHome,html.nativev2 #bikiPublicBack,html.nativev2 .nvwelcome{display:none!important}\n@media print{html.nativev2[data-nvtheme=signature] .app .page table,html.nativev2[data-nvtheme=signature] .app .page tbody,html.nativev2[data-nvtheme=signature] .app .page tr,html.nativev2[data-nvtheme=signature] .app .page td,html.nativev2[data-nvtheme=signature] .app .page th{background:white!important;color:black!important}}\n";d.head.append(sigStyle);
window.__bikiSignatureAuthorized=()=>sessionStorage.getItem('biki_logged_in')==='yes'&&!visible(by('loginOverlay'))&&!visible(by('bikiCloudGate'))&&!!(window.firebase&&firebase.auth().currentUser);
let sigAttempt=false,sigStarted=false;
window.__bikiSignatureLogin=(email,password)=>{
  const f=by('bikiCloudForm'),u=by('bikiCloudEmail'),p=by('bikiCloudPassword'),b=by('bikiCloudLogin');
  if(!f||!u||!p||!b||b.disabled||typeof f.onsubmit!=='function'||typeof firebase==='undefined')return false;
  sigAttempt=true;sigStarted=false;u.value=email;p.value=password;
  f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));sigStarted=b.disabled;
  if(!sigStarted){p.value='';sigAttempt=false;return false;}return true;
};
window.__bikiSignatureLoginState=()=>{
  const b=by('bikiCloudLogin'),msg=by('bikiCloudMsg')?.textContent||'';
  if(!sigAttempt||!sigStarted||!b)return {state:'error'};
  if(b.disabled)return {state:'pending'};
  if(/fail|error|expired|interrupted/i.test(msg)){sigAttempt=false;return {state:'error'};}
  if(window.__bikiSignatureAuthorized()){sigAttempt=false;return {state:'ok'};}
  return {state:'error'};
};

sync();setInterval(()=>{sync();attachBioCloud();},400);
})();