# Nexora Careers

Mobile friendly careers site for hands-on and trade roles. Built with React, Vite, Firebase Authentication, Cloud Firestore, and Firebase Storage.

## Routes

- `/` — search open jobs
- `/apply` — enter details, sign in or create an account, then upload a required CV
- `/login` — sign in for administrators or candidates
- `/dashboard` — signed-in candidate applications linked to their account
- `/admin/applications` — administrator application inbox and status updates
- `/admin/jobs` — current job openings

## Firebase setup

1. Create a Firebase project at https://console.firebase.google.com and register a Web App.
2. Enable **Authentication → Sign-in method → Email/Password**. Enable Google or Facebook only if you plan to offer those sign-in methods.
3. Under **Authentication → Settings → Authorized domains**, add your local and deployed domains.
4. Create a **Cloud Firestore** database and enable **Storage**. Create the default Storage bucket, then copy its bucket name from Firebase Console → Storage.
5. Copy `.env.example` to `.env.local`, then add the Firebase Web App values, including `VITE_FIREBASE_STORAGE_BUCKET`. Set `VITE_ADMIN_EMAILS` to your administrator email address (comma separated if needed). Restart Vite after changing environment variables.
6. The included `firestore.rules` is already synchronized with the administrator email in your local `.env.local`. Publish those rules from **Firestore → Rules** in the Firebase console. If you change admin emails later, update the email list in both places.
7. In **Authentication → Users**, create the administrator account with that email and sign in at `/login`. The admin link is in the footer, or open `/admin/applications` directly.

The application flow saves the worker details in the browser session, then requires sign-in before uploading a CV and submitting. CVs are limited to PDF or Word files up to 10 MB. Publish both `firestore.rules` in Firestore → Rules and `storage.rules` in Storage → Rules. Applicants can upload and read their own CVs; only the configured admin and the applicant can read a CV. The admin inbox opens CVs and allows status updates.

The admin email appears in the frontend configuration for route navigation, but Firestore rules independently protect application data. Publish both rulesets before collecting real applicant information. Email/password users can create an account from the sign-in page; Google and Facebook sign-in are also available.

## Run locally

```sh
npm install
npm run dev
```



