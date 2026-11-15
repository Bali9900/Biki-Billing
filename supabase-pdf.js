/* BIKI private PDF cloud: Supabase Auth (separate from Firebase Auth). */
(()=>{'use strict';
const URL_BASE='https://kxlzoylmepbvfnacuzgk.supabase.co';
const KEY='sb_publishable_sEV_dsJ7nO2ZNOUgonnmbw_WwrdlSqI';
const BUCKET='ticket-pdfs';
let client;
function sb(){if(!client){if(!window.supabase)throw Error('Supabase library did not load. Check internet.');client=window.supabase.createClient(URL_BASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}})}return client}
async function auth(){const {data,error}=await sb().auth.getUser();if(error||!data.user)throw Error('Connect PDF Cloud account first');if(data.user.email?.toLowerCase()!=='galimpur01@gmail.com')throw Error('This email is not allowed for the private PDF bucket');return data.user}
function pathFor(id){return 'owner/'+encodeURIComponent(String(id))+'.pdf'}
async function upload(id,file){await auth();const path=pathFor(id);const {error}=await sb().storage.from(BUCKET).upload(path,file,{upsert:true,contentType:'application/pdf'});if(error)throw error;return path}
async function download(path){await auth();const {data,error}=await sb().storage.from(BUCKET).download(path);if(error)throw error;return data}
async function remove(path){await auth();const {error}=await sb().storage.from(BUCKET).remove([path]);if(error)throw error}

window.bikiPdfCloud = {
  upload,
  download,
  remove,
  getSession: async () => {
    const { data, error } = await sb().auth.getSession();
    if (error) throw error;
    return data.session;
  }
};

function init(){const $=id=>document.getElementById(id);if(!$('pdfCloudLogin'))return;
const status=async()=>{try{const {data}=await sb().auth.getUser();$('pdfCloudStatus').textContent=data.user?'Connected: '+data.user.email:'Not connected — PDF upload requires Supabase login'}catch(e){$('pdfCloudStatus').textContent=e.message}};
$('pdfCloudLogin').onclick=async()=>{try{const {error}=await sb().auth.signInWithPassword({email:$('pdfCloudEmail').value.trim(),password:$('pdfCloudPassword').value});if(error)throw error;await status()}catch(e){alert('Cloud login: '+e.message)}};
$('pdfCloudSignup').onclick=async()=>{try{const email=$('pdfCloudEmail').value.trim();if(email.toLowerCase()!=='galimpur01@gmail.com')throw Error('Use the authorized owner email');const password=$('pdfCloudPassword').value;if(password.length<8)throw Error('Use a password of at least 8 characters');const {data,error}=await sb().auth.signUp({email,password});if(error)throw error;alert(data.session?'Cloud account created and signed in.':'Account created. Check email for confirmation, then click Connect PDF Cloud.');await status()}catch(e){alert('Cloud signup: '+e.message)}};
$('pdfCloudLogout').onclick=async()=>{await sb().auth.signOut();await status()};
$('pdfCloudMigrate').onclick=async()=>{if(!confirm('Upload old PDFs stored in this browser to Supabase Cloud? Keep backups.'))return;try{await auth();const tickets=(typeof v==='function'?v().tickets:[])||[];let count=0,failed=0;for(const t of tickets){if(t.pdfCloudPath||!t.pdfName)continue;try{const file=await ticketPdfOperation(t.id,'get');if(!file)continue;t.pdfCloudPath=await upload(t.id,file);count++;}catch(e){failed++;console.error('PDF migration',t.id,e)}}if(count){persist();if(typeof window.tickets==='function')window.tickets()}alert('Migrated '+count+' PDF(s). Failed '+failed+'. Check another PC after sync.')}catch(e){alert(e.message)}};
status();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
