# closet organizer

A personal style tracker: closet inventory (including hairstyles), an inspo
board organized into boards, an outfit diary, and a shopping list (including
a Home category) — with an outfit generator ("the closet computer") that
learns what you like to wear from your diary entries, and cloud sync via
Supabase so your closet follows you between devices.

## Run it locally

This app needs Supabase credentials to run (see **Supabase setup** below for
the full walkthrough) — a `.env` file is already included with your project's
URL and anon key filled in, so this should work immediately:

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually http://localhost:5173).

## Account, sync, and how data is stored

The app requires signing in (email + password via Supabase Auth) before any
content shows. Once signed in, your data syncs to a Supabase table — see
**Supabase setup** below for the exact SQL to create it.

`localStorage` is still used as a fast local cache and offline fallback, but
Supabase is the source of truth once you're logged in: the first time you log
in on a given browser, if that browser already has local data and Supabase
doesn't have any yet, the local data gets pushed up rather than discarded. On
every device after that, Supabase's copy wins so your closet is consistent
across places you're logged in.

Photos are compressed client-side before saving (resized + JPEG-compressed).
This matters more now than it used to: everything (including images) is
stored as JSON in a single `jsonb` column per data-key, so keeping photos
reasonably small keeps both localStorage and your Supabase rows lean.

### Supabase setup

1. In your Supabase project's **SQL Editor**, run:

   ```sql
   create table if not exists public.closet_organizer_state (
     user_id uuid not null references auth.users(id) on delete cascade,
     key text not null,
     value jsonb not null default '{}'::jsonb,
     updated_at timestamptz not null default now(),
     primary key (user_id, key)
   );

   alter table public.closet_organizer_state enable row level security;

   create policy "select own rows"
     on public.closet_organizer_state for select
     using (auth.uid() = user_id);

   create policy "insert own rows"
     on public.closet_organizer_state for insert
     with check (auth.uid() = user_id);

   create policy "update own rows"
     on public.closet_organizer_state for update
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);

   create policy "delete own rows"
     on public.closet_organizer_state for delete
     using (auth.uid() = user_id);
   ```

   This is a small key-value table (one row per data type — closet items,
   diary entries, shopping list, inspo pins, header photos — per user) rather
   than five separate normalized tables. It mirrors how the app already
   organizes its localStorage keys, which keeps the sync code simple: saving
   is always "upsert this one row," with no schema migrations needed if a
   data shape changes later.

2. Copy `.env.example` to `.env` and fill in your project's URL and anon
   (publishable) key — found in Supabase under **Project Settings → API**:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   The anon key is safe to expose in client-side code — that's what it's
   designed for. Row Level Security (set up by the SQL above) is what
   actually protects each user's data, not keeping this key secret. Never
   use a `service_role` key in client code, though — that one bypasses RLS
   entirely and must stay server-side only.

3. When deploying (Vercel, Netlify, etc.), add the same two environment
   variables in your hosting provider's project settings, since `.env` isn't
   committed to git.

4. By default, Supabase requires email confirmation before a new account can
   sign in — that's what the "check your email" screen after signup is
   waiting for. If you'd rather skip that for a personal project, it's a
   toggle in Supabase under **Authentication → Providers → Email → Confirm
   email**.

## Backup and restore

The account bar (top-right) has a **Backup** menu with two options:
- **Download backup** — exports everything (closet, diary, shopping list,
  inspo pins, header photos) as a single JSON file.
- **Restore from file** — loads a previously exported file back in, replacing
  current data and pushing the restored data to your account as the new
  source of truth.

## The header

The header is an editable Pinterest-style masonry collage. Click any block to
upload your own photo — it replaces the color placeholder in that spot, with
the same hand-painted texture effect applied (SVG turbulence filters distort
each block's edges, plus a subtle grain overlay), so real photos and
placeholder colors both fit the same look. Drag an uploaded photo to reframe
which part of it shows; hover it and click the × to remove it and fall back
to the color block.

## Hairstyles and Home

Two category additions:
- **Hairstyles** lives in the Closet and Diary — log a hairstyle like any
  other closet item (with a photo and tags), track how often you've worn it
  and how you felt in it, and the outfit generator will sometimes include a
  hairstyle suggestion alongside an outfit, since it affects the whole look.
- **Home** lives only in the Shopping list, for homeware you're eyeing that
  isn't really a "closet" item.

These are deliberately two separate category lists (`CLOSET_CATEGORIES` and
`SHOP_CATEGORIES` in `src/lib/constants.js`) rather than one shared list,
since each addition is only relevant to one part of the app.

## Stock tracking, honestly

The "remind me to check stock" feature on the Shopping tab is manual, not
automatic — this is a client-side app with no background server, so it can't
poll a retailer's site while you're not looking. Set a "check again" date on
an item and it'll surface a badge once that date arrives.

## Deploying with Vercel

1. Push this project to a GitHub repo — using **GitHub Desktop** rather than
   the browser's drag-and-drop upload is more reliable, since drag-and-drop
   can silently drop nested folders (and hidden files like `.env`) on some
   browsers.
2. On [vercel.com](https://vercel.com), **Add New → Project**, then import
   the repo. Vercel auto-detects Vite — leave the defaults (Build Command
   `npm run build`, Output Directory `dist`).
3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment
   variables in the Vercel project's settings (Settings → Environment
   Variables), since `.env` doesn't get committed to git.
4. Click **Deploy**.

## If you get a blank page after deploying

Almost always one of:
1. **Wrong `base` in `vite.config.js`** — should be `'/'` for Vercel/Netlify/a
   custom domain, only `'/repo-name/'` for GitHub Pages.
2. **Missing files** — check the GitHub repo has all the files under
   `src/components/`, in case a browser upload dropped some.
3. **Missing Supabase environment variables** — if `VITE_SUPABASE_URL` or
   `VITE_SUPABASE_ANON_KEY` aren't set (locally: no `.env` file, or it didn't
   come through when unzipping — dotfiles are easy for some tools to skip
   silently; when deployed: not added in your hosting provider's project
   settings), the app shows an on-page "Supabase isn't configured" message
   telling you exactly what's missing, rather than a blank screen.

## Project structure

```
src/
  App.jsx                    auth gating, tab state, cloud-synced state wiring
  styles.css                  design tokens & styling
  lib/
    constants.js               seasons, occasions, categories, color palette
    storage.js                  localStorage + image compression
    outfitEngine.js              outfit generation / pairing algorithm
    supabaseClient.js            Supabase client + table name
    useCloudState.js             the localStorage <-> Supabase sync hook
  components/
    ui.jsx                      shared Modal / TagBox / StarPicker / ImageDrop / edit & remove buttons
    AuthScreen.jsx               sign in / sign up / "check your email"
    AccountBar.jsx               avatar, sign out, backup/restore menu
    PinterestHeader.jsx          masonry-collage header with the title
    ClosetComputer.jsx           outfit generator + "style around this" panel
    ClosetTab.jsx
    InspoTab.jsx
    DiaryTab.jsx
    ShopTab.jsx
```
