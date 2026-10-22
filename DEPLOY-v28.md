# v28: Pager mailbox + main website rollout

- Contains full v27 features plus a small Love Pager icon on every page, an unread badge and a homepage notification.
- Badge checks for new incoming pages every 25 seconds while the site is open/visible. No background push notification.
- Requires existing D1 `love_*` tables and a `DB` binding on the **main** Cloudflare Pages project.
- No new SQL migration needed from v27.
- Main GitHub repo: https://github.com/matkwong97/ai-steady-mai-sg
- Replace repository contents with the full contents of this package. Remove obsolete account.js from functions/api; retain any needed custom project files not in this package only after review.
- Commit main; Cloudflare Git integration deploys automatically.
- Test main site on two devices, verify pair persists, send page, see badge, tap badge to open inbox, cut link.
- Keep existing main-site backup before updating.
