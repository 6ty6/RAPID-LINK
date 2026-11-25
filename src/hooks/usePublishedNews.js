import useSanityContent from './useSanityContent.js'
import { newsArticles } from '../content'
import { getSanityPublishedNews } from '../services/content/sanityContentRepository.js'

export default function usePublishedNews() {
  const { data: articles, loading, error } = useSanityContent('news', getSanityPublishedNews, newsArticles, { clearOnError: true })
  return { articles: loading ? [] : articles, loading, error }
}
