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

export function RemoveButton({ onRemove, label = 'Remove' }) {
  return (
    <button
      className="card-remove"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onRemove()
      }}
    >
      ×
    </button>
  )
}

export function EditButton({ onEdit, label = 'Edit' }) {
  return (
    <button
      className="card-edit"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onEdit()
      }}
    >
      ✎
    </button>
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
  const [dragOver, setDragOver] = React.useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) onFile(file)
  }

  return (
    <div
      className={'imgdrop' + (dragOver ? ' drag-over' : '')}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {image ? (
        <>
          <img src={image} alt="" />
          <div>tap to change, or drag a new photo here</div>
        </>
      ) : (
        <>
          <div>{label}</div>
          <div className="imgdrop-sub">or drag a photo here</div>
        </>
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
