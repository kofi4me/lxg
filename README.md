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

No environment variables, package installation, or server runtime are required. Cloudflare serves `dist/index.html` and the adjacent assets. Configure a custom domain in the Pages project after the first successful deployment.

Official guide: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/

## Local preview

From the repository root run `python -m http.server 18765 --directory dist`, then open http://localhost:18765/.
