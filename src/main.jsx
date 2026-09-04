import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GreenTechDashboard from './dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GreenTechDashboard />
  </StrictMode>,
)
