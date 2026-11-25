import { defineArrayMember, defineField, defineType } from 'sanity'

export const newsArticle = defineType({
  name: 'newsArticle',
  title: 'News article',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: rule => rule.required() }),
    defineField({ name: 'category', title: 'Category', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'publishedAt', title: 'Publication date', type: 'date', validation: rule => rule.required() }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 3, validation: rule => rule.required() }),
    defineField({ name: 'image', title: 'Article image', type: 'image', options: { hotspot: true }, validation: rule => rule.required() }),
    defineField({ name: 'imageAlt', title: 'Image description', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'featured', title: 'Feature on homepage', type: 'boolean', initialValue: false }),
    defineField({ name: 'isPublished', title: 'Visible on website', type: 'boolean', initialValue: false }),
    defineField({
      name: 'sections', title: 'Article sections', type: 'array', of: [defineArrayMember({
        type: 'object', name: 'articleSection', fields: [
          defineField({ name: 'heading', title: 'Heading', type: 'string' }),
          defineField({ name: 'paragraphs', title: 'Paragraphs', type: 'array', of: [{ type: 'text' }] }),
        ],
      })],
    }),
    defineField({ name: 'externalLink', title: 'Optional external link', type: 'url' }),
    defineField({ name: 'externalLabel', title: 'External-link label', type: 'string' }),
  ],
  preview: { select: { title: 'title', subtitle: 'category', media: 'image' } },
})
