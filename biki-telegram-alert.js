/* BIKI Telegram alerts. Token remains in Supabase secrets. */
(()=>{'use strict';
const URL='https://kxlzoylmepbvfnacuzgk.supabase.co/functions/v1/biki-telegram-alert';
const KEY='biki_telegram_pending_v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}};
let sending=false;
function enqueue(payload,id){
 const queue=read();if(queue.some(x=>x.id===id))return;
 queue.push({id,payload,created:Date.now()});
 localStorage.setItem(KEY,JSON.stringify(queue.slice(-100)));flush();
}
async function flush(){
 if(sending||!navigator.onLine)return;
 const session=await window.bikiPdfCloud?.getSession?.().catch(()=>null);
 if(!session?.access_token)return;
 sending=true;
 try{for(const item of read().slice(0,20)){
   const response=await fetch(URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':'sb_publishable_sEV_dsJ7nO2ZNOUgonnmbw_WwrdlSqI'},body:JSON.stringify(item.payload)});
   if(!response.ok){console.warn('Telegram alert not sent:',response.status);break}
   localStorage.setItem(KEY,JSON.stringify(read().filter(x=>x.id!==item.id)));
 }}catch(err){console.warn('Telegram alert queued for retry',err)}finally{sending=false}
}
window.bikiTelegramAlert={enqueue,flush,pending:()=>read().length};
window.addEventListener('online',flush);
window.addEventListener('focus',flush);
setInterval(flush,60000);
setTimeout(flush,2500);
})();
