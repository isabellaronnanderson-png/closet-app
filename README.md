# closet organizer

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
it from.

Photos are compressed client-side before saving (resized + JPEG-compressed)
to stay well under localStorage's ~5–10MB limit. If you're cataloguing a large
closet with lots of photos, you may eventually hit that limit — the fix at
that point is swapping `src/lib/storage.js` to use IndexedDB instead, which
has much higher limits.

## The header

The header is an editable Pinterest-style masonry collage. Click any block to
upload your own photo — it replaces the color placeholder in that spot, with
the same hand-painted texture effect applied (SVG turbulence filters distort
each block's edges, plus a subtle grain overlay), so real photos and
placeholder colors both fit the same look. Hover a photo to remove it and
fall back to the color block. Photos are saved to `localStorage` like
everything else in the app, so they'll persist between visits on the same
browser.

## Deploying with Vercel

1. Push this project to a GitHub repo — using **GitHub Desktop** rather than
   the browser's drag-and-drop upload is more reliable, since drag-and-drop
   can silently drop nested folders on some browsers.
2. On [vercel.com](https://vercel.com), **Add New → Project**, then import
   the repo. Vercel auto-detects Vite — leave the defaults (Build Command
   `npm run build`, Output Directory `dist`).
3. Click **Deploy**.

Netlify works the same way. For GitHub Pages specifically, change `base: '/'`
in `vite.config.js` to `base: '/your-repo-name/'`, since Pages serves sites
from a subpath rather than the domain root.

## If you get a blank page after deploying

Almost always one of:
1. **Wrong `base` in `vite.config.js`** — should be `'/'` for Vercel/Netlify/a
   custom domain, only `'/repo-name/'` for GitHub Pages.
2. **Missing files** — check the GitHub repo has all the files under
   `src/components/`, in case a browser upload dropped some.

## Project structure

```
src/
  App.jsx                    tab state + persistence wiring
  styles.css                  design tokens & styling
  lib/
    constants.js               seasons, occasions, categories, color palette
    storage.js                  localStorage + image compression
    outfitEngine.js              outfit generation / pairing algorithm
  components/
    ui.jsx                      shared Modal / TagBox / StarPicker / ImageDrop
    PinterestHeader.jsx          masonry-collage header with the title
    ClosetComputer.jsx           outfit generator + "style around this" panel
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
