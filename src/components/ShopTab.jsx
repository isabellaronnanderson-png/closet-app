import React, { useState } from 'react'
import { Modal, TagBox, ImageDrop, RemoveButton } from './ui.jsx'
import { SEASONS, OCCASIONS, CATEGORIES, accentFor } from '../lib/constants.js'
import { fileToCompressedDataURL } from '../lib/storage.js'

export default function ShopTab({ shopItems, setShopItems }) {
  const [filterTag, setFilterTag] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const filtered = (cat) => {
    let items = shopItems.filter((i) => i.category === cat)
    if (filterTag) items = items.filter((i) => i.seasons.includes(filterTag) || i.occasions.includes(filterTag))
    return items.slice().reverse()
  }

  function removeItem(id) {
    setShopItems(shopItems.filter((i) => i.id !== id))
  }

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

      {shopItems.length === 0 && (
        <div className="empty-state">Nothing saved yet — paste a link when something catches your eye.</div>
      )}

      {CATEGORIES.map((cat, i) => {
        const items = filtered(cat)
        if (items.length === 0) return null
        return (
          <div className="cat-block" key={cat}>
            <div className="cat-title" style={{ color: accentFor(i) }}>{cat}</div>
            <div className="hscroll">
              {items.map((it) => <ShopCard key={it.id} item={it} today={today} onRemove={() => removeItem(it.id)} />)}
            </div>
          </div>
        )
      })}

      {showAdd && (
        <AddShopModal onClose={() => setShowAdd(false)} onSave={(item) => { setShopItems([...shopItems, item]); setShowAdd(false) }} />
      )}
    </div>
  )
}

function ShopCard({ item, today, onRemove }) {
  return (
    <div className="card" onClick={() => window.open(item.url, '_blank', 'noopener')}>
      <RemoveButton onRemove={onRemove} label="Remove from shopping list" />
      {item.checkDate && item.checkDate <= today && <div className="badge">check me</div>}
      {item.image ? <img className="thumb" src={item.image} alt={item.name} /> : <div className="thumb empty">no photo</div>}
      <div className="cap">{item.name}</div>
      {item.price && <div className="price">{item.price}</div>}
      <div className="tagline2">{item.seasons.length ? item.seasons.join(', ') : '\u00A0'}</div>
    </div>
  )
}

function AddShopModal({ onClose, onSave }) {
  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
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
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. cropped cardigan" />
      </div>
      <div className="field">
        <label>Link</label>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
      </div>
      <div className="field">
        <label>Price (optional)</label>
        <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. £48" />
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
            id: 's' + Date.now(), name: name.trim(), url: url.trim(), price: price.trim(), image, category,
            seasons: [...seasons], occasions: [...occasions],
            checkDate: checkDate || null, inStock: true, createdAt: Date.now(),
          })
        }}>Save</button>
      </div>
    </Modal>
  )
}
