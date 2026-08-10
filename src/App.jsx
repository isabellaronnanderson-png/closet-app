import React, { useEffect, useState } from 'react'
import { loadList, saveList } from './lib/storage.js'
import ClosetTab from './components/ClosetTab.jsx'
import InspoTab from './components/InspoTab.jsx'
import DiaryTab from './components/DiaryTab.jsx'
import ShopTab from './components/ShopTab.jsx'

const TABS = [
  { id: 'closet', label: 'Closet' },
  { id: 'diary', label: 'Diary' },
  { id: 'shop', label: 'Shopping' },
  { id: 'inspo', label: 'Inspo' },
]

export default function App() {
  const [tab, setTab] = useState('closet')

  const [closetItems, setClosetItems] = useState(() => loadList('closet-items'))
  const [inspoItems, setInspoItems] = useState(() => loadList('inspo-items'))
  const [diaryEntries, setDiaryEntries] = useState(() => loadList('diary-entries'))
  const [shopItems, setShopItems] = useState(() => loadList('shopping-items'))

  useEffect(() => { saveList('closet-items', closetItems) }, [closetItems])
  useEffect(() => { saveList('inspo-items', inspoItems) }, [inspoItems])
  useEffect(() => { saveList('diary-entries', diaryEntries) }, [diaryEntries])
  useEffect(() => { saveList('shopping-items', shopItems) }, [shopItems])

  return (
    <div className="app-shell">
      <div className="masthead">
        <div className="kicker">personal style headquarters</div>
        <h1>Bella's Closet</h1>
        <div className="sub">your closet, your rules, your archive</div>
      </div>

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
      {tab === 'inspo' && (
        <InspoTab inspoItems={inspoItems} setInspoItems={setInspoItems} />
      )}
      {tab === 'diary' && (
        <DiaryTab diaryEntries={diaryEntries} setDiaryEntries={setDiaryEntries} closetItems={closetItems} />
      )}
      {tab === 'shop' && (
        <ShopTab shopItems={shopItems} setShopItems={setShopItems} />
      )}

      <footer className="credit">stored privately in this browser · built for you</footer>
    </div>
  )
}
