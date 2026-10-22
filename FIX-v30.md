# v30 Couple Room invitation fix

## Root cause
The server generates and requires `LOVE-` plus 12 hexadecimal characters (17 characters total), but the invitation input in v29 had `maxlength="12"`. iPhone Safari silently cut off the last five characters, so joining always failed with `Enter your name and a valid invitation code`.

## Fix
- Invitation input now accepts the full 17-character code.
- Placeholder shows a valid-length example.
- Client validates code length and gives a clear explanation before submitting.

## Deploy to main GitHub
Replace only the repository-root `love-space.js` with this v30 file. Commit to `main`, then wait for Cloudflare Pages automatic deployment. No SQL or D1 changes.

## Testing
On the first phone, create a room and generate a *fresh* invitation. Copy the complete code (LOVE- plus 12 characters). On the second phone, paste it and join within 15 minutes. If the first phone already created a room, it can generate a new invitation without creating a new room.

Note: Existing room and recovery keys are unaffected.
