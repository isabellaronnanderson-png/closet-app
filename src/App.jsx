import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient.js'
import { useCloudState } from './lib/useCloudState.js'
import ClosetTab from './components/ClosetTab.jsx'
import InspoTab from './components/InspoTab.jsx'
import DiaryTab from './components/DiaryTab.jsx'
import ShopTab from './components/ShopTab.jsx'
import MixTab from './components/MixTab.jsx'
import PinterestHeader from './components/PinterestHeader.jsx'
import AuthScreen from './components/AuthScreen.jsx'
import AccountBar from './components/AccountBar.jsx'

const TABS = [
  { id: 'closet', label: 'Closet' },
  { id: 'mix', label: 'Mix' },
  { id: 'diary', label: 'Diary' },
  { id: 'shop', label: 'Shopping' },
  { id: 'inspo', label: 'Inspo' },
]

export default function App() {
  const [tab, setTab] = useState('closet')

  // undefined = still checking; null = signed out; object = signed in
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!isSupabaseConfigured) { setSession(null); return }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => listener.subscription.unsubscribe()
  }, [])

  // Every one of these is backed by localStorage immediately, and reconciles
  // with (then syncs to) Supabase once a session exists. See useCloudState.js.
  const [closetItems, setClosetItems] = useCloudState('closet-items', [], session)
  const [inspoItems, setInspoItems] = useCloudState('inspo-items', [], session)
  const [diaryEntries, setDiaryEntries] = useCloudState('diary-entries', [], session)
  const [shopItems, setShopItems] = useCloudState('shopping-items', [], session)
  const [headerPhotos, setHeaderPhotos] = useCloudState('header-photos', {}, session)

  if (!isSupabaseConfigured) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-title" style={{ fontSize: 26, fontFamily: 'Poppins, sans-serif', color: 'var(--ink)' }}>
            Supabase isn't configured
          </h1>
          <p className="auth-text" style={{ textAlign: 'left' }}>
            This app needs a <code>.env</code> file in the project root with:
          </p>
          <pre style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 8, fontSize: 12, overflowX: 'auto' }}>
VITE_SUPABASE_URL=https://your-project.supabase.co{'\n'}VITE_SUPABASE_ANON_KEY=your-anon-key
          </pre>
          <p className="auth-text" style={{ textAlign: 'left' }}>
            Copy <code>.env.example</code> to <code>.env</code> and fill those in, then restart
            <code> npm run dev</code>. If you're seeing this on a deployed site, add the same two
            variables in your hosting provider's project settings and redeploy.
          </p>
        </div>
      </div>
    )
  }

  if (session === undefined) {
    return <div className="auth-loading">loading…</div>
  }

  if (!session) {
    return <AuthScreen />
  }

  return (
    <>
      <AccountBar
        session={session}
        data={{
          'closet-items': closetItems,
          'inspo-items': inspoItems,
          'diary-entries': diaryEntries,
          'shopping-items': shopItems,
          'header-photos': headerPhotos,
        }}
        setters={{
          setClosetItems,
          setInspoItems,
          setDiaryEntries,
          setShopItems,
          setHeaderPhotos,
        }}
      />

      <PinterestHeader photos={headerPhotos} setPhotos={setHeaderPhotos} />

      <div className="app-shell">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={'tab-btn' + (tab === t.id ? ' active' : '')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'closet' && (
          <ClosetTab closetItems={closetItems} setClosetItems={setClosetItems} diaryEntries={diaryEntries} />
        )}
        {tab === 'mix' && (
          <MixTab closetItems={closetItems} diaryEntries={diaryEntries} />
        )}
        {tab === 'inspo' && (
          <InspoTab inspoItems={inspoItems} setInspoItems={setInspoItems} />
        )}
        {tab === 'diary' && (
          <DiaryTab diaryEntries={diaryEntries} setDiaryEntries={setDiaryEntries} closetItems={closetItems} />
        )}
        {tab === 'shop' && (
          <ShopTab shopItems={shopItems} setShopItems={setShopItems} />
        )}

        <footer className="credit">synced to your account · cached locally for speed</footer>
      </div>
    </>
  )
}
