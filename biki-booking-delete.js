/*
 * BIKI ONLINE SERVICE CENTER — Booking History Delete Button
 * Add <script src="biki-booking-delete.js"></script> after the supabase-pdf.js script in index.html.
 * Existing Booking History, Billing, Firebase sync and PDF Cloud features are unchanged.
 */
(() => {
  'use strict';

  const rootId = 'v2TicketOut';
  const editSelector = '[data-ticket-edit]';
  const deleteSelector = '[data-biki-booking-delete]';
  let busy = false;

  function model() {
    // The existing index.html declares `data` as a global lexical variable.
    return typeof data !== 'undefined' ? data : null;
  }

  function addButtons(root) {
    root.querySelectorAll(editSelector).forEach(editButton => {
      const actions = editButton.closest('.ticket-history-actions');
      if (!actions || actions.querySelector(deleteSelector)) return;
      const id = editButton.getAttribute('data-ticket-edit');
      if (!id) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'biki-booking-delete-btn';
      button.setAttribute('data-biki-booking-delete', id);
      button.textContent = '🗑 Delete Booking';
      button.title = 'Delete this booking record and its attached PDF';
      actions.appendChild(button);
    });
  }

  function removeLocalPdf(id) {
    if (!window.indexedDB) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('biki_ticket_pdf_files');
      req.onerror = () => reject(req.error || new Error('Cannot open local PDF storage'));
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('tickets')) {
          db.close();
          resolve();
          return;
        }
        const tx = db.transaction('tickets', 'readwrite');
        tx.objectStore('tickets').delete(String(id));
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error || new Error('Local PDF delete failed')); };
        tx.onabort = () => { db.close(); reject(tx.error || new Error('Local PDF delete aborted')); };
      };
    });
  }

  async function deleteBooking(button, root) {
    if (busy) return;
    if (typeof bikiIsStaff === 'function' && bikiIsStaff()) {
      alert('Only an admin can delete bookings.');
      return;
    }

    const state = model();
    const bookings = state?.proV2?.tickets;
    if (!Array.isArray(bookings)) {
      alert('Booking data is not ready. Please reload the page.');
      return;
    }

    const id = button.getAttribute('data-biki-booking-delete');
    const ticket = bookings.find(t => String(t.id) === String(id));
    if (!ticket) {
      alert('Booking was not found. Please refresh the list.');
      return;
    }

    // Never silently erase financial history or orphan a due/payment entry.
    const linkedDues = (state.dues || []).filter(d =>
      String(d.ticketId || '') === String(id) ||
      (ticket.dueId && String(d.id) === String(ticket.dueId))
    );
    const hasPayments = (state.proV2.payments || []).some(p =>
      ticket.dueId && String(p.dueId) === String(ticket.dueId)
    );
    if (linkedDues.length || hasPayments || ticket.dueId) {
      alert('This booking is linked to Due Management or payment history. Resolve the linked due/payment first; booking deletion is blocked to protect the accounts.');
      return;
    }

    const customer = String(ticket.customer || 'Unknown');
    const pnr = String(ticket.pnr || 'N/A');
    const pdfNote = (ticket.pdfCloudPath || ticket.pdfName)
      ? '\n\nThe attached PDF will also be permanently deleted. Download a backup first if needed.'
      : '';
    if (!confirm('Permanently delete this booking?\n\nCustomer: ' + customer + '\nPNR: ' + pnr + pdfNote + '\n\nThis cannot be undone.')) return;

    busy = true;
    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = 'Deleting…';
    try {
      // Remove local file first. If cloud removal fails, the booking and cloud PDF remain.
      if (ticket.pdfName || ticket.pdfCloudPath) await removeLocalPdf(id);
      if (ticket.pdfCloudPath) {
        if (!window.bikiPdfCloud?.remove) {
          throw new Error('PDF Cloud is unavailable. Reconnect it before deleting this booking.');
        }
        await window.bikiPdfCloud.remove(ticket.pdfCloudPath);
      }

      state.proV2.tickets = bookings.filter(t => String(t.id) !== String(id));
      state.pro = state.pro || {};
      state.pro.audit = Array.isArray(state.pro.audit) ? state.pro.audit : [];
      state.pro.audit.push({
        at: new Date().toISOString(),
        actor: sessionStorage.getItem('biki_active_role') || 'admin',
        entity: 'Business Pro V2',
        action: 'TICKET_DELETE',
        id: String(id)
      });

      // save() is the existing Billing persistence function. It also triggers
      // the existing Firebase sync adapter for the accounting data key.
      if (typeof save !== 'function') throw new Error('Billing save function is unavailable');
      save();
      button.closest('tr')?.remove();
      const message = document.getElementById('v2TicketMessage');
      if (message) message.textContent = '✓ Booking deleted. Check the Cloud Sync status before closing this page.';
    } catch (err) {
      console.error('Booking delete failed:', err);
      alert('Booking could not be deleted: ' + (err?.message || String(err)));
      button.disabled = false;
      button.textContent = oldText;
    } finally {
      busy = false;
    }
  }

  function init() {
    const root = document.getElementById(rootId);
    if (!root) return;
    const style = document.createElement('style');
    style.textContent = '.ticket-history-actions .biki-booking-delete-btn{background:#b91c1c!important;color:white!important;border-color:#b91c1c!important}.ticket-history-actions .biki-booking-delete-btn:hover{background:#991b1b!important}.ticket-history-actions .biki-booking-delete-btn:disabled{opacity:.55;cursor:wait}';
    document.head.appendChild(style);

    addButtons(root);
    // The existing tickets() renderer replaces the table on every refresh/search.
    // Observe the table and re-add only the missing delete buttons.
    new MutationObserver(() => addButtons(root)).observe(root, {childList:true,subtree:true});
    root.addEventListener('click', event => {
      const button = event.target.closest(deleteSelector);
      if (!button || !root.contains(button)) return;
      event.preventDefault();
      event.stopPropagation();
      void deleteBooking(button, root);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
