import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import VehicleDetectionApp from './VehicleDetectionApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VehicleDetectionApp />
  </StrictMode>,
)
