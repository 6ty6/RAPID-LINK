import { useContext, useEffect, useState } from 'react'
import { PublicContentContext } from '../content/PublicContentContext.jsx'
import { getAnnouncementsSnapshot, getPublishedAnnouncements } from '../content/index.js'

function AnnouncementGroup({ announcements, duplicate = false }) {
  return <div className="announcement-group" aria-hidden={duplicate || undefined}>
    {announcements.map(({ id, message }) => <span className="announcement-item" key={id}><span className="announcement-marker" aria-hidden="true" />{message}</span>)}
  </div>
}

export default function AnnouncementBar() {
  const snapshot = useContext(PublicContentContext)
  const [initial] = useState(() => {
    const fallback = getAnnouncementsSnapshot()
    return snapshot && Array.isArray(snapshot.announcements)
      ? { records: snapshot.announcements, loading: fallback.loading }
      : fallback
  })
  const [announcements, setAnnouncements] = useState(initial.records)

  useEffect(() => {
    if (!initial.loading) return undefined
    let active = true
    getPublishedAnnouncements()
      .then(records => { if (active) setAnnouncements(records) })
      .catch(() => {})
    return () => { active = false }
  }, [initial.loading])

  if (!announcements.length) return null

  return <aside className="announcement-bar" aria-label="RapidLink announcements">
    <p className="visually-hidden">{announcements.map(item => item.message).join(' ')}</p>
    <div className="announcement-track" aria-hidden="true">
      <AnnouncementGroup announcements={announcements} />
      <AnnouncementGroup announcements={announcements} duplicate />
    </div>
  </aside>
}
