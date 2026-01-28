import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// import { registerSW } from 'virtual:pwa-register' // PWA disabled for now
import App from './App'
import './index.css'

// Register PWA service worker (disabled for now)
// if ('serviceWorker' in navigator) {
//   registerSW();
// }

const rootElement = document.getElementById('root')

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement)
    
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    )
    
    console.log('✅ Student Assessment System loaded successfully')
  } catch (error) {
    console.error('❌ Error loading application:', error)
  }
}