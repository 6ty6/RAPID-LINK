import { useContext, useEffect, useState } from 'react'
import { getNews, getNewsSnapshot } from '../content/index.js'
import { PublicContentContext } from '../content/PublicContentContext.jsx'

export default function usePublishedNews() {
  const snapshot = useContext(PublicContentContext)
  const [initial] = useState(() => snapshot ? { records: snapshot.news, loading: false } : getNewsSnapshot())
  const [articles, setArticles] = useState(initial.records)
  const [loading, setLoading] = useState(initial.loading)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!initial.loading && !snapshot) return
    getNews()
      .then(setArticles)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [initial, snapshot])

  return { articles, loading, error }
}
