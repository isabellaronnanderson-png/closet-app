# AS IF! — style diary

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

## Deploying to GitHub Pages

1. Push this project to a GitHub repo.
2. In `vite.config.js`, set `base: '/your-repo-name/'` to match your repo name.
3. Build and deploy:
   ```bash
   npm run build
   npm install -g gh-pages   # one-time
   npx gh-pages -d dist
   ```
4. In your repo's Settings → Pages, set the source to the `gh-pages` branch.
5. Your app will be live at `https://<your-username>.github.io/<repo-name>/`.

(Vercel or Netlify both work too, and are simpler — just point them at the repo
with build command `npm run build` and output directory `dist`, no `base` config needed.)

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
