# v33 one-deployment upgrade from v31

Includes all v32 improvements and shared Couple Room scrapbooks.

## GitHub main repository
Replace root `app.js`, `index.html`, `love-space.js`; add `functions/api/shared-scrapbook.js`; add `shared-scrapbook-schema.sql` for reference. Preserve all other files and folders. Commit to main.

## Cloudflare D1
Before testing, open D1 `ai-steady-mai-db` -> Console and execute the contents of `shared-scrapbook-schema.sql` ONCE. This adds two tables, leaves existing tables intact. Main Pages project must have production D1 binding `DB` -> `ai-steady-mai-db`. No new database required.

## Test
Link two phones using Love Pager. Create shared album on phone A, add a small photo and note. Refresh shared scrapbooks on phone B. Add another memory from phone B, then reload phone A. Private scrapbook remains private.

## Pilot limitations
Photos are heavily compressed and stored as base64 in D1, not R2; 100 memories and 25 albums per room. This is a small private pilot, not a large public photo service. There is no live sync or push; reopen shared page to refresh. Either partner can see all shared memories; only the author can delete their own. Closing the Couple Room makes the shared albums inaccessible; export first. Exports contain photo data and should be kept private. No migration from local private scrapbook to shared albums is performed automatically.
