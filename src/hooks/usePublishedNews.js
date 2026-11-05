import { useEffect, useState } from 'react'
import { newsArticles } from '../content'
import { contentAdminConfigured, getPublishedNews } from '../services/careers'

export default function usePublishedNews() {
  const [articles, setArticles] = useState(newsArticles)
  const [loading, setLoading] = useState(contentAdminConfigured)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!contentAdminConfigured) return
    getPublishedNews()
      .then(setArticles)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return { articles, loading, error }
}
