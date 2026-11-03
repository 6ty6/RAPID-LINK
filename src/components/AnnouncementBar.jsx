import { announcements } from '../content'

function AnnouncementGroup({ duplicate = false }) {
  return <div className="announcement-group" aria-hidden={duplicate || undefined}>
    {announcements.map(message => <span className="announcement-item" key={message}><span className="announcement-marker" aria-hidden="true" />{message}</span>)}
  </div>
}

export default function AnnouncementBar() {
  return <aside className="announcement-bar" aria-label="RapidLink announcements">
    <p className="visually-hidden">{announcements.join(' ')}</p>
    <div className="announcement-track" aria-hidden="true">
      <AnnouncementGroup />
      <AnnouncementGroup duplicate />
    </div>
  </aside>
}
