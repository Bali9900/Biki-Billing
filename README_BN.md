# BIKI ONLINE SERVICE CENTER — Firebase Live Sync

## Setup (আপনার Firebase Project-এ)

1. https://console.firebase.google.com এ আপনার বিদ্যমান biki-billing Project খুলুন।
2. Project Settings → Your apps → Web app যোগ করে Firebase config কপি করুন। `firebase-config.js`-এ আপনার দেওয়া Web App config ইতিমধ্যে বসানো হয়েছে। **এই config-এ কোনো private admin key/service account key বসাবেন না।**
3. Build → Authentication → Sign-in method → Email/Password ENABLE করুন। Users → Add user দিয়ে একটি শক্তিশালী password-সহ Owner Email account তৈরি করুন।
4. Authentication → Users থেকে Owner UID কপি করুন।
5. Build → Firestore Database → Create database (Production mode)। Rules tab-এ `firestore.rules` ফাইলের contents বসান এবং আপনার UID-সহ rules ইতিমধ্যে `firestore.rules`-এ বসানো হয়েছে; Firebase Console-এ আপনি rules publish করেছেন।
6. Authentication → Settings → Authorized domains-এ `bali9900.github.io` (অথবা আপনার নিজের host domain) যুক্ত করুন, যদি আগে থেকে না থাকে।
7. `index.html`, `firebase-sync.js`, `firebase-config.js` এবং `login-travel-background.jpg` (যদি থাকে) একই GitHub Pages repository root-এ upload করুন। `firestore.rules` GitHub-এ publish করার প্রয়োজন নেই।
8. GitHub Pages link খুলে Firebase Owner Email/Password দিয়ে login করুন। নতুন PC-তেও একই Email/Password ব্যবহার করুন।

## Old PC Data Migration

1. **পুরোনো PC/browser-এ প্রথমে** original website খুলে Business Pro → Daily Backup থেকে JSON backup download করুন। নতুন Cloud version দিয়ে replace করার **আগে** এটি করতে হবে।
2. Cloud website-এ Owner login করুন। `⬆ Import Old PC Data`-তে পুরোনো JSON backup নির্বাচন করুন। Confirm করলে আগের Cloud data overwrite হবে।
3. `⬇ Local Backup` দিয়ে migration-এর পরেও backup রাখুন। অন্য PC-তে reload করে পরীক্ষা করুন।
4. `biki_accounting_v1` document 900 KB ছাড়ালে Firestore write বন্ধ হবে। বড় ticket PDF/image থাকলে আলাদা Firebase Storage architecture দরকার; এই সংস্করণে বড় ফাইলের full cloud sync সমর্থিত নয়।

## Important limitations

- Firebase project configuration এবং Security Rules না বসানো পর্যন্ত website কাজ করবে না।
- Firebase Email/Password Authentication is authoritative; old `admin/1234`, browser-only PIN, browser-only staff passwords are disabled as valid cloud authentication. **Staff accounts must be rebuilt with Firebase Auth and role rules before staff access is enabled.**
- Existing Business Pro features retained. Firestore sync uses one document per storage key and last-write-wins. Simultaneous edits on two PCs to the same accounting record can overwrite one another. Avoid concurrent edits until a transaction-level Firestore data model is implemented.
- Single Firestore document has a 1 MiB maximum. App sync enforces a 900 KB value cap, so large original ticket PDF/base64 images cannot sync; local-only data isn't a cloud backup.
- Firebase billing/free quota depends on your Firebase plan. Enable billing alerts if appropriate.
- The old 'Cloud Backup URL/token' panel is an independent legacy feature, not Firebase sync. Use Firebase status at bottom-right instead.
- This build has not been connected to your live Firebase project or tested with your credentials; you must configure and test it before production.
- **Security note:** Existing code retains legacy admin-only actions checking a local password. They should be migrated to Firebase reauthentication before sensitive production use. Avoid real customer financial/identity documents until fully audited.

## আপনার Project-এর জন্য প্রস্তুত
- Firebase Project: `biki-billing`
- Firebase owner UID: `IN19xYH45xaWncrNswTbU8IrXPj1`
- ZIP-এর `firebase-config.js` এবং `firestore.rules` আপডেট করা হয়েছে।
- GitHub Pages-এ `index.html`, `firebase-sync.js`, `firebase-config.js` তিনটি ফাইল একই root-এ আপলোড করতে হবে।
- Firebase Authentication-এ তৈরি করা Email/Password দিয়ে Login করুন। Password ZIP-এ নেই।
- Login-এর সময় পুরোনো local data পাওয়া গেলে একটি safety backup স্বয়ংক্রিয়ভাবে download করার চেষ্টা করবে; browser download permission চাইতে পারে। আলাদা করে আগেই backup নেওয়া জরুরি।
- PDF upload-এর Cloud Storage এই ZIP-এ নেই।


## Live Sync troubleshooting (2026-11-13)
- Updated `firebase-sync.js`: added **Test Cloud Write** (writes and reads a small diagnostic document) and **Refresh Cloud Data** (reads the accounting document directly from the Firestore server).
- On PC 1: click `☁ Test Cloud Write`, then add `TEST CUSTOMER 001`. Wait for `Saved online ✓`. If it says `SYNC ERROR`, save a Local Backup and do not overwrite browser data.
- Firebase Console → Firestore → Data → `owners` → `<owner UID>` → `settings` → `biki_accounting_v1`: verify document exists. Do not edit the data manually.
- On PC 2: sign in with the SAME Firebase user, click `↻ Refresh Cloud Data`, and confirm if it reports the server customer count.
- If both devices have separate existing unsynced data, export backups from BOTH before refreshing or importing.
- The app still stores the accounting dataset as one Firestore document (900 KB safety cap); concurrent edits from two PCs can overwrite data. It is not production-grade multi-user accounting.
- Original ticket PDFs remain local-only; not synchronized.

## Login Background Update
- আপনার দেওয়া ট্রেন ও বিমানের ছবি `login-travel-background.jpg` হিসেবে যোগ করা হয়েছে।
- Firebase Login screen-এর background-এ ছবিটি দেখাবে।
- GitHub repository root-এ `firebase-sync.js` এবং `login-travel-background.jpg` **দুটি ফাইলই** replace/upload করুন। অন্য ফাইলগুলি অপরিবর্তিত।
- GitHub Pages deploy হলে Ctrl+Shift+R দিয়ে reload করুন।
