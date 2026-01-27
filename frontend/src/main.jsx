import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

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
    
    // Show error to user
    rootElement.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">⚠️ Application Error</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">
          Failed to load the application. Please refresh the page.
        </p>
        <button 
          onclick="window.location.reload()"
          style="
            background: white;
            color: #2d3748;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 1rem;
          "
        >
          Refresh Page
        </button>
        <pre style="
          background: rgba(0,0,0,0.3); 
          padding: 1rem; 
          border-radius: 0.5rem; 
          text-align: left;
          max-width: 600px;
          overflow: auto;
          font-size: 0.9rem;
        ">
          ${error.toString()}
        </pre>
      </div>
    `
  }
} else {
  console.error('❌ Root element (#root) not found')
}