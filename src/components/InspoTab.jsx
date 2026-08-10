import React, { useState } from 'react'
import { Modal, ImageDrop } from './ui.jsx'
import { fileToCompressedDataURL } from '../lib/storage.js'

export default function InspoTab({ inspoItems, setInspoItems }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="panel">
      <div className="section-head">
        <div>
          <h2>Inspo Board</h2>
          <div className="tagline">screenshots &amp; pins that get the vision</div>
        </div>
        <button className="btn pink" onClick={() => setShowAdd(true)}>+ Add inspo</button>
      </div>

      {inspoItems.length === 0 ? (
        <div className="empty-state">No pins yet — drop in the screenshots that inspire your next look.</div>
      ) : (
        <div className="hscroll">
          {inspoItems.slice().reverse().map((p) => (
            <div className="card" key={p.id}>
              <img className="thumb" src={p.image} alt="" />
              {p.note && <div className="cap">{p.note}</div>}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddInspoModal
          onClose={() => setShowAdd(false)}
          onSave={(item) => { setInspoItems([...inspoItems, item]); setShowAdd(false) }}
        />
      )}
    </div>
  )
}

function AddInspoModal({ onClose, onSave }) {
  const [image, setImage] = useState(null)
  const [note, setNote] = useState('')

  async function handleFile(file) {
    setImage(await fileToCompressedDataURL(file))
  }

  return (
    <Modal title="Add inspo" onClose={onClose}>
      <div className="field">
        <label>Screenshot / photo</label>
        <ImageDrop label="tap to upload" image={image} onFile={handleFile} />
      </div>
      <div className="field">
        <label>Note (optional)</label>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="what you love about this look" />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn pink" onClick={() => {
          if (!image) { alert('Add a photo first'); return }
          onSave({ id: 'p' + Date.now(), image, note: note.trim(), createdAt: Date.now() })
        }}>Pin it</button>
      </div>
    </Modal>
  )
}
