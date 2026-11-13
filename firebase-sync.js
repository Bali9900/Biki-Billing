/* BIKI Firebase sync adapter: existing features remain in index.html.
 * One trusted owner account, Firestore documents per localStorage key.
 * IMPORTANT: data is loaded from cloud BEFORE dashboard access is granted.
 */
(()=>{'use strict';
const syncKeys=['biki_accounting_v1','biki_business_name','biki_business_address','biki_business_mobile','biki_business_mobile2','biki_business_logo','biki_upi_qr_image','biki_bg_mode','biki_bg_overlay','biki_bg_image','biki_invoice_design_v2','biki_theme_v2'];
const keySet=new Set(syncKeys);
const originalSet=Storage.prototype.setItem;
const originalRemove=Storage.prototype.removeItem;
const config=window.BIKI_FIREBASE_CONFIG||{};
const configured=!!(config.apiKey&&!config.apiKey.startsWith('PASTE_')&&config.projectId&&!config.projectId.startsWith('PASTE_')&&config.appId&&!config.appId.startsWith('PASTE_'));
let auth,db,uid=null,ready=false,unsub=null,applying=false,writeChain=Promise.resolve(),pending=new Map(),lastCloud=new Map(),serverRevision=new Map(),busy=false;
const css=document.createElement('style');css.textContent=`#bikiCloudGate{position:fixed;inset:0;z-index:2147483647;background:linear-gradient(110deg,rgba(3,20,55,.48),rgba(4,34,76,.16)),url("login-travel-background.jpg") center center / cover no-repeat;display:grid;place-items:center;padding:18px;font-family:Arial,sans-serif}#bikiCloudGate *{box-sizing:border-box}#bikiCloudCard{width:min(470px,100%);background:white;border-radius:20px;padding:26px;box-shadow:0 18px 70px #001e5477;color:#17345b}#bikiCloudCard h2{margin:0 0 8px;font-size:22px}#bikiCloudCard p{line-height:1.5}#bikiCloudCard input{width:100%;padding:12px;border:1px solid #bbd0e5;border-radius:9px;margin:6px 0 13px;font-size:15px}#bikiCloudCard button,.bikiCloudBtn{padding:11px 13px;border:0;border-radius:9px;background:#0759d8;color:#fff;font-weight:700;cursor:pointer}#bikiCloudCard button:disabled{opacity:.55;cursor:wait}#bikiCloudCard .secondary{background:#eaf1ff;color:#164786}#bikiCloudCard small{color:#556b82}#bikiCloudMsg{white-space:pre-wrap;font-size:13px;margin-top:10px;color:#9d2a22}#bikiCloudStatus{position:fixed;right:14px;bottom:12px;z-index:999999;background:#102b58;color:white;padding:9px 14px;border-radius:10px;font:12px Arial;box-shadow:0 5px 18px #0003;max-width:280px}#bikiCloudTools{position:fixed;bottom:60px;right:14px;z-index:999999;display:flex;gap:6px;flex-wrap:wrap;max-width:360px;justify-content:flex-end}#bikiCloudTools button{padding:8px 10px;border:0;border-radius:8px;background:#e9f2ff;color:#103d7c;cursor:pointer;box-shadow:0 2px 10px #0002}#credentialsForm,#staffAddForm,#staffAccountsList,#pinSettingsForm,#removePinBtn,#bikiRecoverySetupForm{display:none!important}`;document.head.append(css);
const gate=document.createElement('div');gate.id='bikiCloudGate';gate.innerHTML=`<div id="bikiCloudCard"><h2>☁ BIKI ONLINE SERVICE CENTER</h2><p id="bikiCloudIntro">Firebase Cloud Login · আপনার সব PC-তে একই ডেটা</p><form id="bikiCloudForm"><label>Email (Firebase Authentication)</label><input id="bikiCloudEmail" type="email" autocomplete="username" required placeholder="owner@example.com"><label>Password</label><input id="bikiCloudPassword" type="password" autocomplete="current-password" required placeholder="Firebase password"><button id="bikiCloudLogin" type="submit" style="width:100%">Secure Login</button></form><div id="bikiCloudMsg" role="alert"></div><p><small>পুরোনো admin / 1234 আর কাজ করবে না। Firebase Console-এ Email/Password User তৈরি করুন।</small></p></div>`;document.body.append(gate);
const status=document.createElement('div');status.id='bikiCloudStatus';status.textContent='☁ Cloud: connecting…';document.body.append(status);
const tools=document.createElement('div');tools.id='bikiCloudTools';tools.style.display='none';tools.innerHTML='<button id="bikiCloudExport">⬇ Local Backup</button><button id="bikiCloudImport">⬆ Import Old PC Data</button><button id="bikiCloudRefresh">↻ Refresh Cloud Data</button><button id="bikiCloudTest">☁ Test Cloud Write</button><button id="bikiCloudSignout">Sign out</button><input type="file" id="bikiCloudFile" accept="application/json,.json" style="display:none">';document.body.append(tools);
const msg=s=>document.getElementById('bikiCloudMsg').textContent=s;
const state=s=>status.textContent='☁ '+s;
function downloadBackup(){const storage={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('biki_'))storage[k]=localStorage.getItem(k)}const blob=new Blob([JSON.stringify({version:'BIKI_FIREBASE_MIGRATION_V1',exportedAt:new Date().toISOString(),storage},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='BIKI-OLD-PC-BACKUP-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
document.getElementById('bikiCloudExport').onclick=downloadBackup;
document.getElementById('bikiCloudImport').onclick=()=>document.getElementById('bikiCloudFile').click();
document.getElementById('bikiCloudFile').onchange=async e=>{const f=e.target.files[0];if(!f||!ready)return;if(f.size>15*1024*1024)return alert('Backup too large (15 MB limit).');let payload;try{payload=JSON.parse(await f.text())}catch{return alert('Invalid JSON backup')}const records=payload.storage||payload.localStorage;if(!records||typeof records!=='object'||!records.biki_accounting_v1)return alert('Not a valid BIKI backup.');const keys=syncKeys.filter(k=>typeof records[k]==='string');if(!confirm('WARNING: This will OVERWRITE '+keys.length+' cloud data fields for every PC. First download a backup. Continue?'))return;busy=true;state('Importing…');try{for(const k of keys){await writeKey(k,records[k],true)}alert('Cloud import complete. Reloading latest data.');location.reload()}catch(err){alert('Import failed: '+err.message)}finally{busy=false}};
function setLocal(k,v){applying=true;try{if(v===null)originalRemove.call(localStorage,k);else originalSet.call(localStorage,k,v)}finally{applying=false}}
function docRef(k){return db.collection('owners').doc(uid).collection('settings').doc(k)}
async function writeKey(k,v,force=false){if(!ready&&!force)return;const bytes=new Blob([v||'']).size;if(bytes>900000)throw Error(k+' exceeds Firestore document limit (900 KB). Please reduce image/PDF size.');await docRef(k).set({value:v,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),deviceId:deviceId},{merge:false});lastCloud.set(k,v)}
const deviceId='biki-'+Math.random().toString(36).slice(2);
function queue(k,v){
 pending.set(k,v);state('Saving…');
 writeChain=writeChain.catch(()=>{}).then(async()=>{
   if(!ready||!uid)return;
   const val=pending.get(k);
   if(val===undefined)return;
   await writeKey(k,val);
   if(pending.get(k)===val)pending.delete(k);
   state('Saved online ✓');
 }).catch(e=>{state('SYNC ERROR — '+e.message);console.error('Firebase write failed',e);alert('Cloud save failed for '+k+': '+e.message+'\nData is still on this PC. Export a backup.');});
}
// Intercept only explicitly synced keys; private legacy passwords are never uploaded.
Storage.prototype.setItem=function(k,v){const result=originalSet.call(this,k,v);if(this===localStorage&&keySet.has(k)&&!applying&&ready)queue(k,String(v));return result};
Storage.prototype.removeItem=function(k){const result=originalRemove.call(this,k);if(this===localStorage&&keySet.has(k)&&!applying&&ready)queue(k,null);return result};
function repaint(){try{const s=localStorage.getItem('biki_accounting_v1');if(s){const next=JSON.parse(s);if(next&&Array.isArray(next.transactions)){window.data=next;data=next;data.sales=data.sales||[]}}if(typeof render==='function')render();if(typeof loadBusinessSettings==='function')loadBusinessSettings();if(typeof bikiApplyAppearance==='function')bikiApplyAppearance();if(typeof bikiRefreshLogos==='function')bikiRefreshLogos();if(typeof bikiRenderV2==='function')bikiRenderV2();if(typeof proRender==='function')proRender();if(typeof refresh==='function')refresh()}catch(e){console.error('Cloud refresh error',e)}}
async function startCloud(user){uid=user.uid;ready=false;gate.style.display='grid';msg('Cloud data loading…');state('Loading online data…');
try{
// Preserve existing browser data before replacing it with the cloud snapshot.
const preCloudBackup={};for(const k of syncKeys){const v=localStorage.getItem(k);if(v!==null)preCloudBackup[k]=v}
if(Object.keys(preCloudBackup).length && !sessionStorage.getItem('biki_precloud_backup_saved')){
  const blob=new Blob([JSON.stringify({version:'BIKI_PRE_CLOUD_SAFETY_BACKUP',exportedAt:new Date().toISOString(),storage:preCloudBackup},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='BIKI-PRE-CLOUD-SAFETY-BACKUP-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);sessionStorage.setItem('biki_precloud_backup_saved','yes');
}
const snap=await db.collection('owners').doc(uid).collection('settings').get({source:'server'});const docs=new Map(snap.docs.map(d=>[d.id,d.data().value]));
if(!docs.has('biki_accounting_v1')){msg('Cloud database is empty. Login succeeded. You can import an old backup after opening.');}
for(const k of syncKeys){if(docs.has(k)){setLocal(k,docs.get(k));lastCloud.set(k,docs.get(k))}else{setLocal(k,null)}}
// Discard the legacy local username/password and legacy staff credentials; Firebase is authoritative.
originalRemove.call(localStorage,'biki_login_credentials');originalRemove.call(localStorage,'biki_staff_accounts_v1');originalRemove.call(localStorage,'biki_screen_lock_pin');originalRemove.call(localStorage,'biki_recovery_verifier_v1');
repaint();sessionStorage.setItem('biki_active_role','admin');sessionStorage.setItem('biki_logged_in','yes');sessionStorage.setItem('biki_last_activity',String(Date.now()));if(typeof bikiUnlock==='function')bikiUnlock();
ready=true;gate.style.display='none';document.getElementById('loginOverlay').style.display='none';tools.style.display='flex';state('Live Sync connected ✓');
unsub=db.collection('owners').doc(uid).collection('settings').onSnapshot({includeMetadataChanges:true},snapshot=>{if(!ready||busy)return;if(snapshot.metadata.fromCache){state('Offline / cached — changes not verified online');return;}let changed=false;for(const ch of snapshot.docChanges()){const k=ch.doc.id;if(!keySet.has(k))continue;const value=ch.type==='removed'?null:ch.doc.data().value;if(pending.has(k))continue;if(value===lastCloud.get(k))continue;lastCloud.set(k,value);setLocal(k,value);changed=true}if(changed){repaint();state('Updated from cloud ✓')}},e=>{state('Listener error: '+e.message);console.error(e)});
}catch(e){ready=false;msg('Cloud load failed: '+e.message+'\nCheck Firestore rules, connection, and project configuration.');state('Connection failed');}}
async function signout(){ready=false;if(unsub){unsub();unsub=null}tools.style.display='none';sessionStorage.removeItem('biki_logged_in');sessionStorage.removeItem('biki_active_role');gate.style.display='grid';msg('');await auth.signOut()}
document.getElementById('bikiCloudRefresh').onclick=async()=>{
 if(!ready||!uid)return alert('Login required');
 if(pending.size)return alert('Cloud save is still pending. Wait for Saved online first.');
 state('Checking server…');
 try{
   const snap=await db.collection('owners').doc(uid).collection('settings').get({source:'server'});
   const d=snap.docs.find(x=>x.id==='biki_accounting_v1');
   if(!d){state('No accounting data on server');return alert('Firestore has no accounting data yet. Save a test customer on PC 1, then check the cloud status.');}
   const val=d.data().value;
   const parsed=JSON.parse(val);
   const local=localStorage.getItem('biki_accounting_v1');
   if(local!==val){
     if(!confirm('Newer/different server data found ('+(parsed.customers||[]).length+' customers). Replace this PC view with server data? Download Local Backup first if this PC has unsynced data.')){state('Cloud refresh cancelled');return;}
     setLocal('biki_accounting_v1',val);lastCloud.set('biki_accounting_v1',val);repaint();
   }
   state('Server verified ✓');alert('Firestore server reachable. Server customer count: '+(parsed.customers||[]).length+'. Current PC view refreshed.');
 }catch(e){state('Server read failed: '+e.message);alert('Cloud refresh failed: '+e.message)}
};
document.getElementById('bikiCloudTest').onclick=async()=>{
 if(!ready||!uid)return alert('Login required');
 state('Testing Firestore write…');
 try{
   const ref=db.collection('owners').doc(uid).collection('diagnostics').doc('connection');
   const stamp=new Date().toISOString();
   await ref.set({lastTest:stamp,owner:uid},{merge:true});
   const snap=await ref.get({source:'server'});
   if(!snap.exists||snap.data().lastTest!==stamp)throw Error('Server read-back did not match');
   state('Firestore read/write OK ✓');alert('Firebase Firestore READ + WRITE successful. Now save a test customer and check PC 2.');
 }catch(e){state('Firestore test failed: '+e.message);alert('Firestore test failed: '+e.message)}
};
document.getElementById('bikiCloudSignout').onclick=signout;
// Prevent legacy lock/password bypass. Lock and logout require Firebase sign-in again.
window.logout=signout;window.bikiManualLock=signout;window.bikiLockScreen=()=>{signout()};window.bikiCheckInactivity=()=>{};
const loginForm=document.getElementById('bikiCloudForm');loginForm.onsubmit=async e=>{e.preventDefault();if(!auth)return;const b=document.getElementById('bikiCloudLogin');b.disabled=true;msg('Signing in…');try{await auth.signInWithEmailAndPassword(document.getElementById('bikiCloudEmail').value.trim(),document.getElementById('bikiCloudPassword').value);document.getElementById('bikiCloudPassword').value=''}catch(err){msg('Login failed: '+err.message)}finally{b.disabled=false}};
if(!configured){msg('Firebase configuration missing. Open firebase-config.js and paste your project config. See README_BN.md.');state('Setup required');return}
if(typeof firebase==='undefined'){msg('Firebase SDK could not load. Check internet connection or content blocker.');state('SDK unavailable');return}
try{firebase.initializeApp(config);auth=firebase.auth();db=firebase.firestore();auth.onAuthStateChanged(user=>{if(user){if(uid!==user.uid||!ready)startCloud(user)}else{uid=null;ready=false;gate.style.display='grid';tools.style.display='none';state('Login required')}})}catch(e){msg('Firebase initialization failed: '+e.message);state('Setup error')}
})();
