# Bella's Closet — style diary

A personal style tracker: closet inventory, an inspo board, an outfit diary, and a
shopping list — with an outfit generator ("the closet computer") that learns what
you like to wear from your diary entries.

## Run it locally

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually http://localhost:5173).

## How data is stored

Everything is saved to your browser's `localStorage` — there's no backend and
no account, so your closet only exists on whichever device/browser you added
it from. If you want it on your phone too, you'd need to add items separately
there, or swap in a small backend (e.g. Supabase) later.

Photos are compressed client-side before saving (resized + JPEG-compressed)
to stay well under localStorage's ~5–10MB limit. If you're cataloguing a large
closet with lots of photos, you may eventually hit that limit — the fix at
that point is swapping `src/lib/storage.js` to use IndexedDB instead, which
has much higher limits. The rest of the app doesn't need to change.

## Getting this onto GitHub (recommended way)

Dragging an unzipped folder into GitHub's "upload files" web page can silently
drop nested folders on some browsers, which is a common cause of a repo that
looks empty afterward. The reliable way is GitHub Desktop, which is a proper
app, not a website:

1. Install [GitHub Desktop](https://desktop.github.com) and sign in.
2. `File → New Repository`, point it at this unzipped `as-if` folder (or
   `Add → Add Existing Repository` if you unzipped it somewhere already).
3. Click **Publish repository**.
4. Done — all the nested `src/components/...` files will be there, because
   the app reads the real folder structure on your disk instead of relying
   on a browser drag-and-drop.

(If you're comfortable with the command line, `git init`, `git add .`,
`git commit -m "first commit"`, then create a repo on GitHub and follow the
`git remote add` / `git push` instructions it shows you — same result.)

## Deploying with Vercel

1. On [vercel.com](https://vercel.com), **Add New → Project**, then import
   the GitHub repo you just created.
2. Vercel auto-detects Vite — leave the defaults (Build Command
   `npm run build`, Output Directory `dist`).
3. Click **Deploy**. Your app will be live at the `.vercel.app` URL it gives you.

Netlify works the same way. For GitHub Pages instead, change `base: '/'` in
`vite.config.js` to `base: '/your-repo-name/'`, then `npm run build` and
`npx gh-pages -d dist`.

## If you get a blank page

Almost always one of these two things:

1. **Wrong `base` in `vite.config.js`.** It should be `'/'` for Vercel,
   Netlify, or a custom domain. It only needs to be `'/repo-name/'` for
   GitHub Pages specifically, because Pages serves your site at
   `username.github.io/repo-name/` instead of from the root.
2. **Missing files.** Open your GitHub repo in the browser and check that
   `src/components/` actually has 6 files in it, not 0 — a partial upload is
   the other common cause. Re-publish with GitHub Desktop (above) if so.

Vercel's deployment logs (on the project's "Deployments" tab) will also tell
you plainly if a build failed and why, which is worth checking first.

## Project structure

```
src/
  App.jsx                 tab state + persistence wiring
  styles.css               design tokens & styling
  lib/
    constants.js           seasons, occasions, categories
    storage.js              localStorage + image compression
    outfitEngine.js         outfit generation / pairing algorithm
  components/
    ui.jsx                  shared Modal / TagBox / StarPicker / ImageDrop
    ClosetComputer.jsx      outfit generator + "style around this" panel
    ClosetTab.jsx
    InspoTab.jsx
    DiaryTab.jsx
    ShopTab.jsx
```

## Stock tracking, honestly

The "remind me to check stock" feature on the Shopping tab is manual, not
automatic — this is a static, client-side app with no server running in the
background, so it can't poll a retailer's site while you're not looking. Set a
"check again" date on an item and it'll surface a badge once that date arrives.
