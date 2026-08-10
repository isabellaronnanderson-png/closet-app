import React from 'react'

export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <button className="close-x" onClick={onClose} aria-label="Close">×</button>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function TagBox({ options, selected, onToggle }) {
  return (
    <div className="tagbox">
      {options.map((tag) => (
        <div
          key={tag}
          className={'tagpill' + (selected.has(tag) ? ' on' : '')}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </div>
      ))}
    </div>
  )
}

export function StarPicker({ value, onChange }) {
  return (
    <div className="starpick">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} onClick={() => onChange(i)}>{i <= value ? '★' : '☆'}</span>
      ))}
    </div>
  )
}

export function ImageDrop({ label, image, onFile }) {
  const inputRef = React.useRef(null)
  return (
    <div className="imgdrop" onClick={() => inputRef.current?.click()}>
      {image ? (
        <>
          <img src={image} alt="" />
          <div>tap to change</div>
        </>
      ) : (
        label
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]) }}
      />
    </div>
  )
}
