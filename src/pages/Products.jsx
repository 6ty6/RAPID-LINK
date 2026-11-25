import { useEffect, useId, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { products } from '../content'
import usePageContent from '../hooks/usePageContent.js'
import {documentDownloadUrl,documentExtension} from '../content/documents.js'
import { Breadcrumb, CheckList, NotFound, PageHero } from '../components/Shared'

const loanSectionHeadings = {
  'personal-loan': 'Plan for life’s important moments.',
  'business-loan': 'Support your business’s next step.',
  'group-loan': 'Move forward together.',
  'deduct-at-source-loan': 'Plan repayments around your salary.',
}
const investmentSectionHeadings = {
  'fixed-deposit': 'Set money aside. Plan for the term ahead.',
  'advantage-investment': 'Build your investment toward what matters.',
}
const savingsSectionHeadings = {
  'rapid-savings': 'Make saving part of your everyday life.',
  'rapid-susu': 'Small contributions. Steady progress.',
  'rapid-edu-grow': 'Start saving for their next chapter.',
  'rapid-target-savings': 'Give your next goal a savings plan.',
}

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
    setPdfDocument(null)
    setError('')
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
  const {data:catalog,loading}=usePageContent('products')
  const [ratesOpen, setRatesOpen] = useState(false)
  const product = catalog.find(item=>item.slug===key)
  if(loading)return <p role="status">Loading product information…</p>
  if (!product) return <NotFound />
  const action = product.loan
    ? key === 'deduct-at-source-loan'
      ? <a className="button" href="https://rapidlinkfinance.com/loanform" target="_blank" rel="noopener noreferrer">Apply for a Loan <span aria-hidden="true">→</span></a>
      : <Link className="button" to="/apply-loan">Apply for a Loan <span aria-hidden="true">→</span></Link>
    : <Link className="button" to="/open-account">Open an account</Link>
  const sectionHeading = product.sectionHeading || (product.loan
    ? loanSectionHeadings[key] || 'Support for your next step.'
    : product.category === 'Investments' ? investmentSectionHeadings[key] || 'Put your money to work.' : savingsSectionHeadings[key] || 'Save for what matters.')

  return <>
    <PageHero eyebrow={product.category} title={product.title} intro={product.intro} image={product.heroImage || product.image} />
    <Breadcrumb current={product.title} />
    {product.image ? <section className="section product-details-section"><div className="shell product-showcase">
      <figure className="product-feature-image"><img data-product={key} src={product.image} alt={product.imageAlt || ''} /></figure>
      <div className="product-showcase-content">
        <p className="eyebrow">{product.title}</p>
        <h2>{sectionHeading}</h2>
        <div className="product-compact-cards">
          <article className="product-info-card"><h3>Benefits</h3><CheckList items={product.benefits} /></article>
          <article className="product-info-card"><h3>What you’ll need</h3><CheckList items={product.requirements} /></article>
        </div>
        <div className="product-action">{action}{key === 'deduct-at-source-loan' && <button className="button button-secondary" type="button" onClick={() => setRatesOpen(true)}>View Loan Rates Guide</button>}<p>{product.loan ? 'Continue to our application guidance.' : 'Begin your account application.'}</p></div>
      </div>
    </div></section> : <section className="section"><div className="shell content-grid">
      <article><h2>Benefits</h2><CheckList items={product.benefits} /></article>
      <aside className="requirements"><h2>What you’ll need</h2><CheckList items={product.requirements} />{action}</aside>
    </div></section>}
    {ratesOpen && <RateGuideDialog onClose={() => setRatesOpen(false)} />}
  </>
}

export function Rates() {
  const {data:page}=usePageContent('rates')
  const rows = [
    ['GH¢1,000–10,000', '4.25%', '6.00%', '8.50%'],
    ['GH¢10,001–25,000', '4.50%', '6.50%', '9.00%'],
    ['GH¢25,001–100,000', '4.75%', '6.75%', '9.50%'],
    ['GH¢100,000+', '5.00%', '7.25%', '10.00%'],
  ]

  return <>
    <PageHero {...page.hero} />
    <section className="section"><div className="shell narrow">
      <div className="table-wrap"><table>
        <caption>{page.caption}</caption>
        <thead><tr><th>{page.amountLabel}</th><th>{page.days91Label}</th><th>{page.days182Label}</th><th>{page.days365Label}</th></tr></thead>
        <tbody>{page.rows.map(row=><tr key={row.id}><th scope="row">{row.amount}</th><td>{row.days91}</td><td>{row.days182}</td><td>{row.days365}</td></tr>)}</tbody>
      </table></div>
    </div></section>
  </>
}

function RateGuideDialog({ onClose }) {
  const {data:guide}=usePageContent('rateGuide')
  return <DocumentDialog onClose={onClose} title={guide.dialogTitle} file={guide.file} preview={guide.preview} downloadLabel={guide.downloadLabel} closeLabel="Close rates guide" filename={`RapidLink-loan-rates.${documentExtension(guide.file)||'pdf'}`}/>
}

export function DocumentDialog({onClose,title,file,preview=file,downloadLabel='Download document',closeLabel='Close document',filename}) {
  const titleId=useId()
  const [previousFocus] = useState(() => document.activeElement)
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus() }
  }, [])
  return <dialog ref={dialogRef} className="document-dialog document-native" aria-labelledby={titleId} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}>
    <header><h2 id={titleId}>{title}</h2><div>{file&&<a className="button button-secondary" href={documentDownloadUrl(file,filename)} download>{downloadLabel}</a>}<button className="modal-close" type="button" onClick={() => dialogRef.current.close()} aria-label={closeLabel} autoFocus>×</button></div></header>
    {file?(documentExtension(file)==='pdf'?<PdfPreview url={preview}/>:<p className="pdf-preview-status">This {documentExtension(file).toUpperCase()} document is available to download. Open the downloaded file in a compatible application.</p>):<p className="pdf-preview-status" role="alert">This document is not currently available. Please contact RapidLink for assistance.</p>}
  </dialog>
}

export function RateChart() {
  const {data:page}=usePageContent('rateGuide')
  const [isOpen, setIsOpen] = useState(false)
  return <>
    <PageHero {...page.hero} />
    <section className="section"><div className="shell narrow panel centered rate-guide">
      <h2>{page.title}</h2>
      <p>{page.description}</p>
      {page.documentUnavailable?<p role="status">The current rates document is temporarily unavailable. Please contact RapidLink.</p>:<button className="button" type="button" onClick={() => setIsOpen(true)}>{page.buttonLabel}</button>}
      <p className="document-library-link"><Link className="text-link" to="/documents">Browse public documents</Link></p>
    </div></section>
    {isOpen && <RateGuideDialog onClose={() => setIsOpen(false)} />}
  </>
}
