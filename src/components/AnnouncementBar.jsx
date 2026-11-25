import { announcements as localAnnouncements } from '../content'
import useSanityContent from '../hooks/useSanityContent.js'
import { getSanityPublishedAnnouncements } from '../services/content/sanityContentRepository.js'

function AnnouncementGroup({ announcements, duplicate = false }) {
  return <div className="announcement-group" aria-hidden={duplicate || undefined}>
    {announcements.map(message => <span className="announcement-item" key={message}><span className="announcement-marker" aria-hidden="true" />{message}</span>)}
  </div>
}

export default function AnnouncementBar() {
  const { data, loading } = useSanityContent('announcements', getSanityPublishedAnnouncements, localAnnouncements.map(message => ({ message })), { clearOnError: true })
  const announcements = data.map(item => item.message)
  if (loading || !announcements.length) return null
  return <aside className="announcement-bar" aria-label="RapidLink announcements">
    <p className="visually-hidden">{announcements.join(' ')}</p>
    <div className="announcement-track" aria-hidden="true">
      <AnnouncementGroup announcements={announcements} />
      <AnnouncementGroup announcements={announcements} duplicate />
    </div>
  </aside>
}
