import React, { useState } from 'react'
import { Modal, StarPicker, RemoveButton, EditButton } from './ui.jsx'

export default function DiaryTab({ diaryEntries, setDiaryEntries, closetItems }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  function removeEntry(id) {
    setDiaryEntries(diaryEntries.filter((d) => d.id !== id))
  }

  function saveEntry(entry) {
    if (editingEntry) {
      setDiaryEntries(diaryEntries.map((d) => (d.id === entry.id ? entry : d)))
      setEditingEntry(null)
    } else {
      setDiaryEntries([...diaryEntries, entry])
      setShowAdd(false)
    }
  }

  return (
    <div className="panel">
      <div className="section-head">
        <div>
          <h2>Outfit Diary</h2>
          <div className="tagline">what you wore, how it felt</div>
        </div>
        <button className="btn grape" onClick={() => setShowAdd(true)}>+ Log today's outfit</button>
      </div>

      {diaryEntries.length === 0 ? (
        <div className="empty-state">No entries yet — log today's outfit to start training your closet computer.</div>
      ) : (
        diaryEntries
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((d) => (
            <DiaryRow
              key={d.id}
              entry={d}
              closetItems={closetItems}
              onRemove={() => removeEntry(d.id)}
              onEdit={() => setEditingEntry(d)}
            />
          ))
      )}

      {showAdd && (
        <AddDiaryModal closetItems={closetItems} onClose={() => setShowAdd(false)} onSave={saveEntry} />
      )}
      {editingEntry && (
        <AddDiaryModal closetItems={closetItems} entry={editingEntry} onClose={() => setEditingEntry(null)} onSave={saveEntry} />
      )}
    </div>
  )
}

function DiaryRow({ entry, closetItems, onRemove, onEdit }) {
  const items = entry.itemIds.map((id) => closetItems.find((i) => i.id === id)).filter(Boolean)
  return (
    <div className="diary-entry">
      <EditButton onEdit={onEdit} label="Edit this entry" />
      <RemoveButton onRemove={onRemove} label="Remove entry" />
      <div className="thumbs">
        {items.map((it) => it.image && <img key={it.id} src={it.image} alt={it.name} />)}
      </div>
      <div className="meta">
        <div className="date">{entry.date}</div>
        <div className="stars">{'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}</div>
        {entry.note && <div className="note">{entry.note}</div>}
      </div>
    </div>
  )
}

function AddDiaryModal({ closetItems, entry, onClose, onSave }) {
  const isEditing = !!entry
  const [date, setDate] = useState(entry?.date ?? new Date().toISOString().slice(0, 10))
  const [selected, setSelected] = useState(new Set(entry?.itemIds ?? []))
  const [rating, setRating] = useState(entry?.rating ?? 0)
  const [note, setNote] = useState(entry?.note ?? '')

  function toggle(id) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  return (
    <Modal title={isEditing ? 'Edit outfit entry' : 'Log an outfit'} onClose={onClose}>
      <div className="field">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label>What you wore (tap to select)</label>
        {closetItems.length === 0 ? (
          <div className="empty-state">Add closet items first!</div>
        ) : (
          <div className="gallery" style={{ maxHeight: 220, overflowY: 'auto', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 8 }}>
            {closetItems.map((it) => (
              <div
                key={it.id}
                className="card"
                style={{ padding: 5, outline: selected.has(it.id) ? '2px solid var(--red)' : 'none' }}
                onClick={() => toggle(it.id)}
              >
                {it.image ? <img className="thumb" src={it.image} alt={it.name} /> : <div className="thumb empty">no photo</div>}
                <div className="cap" style={{ fontSize: 10 }}>{it.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="field">
        <label>How did you feel in it?</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div className="field">
        <label>Notes (optional)</label>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="occasion, compliments, regrets…" />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn grape" onClick={() => {
          if (selected.size === 0) { alert('Select at least one item'); return }
          onSave({
            id: entry?.id ?? 'd' + Date.now(),
            date, itemIds: [...selected],
            rating: rating || 3, note: note.trim(),
            createdAt: entry?.createdAt ?? Date.now(),
          })
        }}>{isEditing ? 'Save changes' : 'Save entry'}</button>
      </div>
    </Modal>
  )
}
