import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-11-14' }).withConfig({
  perspective: 'published',
  useCdn: false,
})

const faqs = await client.fetch(`
  *[_type == "faq" && isPublished == true] | order(displayOrder asc) {
    _id, question, answer, category, displayOrder, isPublished
  }
`)

console.log(`VERIFICATION: ${faqs.length} published FAQ record(s).`)
for (const faq of faqs) console.log(`${faq.displayOrder}. [${faq.category}] ${faq.question}`)

if (faqs.length !== 7 || faqs.some((faq, index) => !faq.question || !faq.answer || faq.displayOrder !== index + 1)) {
  throw new Error('The Sanity FAQ inventory does not match the seven ordered website questions.')
}

console.log('FAQ VERIFICATION PASSED')
