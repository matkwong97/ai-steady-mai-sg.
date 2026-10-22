# AI Steady Mai SG v34 — Saved Profile & Friend Consistency

## Deploy from v33
Replace only **app.js**, **love-space.js**, and **index.html** at the repository root in GitHub `matkwong97/ai-steady-mai-sg` branch `main`. Commit and wait for Cloudflare Pages production deployment to succeed. Do not change D1, SQL, `functions/`, or assets.

## Changes
- First-time visitors enter age and gender once. No default gender is assumed.
- Existing v33 saved profiles migrate automatically (`steady_profile`).
- Returning visitors see a compact welcome card, their selected friends, and an Edit profile action.
- Love Space routes require the profile first, preventing scrapbook reactions from choosing a default group.
- Private scrapbook comments use current selected friends and custom names instead of hardcoded names.
- Friend check-ins only start after profile setup, and new messages remember their original group.
- No email or additional backend services required.

## Test
1. Open in a private tab: initial setup required before Love Space.
2. Select male: scrapbook reaction names must be Alvin/Bryan/Calvin/David (or custom names).
3. Refresh: compact Welcome back card appears.
4. Edit profile and select female: future reactions and friend portraits use Angie/Bridget/Carrie/Demi.
5. Verify existing Couple Room, private/shared scrapbooks, and wedding planner still work.
