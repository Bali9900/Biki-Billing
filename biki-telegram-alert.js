
/* BIKI ONLINE SERVICE CENTER
   Automatic Telegram Alerts — Top Right Panel
*/
(() => {
  'use strict';

  const URL =
    'https://kxlzoylmepbvfnacuzgk.supabase.co/functions/v1/biki-telegram-alert';

  const API_KEY =
    'sb_publishable_sEV_dsJ7nO2ZNOUgonnmbw_WwrdlSqI';

  const QUEUE_KEY = 'biki_telegram_pending_v1';
  // Historical recovery reset: do not rescan records before this release.
  const RECOVERY_START = '2026-11-26T20:59:00';
  const RECOVERY_FLOOR = Date.parse(RECOVERY_START + '+05:30');

  const deliveredCloud = new Set();
  async function ledgerRequest(method, body, id) {
    const session = await window.bikiPdfCloud?.getSession?.();
    if (!session?.access_token) throw new Error('Connect PDF Cloud first');
    const endpoint = URL.split('/functions/')[0] + '/rest/v1/biki_telegram_delivered';
    const query = id ? '?select=alert_id&alert_id=eq.' + encodeURIComponent(id) : '?select=alert_id&order=alert_id&limit=1000';
    const res = await fetch(endpoint + (method === 'GET' ? query : '?on_conflict=user_id,alert_id'), {method, headers:{apikey:API_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'}, ...(body ? {body:JSON.stringify(body)} : {})});
    if (!res.ok) throw new Error('Recovery cloud history unavailable ('+res.status+')');
    return method === 'GET' ? await res.json() : null;
  }
  async function syncDelivered() {
    const local = JSON.parse(localStorage.getItem('biki_telegram_sent_v1') || '{}');
    const ids = Object.keys(local);
    for(let i=0;i<ids.length;i+=100) await ledgerRequest('POST',ids.slice(i,i+100).map(alert_id=>({alert_id})));
    const session=await window.bikiPdfCloud?.getSession?.();
    if(!session?.access_token)throw new Error('Connect PDF Cloud first');
    const endpoint=URL.split('/functions/')[0]+'/rest/v1/biki_telegram_delivered?select=alert_id&order=alert_id';
    for(let offset=0;;offset+=1000){const res=await fetch(endpoint+'&limit=1000&offset='+offset,{headers:{apikey:API_KEY,Authorization:'Bearer '+session.access_token}});if(!res.ok)throw new Error('Recovery cloud history unavailable');const rows=await res.json();for(const row of rows)deliveredCloud.add(row.alert_id);if(rows.length<1000)break;}
  }
  let sending = false;
  let lastError = '';
  let lastSuccess = '';

  function readQueue() {
    try {
      const data = JSON.parse(
        localStorage.getItem(QUEUE_KEY) || '[]'
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveQueue(items) {
    localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(items.slice(-100))
    );
  }

  function wasSent(id) {
    try { return deliveredCloud.has(id) || Boolean(JSON.parse(localStorage.getItem('biki_telegram_sent_v1') || '{}')[id]); } catch { return false; }
  }

  function enqueue(payload, id) {
    if (!payload || !payload.type) return;

    const queue = readQueue();
    const alertId = String(
      id || crypto.randomUUID()
    );

    if (queue.some(item => item.id === alertId) || wasSent(alertId)) {
      return;
    }

    queue.push({
      id: alertId,
      payload,
      created: Date.now()
    });

    saveQueue(queue);
    updatePanel();

    // Automatically send after saving.
    flush();
  }

  async function flush() {
    if (sending || !navigator.onLine) return;
    if (!readQueue().length) {
      updatePanel();
      return;
    }

    sending = true;
    updatePanel();

    try {
      const cloud = window.bikiPdfCloud;

      if (typeof cloud?.getSession !== 'function') {
        throw new Error(
          'PDF Cloud session function unavailable'
        );
      }

      const session = await cloud.getSession();

      if (!session?.access_token) {
        throw new Error(
          'Connect PDF Cloud first'
        );
      }

      for (const item of readQueue().slice(0, 20)) {
        if (wasSent(item.id) || (await ledgerRequest('GET',null,item.id)).length) { saveQueue(readQueue().filter(x=>x.id!==item.id)); continue; }
        const response = await fetch(URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization':
              'Bearer ' + session.access_token,
            'apikey': API_KEY
          },
          body: JSON.stringify(item.payload)
        });

        const result = await response.json()
          .catch(() => ({}));

        if (!response.ok || !result.ok) {
          throw new Error(
            (result.error || 'Telegram delivery failed') +
            ' (HTTP ' + response.status + ')'
          );
        }

        saveQueue(
          readQueue().filter(x => x.id !== item.id)
        );
        try{const k='biki_telegram_sent_v1';const ledger=JSON.parse(localStorage.getItem(k)||'{}');ledger[item.id]=Date.now();localStorage.setItem(k,JSON.stringify(ledger));}catch(e){console.warn('Alert delivery ledger unavailable');}

        deliveredCloud.add(item.id);
        await ledgerRequest('POST',{alert_id:item.id});
        lastError = '';
        lastSuccess = new Date()
          .toLocaleString('en-IN');
      }

    } catch (error) {
      lastError = error.message || String(error);

      console.warn(
        'BIKI Telegram Alert:',
        lastError
      );
    } finally {
      sending = false;
      updatePanel();
    }
  }

  function updatePanel() {
    const status = document.getElementById(
      'bikiTelegramStatus'
    );

    if (!status) return;

    const pending = readQueue().length;

    status.textContent =
      'Pending Alerts: ' + pending +
      '\nSending: ' + (sending ? 'Yes' : 'No') +
      '\nStatus: ' +
      (lastError || 'Ready') +
      (lastSuccess
        ? '\nLast Sent: ' + lastSuccess
        : '');
  }


  function recovery(){
    if(sessionStorage.getItem('biki_active_role')==='staff')return alert('Admin only');
    const d=document.createElement('dialog');
    d.style.cssText='width:min(680px,92vw);max-height:85vh;border:1px solid #ccd7e5;border-radius:14px;padding:20px;color:#172b4d;background:white';
    d.innerHTML='<h3>Telegram Alert Recovery</h3><p>Review saved records. Select only messages missing in Telegram. Historical values may reflect later edits.</p><label>After (IST) <input type="datetime-local" min="2026-11-26T20:59:00" value="2026-11-26T20:59:00" step="1"></label> <button type="button" data-scan>Find records</button><p data-info></p><div data-list style="max-height:45vh;overflow:auto"></div><p><button type="button" data-send>Resend selected alerts</button> <button type="button" data-close>Close</button></p>';
    document.body.appendChild(d);d.showModal();
    const q=x=>d.querySelector(x);let rows=[];
    const sentKey='biki_telegram_sent_v1';
    const sent=()=>{try{return JSON.parse(localStorage.getItem(sentKey)||'{}')}catch{return {}}};
    async function scan(){
      rows=[];q('[data-list]').replaceChildren();q('[data-send]').disabled=true;q('[data-info]').textContent='Checking cloud recovery history…';try{await syncDelivered();}catch(e){q('[data-info]').textContent=e.message;return;}q('[data-send]').disabled=false;
      const cutoff=Math.max(RECOVERY_FLOOR,Date.parse(q('input').value+'+05:30'));
      if(!Number.isFinite(cutoff))return;
      let db;try{db=JSON.parse(localStorage.getItem('biki_accounting_v1')||'{}')}catch{return}
      const stamp=(r)=>{if(r.at&&Number.isFinite(Date.parse(r.at)))return Date.parse(r.at);const raw=String(r.id||'');const epoch=raw.match(/(?:^|-)\d{13}(?=-|$)/);if(epoch){const ms=Number(epoch[0].replace(/^-/,'') );if(ms>1577836800000&&ms<4102444800000)return ms;}const n=parseInt(raw.slice(0,8),36);if(n>1577836800000&&n<4102444800000)return n;return NaN};
      const add=(r,key,p,date)=>{if(!r.id)return;const t=stamp(r);const day=String(date||r.date||'').slice(0,10);if(Number.isFinite(t)?t<=cutoff:(!day||day<=RECOVERY_START.slice(0,10)||day<q('input').value.slice(0,10)))return;if(wasSent(key)||readQueue().some(x=>x.id===key)||rows.some(x=>x.key===key))return;rows.push({key,p,t,day});};
      for(const r of db.sales||[])add(r,'invoice:'+r.id,{type:r.items?.every(i=>i.type==='service')?'service':'sale',customer:r.customer,service:r.productName,amount:r.total,paid_amount:r.paidAmount,due_amount:r.dueAmount,payment_mode:r.mode,reference:r.receiptNo||r.id},r.date);
      for(const r of db.dues||[])if(!r.saleId&&!r.ticketId)add(r,'duecreated:'+r.id,{type:'due_created',customer:r.name,amount:r.amount,remaining_due:r.amount,due_date:r.date,note:r.note,reference:r.id},r.date);
      const groups=new Map();
      for(const r of db.proV2?.payments||[]){const id=String(r.id||'');const batch=/^[a-z0-9]{13}-[a-z0-9]{13}$/i.test(id)?id.split('-')[0]:id;if(!batch)continue;const old=groups.get(batch);if(old)old.amount+=Number(r.amount||0);else groups.set(batch,{...r,id:batch,amount:Number(r.amount||0)});}
      for(const r of groups.values())add(r,'duepay:'+r.id,{type:'due_payment',customer:r.customer,amount:r.amount,payment_mode:r.method,reference:r.receiptNo||r.id},r.date);
      for(const r of db.proV2?.tickets||[])add(r,'ticket:'+r.id,{type:'ticket_booking',customer:r.customer,journey:r.mode,origin:r.from,destination:r.to,journey_date:r.journeyDate,pnr:r.pnr,amount:r.fare,payment_mode:r.payment,booking_id:r.id},r.bookedDate||r.date);
      rows.sort((a,b)=>(a.t||Date.parse(a.day))-(b.t||Date.parse(b.day)));
      rows.forEach((r,i)=>{const label=document.createElement('label');label.style.cssText='display:block;padding:9px;border-bottom:1px solid #ddd';const cb=document.createElement('input');cb.type='checkbox';cb.dataset.index=i;label.append(cb,document.createTextNode(' '+(Number.isFinite(r.t)?new Date(r.t).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}):r.day+' (time unknown)')+' | '+r.p.type+' | '+(r.p.customer||'')+' | ₹'+(r.p.amount??'')+' | '+(r.p.reference||r.p.booking_id||'')));q('[data-list]').append(label)});
      q('[data-info]').textContent=rows.length ? rows.length+' candidate records. Select only missing Telegram messages. Historical records before the recovery reset are excluded.' : '✓ No recovery candidates after the reset. Future missing alerts can be recovered here.';
    }
    q('[data-scan]').onclick=scan;q('[data-close]').onclick=()=>d.close();d.addEventListener('close',()=>d.remove());
    q('[data-send]').onclick=()=>{const selected=[...d.querySelectorAll('input[data-index]:checked')].map(c=>rows[Number(c.dataset.index)]);if(!selected.length)return alert('Select missing alerts first');if(readQueue().length+selected.length>100)return alert('Please send fewer alerts at a time');if(!confirm('Resend '+selected.length+' selected alerts? Confirm these are missing in Telegram.'))return;for(const r of selected)if(!wasSent(r.key))enqueue({...r.p,note:[r.p.note,'Recovered from billing history '+r.day].filter(Boolean).join(' | ')},r.key);scan();};scan();
  }

  function createPanel() {
    if (
      document.getElementById(
        'bikiTelegramPanel'
      )
    ) return;

    const panel = document.createElement('div');
    panel.id = 'bikiTelegramPanel';

    // NEW POSITION: TOP RIGHT
    panel.style.cssText = [
      'position:fixed',
      'top:160px',
      'right:18px',
      'z-index:99999',
      'font-family:Arial,sans-serif',
      'max-width:calc(100vw - 24px)'
    ].join(';');

    panel.innerHTML = `
      <button
        id="bikiTelegramToggle"
        type="button"
        style="
          background:#0866d9;
          color:#fff;
          border:0;
          padding:10px 15px;
          border-radius:12px;
          cursor:pointer;
          font-weight:700;
          box-shadow:0 4px 12px #0002;
        ">
        🔔 Telegram
      </button>

      <div
        id="bikiTelegramBox"
        style="
          display:none;
          position:absolute;
          top:48px;
          right:0;
          background:#fff;
          color:#172b4d;
          width:280px;
          max-width:calc(100vw - 30px);
          padding:16px;
          border-radius:14px;
          box-shadow:0 8px 30px #0003;
          box-sizing:border-box;
        ">

        <div style="
          font-weight:bold;
          font-size:15px;
          margin-bottom:12px;
        ">
          🔔 BIKI Telegram Alerts
        </div>

        <pre
          id="bikiTelegramStatus"
          style="
            white-space:pre-wrap;
            overflow-wrap:anywhere;
            font-family:Arial,sans-serif;
            font-size:12px;
            line-height:1.7;
            margin:0 0 12px;
          "></pre>

        <button
          id="bikiTelegramRetry"
          type="button"
          style="
            background:#0866d9;
            color:#fff;
            border:0;
            padding:10px 14px;
            border-radius:8px;
            cursor:pointer;
            font-weight:600;
          ">
          ↻ Retry Pending
        </button>

        <button
          id="bikiTelegramClose"
          type="button"
          style="
            background:#edf2f7;
            color:#172b4d;
            border:0;
            padding:10px 12px;
            border-radius:8px;
            cursor:pointer;
            margin-left:5px;
          ">
          Close
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    const toggle = document.getElementById(
      'bikiTelegramToggle'
    );

    const box = document.getElementById(
      'bikiTelegramBox'
    );

    toggle.onclick = () => {
      box.style.display =
        box.style.display === 'none'
          ? 'block'
          : 'none';

      updatePanel();
    };

    document.getElementById(
      'bikiTelegramRetry'
    ).onclick = flush;

    document.getElementById(
      'bikiTelegramClose'
    ).onclick = () => {
      box.style.display = 'none';
    };

    const recoveryButton=document.createElement('button');recoveryButton.type='button';recoveryButton.textContent='Telegram Alert Recovery';recoveryButton.style.cssText='display:block;margin-top:10px;padding:9px;border:1px solid #ccd7e5;border-radius:8px;background:white;color:#0755d9;cursor:pointer';recoveryButton.onclick=recovery;box.appendChild(recoveryButton);
    updatePanel();
  }

  window.bikiTelegramAlert = {
    enqueue,
    flush,
    pending: () => readQueue().length,
    status: () => ({
      pending: readQueue().length,
      sending,
      error: lastError,
      lastSuccess
    })
  };

  // Automatic retry after internet reconnect.
  window.addEventListener('online', flush);

  // Retry when the website becomes active.
  window.addEventListener('focus', flush);

  // Automatic retry every 60 seconds.
  setInterval(flush, 60000);

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      createPanel
    );
  } else {
    createPanel();
  }

  setTimeout(flush, 2500);
})();
