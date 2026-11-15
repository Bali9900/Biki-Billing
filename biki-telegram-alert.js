
/* BIKI ONLINE SERVICE CENTER — Automatic Telegram Alerts */
(() => {
  'use strict';

  const URL = 'https://kxlzoylmepbvfnacuzgk.supabase.co/functions/v1/biki-telegram-alert';
  const API_KEY = 'sb_publishable_sEV_dsJ7nO2ZNOUgonnmbw_WwrdlSqI';
  const QUEUE_KEY = 'biki_telegram_pending_v1';

  let sending = false;
  let lastError = '';

  function readQueue() {
    try {
      const data = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveQueue(items) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-100)));
  }

  function enqueue(payload, id) {
    if (!payload || !payload.type) return;

    const queue = readQueue();
    const alertId = String(id || crypto.randomUUID());

    if (queue.some(item => item.id === alertId)) return;

    queue.push({
      id: alertId,
      payload,
      created: Date.now()
    });

    saveQueue(queue);
    flush();
  }

  async function flush() {
    if (sending || !navigator.onLine) return;

    sending = true;

    try {
      const cloud = window.bikiPdfCloud;

      if (typeof cloud?.getSession !== 'function') {
        throw new Error('PDF Cloud session function unavailable');
      }

      const session = await cloud.getSession();

      if (!session?.access_token) {
        throw new Error('Connect PDF Cloud first');
      }

      for (const item of readQueue().slice(0, 20)) {
        const response = await fetch(URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token,
            'apikey': API_KEY
          },
          body: JSON.stringify(item.payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok) {
          throw new Error(
            result.error || 'Telegram request failed: HTTP ' + response.status
          );
        }

        saveQueue(readQueue().filter(x => x.id !== item.id));
        lastError = '';
      }
    } catch (error) {
      lastError = error.message || String(error);
      console.warn('BIKI Telegram Alert:', lastError);
    } finally {
      sending = false;
      updatePanel();
    }
  }

  function updatePanel() {
    const status = document.getElementById('bikiTelegramStatus');
    if (!status) return;

    const pending = readQueue().length;

    status.textContent =
      'Pending Alerts: ' + pending +
      (lastError ? '\nStatus: ' + lastError : '\nStatus: Ready');
  }

  function createPanel() {
    if (document.getElementById('bikiTelegramPanel')) return;

    const panel = document.createElement('div');
    panel.id = 'bikiTelegramPanel';

    panel.style.cssText = [
      'position:fixed',
      'bottom:16px',
      'right:16px',
      'z-index:99999',
      'font-family:Arial,sans-serif'
    ].join(';');

    panel.innerHTML = `
      <button id="bikiTelegramToggle"
        style="background:#0866d9;color:white;border:0;
        padding:12px 16px;border-radius:12px;
        cursor:pointer;font-weight:bold">
        🔔 Telegram
      </button>

      <div id="bikiTelegramBox"
        style="display:none;background:white;color:#172b4d;
        width:270px;padding:16px;margin-top:8px;
        border-radius:12px;box-shadow:0 4px 25px #0003">

        <strong>BIKI Telegram Alerts</strong>

        <pre id="bikiTelegramStatus"
          style="white-space:pre-wrap;font-size:12px"></pre>

        <button id="bikiTelegramRetry"
          style="background:#0866d9;color:white;
          border:0;padding:9px;border-radius:8px">
          Retry Pending
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    document.getElementById('bikiTelegramToggle').onclick = () => {
      const box = document.getElementById('bikiTelegramBox');
      box.style.display =
        box.style.display === 'none' ? 'block' : 'none';
      updatePanel();
    };

    document.getElementById('bikiTelegramRetry').onclick = flush;

    updatePanel();
  }

  window.bikiTelegramAlert = {
    enqueue,
    flush,
    pending: () => readQueue().length,
    status: () => ({
      pending: readQueue().length,
      error: lastError
    })
  };

  window.addEventListener('online', flush);
  window.addEventListener('focus', flush);

  setInterval(flush, 60000);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPanel);
  } else {
    createPanel();
  }

  setTimeout(flush, 2500);
})();
