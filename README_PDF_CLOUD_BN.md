# BIKI PDF Cloud Setup (Supabase Auth)

1. GitHub repository root-এ ZIP-এর সব ফাইল Upload/Replace করুন।
2. Firebase Login আগের মতো করুন। Ticket Booking Register-এ PDF Cloud Login দেখাবে।
3. Supabase PDF Cloud-এর জন্য `galimpur01@gmail.com` দিয়ে Create PDF Cloud Account করুন। **Firebase-এর password ব্যবহার করবেন না; আলাদা শক্তিশালী password দিন।**
4. Supabase থেকে email confirmation এলে confirm করুন; তারপর Connect PDF Cloud ক্লিক করুন।
5. নতুন PDF দিয়ে Ticket Save করুন। Cloud upload সফল হলে তবেই booking Save হবে। অন্য PC-তে Firebase Login এবং PDF Cloud Login করে PDF খুলুন।
6. পুরোনো PC-তে `Upload old local Ticket PDFs to Cloud` চাপুন। পুরোনো Browser Data মুছবেন না।

Bucket: ticket-pdfs (private). PDF max 15 MB. Supabase URL and publishable key are public client configuration; service_role keys must NEVER go to GitHub.

NOTE: Existing Firebase booking-record live sync must work for PDF metadata to appear on other PCs. Cloud PDF upload alone does not repair Firestore sync.
NOTE: This uses Supabase Email/Password authentication in addition to Firebase login, without installing PC software.
