import { defineField, defineType } from 'sanity'

const categoryOptions = [
  { title: 'Accounts', value: 'Accounts' },
  { title: 'Savings', value: 'Savings' },
  { title: 'Loans', value: 'Loans' },
  { title: 'Investments', value: 'Investments' },
  { title: 'Security', value: 'Security' },
  { title: 'General', value: 'General' },
]

export const faq = defineType({
  name: 'faq',
  title: 'Frequently asked question',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: rule => rule.required().min(5).max(180),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 5,
      validation: rule => rule.required().min(10).max(2000),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      description: 'Groups questions for editors. The public FAQ page currently shows one list ordered by Display order.',
      type: 'string',
      initialValue: 'General',
      options: { list: categoryOptions, layout: 'dropdown' },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description: 'Questions with lower numbers appear first on the website.',
      type: 'number',
      initialValue: 1,
      validation: rule => rule.required().integer().min(1).max(500),
    }),
    defineField({
      name: 'isPublished',
      title: 'Visible on website',
      description: 'Turn this on and publish the document to show it on the FAQ page.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [{
    title: 'Website order',
    name: 'websiteOrder',
    by: [{ field: 'displayOrder', direction: 'asc' }],
  }],
  preview: {
    select: { title: 'question', category: 'category', published: 'isPublished', order: 'displayOrder' },
    prepare: ({ title, category, published, order }) => ({
      title,
      subtitle: `${order ?? '–'} · ${category || 'General'} · ${published ? 'Visible' : 'Hidden'}`,
    }),
  },
})
