# AI Steady Mai SG v31 — deployment

Main GitHub repository: matkwong97/ai-steady-mai-sg (branch main). Cloudflare Pages: ai-steady-mai-sg.

If v30 is deployed, replace these three files at repository root:
- `app.js`
- `friend-chat.js`
- `love-space.js`

Commit changes to `main`; Cloudflare Pages automatically deploys. No D1 migration or binding changes. Other files in the ZIP are included for full replacement if needed.

What changed:
- Optional shared-on-device relationship profile, used by four friends in whichever gender group is selected (eight character variants).
- Context-first structured friend replies, without blind partner-name substitution.
- Wedding estimator with venue-specific reference price bands, editable cost lines, year adjustment and honest budget shortfall.
- Opt-in in-app friend check-ins, rotating personalities, 1–3/day cap, quiet hours and Thanks action. Separate from partner pager.

Caveats:
- Wedding figures are illustrative Singapore planning assumptions, **not verified live 2026 quotes**. Confirm venue pricing, GST, service charge and package minimums directly.
- Friend check-ins happen only while the site is open/visited. They are not lock-screen push notifications and do not require a server.
- Profile and friend pages are stored locally in the browser; they do not sync across devices.
- Validate the complete user journey on a phone after deployment.
