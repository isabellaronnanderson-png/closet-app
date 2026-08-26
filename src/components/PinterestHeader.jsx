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

export default function PinterestHeader() {
  const [photos, setPhotos] = useState(() => loadList('header-photos', {}))
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
    setPhotos((prev) => ({ ...prev, [activeSlot]: dataUrl }))
  }

  function clearPhoto(slotId, e) {
    e.stopPropagation()
    setPhotos((prev) => {
      const next = { ...prev }
      delete next[slotId]
      return next
    })
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
                {col.map((pin) => {
                  const photo = photos[pin.id]
                  return (
                    <div
                      key={pin.id}
                      className="pin"
                      onClick={() => openPicker(pin.id)}
                      style={{
                        height: pin.h,
                        background: photo ? undefined : pin.bg,
                        borderRadius: pin.r,
                        filter: `url(#${pin.f}) saturate(1.15) contrast(1.05)`,
                      }}
                    >
                      {photo && <img src={photo} alt="" className="pin-photo" />}
                      <div className="pin-hint">{photo ? 'change' : '+ add photo'}</div>
                      {photo && (
                        <button className="pin-clear" onClick={(e) => clearPhoto(pin.id, e)} title="Remove photo">×</button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="corner-title">
          <span>closet organizer</span>
        </div>
      </div>

      {!hasAnyPhoto && (
        <div className="header-tip">click any block to drop in your own photo</div>
      )}
    </>
  )
}
