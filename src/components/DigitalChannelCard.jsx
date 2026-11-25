import { useId, useRef, useState } from 'react'

export default function DigitalChannelCard({ title, text, image, imageAlt, link, index }) {
  const [flipped, setFlipped] = useState(false)
  const detailsId = useId()
  const frontButton = useRef(null)
  const backButton = useRef(null)
  function flip(value) {
    setFlipped(value)
    // Wait for inert to move to the other face before transferring focus.
    requestAnimationFrame(() => (value ? backButton : frontButton).current?.focus({ preventScroll: true }))
  }
  return <article className={`digital-card digital-flip-card ${index % 2 ? 'digital-flip-navy' : 'digital-flip-white'} ${flipped ? 'is-flipped' : ''}`} onKeyDown={event => {
    if (event.key === 'Escape' && flipped) { event.preventDefault(); flip(false) }
  }}>
    <div className="digital-flip-inner">
      <div className="digital-flip-face digital-flip-front" data-cursor-link aria-hidden={flipped} inert={flipped ? '' : undefined} onClick={event => { if (!event.target.closest('button')) flip(true) }}>
        <div className="digital-card-image"><img src={image} alt={imageAlt || title} loading="lazy" decoding="async" /></div>
        <h2>{title}</h2>
        <button ref={frontButton} type="button" className="digital-flip-toggle" aria-label={`View ${title} details`} aria-expanded={flipped} aria-controls={detailsId} onClick={() => flip(true)}>View details</button>
        <span className="quick-access-fold" aria-hidden="true" />
      </div>
      <div id={detailsId} className="digital-flip-face digital-flip-back" data-cursor-link aria-hidden={!flipped} inert={!flipped ? '' : undefined} onClick={event => {
        if (!event.target.closest('a,button') && !window.getSelection()?.toString()) flip(false)
      }}>
        <p className="digital-flip-eyebrow">How to use it</p><h2>{title}</h2><p className="digital-flip-description">{text}</p>
        {link && <a className="button button-secondary digital-flip-service" href={link} target="_blank" rel="noopener noreferrer">{title === 'RapidLink mobile app' ? 'Get the app' : 'Open service'}<span aria-hidden="true">↗</span></a>}
        <button ref={backButton} type="button" className="digital-flip-toggle" aria-label={`Back to ${title}`} onClick={() => flip(false)}>Back to overview</button>
        <span className="quick-access-fold" aria-hidden="true" />
      </div>
    </div>
  </article>
}
