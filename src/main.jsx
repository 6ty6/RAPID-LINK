import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import { PublicContentContext } from './content/PublicContentContext.jsx'

const root = document.getElementById('root')
const snapshotElement = document.getElementById('public-content-snapshot')
const snapshot = snapshotElement ? JSON.parse(snapshotElement.textContent) : null
const app = (
  <React.StrictMode>
    <PublicContentContext.Provider value={snapshot}>
      <BrowserRouter>
      <App />
      </BrowserRouter>
    </PublicContentContext.Provider>
  </React.StrictMode>
)
// Fallback/staff URLs receive the empty SPA shell. Only actual generated routes
// hydrate; a host's fallback must never hydrate a different page's markup.
const currentPath = window.location.pathname.replace(/\/$/, '') || '/'
if (root.dataset.prerendered && root.dataset.route === currentPath) {
  ReactDOM.hydrateRoot(root, app)
} else {
  ReactDOM.createRoot(root).render(app)
}
