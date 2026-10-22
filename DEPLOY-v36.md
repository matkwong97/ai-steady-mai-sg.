# AI Steady Mai SG v36 — Our Love Journey

## What's new
- 72 original secular, inclusive relationship exercises, in 9 themes
- Each challenge explains what to do, why it helps, and offers a reflection prompt
- Uses saved partner's name and the selected friend's customised name
- Pause/resume, completed status, favourites and private reflection notes on this device
- Optional shared challenges through the existing Couple Room; each partner tracks completion independently
- Existing personal/shared scrapbooks, Love Pager, wedding planner, friend messages retained

## Deploy from v35 to main
Replace repository-root `index.html` and `love-space.js`.
Add new repository-root `love-journey-data.js`.
Add new `functions/api/love-journey.js`.
Add `love-journey-schema.sql` to root as a reference.
Keep all other files and assets unchanged.
Commit to `main`; check Cloudflare Pages main project production deployment.
Existing `DB` binding points to `ai-steady-mai-db`; no new database or R2 bucket.

## Database setup
Open Cloudflare Dashboard > D1 > ai-steady-mai-db > Console.
Execute the entire contents of `love-journey-schema.sql` ONCE.
These CREATE TABLE IF NOT EXISTS statements do not remove any previous tables.

## Test
1. Open Love Space > Our Love Journey.
2. Complete one exercise, save a private reflection, favourite another.
3. Refresh: state persists. Verify existing private scrapbook.
4. Link two phones through Love Pager. Share a challenge from one phone.
5. Other phone opens Love Journey > Our couple challenges; each can independently mark completed.
6. Verify that private reflection is NOT sent to partner.
Note: Shared challenges require the existing D1 DB binding and two linked room members.
