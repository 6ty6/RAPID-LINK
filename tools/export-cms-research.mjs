import { chromium } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const escape = text => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const inline = text => escape(text)
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/)
  const output = []
  let paragraph = [], list = null
  const closeParagraph = () => { if (paragraph.length) output.push(`<p>${paragraph.map(inline).join('<br>')}</p>`); paragraph = [] }
  const closeList = () => { if (list) output.push(`</${list}>`); list = null }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '<!-- pagebreak -->') { closeParagraph(); closeList(); output.push('<div class="pagebreak"></div>'); continue }
    if (!line) { closeParagraph(); closeList(); continue }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line)
    if (heading) { closeParagraph(); closeList(); output.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); continue }
    if (line.startsWith('|') && lines[i + 1]?.trim().match(/^\|[\s:|\-]+\|$/)) {
      closeParagraph(); closeList()
      const cells = value => value.trim().slice(1, -1).split('|').map(cell => inline(cell.trim()))
      output.push(`<table><thead><tr>${cells(line).map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>`)
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        output.push(`<tr>${cells(lines[i]).map(c => `<td>${c}</td>`).join('')}</tr>`); i++
      }
      i--; output.push('</tbody></table>'); continue
    }
    const bullet = /^(?:-\s+|\d+\.\s+)(.+)$/.exec(line)
    if (bullet) {
      closeParagraph(); const type = line.startsWith('-') ? 'ul' : 'ol'
      if (list !== type) { closeList(); list = type; output.push(`<${type}>`) }
      output.push(`<li>${inline(bullet[1])}</li>`); continue
    }
    closeList(); paragraph.push(line)
  }
  closeParagraph(); closeList(); return output.join('\n')
}

const css = `@page{size:A4;margin:19mm 17mm 20mm}*{box-sizing:border-box}body{font:10.5pt/1.43 Arial,sans-serif;color:#25364a}h1{font-size:24pt;line-height:1.15;color:#102b46;border-bottom:3px solid #e88026;padding-bottom:10px;margin:0 0 15px}h2{font-size:15pt;color:#123650;margin:22px 0 10px;break-after:avoid}h3{font-size:12pt;color:#123650;margin:17px 0 8px;break-after:avoid}p{margin:0 0 11px;orphans:3;widows:3}li{margin:0 0 7px;orphans:3;widows:3}ul,ol{padding-left:21px}table{width:100%;border-collapse:collapse;font-size:8.5pt;line-height:1.32;margin:12px 0 17px}thead{display:table-header-group}tr{break-inside:avoid}td,th{border:1px solid #cbd5df;padding:7px;vertical-align:top;overflow-wrap:anywhere}th{background:#173651;color:white;text-align:left}tr:nth-child(even)td{background:#f1f5f8}a{color:#185aa1;text-decoration:underline}code{font-size:9pt}strong{color:#102b46}.pagebreak{break-before:page;page-break-before:always}.summary{font-size:10pt;line-height:1.35}.summary h1{font-size:21pt}.summary h2{font-size:12pt;margin:15px 0 8px}.summary p{margin-bottom:9px}.summary table{font-size:8.5pt}.summary li{margin-bottom:5px}`
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  for (const [source, stem, summary] of [
    ['docs/cms-research-report.md', 'RapidLink - Full CMS Research', false],
    ['docs/cms-management-summary.md', 'RapidLink - CMS Management Summary', true],
  ]) {
    const markdown = await readFile(source, 'utf8')
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${stem}</title><style>${css}</style></head><body class="${summary ? 'summary' : ''}">${renderMarkdown(markdown)}</body></html>`
    await writeFile(`docs/${stem}.html`, html)
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.pdf({ path: resolve(`docs/${stem}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: '<div style="font:8px Arial;color:#526579;width:100%;margin:0 17mm;display:flex;justify-content:space-between"><span>RapidLink CMS research · 10 November 2026 · Draft for review</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    })
    await page.close()
    console.log(`Created docs/${stem}.pdf`)
  }
} finally { await browser.close() }

const csv = rows => '\ufeff' + rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n') + '\r\n'
const scenarios = [
  ['01', 'Editor usability', 'Draft news and image alt text without developer assistance', 'Record time errors and assistance'],
  ['02', 'Validation', 'Missing required fields and invalid slug/file', 'Invalid publication rejected in UI and backend'],
  ['03', 'Invitation and revocation', 'Invite test user then revoke access and retry session/token', 'Only permitted users have access; record revocation delay'],
  ['04', 'Draft isolation', 'Anonymous delivery query for drafts hidden fields and draft assets', 'No restricted content or draft assets exposed'],
  ['05', 'Writer publishing', 'Publish as writer via UI and API/Git', 'Backend/repository denies publication'],
  ['06', 'Approval integrity', 'Approve separately; try self-approval and stage skipping', 'Required independent/multiple approvals enforced'],
  ['07', 'Department boundaries', 'Edit another department record', 'Required boundary enforced or management approves N/A'],
  ['08', 'Published version safety', 'Edit a published item without publishing draft', 'Public approved version remains unchanged'],
  ['09', 'Preview', 'Check desktop/mobile and unauthorized preview access', 'Accurate preview; restricted access where required'],
  ['10', 'History and audit', 'Inspect change publish delete and login events plus retention', 'Owner timestamps previous values and retention match requirements'],
  ['11', 'Recovery', 'Restore item media relations and configuration in clean environment', 'Successful restore; recovery time and gaps documented'],
  ['12', 'Publish/unpublish rebuild', 'Publish and withdraw sample article/document', 'HTML links sitemap and delivery API update after build'],
  ['13', 'Build failure', 'Revoke test credential or make source unavailable', 'Build fails safely; named operator notified'],
  ['14', 'Maintenance', 'Check advisories and run a trial upgrade/rollback where applicable', 'Supported version and owner; recovery succeeds'],
  ['15', 'Exit and billing', 'Export complete sample and price actual required features', 'Export limits and comparable dated quotation recorded'],
]
await writeFile('docs/cms-personal-test-matrix.csv', csv([
  ['Test ID', 'CMS', 'Version', 'Plan / trial', 'Area', 'Action', 'Expected result', 'Observed result', 'Status', 'Evidence file', 'Tester', 'Date', 'Unresolved / N/A reason'],
  ...scenarios.map(([id, area, action, expected]) => [id, '', '', '', area, action, expected, '', 'NOT RUN', '', '', '', '']),
]))
await writeFile('docs/cms-cost-worksheet.csv', csv([
  ['Cost item', 'Directus USD', 'Strapi USD', 'Sanity USD', 'Contentful USD', 'Decap USD', 'Basis / quote date'],
  ...['Editors / paid seats', 'Licence per month', 'Compute / database per month', 'Asset storage / bandwidth per month', 'Backup / monitoring per month', 'Identity / Git per month', 'Maintenance / support per month', 'Setup and migration one-time', 'Training one-time', 'Usage growth allowance', 'Tax / currency assumption', '36-month total', 'Mandatory features included?', 'Vendor quotation reference'].map(item => [item, '', '', '', '', '', 'Not yet quoted']),
]))
console.log('Created the personal test matrix and cost worksheet; no CMS tests marked passed.')
