const text = value => typeof value === 'string' && value.trim().length > 0
export const safeSlug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)

// Select public presentation fields explicitly. Never serialize complete API
// rows, staff records, credentials or authentication/session responses.
export function publicSnapshot(news, vacancies) {
  if (!Array.isArray(news) || !Array.isArray(vacancies)) throw new Error('Invalid public content response.')
  const slugs = new Set()
  return {
    news: news.map(article => {
      if (!safeSlug(article.slug) || slugs.has(article.slug) || article.is_published === false ||
          ![article.title, article.summary, article.category, article.image, article.imageAlt].every(text) ||
          !/^\d{4}-\d{2}-\d{2}$/.test(article.publishedAt) || !Array.isArray(article.sections)) {
        throw new Error('Invalid or duplicate public news record.')
      }
      slugs.add(article.slug)
      return {
        slug: article.slug, title: article.title, summary: article.summary,
        category: article.category, image: article.image, imageAlt: article.imageAlt,
        publishedAt: article.publishedAt, featured: Boolean(article.featured),
        externalLink: article.externalLink || '', externalLabel: article.externalLabel || '',
        sections: article.sections.map(section => {
          if (!Array.isArray(section.paragraphs) || !section.paragraphs.every(text)) throw new Error('Invalid public article section.')
          return { ...(section.heading ? { heading: section.heading } : {}), paragraphs: [...section.paragraphs] }
        }),
      }
    }),
    vacancies: vacancies.map(vacancy => {
      if (vacancy.is_published !== true || ![vacancy.id, vacancy.title, vacancy.department, vacancy.location,
        vacancy.employment_type, vacancy.summary, vacancy.application_email].every(text) ||
        !['open', 'closed'].includes(vacancy.status) || !Array.isArray(vacancy.responsibilities) ||
        !vacancy.responsibilities.every(text)) throw new Error('Invalid public vacancy record.')
      return {
        id: vacancy.id, title: vacancy.title, department: vacancy.department, location: vacancy.location,
        employment_type: vacancy.employment_type, summary: vacancy.summary,
        application_email: vacancy.application_email, status: vacancy.status,
        is_published: true, responsibilities: [...vacancy.responsibilities],
      }
    }),
  }
}

export function serializeSnapshot(snapshot) {
  return JSON.stringify(snapshot).replace(/[<>&\u2028\u2029]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`)
}
