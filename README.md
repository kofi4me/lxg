# LXG website
Open dist/index.html in a browser. No installation or build required.

## Member directory
The directory contains 13 named members and 12 placeholders. Membership and profile links were supplied by LXG. Verified professional details and source URLs are stored in `dist/members.js`; profiles awaiting verification retain placeholders. Rendering is handled by `dist/app.js`.

Each profile links to LinkedIn and supporting sources. Job titles reflect the latest information located, not direct employer confirmation as of today. Alfred’s role is sourced to 2025; Samuel’s Executive Head title is supported by January 2025 reporting; David’s and Tawfiq’s roles are supported by July 2026 reports. Individual notes state these limits.

Photographs are saved in dist/images and linked to source pages in each profile. Alfred: named TICON Africa speaker card. Samuel and David: named LinkedIn avatars. Tawfiq: named Bayt CV, matched by Coventry master’s in 2014 and MTN mobile-money career history. These photographs are not necessarily recent. No open reuse license was found; public availability does not establish a license. Member-supplied approved photographs can replace these research images.

Vision, mission and objectives remain proposals for member adoption. Founding history is based on LXG’s supplied account.

No contact form, analytics or external service is connected. Deployment status is managed separately in GitHub and Cloudflare.

Dr. Owusu Nyarko-Boateng: current KryptNet role sourced to company profile and ICISIS 2026; qualifications and telecommunications experience sourced to UENR staff biography. Portrait from the named UENR staff page; it may predate his current role.

Directory update, 9 October 2026: seven named members now occupy slots 1–7, with 18 unassigned placeholders. Richard Asamane (slot 6) uses the name, lawyer designation and LinkedIn supplied by LXG. Sulemana Braimah (slot 7) uses the exact supplied LinkedIn profile, listing MTN and University of Ghana, 1999–2003. His job title and photograph could not be verified. No biography or photograph from the MFWA executive of the same name was used.

Obed Adu-Amankwaah added to slot 8 on 9 October 2026; 17 unassigned placeholders remain. Current role sourced to GNA 24 September 2026. Portrait is the public LinkedIn avatar linked to his exact supplied profile, found on MTN Cameroon’s public post. It is an older profile photograph, not verified as recent. Photo source retained in members.js.

Tony Boateng added to slot 9 on 9 October 2026; 16 unassigned placeholders remain. Role and activity sourced to the Ghana Chamber of Telecommunications. Photo is explicitly captioned Tony Boateng speaking at the February 2026 Success Africa Summit, published by BusinessGhana 13 February 2026, credit MTN Ghana. Source linked in the member profile.

Kwasi Osei Hyeaman added to slot 10 on 9 October 2026; 15 unassigned placeholders remain. Acting Commercial Manager, South-East title sourced to GNA 21 December 2025, with continuation explicitly unconfirmed. Recent-photo research found only an unlabelled event group image; no individual portrait was assigned. Supplied LinkedIn link retained.

Razak Ray Farouk added to slot 11 on 9 October 2026, associated with ROUK Logistics as supplied by LXG. Business Instagram appears on the card and in the profile. No ownership, job title or unverified professional history was inferred. Eleven named members and 14 unassigned placeholders remain.


9 October 2026: Added Akwasi Kwarteng in member slot 12 with the exact LinkedIn URL supplied by LXG. A named July 2025 MyJoyOnline image of the MTN Northern Sector MoMo Channel Development Manager was found, but its identity could not be linked conclusively to the restricted supplied LinkedIn profile. Photo and professional details remain pending confirmation. 12 named members and 13 placeholders.

9 October 2026: Added Godfred Kwarteng in slot 13 with the exact LinkedIn profile supplied by LXG. Public LinkedIn access failed; other same-name references could not be conclusively linked. Current biography and photograph pending verification. 13 named members and 12 placeholders.


## Deploy to Cloudflare Pages

1. In Cloudflare, open Workers & Pages and create a Pages project using Git integration.
2. Connect the GitHub repository `kofi4me/lxg`.
3. Select production branch `main`.
4. Choose framework preset **None**. Leave the build command blank.
5. Set build output directory to **dist** and leave the root directory at the repository root.
6. Save and deploy. Subsequent pushes to `main` will trigger deployments once Git integration is connected.

The original static website required no server runtime. Direct registration now requires the Worker, D1 database and Admin secret described below; a static-only Pages deployment will not provide registration or Admin functions. Configure a custom domain in the Pages project after the first successful deployment.

Official guide: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/

## Local preview

From the repository root run `python -m http.server 18765 --directory dist`, then open http://localhost:18765/.


## Events update — 10 October 2026
LXG establishment year corrected to 2012 throughout the website, as confirmed by LXG. Events navigation and an executive meeting section have been added. Attendance form fields include name, email, optional phone, attendance response and consent. Registration remains explicitly closed and fields disabled until the event details and submission destination are supplied. No attendance data is stored or transmitted. The programme and official logo were not available in this conversation or the LXG project folder; the unrelated July 2025 poultry agenda was not published.


10 October 2026: Incorporated the supplied LXG Reunion programme for 13–14 November 2026 at Adi Lake Resort, Akosombo, including the two-day schedule, breakout groups and packing list. Original Word programme available for download. Supplied PDF seal rendered faithfully to images/lxg-seal.png and used in header, hero, footer and favicon. Founding year remains 2012. Form remains below the programme; submission is not enabled until an organiser email or storage destination is configured.


