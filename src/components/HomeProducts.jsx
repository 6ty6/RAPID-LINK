import { Link } from 'react-router-dom'
import { products as localProducts } from '../content'
import { useManagedContent } from '../cms/public'

const featuredSlugs = ['rapid-savings', 'rapid-susu', 'rapid-edu-grow', 'personal-loan', 'business-loan', 'fixed-deposit']
// Reuse clean photographs for the older catalogue image paths on these cards.
// Custom CMS uploads continue to take precedence; product detail pages are unchanged.
const cardPhotographs = {
  '/assets/rapid-savings.jpg': '/assets/rapid-target-savings.webp',
  '/assets/personal-loan-public.webp': '/assets/deduct-loan.jpg',
  '/assets/fixed-deposit.webp': '/assets/advantage-investment.webp',
}

export default function HomeProducts() {
  const products = useManagedContent('product', Object.entries(localProducts).map(([slug, data]) => ({ ...data, slug })))
  const featured = featuredSlugs.map(slug => products.find(product => product.slug === slug)).filter(Boolean)
  return <section className="section home-products" aria-labelledby="home-products-title"><div className="shell">
    <div className="section-heading"><p className="eyebrow">Explore products</p><h2 id="home-products-title">Products for your next step.</h2></div>
    <div className="card-grid">{featured.map((product,index) => <Link className={`product-card product-photo-card ${index % 2 ? 'product-photo-card-orange' : ''}`} key={product.slug} to={`/${product.slug}`} aria-labelledby={`product-${product.slug}-title`} aria-describedby={`product-${product.slug}-intro`}>
      <span className="product-card-photo">{product.image && <img src={cardPhotographs[product.image] || product.image} alt="" loading="lazy" decoding="async" />}</span>
      <div className="product-card-copy"><span className="product-card-category">{product.category}</span><h3 id={`product-${product.slug}-title`}>{product.title}</h3><p id={`product-${product.slug}-intro`}>{product.intro}</p></div>
      <span className="quick-access-fold" aria-hidden="true" />
    </Link>)}</div>
  </div></section>
}
