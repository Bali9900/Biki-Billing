
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

  function enqueue(payload, id) {
    if (!payload || !payload.type) return;

    const queue = readQueue();
    const alertId = String(
      id || crypto.randomUUID()
    );

    if (queue.some(item => item.id === alertId)) {
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
