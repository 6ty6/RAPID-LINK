import { defineArrayMember, defineField, defineType } from 'sanity'

const requiredText = rule => rule.required().min(2).max(240)
const internalLink = rule => rule.required().regex(/^\/[a-z0-9][a-z0-9/#-]*$/i, {
  name: 'website path',
  invert: false,
})

const linkFields = [
  defineField({ name: 'label', title: 'Link label', type: 'string', validation: requiredText }),
  defineField({
    name: 'href',
    title: 'Website path',
    description: 'Use a path such as /stories or /rates.',
    type: 'string',
    validation: internalLink,
  }),
]

export const sharedSettings = defineType({
  name: 'sharedSettings',
  title: 'Shared website content',
  type: 'document',
  description: 'Shared wording that appears across several public pages.',
  groups: [
    { name: 'footer', title: 'Footer text', default: true },
    { name: 'menus', title: 'Footer links' },
    { name: 'app', title: 'App download section' },
  ],
  fields: [
    defineField({ name: 'appEyebrow', title: 'Small heading', type: 'string', group: 'app', validation: requiredText }),
    defineField({ name: 'appTitle', title: 'Main heading', type: 'string', group: 'app', validation: requiredText }),
    defineField({ name: 'appDescription', title: 'Description', type: 'text', rows: 4, group: 'app', validation: rule => rule.required().min(20).max(500) }),
    defineField({
      name: 'appImage',
      title: 'Mobile app image',
      type: 'image',
      group: 'app',
      options: { hotspot: true },
      validation: rule => rule.required(),
    }),
    defineField({ name: 'appImageAlt', title: 'Image description', description: 'Describe the information shown in the image for customers using assistive technology.', type: 'string', group: 'app', validation: rule => rule.required().min(10).max(240) }),
    defineField({ name: 'iosLabel', title: 'iOS button label', type: 'string', group: 'app', validation: requiredText }),
    defineField({ name: 'androidLabel', title: 'Android button label', type: 'string', group: 'app', validation: requiredText }),

    defineField({ name: 'footerDescription', title: 'Organisation description', type: 'text', rows: 3, group: 'footer', validation: rule => rule.required().min(20).max(400) }),
    defineField({ name: 'companyName', title: 'Company name in copyright', type: 'string', group: 'footer', validation: requiredText }),
    defineField({ name: 'privacyNotice', title: 'Privacy notice text', type: 'string', group: 'footer', validation: requiredText }),
    defineField({ name: 'socialHeading', title: 'Social-media heading', type: 'string', group: 'footer', validation: requiredText }),
    defineField({ name: 'exploreHeading', title: 'Explore-column heading', type: 'string', group: 'footer', validation: requiredText }),
    defineField({ name: 'companyHeading', title: 'Company-column heading', type: 'string', group: 'footer', validation: requiredText }),
    defineField({ name: 'contactHeading', title: 'Contact-column heading', type: 'string', group: 'footer', validation: requiredText }),

    defineField({
      name: 'menuDescriptions',
      title: 'Dropdown descriptions',
      description: 'Keep one description for each main website menu. Menu links themselves remain protected in code for now.',
      type: 'array',
      group: 'menus',
      validation: rule => rule.required().min(3).max(3).unique(),
      of: [defineArrayMember({
        name: 'menuDescription',
        title: 'Menu description',
        type: 'object',
        fields: [
          defineField({
            name: 'menu',
            title: 'Menu',
            type: 'string',
            options: { list: [
              { title: 'Savings & Investments', value: 'Savings & Investments' },
              { title: 'Loans', value: 'Loans' },
              { title: 'About Us', value: 'About Us' },
            ] },
            validation: rule => rule.required(),
          }),
          defineField({ name: 'description', title: 'Description', type: 'string', validation: requiredText }),
        ],
        preview: { select: { title: 'menu', subtitle: 'description' } },
      })],
    }),
    defineField({
      name: 'exploreLinks',
      title: 'Extra explore links',
      type: 'array',
      group: 'menus',
      validation: rule => rule.required().min(1).max(6),
      of: [defineArrayMember({ name: 'footerLink', title: 'Footer link', type: 'object', fields: linkFields, preview: { select: { title: 'label', subtitle: 'href' } } })],
    }),
    defineField({
      name: 'companyLinks',
      title: 'Company links',
      type: 'array',
      group: 'menus',
      validation: rule => rule.required().min(1).max(8),
      of: [defineArrayMember({ name: 'footerLink', title: 'Footer link', type: 'object', fields: linkFields, preview: { select: { title: 'label', subtitle: 'href' } } })],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Footer & mobile app promotion', subtitle: 'Shared across the public website' }),
  },
})
