import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { products } from '../content'
import { Breadcrumb, CheckList, NotFound, PageHero } from '../components/Shared'

function PdfCanvasPage({ document, pageNumber }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let renderTask

    document.getPage(pageNumber).then(page => {
      if (cancelled || !canvasRef.current) return
      const viewport = page.getViewport({ scale: 1.55 })
      const outputScale = window.devicePixelRatio || 1
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas rendering is unavailable.')

      canvas.width = Math.floor(viewport.width * outputScale)
      canvas.height = Math.floor(viewport.height * outputScale)
      canvas.style.width = `${Math.floor(viewport.width)}px`
      canvas.style.height = `${Math.floor(viewport.height)}px`
      renderTask = page.render({
        canvasContext: context,
        viewport,
        transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0],
      })
      return renderTask.promise
    }).catch(error => {
      if (error?.name !== 'RenderingCancelledException') console.error('Unable to render PDF page', error)
    })

    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [document, pageNumber])

  return <figure className="pdf-page"><canvas ref={canvasRef} role="img" aria-label={`Rate guide page ${pageNumber}`} /><figcaption>Page {pageNumber}</figcaption></figure>
}

function PdfPreview({ url }) {
  const [pdfDocument, setPdfDocument] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let loadingTask

    const load = async () => {
      try {
        const [pdfjs, workerModule] = await Promise.all([
          import('pdfjs-dist/build/pdf.mjs'),
          import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        ])
        if (!active) return
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok || response.status === 204) throw new Error(`Unable to retrieve the PDF (${response.status}).`)
        const pdfData = new Uint8Array(await response.arrayBuffer())
        if (!active) return
        pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default
        loadingTask = pdfjs.getDocument({ data: pdfData })
        const loadedDocument = await loadingTask.promise
        if (active) setPdfDocument(loadedDocument)
      } catch (caught) {
        if (active) {
          console.error('Unable to load PDF preview', caught, caught?.message)
          setError('The document preview could not be loaded. You can still download the PDF using the button above.')
        }
      }
    }

    load()
    return () => {
      active = false
      loadingTask?.destroy()
    }
  }, [url])

  return <div className="pdf-preview" aria-live="polite">
    {!pdfDocument && !error && <div className="pdf-preview-status"><span className="pdf-spinner" aria-hidden="true" /><p>Preparing document preview…</p></div>}
    {error && <div className="pdf-preview-status form-error" role="alert"><p>{error}</p></div>}
    {pdfDocument && <div className="pdf-pages">{Array.from({ length: pdfDocument.numPages }, (_, index) => <PdfCanvasPage document={pdfDocument} pageNumber={index + 1} key={index + 1} />)}</div>}
  </div>
}

export function ProductPage() {
  const { '*': key } = useParams()
  const product = products[key]
  if (!product) return <NotFound />
  const action = product.loan
    ? key === 'deduct-at-source-loan'
      ? <a className="button" href="https://rapidlinkfinance.com/loanform" target="_blank" rel="noopener noreferrer">Apply for a Loan <span aria-hidden="true">→</span></a>
      : <Link className="button" to="/apply-loan">Apply for a Loan <span aria-hidden="true">→</span></Link>
    : <Link className="button" to="/open-account">Open an account</Link>
  const sectionHeading = product.loan
    ? 'Support for your next step.'
    : product.category === 'Investments' ? 'Put your money to work.' : 'Save for what matters.'

  return <>
    <PageHero eyebrow={product.category} title={product.title} intro={product.intro} image={product.heroImage || product.image} />
    <Breadcrumb current={product.title} />
    {product.image ? <section className="section product-details-section"><div className="shell product-showcase">
      <figure className="product-feature-image"><img src={product.image} alt={product.imageAlt || ''} /></figure>
      <div className="product-showcase-content">
        <p className="eyebrow">{product.title}</p>
        <h2>{sectionHeading}</h2>
        <div className="product-compact-cards">
          <article className="product-info-card"><h3>Benefits</h3><CheckList items={product.benefits} /></article>
          <article className="product-info-card"><h3>What you’ll need</h3><CheckList items={product.requirements} /></article>
        </div>
        <div className="product-action">{action}{key === 'deduct-at-source-loan' && <Link className="button button-secondary" to="/rate-chart">View Loan Rates Guide</Link>}<p>{product.loan ? 'Continue to our application guidance.' : 'Begin your account application.'}</p></div>
      </div>
    </div></section> : <section className="section"><div className="shell content-grid">
      <article><h2>Benefits</h2><CheckList items={product.benefits} /></article>
      <aside className="requirements"><h2>What you’ll need</h2><CheckList items={product.requirements} />{action}</aside>
    </div></section>}
  </>
}

export function Rates() {
  const rows = [
    ['GH¢1,000–10,000', '4.25%', '6.00%', '8.50%'],
    ['GH¢10,001–25,000', '4.50%', '6.50%', '9.00%'],
    ['GH¢25,001–100,000', '4.75%', '6.75%', '9.50%'],
    ['GH¢100,000+', '5.00%', '7.25%', '10.00%'],
  ]

  return <>
    <PageHero eyebrow="Savings & investments" title="Fixed deposit rates" intro="Published rates as of 19 October 2026." image="/assets/rates-hero-v2.png" />
    <section className="section"><div className="shell narrow">
      <div className="table-wrap"><table>
        <caption>Fixed deposit rates by amount and term</caption>
        <thead><tr><th>Amount</th><th>91 days</th><th>182 days</th><th>365 days</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, index) => index ? <td key={cell}>{cell}</td> : <th scope="row" key={cell}>{cell}</th>)}</tr>)}</tbody>
      </table></div>
    </div></section>
  </>
}

export function RateChart() {
  const [isOpen, setIsOpen] = useState(false)
  const documentUrl = '/downloads/rate-chart.pdf'
  const previewUrl = '/downloads/rate-chart-preview.txt'

  useEffect(() => {
    if (!isOpen) return undefined
    const closeOnEscape = event => event.key === 'Escape' && setIsOpen(false)
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  return <>
    <PageHero eyebrow="Controller loans" title="Rates Chart (2025)" intro="View or download RapidLink’s controller (government) loan rates guide." image="/assets/rates-hero-v2.png" />
    <section className="section"><div className="shell narrow panel centered rate-guide">
      <h2>Controller Loan Rates Guide</h2>
      <p>Click below to view the controller (government) loan rates guide.</p>
      <button className="button" type="button" onClick={() => setIsOpen(true)}>View document</button>
    </div></section>
    {isOpen && <div className="document-modal" role="presentation" onMouseDown={event => event.target === event.currentTarget && setIsOpen(false)}>
      <section className="document-dialog" role="dialog" aria-modal="true" aria-labelledby="rate-guide-title">
        <header><h2 id="rate-guide-title">RapidLink Controller Loan Rates Guide</h2><div><a className="button button-secondary" href={documentUrl} download>Download</a><button className="modal-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close rates guide">×</button></div></header>
        <PdfPreview url={previewUrl} />
      </section>
    </div>}
  </>
}
