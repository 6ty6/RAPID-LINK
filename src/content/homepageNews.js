// Featured articles take priority; recent stories fill the remaining spaces.
export function selectHomepageNews(articles, limit = 3) {
  return [...articles].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    || (b.publishedAt || '').localeCompare(a.publishedAt || '')
    || a.slug.localeCompare(b.slug)).slice(0, limit)
}
