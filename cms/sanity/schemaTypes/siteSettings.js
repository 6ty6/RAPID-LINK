import { defineArrayMember, defineField, defineType } from 'sanity'

const requiredText = rule => rule.required().min(2).max(200)

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Contact & social settings',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Contact numbers', default: true },
    { name: 'branches', title: 'Branches' },
    { name: 'social', title: 'Social media' },
  ],
  fields: [
    defineField({
      name: 'email',
      title: 'Public email address',
      type: 'string',
      group: 'contact',
      validation: rule => rule.required().email(),
    }),
    defineField({
      name: 'supportLines',
      title: 'Main support numbers',
      description: 'These numbers appear in the website header. Drag items to change their order.',
      type: 'array',
      group: 'contact',
      validation: rule => rule.required().min(1).max(4),
      of: [defineArrayMember({
        name: 'supportLine',
        title: 'Support number',
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Full label', type: 'string', validation: requiredText }),
          defineField({ name: 'mobileLabel', title: 'Short mobile label', type: 'string', validation: requiredText }),
          defineField({ name: 'display', title: 'Number shown to customers', type: 'string', validation: requiredText }),
          defineField({ name: 'href', title: 'Clickable telephone link', description: 'Use the international form, for example tel:+233303955183.', type: 'string', validation: rule => rule.required().regex(/^tel:\+[0-9]+$/, { name: 'telephone link' }) }),
        ],
        preview: { select: { title: 'label', subtitle: 'display' } },
      })],
    }),
    defineField({
      name: 'loanSupportLines',
      title: 'Loan support numbers',
      description: 'Numbers displayed on the loan-assistance page.',
      type: 'array',
      group: 'contact',
      validation: rule => rule.required().min(1).max(4),
      of: [defineArrayMember({
        name: 'loanSupportLine',
        title: 'Loan support number',
        type: 'object',
        fields: [
          defineField({ name: 'display', title: 'Number shown to customers', type: 'string', validation: requiredText }),
          defineField({ name: 'href', title: 'Clickable telephone link', description: 'Use the international form, for example tel:+233533730336.', type: 'string', validation: rule => rule.required().regex(/^tel:\+[0-9]+$/, { name: 'telephone link' }) }),
        ],
        preview: { select: { title: 'display' } },
      })],
    }),
    defineField({
      name: 'branches',
      title: 'Branch locations',
      description: 'Drag branches to change their website order. The first branch is used as the main office in the footer.',
      type: 'array',
      group: 'branches',
      validation: rule => rule.required().min(2).max(20),
      of: [defineArrayMember({
        name: 'branch',
        title: 'Branch',
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Branch name', type: 'string', validation: requiredText }),
          defineField({ name: 'contactTitle', title: 'Contact-card label', type: 'string', validation: requiredText }),
          defineField({ name: 'address', title: 'Short address', type: 'string', validation: requiredText }),
          defineField({ name: 'fullAddress', title: 'Full map address', type: 'string', validation: requiredText }),
          defineField({ name: 'digitalAddress', title: 'GhanaPost GPS address', type: 'string', validation: requiredText }),
          defineField({ name: 'mapName', title: 'Google Maps location name', type: 'string', validation: requiredText }),
          defineField({ name: 'phones', title: 'Branch telephone numbers', type: 'array', of: [{ type: 'string' }], validation: rule => rule.required().min(1) }),
        ],
        preview: { select: { title: 'title', subtitle: 'address' } },
      })],
    }),
    defineField({
      name: 'socialProfiles',
      title: 'Official social media profiles',
      description: 'Only approved official profiles should be published here.',
      type: 'array',
      group: 'social',
      validation: rule => rule.required().min(1).max(10),
      of: [defineArrayMember({
        name: 'socialProfile',
        title: 'Social profile',
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Platform name', type: 'string', validation: requiredText }),
          defineField({ name: 'href', title: 'Profile URL', type: 'url', validation: rule => rule.required().uri({ scheme: ['https'] }) }),
          defineField({
            name: 'icon',
            title: 'Platform icon',
            type: 'string',
            options: { list: [
              { title: 'LinkedIn', value: 'linkedin' },
              { title: 'TikTok', value: 'tiktok' },
              { title: 'Instagram', value: 'instagram' },
              { title: 'Facebook', value: 'facebook' },
              { title: 'X', value: 'x' },
            ] },
            validation: rule => rule.required(),
          }),
        ],
        preview: { select: { title: 'name', subtitle: 'href' } },
      })],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'RapidLink contact & social settings', subtitle: 'Header, footer and contact page' }),
  },
})
