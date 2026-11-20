import { Link } from 'react-router-dom'
import { PageHero } from '../components/Shared'
import { useManagedContent, usePublicCms } from './public'
export default function PublicDocuments() {
  const records = useManagedContent('document', []), cms = usePublicCms()
  return <><PageHero title="Public documents" eyebrow="Resources" intro="Approved information made available by RapidLink." /><section className="section"><div className="shell narrow">
    {records.map(record => <article className="panel" key={record.id}><h2>{record.title}</h2><p>{record.description}</p>{record.version && <p>Version: {record.version}</p>}{record.effectiveDate && <p>Effective: {record.effectiveDate}</p>}<a className="button" href={record.file} target="_blank" rel="noopener noreferrer">View document</a></article>)}
    {!records.length && !cms.loading && <p>Documents are currently unavailable. <Link to="/contact">Contact our team</Link> for help.</p>}
  </div></section></>
}
