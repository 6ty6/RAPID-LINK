import { defineField, defineType } from 'sanity'

export const careerVacancy = defineType({
  name: 'careerVacancy',
  title: 'Career vacancy',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Job title', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'department', title: 'Department', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'location', title: 'Location', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'employmentType', title: 'Employment type', type: 'string', initialValue: 'Full-time', validation: rule => rule.required() }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 4, validation: rule => rule.required() }),
    defineField({ name: 'responsibilities', title: 'Responsibilities', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'status', title: 'Vacancy status', type: 'string', initialValue: 'open',
      options: { list: [{ title: 'Open', value: 'open' }, { title: 'Closed', value: 'closed' }], layout: 'radio' },
      validation: rule => rule.required(),
    }),
    defineField({ name: 'isPublished', title: 'Visible on website', type: 'boolean', initialValue: false }),
    defineField({ name: 'applicationEmail', title: 'Application email', type: 'string', validation: rule => rule.required().email() }),
  ],
  preview: { select: { title: 'title', department: 'department', status: 'status' }, prepare: ({ title, department, status }) => ({ title, subtitle: `${department} · ${status}` }) },
})
