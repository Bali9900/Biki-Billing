BIKI BILLING - DATA SAFETY PATCH

This patch stops Firebase login from deleting localStorage keys when a cloud document is missing.
It does NOT automatically restore missing historical records.

IMPORTANT:
1. Keep all existing JSON backups.
2. Do NOT click Import Old PC Data unless you have checked the cloud data; that button OVERWRITES cloud records.
3. If records are missing, inspect Firebase Firestore owners/<your UID>/settings/biki_accounting_v1.
4. Check the same Firebase account is used on all devices.
5. Download a manual Local Backup before any import.

Mobile drawer fix remains included.
