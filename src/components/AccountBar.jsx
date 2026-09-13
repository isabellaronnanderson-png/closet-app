import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const BACKUP_KEYS = ['closet-items', 'inspo-items', 'diary-entries', 'shopping-items', 'header-photos']

export default function AccountBar({ session, data, setters }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const fileInputRef = useRef(null)
  const menuWrapRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e) {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOpen])

  const email = session?.user?.email || ''
  const initial = email ? email[0].toUpperCase() : '?'

  function downloadBackup() {
    const payload = {
      app: 'closet organizer',
      exportedAt: new Date().toISOString(),
      data,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `closet-organizer-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  function triggerRestore() {
    fileInputRef.current?.click()
    setMenuOpen(false)
  }

  async function handleRestoreFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const incoming = parsed?.data ?? parsed

      const foundAnyKey = BACKUP_KEYS.some((k) => k in incoming)
      if (!foundAnyKey) {
        alert("This doesn't look like a closet organizer backup file.")
        return
      }
      if (!confirm('Restore from this backup? This will replace your current data (and push the restored data to your account).')) {
        return
      }

      if ('closet-items' in incoming) setters.setClosetItems(incoming['closet-items'])
      if ('inspo-items' in incoming) setters.setInspoItems(incoming['inspo-items'])
      if ('diary-entries' in incoming) setters.setDiaryEntries(incoming['diary-entries'])
      if ('shopping-items' in incoming) setters.setShopItems(incoming['shopping-items'])
      if ('header-photos' in incoming) setters.setHeaderPhotos(incoming['header-photos'])

      alert('Backup restored.')
    } catch (err) {
      console.error(err)
      alert("Couldn't read that file — make sure it's a backup exported from this app.")
    }
  }

  return (
    <div className="account-bar">
      <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleRestoreFile} />

      <div className="account-bar-menu-wrap" ref={menuWrapRef}>
        <button className="btn ghost small" onClick={() => setMenuOpen((v) => !v)}>Backup ▾</button>
        {menuOpen && (
          <div className="account-bar-menu">
            <button onClick={downloadBackup}>Download backup</button>
            <button onClick={triggerRestore}>Restore from file</button>
          </div>
        )}
      </div>

      <div className="account-avatar" title={email}>{initial}</div>
      <button className="btn ghost small" onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  )
}
