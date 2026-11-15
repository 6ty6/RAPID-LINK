import { getAnnouncements } from '../content/index.js'

function AnnouncementGroup({ announcements, duplicate = false }) {
  return <div className="announcement-group" aria-hidden={duplicate || undefined}>
    {announcements.map(({ id, message }) => <span className="announcement-item" key={id}><span className="announcement-marker" aria-hidden="true" />{message}</span>)}
  </div>
}

export default function AnnouncementBar() {
  const announcements = getAnnouncements()
  return <aside className="announcement-bar" aria-label="RapidLink announcements">
    <p className="visually-hidden">{announcements.map(item => item.message).join(' ')}</p>
    <div className="announcement-track" aria-hidden="true">
      <AnnouncementGroup announcements={announcements} />
      <AnnouncementGroup announcements={announcements} duplicate />
    </div>
  </aside>
}
