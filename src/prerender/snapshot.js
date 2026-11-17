const text = value => typeof value === 'string' && value.trim().length > 0
export const safeSlug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)

// Select public presentation fields explicitly. Never serialize complete API
// rows, staff records, credentials or authentication/session responses.
export function publicSnapshot(news, vacancies, impactCounters = [], faqs = []) {
  if (!Array.isArray(news) || !Array.isArray(vacancies) || !Array.isArray(impactCounters) || !Array.isArray(faqs)) throw new Error('Invalid public content response.')
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
    impactCounters: impactCounters.map(counter => {
      if (counter.is_published === false || !text(counter.label) || !Number.isInteger(counter.target) || counter.target < 0 ||
          !['branches', 'customers', 'years', 'products'].includes(counter.icon) ||
          (counter.prefix && typeof counter.prefix !== 'string') || (counter.suffix && typeof counter.suffix !== 'string')) {
        throw new Error('Invalid public impact counter record.')
      }
      return {
        id: counter.id || `${counter.icon}-${counter.label}`,
        target: counter.target,
        prefix: counter.prefix || '',
        suffix: counter.suffix || '',
        label: counter.label,
        icon: counter.icon,
        displayOrder: Number.isInteger(counter.displayOrder) ? counter.displayOrder : 0,
        verifiedAt: counter.verifiedAt || '',
      }
    }).sort((left, right) => left.displayOrder - right.displayOrder),
    faqs: faqs.map((faq, index) => {
      if (faq.is_published === false || !text(faq.question) || !text(faq.answer)) throw new Error('Invalid public FAQ record.')
      return {
        id: text(faq.id) ? faq.id : `faq-${index + 1}`,
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'General',
        displayOrder: Number.isInteger(faq.displayOrder) ? faq.displayOrder : index + 1,
      }
    }).sort((left, right) => left.displayOrder - right.displayOrder),
  }
}

export function serializeSnapshot(snapshot) {
  return JSON.stringify(snapshot).replace(/[<>&\u2028\u2029]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`)
}
