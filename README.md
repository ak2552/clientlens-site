# clientlens.co

Static studio website. No build step, no external requests.

- / : studio home
- /contacts-backup/ : app page
- /contacts-backup/privacy/ : privacy policy (linked from the app and both stores)
- /contacts-backup/support/ : support and FAQ

Deploy: copy the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, or a storage bucket).

IndexNow: the key file at the site root lets us notify Bing (and other IndexNow engines) when pages change. After deploying changes, POST the changed URLs to https://api.indexnow.org/indexnow with that key.
