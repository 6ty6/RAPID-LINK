import { defineArrayMember, defineField, defineType } from 'sanity'

const percentage = rule => rule.required().min(0).max(100).precision(2)
const currencyAmount = rule => rule.required().min(0).max(1000000).precision(2)

export const loanCalculatorSettings = defineType({
  name: 'loanCalculatorSettings',
  title: 'Loan calculator',
  type: 'document',
  description: 'The approved figures and customer wording used by the public loan calculator. The calculation formula remains protected in website code.',
  groups: [
    { name: 'limits', title: '1. Loan limits', default: true },
    { name: 'pricing', title: '2. Interest & fees' },
    { name: 'repayment', title: '3. Repayment schedule' },
    { name: 'settlement', title: '4. Early settlement' },
    { name: 'wording', title: '5. Customer wording' },
    { name: 'approval', title: '6. Approval & dates' },
  ],
  fields: [
    defineField({
      name: 'isActive',
      title: 'Use these settings on the website',
      description: 'Turn this off to make the website use its reviewed local fallback settings.',
      type: 'boolean',
      group: 'limits',
      initialValue: false,
      validation: rule => rule.required(),
    }),
    defineField({ name: 'minimumPrincipal', title: 'Minimum loan amount (GH₵)', type: 'number', group: 'limits', initialValue: 1000, validation: currencyAmount }),
    defineField({ name: 'maximumPrincipal', title: 'Maximum loan amount (GH₵)', type: 'number', group: 'limits', initialValue: 20000, validation: currencyAmount }),
    defineField({ name: 'minimumMonths', title: 'Minimum duration (months)', type: 'number', group: 'limits', initialValue: 1, validation: rule => rule.required().integer().min(1).max(6) }),
    defineField({ name: 'maximumMonths', title: 'Maximum duration (months)', type: 'number', group: 'limits', initialValue: 6, validation: rule => rule.required().integer().min(1).max(6) }),

    defineField({ name: 'monthlyFlatRate', title: 'Monthly flat interest rate (%)', description: 'Interest is calculated on the original principal for every month.', type: 'number', group: 'pricing', initialValue: 6, validation: percentage }),
    defineField({ name: 'nominalAnnualRate', title: 'Nominal annual rate (%)', description: 'This is not labelled as APR on the website.', type: 'number', group: 'pricing', initialValue: 72, validation: percentage }),
    defineField({ name: 'processingFeeRate', title: 'Processing fee (%)', type: 'number', group: 'pricing', initialValue: 5, validation: percentage }),
    defineField({ name: 'insuranceFeeRate', title: 'Insurance fee (%)', type: 'number', group: 'pricing', initialValue: 1, validation: percentage }),
    defineField({ name: 'managementFeeRate', title: 'Management fee (%)', type: 'number', group: 'pricing', initialValue: 0.75, validation: percentage }),

    defineField({
      name: 'repaymentFrequencies',
      title: 'Available repayment frequencies',
      type: 'array',
      group: 'repayment',
      initialValue: ['monthly', 'weekly'],
      of: [defineArrayMember({ type: 'string' })],
      options: { list: [{ title: 'Monthly', value: 'monthly' }, { title: 'Weekly', value: 'weekly' }], layout: 'grid' },
      validation: rule => rule.required().min(1).unique(),
    }),
    defineField({
      name: 'weeklySchedule',
      title: 'Weekly payments by loan duration',
      description: 'Keep one row for each duration from one to six months. Editors can see the complete schedule in one place.',
      type: 'array',
      group: 'repayment',
      initialValue: [
        { _key: 'month-1', _type: 'weeklyPaymentTerm', months: 1, payments: 4 },
        { _key: 'month-2', _type: 'weeklyPaymentTerm', months: 2, payments: 8 },
        { _key: 'month-3', _type: 'weeklyPaymentTerm', months: 3, payments: 13 },
        { _key: 'month-4', _type: 'weeklyPaymentTerm', months: 4, payments: 17 },
        { _key: 'month-5', _type: 'weeklyPaymentTerm', months: 5, payments: 21 },
        { _key: 'month-6', _type: 'weeklyPaymentTerm', months: 6, payments: 25 },
      ],
      of: [defineArrayMember({
        name: 'weeklyPaymentTerm',
        title: 'Weekly repayment term',
        type: 'object',
        fields: [
          defineField({ name: 'months', title: 'Loan duration (months)', type: 'number', validation: rule => rule.required().integer().min(1).max(6) }),
          defineField({ name: 'payments', title: 'Number of weekly payments', type: 'number', validation: rule => rule.required().integer().min(1).max(30) }),
        ],
        preview: {
          select: { months: 'months', payments: 'payments' },
          prepare: ({ months, payments }) => ({ title: `${months} ${months === 1 ? 'month' : 'months'}`, subtitle: `${payments} weekly payments` }),
        },
      })],
      validation: rule => rule.required().min(6).max(6).custom(rows => {
        if (!Array.isArray(rows)) return true
        const months = rows.map(row => row?.months)
        return new Set(months).size === 6 && [1, 2, 3, 4, 5, 6].every(month => months.includes(month))
          ? true
          : 'Include each duration from one to six months exactly once.'
      }),
    }),

    defineField({ name: 'earlySettlementRate', title: 'Early-settlement fee (%)', description: 'Calculated on the outstanding principal.', type: 'number', group: 'settlement', initialValue: 5, validation: percentage }),
    defineField({ name: 'excludeFutureInterest', title: 'Remove future interest from early settlement', description: 'Protected calculation rule. A code review is required before this policy can change.', type: 'boolean', group: 'settlement', initialValue: true, readOnly: true, validation: rule => rule.required() }),

    defineField({ name: 'heroIntro', title: 'Calculator introduction', type: 'text', rows: 2, group: 'wording', validation: rule => rule.required().min(20).max(220) }),
    defineField({ name: 'disclaimer', title: 'Estimate disclaimer', type: 'text', rows: 2, group: 'wording', validation: rule => rule.required().min(20).max(240) }),
    defineField({ name: 'assumptionNotice', title: 'Verification notice', type: 'text', rows: 3, group: 'wording', validation: rule => rule.required().min(20).max(400) }),

    defineField({
      name: 'approvalStatus',
      title: 'Approval status',
      type: 'string',
      group: 'approval',
      initialValue: 'provisional',
      options: { list: [{ title: 'Provisional — awaiting verification', value: 'provisional' }, { title: 'Approved', value: 'approved' }] },
      validation: rule => rule.required(),
    }),
    defineField({ name: 'effectiveDate', title: 'Effective date', type: 'date', group: 'approval', validation: rule => rule.required() }),
    defineField({ name: 'approvedBy', title: 'Approved by', description: 'Name or role of the Credit/Compliance approver.', type: 'string', group: 'approval', validation: rule => rule.max(120) }),
    defineField({ name: 'approvalReference', title: 'Approval reference', description: 'Optional memo, email or policy reference.', type: 'string', group: 'approval', validation: rule => rule.max(120) }),
    defineField({ name: 'changeNotes', title: 'Change notes', description: 'Explain why the figures or wording changed.', type: 'text', rows: 3, group: 'approval', validation: rule => rule.max(500) }),
  ],
  validation: rule => rule.custom(document => {
    if (!document) return true
    if (document.maximumPrincipal < document.minimumPrincipal) return 'Maximum loan amount must be greater than or equal to the minimum.'
    if (document.maximumMonths < document.minimumMonths) return 'Maximum duration must be greater than or equal to the minimum.'
    if (document.isActive && document.approvalStatus === 'approved' && !document.approvedBy) return 'Record who approved these settings before activating an approved configuration.'
    return true
  }),
  preview: {
    select: { active: 'isActive', status: 'approvalStatus', effectiveDate: 'effectiveDate' },
    prepare: ({ active, status, effectiveDate }) => ({
      title: 'RapidLink loan calculator settings',
      subtitle: `${active ? 'Active' : 'Inactive'} · ${status === 'approved' ? 'Approved' : 'Provisional'}${effectiveDate ? ` · from ${effectiveDate}` : ''}`,
    }),
  },
})
