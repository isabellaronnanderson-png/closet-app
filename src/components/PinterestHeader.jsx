import React, { useEffect, useRef, useState } from 'react'
import { PALETTE } from '../lib/constants.js'
import { loadList, saveList, fileToCompressedDataURL } from '../lib/storage.js'

// Each slot has a stable id (used as the localStorage key for its photo),
// a fallback color for when no photo has been uploaded yet, a corner-radius
// mix, and which distortion filter it uses. Columns are hand-arranged
// (not auto-balanced CSS columns, which distribute unevenly) so every
// column gets a deliberate visual mix.
const COLUMNS = [
  [
    { id: 'h0', h: 260, bg: PALETTE.blue, r: '20px 10px 16px 12px', f: 'oilEdge1' },
    { id: 'h1', h: 200, bg: PALETTE.yellow, r: '10px 18px 10px 20px', f: 'oilEdge3' },
    { id: 'h2', h: 240, bg: PALETTE.brown, r: '16px 16px 22px 8px', f: 'oilEdge2' },
  ],
  [
    { id: 'h3', h: 230, bg: PALETTE.red, r: '22px 8px 18px 14px', f: 'oilEdge4' },
    { id: 'h4', h: 190, bg: PALETTE.olive, r: '10px 20px 12px 18px', f: 'oilEdge1' },
    { id: 'h5', h: 270, bg: PALETTE.yellow, r: '18px 12px 8px 22px', f: 'oilEdge3' },
    { id: 'h6', h: 220, bg: PALETTE.blue, r: '14px 16px 20px 10px', f: 'oilEdge2' },
  ],
  [
    { id: 'h7', h: 280, bg: PALETTE.brown, r: '20px 12px 10px 18px', f: 'oilEdge4' },
    { id: 'h8', h: 200, bg: PALETTE.red, r: '8px 22px 16px 14px', f: 'oilEdge1' },
    { id: 'h9', h: 240, bg: PALETTE.blue, r: '18px 10px 20px 12px', f: 'oilEdge3' },
  ],
  [
    { id: 'h10', h: 220, bg: PALETTE.olive, r: '12px 18px 14px 20px', f: 'oilEdge2' },
    { id: 'h11', h: 260, bg: PALETTE.yellow, r: '22px 14px 10px 16px', f: 'oilEdge4' },
    { id: 'h12', h: 190, bg: PALETTE.red, r: '10px 16px 22px 12px', f: 'oilEdge1' },
    { id: 'h13', h: 230, bg: PALETTE.brown, r: '16px 20px 12px 8px', f: 'oilEdge3' },
  ],
  [
    { id: 'h14', h: 270, bg: PALETTE.red, r: '14px 10px 18px 22px', f: 'oilEdge2' },
    { id: 'h15', h: 200, bg: PALETTE.brown, r: '20px 16px 8px 14px', f: 'oilEdge4' },
    { id: 'h16', h: 240, bg: PALETTE.olive, r: '12px 20px 14px 18px', f: 'oilEdge1' },
  ],
]

// Old saves stored a plain data-URL string per slot. New saves store
// { src, x, y } so the crop position can be remembered too. This upgrades
// old data in place the first time it's loaded.
function normalizePhotos(raw) {
  const next = {}
  for (const [id, val] of Object.entries(raw)) {
    next[id] = typeof val === 'string' ? { src: val, x: 50, y: 50 } : val
  }
  return next
}

const DRAG_THRESHOLD = 4 // px of movement before a click becomes a drag

export default function PinterestHeader() {
  const [photos, setPhotos] = useState(() => normalizePhotos(loadList('header-photos', {})))
  const [activeSlot, setActiveSlot] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => { saveList('header-photos', photos) }, [photos])

  const hasAnyPhoto = Object.keys(photos).length > 0

  function openPicker(slotId) {
    setActiveSlot(slotId)
    fileInputRef.current?.click()
  }

  async function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file || !activeSlot) return
    const dataUrl = await fileToCompressedDataURL(file, 700, 0.75)
    setPhotos((prev) => ({ ...prev, [activeSlot]: { src: dataUrl, x: 50, y: 50 } }))
  }

  function clearPhoto(slotId, e) {
    e.stopPropagation()
    setPhotos((prev) => {
      const next = { ...prev }
      delete next[slotId]
      return next
    })
  }

  function updatePosition(slotId, x, y) {
    setPhotos((prev) => ({ ...prev, [slotId]: { ...prev[slotId], x, y } }))
  }

  return (
    <>
      <div className="header-section">
        {/* Hidden SVG filters - each gives a slightly different hand-painted edge distortion */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <filter id="oilEdge1" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.03" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="oilEdge2" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.018" numOctaves="2" seed="23" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="oilEdge3" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.04" numOctaves="3" seed="41" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="oilEdge4" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.025 0.012" numOctaves="2" seed="59" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />

        <div className="board-wrap">
          <div className="board">
            {COLUMNS.map((col, ci) => (
              <div className="board-col" key={ci}>
                {col.map((pin) => (
                  <Pin
                    key={pin.id}
                    pin={pin}
                    photo={photos[pin.id]}
                    onOpenPicker={() => openPicker(pin.id)}
                    onClear={(e) => clearPhoto(pin.id, e)}
                    onReposition={(x, y) => updatePosition(pin.id, x, y)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="corner-title">
          <span>closet organizer</span>
        </div>
      </div>

      {!hasAnyPhoto && (
        <div className="header-tip">click any block to drop in your own photo — drag an uploaded photo to reframe it</div>
      )}
    </>
  )
}

function Pin({ pin, photo, onOpenPicker, onClear, onReposition }) {
  const elRef = useRef(null)
  const dragRef = useRef(null) // { startX, startY, startObjX, startObjY, moved }
  const [live, setLive] = useState(null) // { x, y } while actively dragging, for smooth feedback

  function handlePointerDown(e) {
    if (!photo) return // no photo yet - let the click fall through to open the picker
    const rect = elRef.current.getBoundingClientRect()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startObjX: photo.x,
      startObjY: photo.y,
      rectW: rect.width,
      rectH: rect.height,
      moved: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e) {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) d.moved = true
    if (!d.moved) return
    const dxPct = (dx / d.rectW) * 100
    const dyPct = (dy / d.rectH) * 100
    const nx = Math.min(100, Math.max(0, d.startObjX - dxPct))
    const ny = Math.min(100, Math.max(0, d.startObjY - dyPct))
    setLive({ x: nx, y: ny })
  }

  function handlePointerUp() {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    if (d.moved && live) {
      onReposition(live.x, live.y)
      setLive(null)
    } else {
      setLive(null)
      onOpenPicker()
    }
  }

  const pos = live || photo
  const objectPosition = photo ? `${pos.x}% ${pos.y}%` : undefined

  return (
    <div
      ref={elRef}
      className={'pin' + (photo ? ' pin-has-photo' : '')}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        height: pin.h,
        background: photo ? undefined : pin.bg,
        borderRadius: pin.r,
        filter: `url(#${pin.f}) saturate(1.15) contrast(1.05)`,
      }}
    >
      {photo && (
        <img src={photo.src} alt="" className="pin-photo" style={{ objectPosition }} draggable={false} />
      )}
      <div className="pin-hint">{photo ? 'drag to reframe · click to change' : '+ add photo'}</div>
      {photo && (
        <button className="pin-clear" onClick={onClear} title="Remove photo">×</button>
      )}
    </div>
  )
}
