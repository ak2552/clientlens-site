# clientlens.co

Static studio website. No build step, no external requests.

- / : studio home
- /contacts-backup/ : app page
- /contacts-backup/privacy/ : privacy policy (linked from the app and both stores)
- /contacts-backup/support/ : support and FAQ
- /printcal/ : app page (PrintCal: Print Your Calendar)
- /printcal/privacy/ : privacy policy (linked from the app's Settings and both stores)
- /printcal/support/ : support and FAQ
- /printcal/print-iphone-calendar/, /printcal/print-google-calendar/ : help articles
- Each app also has /terms/, /accessibility/ and /acknowledgements/ under its own folder.

Rules: studio-level pages (home) make no promises about pricing or data handling; those live on each app's own page where they are true. An app's privacy/support pages are linked only from that app's pages. llms-full.txt is generated: `node scripts/build-llms-full.mjs`.

Deploy: copy the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, or a storage bucket).

IndexNow: the key file at the site root lets us notify Bing (and other IndexNow engines) when pages change. After deploying changes, POST the changed URLs to https://api.indexnow.org/indexnow with that key.
