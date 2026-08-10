import React, { useState } from 'react'
import { generateOutfit, suggestPairings } from '../lib/outfitEngine.js'

export default function ClosetComputer({ closetItems, diaryEntries }) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null) // { kind: 'outfit'|'pairing', picks, label }
  const [styleWithId, setStyleWithId] = useState('')

  function mixOutfit() {
    if (closetItems.length < 2) {
      setResult({ kind: 'message', text: "Add a few more closet items first — I need at least a top/bottom or dress plus shoes to work with." })
      return
    }
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      const picks = generateOutfit(closetItems, diaryEntries)
      if (picks.length === 0) {
        setResult({ kind: 'message', text: "Couldn't find enough pieces — add tops, bottoms or a dress, plus shoes." })
      } else {
        setResult({ kind: 'outfit', picks })
      }
    }, 800)
  }

  function showPairings() {
    if (!styleWithId) {
      setResult({ kind: 'message', text: 'Pick an item above first.' })
      return
    }
    const base = closetItems.find((i) => i.id === styleWithId)
    const suggestions = suggestPairings(base, closetItems, diaryEntries)
    if (suggestions.length === 0) {
      setResult({ kind: 'message', text: `No pairing data yet for "${base.name}" — log a few diary entries wearing it and I'll learn what goes with it.` })
    } else {
      setResult({ kind: 'pairing', base, picks: suggestions.map((it) => [it, it.category]) })
    }
  }

  return (
    <div className="closet-computer">
      <div className="cc-header">
        <h2>💻 the closet computer</h2>
        <button className="btn pink" onClick={mixOutfit}>Mix me an outfit ✨</button>
      </div>
      <div className="cc-screen">
        {scanning && <div className="scanline" />}
        {!scanning && !result && (
          <div className="cc-placeholder">
            Tap the button — I'll build you something from what's actually in your closet, favoring pieces you love and haven't worn in a while.
          </div>
        )}
        {!scanning && result?.kind === 'message' && (
          <div className="cc-placeholder">{result.text}</div>
        )}
        {!scanning && result?.kind === 'outfit' && (
          <div className="cc-results">
            {result.picks.map(([it, label]) => (
              <div className="cc-slot" key={it.id}>
                {it.image && <img src={it.image} alt={it.name} />}
                <div className="lab">{label}</div>
                <div className="nm">{it.name}</div>
              </div>
            ))}
          </div>
        )}
        {!scanning && result?.kind === 'pairing' && (
          <>
            <div className="cc-note">styled with {result.base.name}</div>
            <div className="cc-results">
              {result.picks.map(([it, label]) => (
                <div className="cc-slot" key={it.id}>
                  {it.image && <img src={it.image} alt={it.name} />}
                  <div className="lab">{label}</div>
                  <div className="nm">{it.name}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="style-with-box">
        <span className="mono" style={{ fontSize: 12 }}>or style around:</span>
        <select value={styleWithId} onChange={(e) => setStyleWithId(e.target.value)}>
          <option value="">choose an item…</option>
          {closetItems.map((it) => (
            <option key={it.id} value={it.id}>{it.name} ({it.category})</option>
          ))}
        </select>
        <button className="btn sky small" onClick={showPairings}>show me pairings</button>
      </div>
    </div>
  )
}
