# AI Steady Mai SG v27 — No-account Couple Room

## IMPORTANT: keep your current website live until tested.

1. Upload ALL v27 files to the GitHub repository connected to your main Cloudflare Pages website, preserving root files, `assets/`, and `functions/api/`. Remove the obsolete `functions/api/account.js` if it remains in the repository (v27 does not use it).
2. In Cloudflare → D1 → `ai-steady-mai-db` → Console, paste and run the complete `room-schema.sql` from this package. You may leave the six legacy account tables in place; they are not used.
3. In your MAIN Cloudflare Pages project → Settings → Bindings → Production, add D1 binding `DB` pointing to `ai-steady-mai-db`. This is essential.
4. A GitHub commit to `main` automatically deploys. Wait for Success.
5. On phone A, Love Space → Love Pager → Create room. SAVE the displayed recovery key securely. Generate invitation. On phone B, Join using code; SAVE its separate recovery key. Test sending in both directions and refreshing pages.
6. Test Cut Link from either phone; both should lose access. Test a new room.

Notes: A room persists in D1 and a private device token is saved locally. Clearing browser data loses the token; use the recovery key to restore access. Anyone with the recovery key can access that member's pager. Invitations expire after 15 minutes and are single-use. Photos in Scrapbook are still only stored locally in IndexedDB; export a backup. Messages appear in-app, not iOS lock-screen notifications. No email accounts or AI API required. Test privately before public launch.
