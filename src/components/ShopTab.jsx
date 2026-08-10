import React, { useState } from 'react'
import { Modal, TagBox, ImageDrop } from './ui.jsx'
import { SEASONS, OCCASIONS, CATEGORIES } from '../lib/constants.js'
import { fileToCompressedDataURL } from '../lib/storage.js'

export default function ShopTab({ shopItems, setShopItems }) {
  const [filterTag, setFilterTag] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  let items = shopItems.slice().reverse()
  if (filterTag) items = items.filter((i) => i.seasons.includes(filterTag) || i.occasions.includes(filterTag))

  return (
    <div className="panel">
      <div className="section-head">
        <div>
          <h2>Shopping List</h2>
          <div className="tagline">things calling your name</div>
        </div>
        <button className="btn sky" onClick={() => setShowAdd(true)}>+ Save a link</button>
      </div>

      <div className="chiprow">
        {[...SEASONS, ...OCCASIONS].map((tag) => (
          <div key={tag} className={'chip' + (filterTag === tag ? ' on' : '')}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}>
            {tag}
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">Nothing saved yet — paste a link when something catches your eye. 🛍</div>
      ) : (
        <div className="gallery">
          {items.map((it) => (
            <div className="card" key={it.id} onClick={() => window.open(it.url, '_blank', 'noopener')}>
              {it.checkDate && it.checkDate <= today && <div className="badge">check me!</div>}
              {it.image ? <img className="thumb" src={it.image} alt={it.name} /> : <div className="thumb empty">🛍</div>}
              <div className="cap">{it.name}</div>
              <div className="tagline2">{it.category}{it.seasons.length ? ' · ' + it.seasons.join(', ') : ''}</div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddShopModal onClose={() => setShowAdd(false)} onSave={(item) => { setShopItems([...shopItems, item]); setShowAdd(false) }} />
      )}
    </div>
  )
}

function AddShopModal({ onClose, onSave }) {
  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [seasons, setSeasons] = useState(new Set())
  const [occasions, setOccasions] = useState(new Set())
  const [checkDate, setCheckDate] = useState('')

  async function handleFile(file) {
    setImage(await fileToCompressedDataURL(file))
  }
  function toggle(set, setSet, tag) {
    const next = new Set(set)
    next.has(tag) ? next.delete(tag) : next.add(tag)
    setSet(next)
  }

  return (
    <Modal title="Save a shopping link" onClose={onClose}>
      <div className="field">
        <label>Photo / screenshot (optional)</label>
        <ImageDrop label="tap to upload" image={image} onFile={handleFile} />
      </div>
      <div className="field">
        <label>Item name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. cropped yellow cardigan" />
      </div>
      <div className="field">
        <label>Link</label>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
      </div>
      <div className="field">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Season</label>
        <TagBox options={SEASONS} selected={seasons} onToggle={(t) => toggle(seasons, setSeasons, t)} />
      </div>
      <div className="field">
        <label>Occasion</label>
        <TagBox options={OCCASIONS} selected={occasions} onToggle={(t) => toggle(occasions, setOccasions, t)} />
      </div>
      <div className="field">
        <label>Remind me to check stock on (optional)</label>
        <input type="date" value={checkDate} onChange={(e) => setCheckDate(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn sky" onClick={() => {
          if (!name.trim() || !url.trim()) { alert('Add a name and link'); return }
          onSave({
            id: 's' + Date.now(), name: name.trim(), url: url.trim(), image, category,
            seasons: [...seasons], occasions: [...occasions],
            checkDate: checkDate || null, inStock: true, createdAt: Date.now(),
          })
        }}>Save</button>
      </div>
    </Modal>
  )
}
