import useSanityContent from './useSanityContent.js'
import { getSanitySiteInformation } from '../services/content/sanityContentRepository.js'
import { siteInformation } from '../content/site.js'
export default function useSiteInformation() {
  return useSanityContent('site', getSanitySiteInformation, siteInformation).data
}
