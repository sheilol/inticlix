import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'
import { t } from '../lib/i18n'

export default function Header({ lang, setLang }) {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const accountUrl = user ? (isAdmin ? '/admin/applications' : '/dashboard') : '/login'
  return <header><Link className="brand" to="/"><span className="brand-mark small"><span>N</span></span><strong>Nexora</strong></Link><nav><button onClick={() => { navigate('/'); document.querySelector('.jobs')?.scrollIntoView({ behavior: 'smooth' }) }}>{t(lang, 'jobs')}</button><button onClick={() => { navigate('/'); setTimeout(() => document.querySelector('.process')?.scrollIntoView({ behavior: 'smooth' }), 0) }}>{t(lang, 'howItWorks')}</button></nav><div className="header-actions"><button className="language-switch" aria-label={t(lang, 'changeLanguage')} onClick={() => setMenuOpen(!menuOpen)}>{lang === 'hi' ? 'हि' : 'EN'}</button>{menuOpen && <div className="language-menu"><button onClick={() => { sessionStorage.setItem('nexora-lang', 'en'); setLang('en'); setMenuOpen(false) }}>{t(lang, 'english')}</button><button onClick={() => { sessionStorage.setItem('nexora-lang', 'hi'); setLang('hi'); setMenuOpen(false) }}>{t(lang, 'hindi')}</button></div>}<Link className="login-btn" to={accountUrl}>{user ? (isAdmin ? t(lang, 'admin') : t(lang, 'myAccount')) : t(lang, 'signIn')}</Link></div></header>
}
