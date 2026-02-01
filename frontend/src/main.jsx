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
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    )
    
// Debug log removed
  } catch (error) {
    console.error('❌ Error loading application:', error)
  }
}