import React from 'react'

// Each letter is its own little "cutout" — mismatched font, colored paper,
// white text, slight rotation. Values are hand-tuned rather than randomized
// so the title looks the same every time it renders. Backgrounds cycle
// through exactly the six accent colors — no black or off-palette tiles.
const LETTERS = [
  { ch: 'b', font: "'Permanent Marker'", bg: '#444482', rotate: -6 },
  { ch: 'e', font: "'Courier Prime'", bg: '#77AAFC', rotate: 4 },
  { ch: 'l', font: "'Special Elite'", bg: '#9B5CB8', rotate: -3 },
  { ch: 'l', font: "'Poppins'", italic: true, bg: '#589448', rotate: 5 },
  { ch: 'a', font: "'Sacramento'", big: true, bg: '#9E0B03', rotate: -8 },
  { ch: "'", font: "'Courier Prime'", bg: '#F5F5A9', dark: true, rotate: 2 },
  { ch: 's', font: "'Permanent Marker'", bg: '#444482', rotate: -4 },
  { ch: ' ', space: true },
  { ch: 'c', font: "'Special Elite'", bg: '#77AAFC', rotate: 3 },
  { ch: 'l', font: "'Poppins'", italic: true, bg: '#9B5CB8', rotate: -5 },
  { ch: 'o', font: "'Courier Prime'", bg: '#589448', rotate: 4 },
  { ch: 's', font: "'Permanent Marker'", bg: '#9E0B03', rotate: -3 },
  { ch: 'e', font: "'Sacramento'", big: true, bg: '#F5F5A9', dark: true, rotate: 6 },
  { ch: 't', font: "'Special Elite'", bg: '#444482', rotate: -4 },
]

export default function CollageTitle() {
  return (
    <h1 className="collage-title" aria-label="bella's closet">
      {LETTERS.map((l, i) =>
        l.space ? (
          <span key={i} className="collage-space" />
        ) : (
          <span
            key={i}
            className="collage-letter"
            style={{
              fontFamily: l.font,
              fontStyle: l.italic ? 'italic' : 'normal',
              fontSize: l.big ? '1.5em' : '1em',
              background: l.bg,
              color: l.dark ? '#111111' : '#fff',
              transform: `rotate(${l.rotate}deg)`,
            }}
          >
            {l.ch}
          </span>
        )
      )}
    </h1>
  )
}
