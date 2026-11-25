import AccountApplicationForm from './AccountApplicationForm'
import { PageMeta } from '../components/Shared'

export default function OpenAccount() {
  return <>
    <PageMeta title="Account application" description="Try the RapidLink account application form. Submissions are currently disabled." noIndex />
    <AccountApplicationForm />
  </>
}
