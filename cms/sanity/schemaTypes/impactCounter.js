import { defineField, defineType } from 'sanity'

const iconOptions = [
  { title: 'Branches', value: 'branches' },
  { title: 'Customers', value: 'customers' },
  { title: 'Years', value: 'years' },
  { title: 'Financial products', value: 'products' },
]

export const impactCounter = defineType({
  name: 'impactCounter',
  title: 'Impact counter',
  type: 'document',
  fields: [
    defineField({ name: 'label', title: 'Counter description', type: 'string', validation: rule => rule.required().max(80) }),
    defineField({ name: 'target', title: 'Number', type: 'number', validation: rule => rule.required().integer().min(0).max(1000000000) }),
    defineField({ name: 'prefix', title: 'Optional prefix', type: 'string', description: 'For example GH₵.', validation: rule => rule.max(8) }),
    defineField({ name: 'suffix', title: 'Optional suffix', type: 'string', description: 'For example + or %.', validation: rule => rule.max(8) }),
    defineField({ name: 'icon', title: 'Icon', type: 'string', options: { list: iconOptions }, validation: rule => rule.required() }),
    defineField({ name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 1, validation: rule => rule.required().integer().min(1).max(20) }),
    defineField({ name: 'isPublished', title: 'Visible on website', type: 'boolean', initialValue: false }),
    defineField({ name: 'verifiedAt', title: 'Last verified date', type: 'date', description: 'Record when the organisation confirmed this number.' }),
  ],
  orderings: [{ title: 'Website order', name: 'websiteOrder', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: {
    select: { title: 'label', target: 'target', prefix: 'prefix', suffix: 'suffix', published: 'isPublished' },
    prepare: ({ title, target, prefix = '', suffix = '', published }) => ({
      title,
      subtitle: `${prefix}${target ?? 0}${suffix} · ${published ? 'Visible' : 'Hidden'}`,
    }),
  },
})
