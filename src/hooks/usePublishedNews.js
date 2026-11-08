import { useEffect, useState } from 'react'
import { getInitialNews, getPublishedNews, isNewsContentRemote } from '../services/content'

export default function usePublishedNews() {
  const [articles, setArticles] = useState(getInitialNews)
  const [loading, setLoading] = useState(isNewsContentRemote)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!isNewsContentRemote) return
    getPublishedNews()
      .then(setArticles)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return { articles, loading, error }
}
