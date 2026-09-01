import React, { useMemo, useState } from 'react'
import { Modal, ImageDrop, RemoveButton, EditButton } from './ui.jsx'
import { fileToCompressedDataURL } from '../lib/storage.js'
import { SEASONS } from '../lib/constants.js'

const UNSORTED = 'Unsorted'

export default function InspoTab({ inspoItems, setInspoItems }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeBoard, setActiveBoard] = useState('All')

  function removeItem(id) {
    setInspoItems(inspoItems.filter((i) => i.id !== id))
  }

  function saveItem(item) {
    if (editingItem) {
      setInspoItems(inspoItems.map((i) => (i.id === item.id ? item : i)))
      setEditingItem(null)
    } else {
      setInspoItems([...inspoItems, item])
      setShowAdd(false)
    }
  }

  // Boards to show as tabs: the four seasons are always offered (so you can
  // switch to "Spring" before you've pinned anything to it yet), plus any
  // custom board names already in use, plus "Unsorted" if anything needs it.
  const boards = useMemo(() => {
    const custom = new Set(inspoItems.map((i) => i.board).filter((b) => b && !SEASONS.includes(b)))
    const hasUnsorted = inspoItems.some((i) => !i.board)
    return ['All', ...SEASONS, ...custom, ...(hasUnsorted ? [UNSORTED] : [])]
  }, [inspoItems])

  const visible = inspoItems
    .filter((i) => activeBoard === 'All' || (i.board || UNSORTED) === activeBoard)
    .slice()
    .reverse()

  return (
    <div className="panel">
      <div className="section-head">
        <div>
          <h2>Inspo Board</h2>
          <div className="tagline">screenshots &amp; pins that get the vision</div>
        </div>
        <button className="btn peach" onClick={() => setShowAdd(true)}>+ Add inspo</button>
      </div>

      <div className="chiprow">
        {boards.map((b) => (
          <div key={b} className={'chip' + (activeBoard === b ? ' on' : '')} onClick={() => setActiveBoard(b)}>
            {b}
          </div>
        ))}
      </div>

      {inspoItems.length === 0 ? (
        <div className="empty-state">No pins yet — drop in the screenshots that inspire your next look.</div>
      ) : visible.length === 0 ? (
        <div className="empty-state">Nothing pinned to {activeBoard} yet.</div>
      ) : (
        <div className="inspo-masonry">
          {visible.map((p) => (
            <div className="inspo-pin" key={p.id}>
              <EditButton onEdit={() => setEditingItem(p)} label="Edit this pin" />
              <RemoveButton onRemove={() => removeItem(p.id)} label="Remove pin" />
              <img className="inspo-pin-img" src={p.image} alt="" />
              {p.note && <div className="inspo-pin-cap">{p.note}</div>}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddInspoModal boards={SEASONS} onClose={() => setShowAdd(false)} onSave={saveItem} />
      )}
      {editingItem && (
        <AddInspoModal boards={SEASONS} item={editingItem} onClose={() => setEditingItem(null)} onSave={saveItem} />
      )}
    </div>
  )
}

function AddInspoModal({ boards, item, onClose, onSave }) {
  const isEditing = !!item
  const [image, setImage] = useState(item?.image ?? null)
  const [note, setNote] = useState(item?.note ?? '')
  const [board, setBoard] = useState(item?.board ?? '')

  async function handleFile(file) {
    setImage(await fileToCompressedDataURL(file))
  }

  return (
    <Modal title={isEditing ? 'Edit inspo pin' : 'Add inspo'} onClose={onClose}>
      <div className="field">
        <label>Screenshot / photo</label>
        <ImageDrop label="tap to upload" image={image} onFile={handleFile} />
      </div>
      <div className="field">
        <label>Board (optional)</label>
        <input
          type="text"
          list="inspo-board-suggestions"
          value={board}
          onChange={(e) => setBoard(e.target.value)}
          placeholder="e.g. Spring, or make up your own"
        />
        <datalist id="inspo-board-suggestions">
          {boards.map((b) => <option key={b} value={b} />)}
        </datalist>
      </div>
      <div className="field">
        <label>Note (optional)</label>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="what you love about this look" />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn peach" onClick={() => {
          if (!image) { alert('Add a photo first'); return }
          onSave({
            id: item?.id ?? 'p' + Date.now(),
            image, note: note.trim(), board: board.trim(),
            createdAt: item?.createdAt ?? Date.now(),
          })
        }}>{isEditing ? 'Save changes' : 'Pin it'}</button>
      </div>
    </Modal>
  )
}
