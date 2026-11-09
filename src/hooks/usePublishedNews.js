import { useEffect, useState } from 'react'
import { getNews, getNewsSnapshot } from '../content/index.js'

export default function usePublishedNews() {
  const [initial] = useState(getNewsSnapshot)
  const [articles, setArticles] = useState(initial.records)
  const [loading, setLoading] = useState(initial.loading)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!initial.loading) return
    getNews()
      .then(setArticles)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [initial])

  return { articles, loading, error }
}
