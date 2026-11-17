import { defineField, defineType } from 'sanity'

export const announcement = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',

  fields: [
    defineField({
      name: 'message',
      title: 'Announcement message',
      type: 'text',
      rows: 3,
      validation: rule => rule.required().min(10).max(300),
    }),

    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      initialValue: 'normal',
      options: {
        list: [
          { title: 'Normal', value: 'normal' },
          { title: 'Important', value: 'important' },
          { title: 'Urgent', value: 'urgent' },
        ],
        layout: 'radio',
      },
      validation: rule => rule.required(),
    }),

    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description: 'Lower numbers appear first.',
      type: 'number',
      initialValue: 1,
      validation: rule => rule.required().integer().min(1),
    }),

    defineField({
      name: 'startDate',
      title: 'Start date',
      type: 'datetime',
    }),

    defineField({
      name: 'expiryDate',
      title: 'Expiry date',
      type: 'datetime',
      validation: rule => rule.custom((expiryDate, context) => {
        const startDate = context.document?.startDate

        if (!expiryDate || !startDate) return true

        return new Date(expiryDate) > new Date(startDate)
          || 'Expiry date must be later than the start date.'
      }),
    }),

    defineField({
      name: 'isPublished',
      title: 'Visible on website',
      type: 'boolean',
      initialValue: false,
    }),
  ],

  orderings: [
    {
      title: 'Website order',
      name: 'websiteOrder',
      by: [
        { field: 'displayOrder', direction: 'asc' },
      ],
    },
  ],

  preview: {
    select: {
      title: 'message',
      priority: 'priority',
      published: 'isPublished',
    },

    prepare: ({ title, priority, published }) => ({
      title,
    subtitle: `${priority || 'normal'} · ${published ? 'Visible' : 'Hidden'}`,
    }),
  },
})