import useSanityContent from './useSanityContent.js'
import { getSanitySharedContent } from '../services/content/sanityContentRepository.js'
import { sharedContent } from '../content/shared.js'
export default function useSharedContent() {
  return useSanityContent('shared', getSanitySharedContent, sharedContent).data
}
