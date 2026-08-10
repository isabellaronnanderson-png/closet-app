import React, { useState } from 'react'
import { Modal, TagBox, ImageDrop } from './ui.jsx'
import { SEASONS, OCCASIONS, CATEGORIES, accentFor } from '../lib/constants.js'
import { fileToCompressedDataURL } from '../lib/storage.js'
import ClosetComputer from './ClosetComputer.jsx'

export default function ClosetTab({ closetItems, setClosetItems, diaryEntries }) {
  const [filterTag, setFilterTag] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  function addItem(item) {
    setClosetItems([...closetItems, item])
  }

  const filtered = (cat) => {
    let items = closetItems.filter((i) => i.category === cat)
    if (filterTag) items = items.filter((i) => i.seasons.includes(filterTag) || i.occasions.includes(filterTag))
    return items
  }

  return (
    <div className="panel">
      <ClosetComputer closetItems={closetItems} diaryEntries={diaryEntries} />

      <div className="section-head">
        <div>
          <h2>The Closet</h2>
          <div className="tagline">every piece you own, sorted &amp; ready</div>
        </div>
        <button className="btn" onClick={() => setShowAdd(true)}>+ Add item</button>
      </div>

      <div className="chiprow">
        {[...SEASONS, ...OCCASIONS].map((tag) => (
          <div key={tag} className={'chip' + (filterTag === tag ? ' on' : '')}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}>
            {tag}
          </div>
        ))}
      </div>

      {closetItems.length === 0 && (
        <div className="empty-state">Your closet is empty. Add your first piece — every outfit starts here.</div>
      )}

      {CATEGORIES.map((cat, i) => {
        const items = filtered(cat)
        if (items.length === 0) return null
        return (
          <div className="cat-block" key={cat}>
            <div className="cat-title" style={{ color: accentFor(i) }}>{cat}</div>
            <div className="hscroll">
              {items.map((it) => <ItemCard key={it.id} item={it} diaryEntries={diaryEntries} />)}
            </div>
          </div>
        )
      })}

      {showAdd && (
        <AddItemModal onClose={() => setShowAdd(false)} onSave={(item) => { addItem(item); setShowAdd(false) }} />
      )}
    </div>
  )
}

function ItemCard({ item, diaryEntries }) {
  const worn = diaryEntries.filter((d) => d.itemIds.includes(item.id))
  const avgRating = worn.length ? (worn.reduce((s, d) => s + d.rating, 0) / worn.length).toFixed(1) : null
  return (
    <div className="card">
      {item.image ? <img className="thumb" src={item.image} alt={item.name} /> : <div className="thumb empty">no photo</div>}
      <div className="cap">{item.name}</div>
      <div className="tagline2">{[...item.seasons, ...item.occasions].slice(0, 2).join(' · ') || '\u00A0'}</div>
      <div className="stars">{avgRating ? `worn ${worn.length}× · ${avgRating}★` : 'not worn yet'}</div>
    </div>
  )
}

function AddItemModal({ onClose, onSave }) {
  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [seasons, setSeasons] = useState(new Set())
  const [occasions, setOccasions] = useState(new Set())

  async function handleFile(file) {
    setImage(await fileToCompressedDataURL(file))
  }
  function toggle(set, setSet, tag) {
    const next = new Set(set)
    next.has(tag) ? next.delete(tag) : next.add(tag)
    setSet(next)
  }

  return (
    <Modal title="Add closet item" onClose={onClose}>
      <div className="field">
        <label>Photo</label>
        <ImageDrop label="tap to upload a photo" image={image} onFile={handleFile} />
      </div>
      <div className="field">
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. blue plaid mini skirt" />
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
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn pink" onClick={() => {
          if (!name.trim()) { alert('Give it a name!'); return }
          onSave({
            id: 'i' + Date.now(), name: name.trim(), image, category,
            seasons: [...seasons], occasions: [...occasions], createdAt: Date.now(),
          })
        }}>Save item</button>
      </div>
    </Modal>
  )
}
