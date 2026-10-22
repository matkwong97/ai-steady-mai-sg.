v35 scrapbook recovery patch for v34.

Root cause: albumOpen() declared const name = albumName(id), shadowing the global name(i) friend-name function. When a scrapbook entry qualified for a friend note, name(who) threw TypeError, causing the whole album to display 'Unable to load this scrapbook.'

Fix: rename local variable to albumTitle; friend notes now call the actual global name(i) function. Correct the friend rotation, which previously always selected index 0 for qualifying entries.

No existing memories or browser data are changed or deleted. This is a display-only fix.

Deploy: replace only root love-space.js in main GitHub repository, commit to main, await Cloudflare Pages production success, refresh. No SQL or D1 changes.
