import React from 'react'
import ClosetComputer from './ClosetComputer.jsx'

export default function MixTab({ closetItems, diaryEntries }) {
  return (
    <div className="panel">
      <ClosetComputer closetItems={closetItems} diaryEntries={diaryEntries} />
    </div>
  )
}