Registration email configured: gr8owusu222@gmail.com, as supplied by LXG. The enabled form validates required fields and consent, then opens a mailto draft containing the attendance details. Members must send the message in their email application. No backend storage or automatic email delivery is configured; the page includes a direct-email fallback and never reports an unsent draft as a completed registration.


## Existing Cloudflare Workers deployment

The existing site is https://lxg.gr8owusu222.workers.dev/. Deploy it as Worker `lxg` using the root `wrangler.json`, which serves static assets from `dist`.

In Cloudflare, open **Workers & Pages > lxg > Settings > Builds**. Connect `kofi4me/lxg`, select production branch `main`, leave the build command empty and the root directory at the repository root, and use deploy command `npx wrangler deploy`. Trigger a new build from the latest main commit. A successful GitHub push alone does not confirm that Cloudflare deployed it.

The earlier Pages instructions apply only if creating a separate Pages project.


## Direct registration and Admin dashboard

The website now submits registrations to `/api/registrations` and stores them in Cloudflare D1. The Admin dashboard at `/admin/` offers password-protected access, search, attendance filters, totals, pagination and CSV export. This replaces email drafts; no email application opens and no automatic notification email is sent. Registrations are available in the Admin dashboard after a successful submission.

### Activate on Cloudflare

1. Open **Workers & Pages > lxg > Settings > Variables and Secrets**. Add a **Secret** named `ADMIN_PASSWORD`. Set a unique password of at least 16 characters (maximum 256). Save/deploy the secret. Never put the password in GitHub or send it in chat.
2. Under **Settings > Builds**, connect `kofi4me/lxg`, branch `main`. Use the repository root, no build command, and deploy command `npx wrangler deploy`. Use current Wrangler 4, which supports automatic D1 provisioning.
3. Deploy the latest commit. `wrangler.json` declares the `DB` binding and database name `lxg-registrations`. Wrangler automatically creates or connects the D1 database. Tables are created idempotently on the first API request; existing data is preserved.
4. After deployment, verify that **Bindings** includes a D1 binding named `DB`. If resource provisioning is rejected, create `lxg-registrations` under **Storage & databases > D1**, then add its `database_id` to the `d1_databases` entry in `wrangler.json` and redeploy. Database IDs are configuration, not passwords. Pin the provisioned ID in this file after the first deployment to make the database connection explicit.
5. Open `/admin/` and sign in. Submit a test attendance response from the event form and confirm it appears. Verify an unauthenticated visit cannot fetch `/api/admin/registrations`.

Setup has not been verified in the live Cloudflare account. Without `DB` and a valid `ADMIN_PASSWORD`, the API returns a clear unavailable message and does not claim registrations were saved.

### Security and operation

- Required-field validation and consent are enforced on the server. One registration per email address per event; public visitors cannot overwrite an existing response. Contact the organiser for corrections.
- Admin sessions last eight hours, use HttpOnly Secure SameSite cookies, and are revoked on logout or password change. Login attempts are limited and visitor IP addresses are stored only as salted hashes in short-lived rate-limit records.
- Responses and exports are marked no-store. CSV values are escaped against spreadsheet formula execution. Registration data is never included in public static assets.
- Secret files `.dev.vars` and `.env` are ignored by Git. To test locally, set `ADMIN_PASSWORD` in `.dev.vars`, then run `npx wrangler dev`. The plain Python static preview cannot serve registration endpoints.
- Run backend checks with Node 22.13 or newer: `node --test tests/registration.test.mjs`. The tests use SQLite with a D1-compatible adapter. Syntax checks: `node --check worker/index.mjs`, `node --check dist/app.js`, `node --check dist/admin/admin.js`.
- Keep `worker/schema.sql` and `worker/schema.mjs` in sync when changing the initial schema. Future changes to existing tables need an explicit migration.

Cloudflare provisioning documentation: https://developers.cloudflare.com/workers/wrangler/configuration/#automatic-provisioning


Site address updated to https://lxg.gr8owusu222.workers.dev/ and Worker name changed to `lxg`. Main banner seal reduced from 480px to 120px (one-quarter width and height). Database name remains `lxg-registrations`; the new Worker needs its own `ADMIN_PASSWORD` secret and the existing database binding to retain registrations.


Form expansion: added Ghanaian meal preferences, dietary requirements, attendance days, accommodation and transport preferences, departure city, activity interests and other arrangements. These are planning requests, not confirmed resort offerings. Admin detail views and CSV include them. Existing databases gain a details_json column automatically, preserving previous registrations. The main logo is explicitly capped at 96px in HTML and CSS. CSS/JS asset URLs are versioned. Admin is available at /admin/ and /admin.html. /api/health identifies the deployed release without exposing registration records. Live inspection before this update found an older static site and 404 for Admin/API; the new Worker must be deployed.


Navigation update: Home displays only the introductory banner. About LXG, Vision & mission, Members, Achievements and Events each show a separate section through navigation.js. Existing #events and #attendance-form links continue to open the correct view; browser Back/Forward switches views. Home is the default and selected navigation is marked for accessibility.
