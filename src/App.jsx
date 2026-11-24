import { useState } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Icon from './components/Icon'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ApplicationPage from './pages/ApplicationPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import { t } from './lib/i18n'

const defaultJobs = [
  { id: 'electrician', titleEn: 'Electrician', titleHi: 'इलेक्ट्रीशियन', dept: 'Electrical', deptHi: 'बिजली का काम', location: 'Bengaluru', locationHi: 'बेंगलुरु', type: 'Full-time', accent: 'orange', pay: '₹18,000–₹28,000 / month' },
  { id: 'site-supervisor', titleEn: 'Site Supervisor', titleHi: 'साइट सुपरवाइज़र', dept: 'Construction', deptHi: 'निर्माण', location: 'Bengaluru', locationHi: 'बेंगलुरु', type: 'Full-time', accent: 'purple', pay: '₹24,000–₹35,000 / month' },
  { id: 'plumber', titleEn: 'Plumber', titleHi: 'प्लंबर', dept: 'Plumbing', deptHi: 'पाइप और नल का काम', location: 'Bengaluru', locationHi: 'बेंगलुरु', type: 'Full-time', accent: 'green', pay: '₹18,000–₹26,000 / month' },
]

export default function App() {
  const [lang, setLang] = useState(sessionStorage.getItem('nexora-lang') || '')
  const [jobs] = useState(defaultJobs)

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
    document.title = lang === 'hi' ? t(lang, 'siteTitle') : 'Nexora Careers'
  }, [lang])

  const chooseLang = (value) => {
    sessionStorage.setItem('nexora-lang', value)
    setLang(value)
  }

  if (!lang) {
    return (
      <div className="language-overlay">
        <div className="language-card">
          <div className="brand-mark"><span>N</span></div>
          <h2>{t(lang || 'en', 'chooseLanguage')}</h2>
          <p>{t(lang || 'en', 'selectLanguage')}</p>
          <div className="language-options">
            <button onClick={() => chooseLang('en')}><b>A</b><span>English</span></button>
            <button onClick={() => chooseLang('hi')}><b>अ</b><span>हिन्दी</span></button>
          </div>
          <button className="language-close" onClick={() => chooseLang('en')}>{t('en', 'continue')} <Icon name="arrow" size={17}/></button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Header lang={lang} setLang={setLang} />
        <Routes>
          <Route path="/" element={<HomePage jobs={jobs} lang={lang} />} />
          <Route path="/login" element={<LoginPage lang={lang} />} />
          <Route path="/apply" element={<ApplicationPage jobs={jobs} lang={lang} />} />
          <Route path="/dashboard" element={<ProtectedRoute lang={lang}><DashboardPage lang={lang} jobs={jobs} /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute admin lang={lang}><AdminPage jobs={jobs} lang={lang} /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute admin lang={lang}><AdminPage jobs={jobs} lang={lang} /></ProtectedRoute>} />
          <Route path="*" element={<main className="auth-page"><section className="auth-card"><h2>{t(lang, 'pageNotFound')}</h2><Link className="primary full" to="/">{t(lang, 'returnHome')}</Link></section></main>} />
        </Routes>
        <footer className="footer">
          <Link className="brand" to="/"><span className="brand-mark small"><span>N</span></span><strong>Nexora</strong></Link>
          <p>© 2026 {t(lang, 'careers')}</p>
          <Link className="footer-admin" to="/admin/applications">{t(lang, 'adminPortal')}</Link>
        </footer>
      </div>
    </BrowserRouter>
  )
}

