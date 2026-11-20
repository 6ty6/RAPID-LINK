import { useEffect, useState } from 'react'
import { usePublicCms } from '../cms/public'
import { newsArticles } from '../content'
import { contentAdminConfigured, getPublishedNews } from '../services/careers'

export default function usePublishedNews() {
  const cms = usePublicCms()
  const [articles, setArticles] = useState(newsArticles)
  const [loading, setLoading] = useState(contentAdminConfigured)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (cms.enabled || !contentAdminConfigured) return
    getPublishedNews()
      .then(setArticles)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [cms.enabled])

  return cms.enabled ? { articles: cms.records.filter(record => record.kind === 'news'), loading: cms.loading, error: cms.error } : { articles, loading, error }
}
