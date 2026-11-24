/* BIKI private PDF cloud. Persistent Supabase Auth independent of Billing/Firebase login. */
(()=>{'use strict';
const URL_BASE='https://kxlzoylmepbvfnacuzgk.supabase.co';
const KEY='sb_publishable_sEV_dsJ7nO2ZNOUgonnmbw_WwrdlSqI';
const BUCKET='ticket-pdfs';
const OWNER='galimpur01@gmail.com';
const STORAGE_KEY='sb-kxlzoylmepbvfnacuzgk-auth-token'; // Supabase default: preserve existing sessions
let client;
function sb(){
 if(!client){
  if(!window.supabase)throw Error('Supabase library did not load. Check internet.');
  client=window.supabase.createClient(URL_BASE,KEY,{
   auth:{storageKey:STORAGE_KEY,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,
    storage:window.localStorage}
  });
 }
 return client;
}
async function auth(){
 const {data,error}=await sb().auth.getUser();
 if(error||!data.user)throw Error('Connect PDF Cloud account first');
 if(data.user.email?.toLowerCase()!==OWNER)throw Error('This email is not allowed for the private PDF bucket');
 return data.user;
}
function pathFor(id){return 'owner/'+encodeURIComponent(String(id))+'.pdf'}
async function upload(id,file){await auth();const path=pathFor(id);const {error}=await sb().storage.from(BUCKET).upload(path,file,{upsert:true,contentType:'application/pdf'});if(error)throw error;return path}
async function download(path){await auth();const {data,error}=await sb().storage.from(BUCKET).download(path);if(error)throw error;return data}
async function remove(path){await auth();const {error}=await sb().storage.from(BUCKET).remove([path]);if(error)throw error}
window.bikiPdfCloud={upload,download,remove,getSession:async()=>{const {data,error}=await sb().auth.getSession();if(error)throw error;return data.session}};
function init(){
 const $=id=>document.getElementById(id);
 if(!$('pdfCloudLogin'))return;
 const status=async()=>{
  try{
   const {data,error}=await sb().auth.getUser();
   const el=$('pdfCloudStatus');if(!el)return;
   if(data?.user?.email?.toLowerCase()===OWNER){el.textContent='Connected: '+data.user.email+' (Auto Restore ON)';}
   else if(error && !navigator.onLine){el.textContent='Offline — saved session will be checked when internet returns';}
   else{el.textContent='Not connected — PDF upload requires Supabase login';}
  }catch(e){if($('pdfCloudStatus'))$('pdfCloudStatus').textContent='Cloud status: '+e.message;}
 };
 $('pdfCloudLogin').onclick=async()=>{
  try{
   const {error}=await sb().auth.signInWithPassword({email:$('pdfCloudEmail').value.trim(),password:$('pdfCloudPassword').value});
   if(error)throw error;
   $('pdfCloudPassword').value='';await status();
  }catch(e){alert('Cloud login: '+e.message)}
 };
 $('pdfCloudSignup').onclick=async()=>{
  try{
   const email=$('pdfCloudEmail').value.trim();if(email.toLowerCase()!==OWNER)throw Error('Use the authorized owner email');
   const password=$('pdfCloudPassword').value;if(password.length<8)throw Error('Use a password of at least 8 characters');
   const {data,error}=await sb().auth.signUp({email,password});if(error)throw error;
   $('pdfCloudPassword').value='';
   alert(data.session?'Cloud account created and signed in.':'Account created. Check email for confirmation, then click Connect PDF Cloud.');await status();
  }catch(e){alert('Cloud signup: '+e.message)}
 };
 $('pdfCloudLogout').onclick=async()=>{
  if(!confirm('Disconnect PDF Cloud on this browser? You will need to sign in again.'))return;
  try{const {error}=await sb().auth.signOut();if(error)throw error;await status()}catch(e){alert('Cloud disconnect: '+e.message)}
 };
 $('pdfCloudMigrate').onclick=async()=>{
  if(!confirm('Upload old PDFs stored in this browser to Supabase Cloud? Keep backups.'))return;
  try{
   await auth();const tickets=(typeof v==='function'?v().tickets:[])||[];let count=0,failed=0;
   for(const t of tickets){if(t.pdfCloudPath||!t.pdfName)continue;
    try{const file=await ticketPdfOperation(t.id,'get');if(!file)continue;t.pdfCloudPath=await upload(t.id,file);count++}
    catch(e){failed++;console.error('PDF migration',t.id,e)}
   }
   if(count){persist();if(typeof window.tickets==='function')window.tickets()}
   alert('Migrated '+count+' PDF(s). Failed '+failed+'. Check another PC after sync.');
  }catch(e){alert(e.message)}
 };
 try{sb().auth.onAuthStateChange(()=>{void status()})}catch(e){console.warn('Cloud auth listener:',e)}
 void status();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
