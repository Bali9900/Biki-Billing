/* BIKI Booking History — 7-day customer PDF sharing. Customer pages never require Billing login. */
(()=>{
'use strict';
const HOST='https://bikionlineservicecenter.github.io/';
const CLOUD_ORIGIN='https://kxlzoylmepbvfnacuzgk.supabase.co';
const HASH_PREFIX='#ticket=';
const SHORT_HASH='#t=';
const SHORT_API=CLOUD_ORIGIN+'/functions/v1/biki-ticket-short';
const TTL=604800000;
const root=document.documentElement;
const guest=location.hash.startsWith(HASH_PREFIX)||location.hash.startsWith(SHORT_HASH);
if(guest){
  root.setAttribute('data-biki-ticket-guest','');
  const st=document.createElement('style');
  st.id='biki-ticket-guest-style';
  st.textContent='html[data-biki-ticket-guest] body > :not(#bikiTicketGuest){display:none!important}html[data-biki-ticket-guest] body{margin:0!important;background:#f0f5fd!important;overflow:auto!important}#bikiTicketGuest{display:block!important;position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#f0f5fd;color:#173255;font:15px Arial,"Noto Sans Bengali",sans-serif;padding:24px 12px;box-sizing:border-box}#bikiTicketGuest *{box-sizing:border-box}#bikiTicketGuest .bt-card{max-width:860px;margin:0 auto;background:#fff;border:1px solid #d9e6f6;border-radius:18px;overflow:hidden;box-shadow:0 10px 40px #0b36741c}#bikiTicketGuest header{padding:20px;background:#0c459c;color:white;text-align:center}#bikiTicketGuest header img{width:57px;height:57px;object-fit:contain;background:#fff;border-radius:12px;margin-bottom:7px}#bikiTicketGuest h1{font-size:20px;margin:8px 0}#bikiTicketGuest .bt-body{padding:22px}#bikiTicketGuest .bt-buttons{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}#bikiTicketGuest a.bt-btn{display:inline-block;padding:12px 17px;border-radius:9px;background:#0a57c8;color:#fff;text-decoration:none;font-weight:700}#bikiTicketGuest a.bt-btn.secondary{background:#eef4ff;color:#164c95}#bikiTicketGuest iframe{width:100%;height:min(70vh,720px);border:1px solid #dae5f3;border-radius:10px;background:white}#bikiTicketGuest .bt-notice{padding:13px;border-radius:9px;background:#eff6ff;line-height:1.55}#bikiTicketGuest .bt-error{background:#fff0f0;color:#a12727}';
  document.head.append(st);
}
function safeUrl(value){
 const u=new URL(value);
 if(u.origin!==CLOUD_ORIGIN||!u.pathname.startsWith('/storage/v1/object/sign/ticket-pdfs/'))throw Error('Invalid ticket link');
 if(!u.searchParams.has('token'))throw Error('Missing secure ticket token');
 return u.href;
}
function unpack(token){
 if(typeof token!=='string'||token.length>16000||!/^[a-zA-Z0-9_-]+$/.test(token))throw Error('Invalid ticket link');
 const base64=token.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-token.length%4)%4);
 const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
 const p=JSON.parse(new TextDecoder().decode(bytes));
 if(p.v!==1||!Number.isFinite(p.expires)||p.expires<Date.now()||p.expires>Date.now()+TTL+120000)throw Error('This ticket link has expired or is invalid');
 return {view:safeUrl(p.view),download:safeUrl(p.download),expires:p.expires};
}
async function fetchShort(code){
 if(!/^[A-Za-z0-9_-]{12,64}$/.test(code))throw Error('Invalid short ticket code');
 const response=await fetch(SHORT_API+'?code='+encodeURIComponent(code),{cache:'no-store'});
 if(!response.ok)throw Error('Short ticket link expired or unavailable');
 const p=await response.json();
 if(!Number.isFinite(p.expires)||p.expires<Date.now()||p.expires>Date.now()+TTL+120000)throw Error('Expired short ticket link');
 return {view:safeUrl(p.view),download:safeUrl(p.download),expires:p.expires};
}
async function guestPage(){
 const host=document.createElement('main');
 host.id='bikiTicketGuest';
 const card=document.createElement('div');card.className='bt-card';host.append(card);
 const hdr=document.createElement('header');
 const logo=document.createElement('img');logo.src='favicon.png';logo.alt='MB Logo';hdr.append(logo);
 const h=document.createElement('h1');h.textContent='BIKI ONLINE SERVICE CENTER';hdr.append(h);
 const loc=document.createElement('div');loc.textContent='Galimpur Bazar, Chanchal, Malda';hdr.append(loc);card.append(hdr);
 const body=document.createElement('div');body.className='bt-body';card.append(body);
 const loading=document.createElement('p');loading.className='bt-notice';loading.textContent='Opening your secure ticket…';body.append(loading);
 try{
   const short=location.hash.startsWith(SHORT_HASH);
   const token=location.hash.slice(short?SHORT_HASH.length:HASH_PREFIX.length);
   const data=short?await fetchShort(token):unpack(token);
   loading.remove();
   const title=document.createElement('h2');title.textContent='Your Travel Ticket PDF';body.append(title);
   const notice=document.createElement('p');notice.className='bt-notice';
   notice.textContent='Your ticket is available to view and download until '+new Date(data.expires).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})+'. Please keep this private link secure.';
   body.append(notice);
   const buttons=document.createElement('div');buttons.className='bt-buttons';
   const view=document.createElement('a');view.className='bt-btn secondary';view.href=data.view;view.target='_blank';view.rel='noopener noreferrer';view.textContent='📄 View Ticket';
   const down=document.createElement('a');down.className='bt-btn';down.href=data.download;down.target='_blank';down.rel='noopener noreferrer';down.textContent='⬇ Download PDF';
   buttons.append(view,down);body.append(buttons);
   const frame=document.createElement('iframe');frame.src=data.view;frame.title='Ticket PDF preview';frame.referrerPolicy='no-referrer';body.append(frame);
   const foot=document.createElement('p');foot.textContent='Thank you for choosing BIKI ONLINE SERVICE CENTER';body.append(foot);
 }catch(e){
   loading.remove();
   const n=document.createElement('p');n.className='bt-notice bt-error';n.textContent='Ticket link expired or invalid. Contact BIKI ONLINE SERVICE CENTER for a new 7-day link.';body.append(n);
 }
 document.body.append(host);
}
if(guest){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void guestPage()},{once:true});else void guestPage();
 return;
}
const selector='[data-biki-ticket-share]';
let busy=false;
const escapeText=s=>String(s||'');
const b64json=obj=>{
 const bytes=new TextEncoder().encode(JSON.stringify(obj));
 let bin='';for(const b of bytes)bin+=String.fromCharCode(b);
 return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
};
function bookingById(id){
 let state=null;
 try{state=typeof data!=='undefined'?data:null}catch(_){}
 const tickets=state?.proV2?.tickets;
 return Array.isArray(tickets)?tickets.find(t=>String(t.id)===String(id)):null;
}
function buttons(root){
 root.querySelectorAll('[data-ticket-edit]').forEach(edit=>{
  const actions=edit.closest('.ticket-history-actions');
  if(!actions||actions.querySelector(selector))return;
  const id=edit.getAttribute('data-ticket-edit');
  if(!id)return;
  const ticket=bookingById(id);
  if(!ticket?.pdfName)return;
  const b=document.createElement('button');b.type='button';b.setAttribute('data-biki-ticket-share',id);b.textContent='🔗 Share Ticket Link';b.title='Create a secure PDF link active for 7 days';b.className='biki-share-ticket-button';actions.append(b);
 });
}
function openDialog(link,ticket,expires){
 const old=document.getElementById('bikiShareDialog');old?.remove();
 const overlay=document.createElement('div');overlay.id='bikiShareDialog';
 overlay.style.cssText='position:fixed;inset:0;background:#061c3cb8;display:grid;place-items:center;padding:16px;z-index:2147483646;font:14px Arial,sans-serif';
 const card=document.createElement('div');card.style.cssText='max-width:560px;width:100%;background:#fff;color:#193956;border-radius:16px;padding:22px;box-shadow:0 20px 60px #0004';
 const heading=document.createElement('h2');heading.textContent='🔗 Ticket Share Link';heading.style.margin='0 0 10px';card.append(heading);
 const description=document.createElement('p');description.textContent='Active for 7 days, until '+new Date(expires).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})+'. Customer can view or download the PDF without login.';card.append(description);
 const field=document.createElement('textarea');field.readOnly=true;field.value=link;field.rows=4;field.style.cssText='width:100%;padding:10px;box-sizing:border-box;border:1px solid #cad9ef;border-radius:8px;overflow-wrap:anywhere';card.append(field);
 const actions=document.createElement('div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:9px;margin-top:13px';
 function add(label,fn,bg){const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='padding:10px 13px;border:0;border-radius:8px;background:'+bg+';color:white;cursor:pointer';b.onclick=fn;actions.append(b);}
 const message=['🚆 BIKI ONLINE SERVICE CENTER','','Dear Customer,','Your booked ticket is ready.','','🎫 Ticket Download Link:',link,'','📥 View & Download Your Ticket','⏳ Link Validity: 7 Days','','Thank you for choosing us! 🙏','','BIKI ONLINE SERVICE CENTER','Galimpur Bazar, Chanchal, Malda'].join('\n');
 async function copy(value,label){try{await navigator.clipboard.writeText(value);alert(label+' copied')}catch(_){const temp=document.createElement('textarea');temp.value=value;temp.style.cssText='position:fixed;left:-10000px;top:0';document.body.append(temp);temp.select();const ok=document.execCommand('copy');temp.remove();if(ok)alert(label+' copied');else alert('Copy failed. Please select the text and copy manually.');}}
 add('📋 Copy Link',()=>copy(link,'Ticket link'),'#1757b2');
 add('📄 Copy Message',()=>copy(message,'Ticket message'),'#3269c4');
 add('🟢 Share WhatsApp',()=>{
  const digits=String(ticket.phone||'').replace(/\D/g,'');
  const num=digits.length===10?'91'+digits:digits.length===12&&digits.startsWith('91')?digits:'';
  window.open('https://wa.me/'+num+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
 },'#16834d');
 add('Close',()=>overlay.remove(),'#52657d');
 card.append(actions);overlay.append(card);overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});document.body.append(overlay);
}
async function share(button){
 if(busy)return;
 const id=button.getAttribute('data-biki-ticket-share');
 const ticket=bookingById(id);
 if(!ticket?.pdfName)return alert('Ticket PDF is not available.');
 if(!ticket.pdfCloudPath)return alert('This PDF is saved only on the original PC. Upload/migrate it to Supabase PDF Cloud before sharing.');
 if(!window.bikiPdfCloud?.createShareLinks)return alert('PDF Cloud is not ready. Reload the page.');
 busy=true;button.disabled=true;const old=button.textContent;button.textContent='Creating 7-day link…';
 try{
  let result;
  try{
   const session=await window.bikiPdfCloud.getSession();
   if(!session?.access_token)throw Error('PDF Cloud session expired');
   const response=await fetch(SHORT_API,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({path:ticket.pdfCloudPath,filename:ticket.pdfName})});
   const body=await response.json();
   if(!response.ok||!body.code)throw Error(body.error||'Short link service unavailable');
   result={url:HOST+SHORT_HASH+body.code,expires:body.expires};
  }catch(shortError){
   console.warn('Short ticket link unavailable; using secure long link',shortError);
   const links=await window.bikiPdfCloud.createShareLinks(ticket.pdfCloudPath,ticket.pdfName);
   result={url:HOST+HASH_PREFIX+b64json({v:1,view:links.view,download:links.download,expires:links.expires}),expires:links.expires};
  }
  openDialog(result.url,ticket,result.expires);
 }catch(err){alert('Could not create ticket share link: '+(err?.message||String(err)));}
 finally{busy=false;button.disabled=false;button.textContent=old;}
}
function init(){
 const area=document.getElementById('v2TicketOut');if(!area)return;
 const style=document.createElement('style');style.textContent='.ticket-history-actions .biki-share-ticket-button{background:#1757b2!important;color:#fff!important;border:1px solid #1757b2!important}.ticket-history-actions .biki-share-ticket-button:disabled{opacity:.5;cursor:wait}';document.head.append(style);
 buttons(area);
 new MutationObserver(()=>buttons(area)).observe(area,{childList:true,subtree:true});
 area.addEventListener('click',e=>{
  const button=e.target.closest(selector);if(!button||!area.contains(button))return;
  e.preventDefault();e.stopImmediatePropagation();void share(button);
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();