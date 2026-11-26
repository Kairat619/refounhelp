import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Policies from './pages/Policies.jsx'
import PolicyDetail from './pages/PolicyDetail.jsx'
import Check from './pages/Check.jsx'
import Cases from './pages/Cases.jsx'
import CaseDetail from './pages/CaseDetail.jsx'
import Pricing from './pages/Pricing.jsx'
import Business from './pages/Business.jsx'
import NotFound from './pages/NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="policies" element={<Policies />} />
          <Route path="policies/:id" element={<PolicyDetail />} />
          <Route path="check" element={<Check />} />
          <Route path="cases" element={<Cases />} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="business" element={<Business />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
