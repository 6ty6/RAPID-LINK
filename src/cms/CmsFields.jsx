import { useEffect, useId, useState } from 'react'
import { cmsRequest } from './client'

export function CmsImage({ value, alt = '' }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let cancelled = false, objectUrl
    if (!value?.startsWith('media:')) { setSrc(value || ''); return undefined }
    cmsRequest(`/media/${value.slice(6)}`).then(blob => { objectUrl = URL.createObjectURL(blob); if (!cancelled) setSrc(objectUrl) }).catch(() => { if (!cancelled) setSrc('') })
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [value])
  return src ? <img src={src} alt={alt} /> : null
}

export function CmsFields({ fields, data, onChange, disabled, assets = [] }) {
  const prefix = useId()
  return <div className="cms-fields">{fields.map(f => {
    const id = `${prefix}-${f.key}`
    const change = value => onChange({ ...data, [f.key]: value })
    if (f.type === 'objects') return <fieldset className="cms-repeat" key={f.key}><legend>{f.label}</legend>{(data[f.key] || []).map((item, index) => <div className="cms-repeat-item" key={index}><CmsFields fields={f.fields.map(child => ({ ...child, key: child.key }))} data={item} onChange={value => change(data[f.key].map((current, i) => i === index ? value : current))} disabled={disabled} assets={assets} /><button type="button" disabled={disabled} onClick={() => change(data[f.key].filter((_, i) => i !== index))}>Remove {f.label.toLowerCase()} item {index + 1}</button></div>)}<button type="button" disabled={disabled || (data[f.key]?.length || 0) >= 100} onClick={() => change([...(data[f.key] || []), Object.fromEntries(f.fields.map(child => [child.key, child.type === 'list' ? [] : child.type === 'number' ? 0 : child.options?.[0] || '']))])}>Add {f.label.toLowerCase()} item</button></fieldset>
    return <div className={`cms-field cms-field-${f.type}`} key={f.key}>
      <label htmlFor={id}>{f.label}{f.required ? ' *' : ''}</label>
      {f.type === 'textarea' || f.type === 'list' ? <><textarea id={id} disabled={disabled} rows={f.type === 'list' ? 4 : 5} value={f.type === 'list' ? (data[f.key] || []).join('\n') : data[f.key] || ''} onChange={event => change(f.type === 'list' ? event.target.value.split('\n') : event.target.value)} />{f.type === 'list' && <small>One item per line.</small>}</> : f.type === 'boolean' ? <input id={id} type="checkbox" disabled={disabled} checked={Boolean(data[f.key])} onChange={event => change(event.target.checked)} /> : f.type === 'select' ? <select id={id} disabled={disabled} value={data[f.key] || ''} onChange={event => change(event.target.value)}>{f.options.map(value => <option key={value}>{value}</option>)}</select> : <input id={id} type={['number', 'email', 'date'].includes(f.type) ? f.type : 'text'} disabled={disabled} step={f.type === 'number' ? 'any' : undefined} value={data[f.key] ?? ''} maxLength={2000} onChange={event => change(f.type === 'number' ? Number(event.target.value) : event.target.value)} />}
      {f.type === 'image' && <><select aria-label={`Choose ${f.label.toLowerCase()} from library`} disabled={disabled} value="" onChange={event => change(`media:${event.target.value}`)}><option value="">Choose from the image library</option>{assets.map(asset => <option value={asset.id} key={asset.id}>{asset.label}</option>)}</select><CmsImage value={data[f.key]} alt={data.imageAlt || ''} /></>}
      {f.type === 'link' && <small>Use a verified HTTPS destination or an approved /downloads/ path.</small>}
    </div>
  })}</div>
}

export function CmsPreview({ entry }) {
  if (!entry) return null
  return <article className="cms-preview"><p className="eyebrow">Staff preview — not published</p><h2>{entry.title}</h2>{Object.entries(entry.data).map(([key, value]) => {
    if (entry.kind === 'calculator' && typeof value === 'number') return <p key={key}><strong>{key.replace(/([A-Z])/g,' $1')}:</strong> {value}</p>
    if (!value || typeof value === 'boolean' || typeof value === 'number') return null
    if (key.toLowerCase().includes('image') && key !== 'imageAlt') return <CmsImage key={key} value={value} alt={entry.data.imageAlt || ''} />
    if (Array.isArray(value)) return <section key={key}><h3>{key.replaceAll('_', ' ')}</h3>{value.map((item, i) => typeof item === 'string' ? <p key={i}>{item}</p> : <div key={i}>{item.heading && <h3>{item.heading}</h3>}{item.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}{item.label && <p>{item.label}</p>}</div>)}</section>
    return <p key={key}>{String(value)}</p>
  })}</article>
}
