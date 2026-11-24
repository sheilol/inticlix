import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'
import Icon from '../components/Icon'
import { authErrorMessage, t } from '../lib/i18n'

export default function LoginPage({ lang }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const { signInWithGoogle, signInWithFacebook, signInWithEmail, createAccountWithEmail, firebaseConfigured, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const finishLogin = () => navigate(location.state?.from || (isAdmin ? '/admin/applications' : '/dashboard'), { replace: true })

  const handleProvider = async (provider) => {
    setError('')
    setSubmitting(true)
    try { await provider(); finishLogin() } catch (err) { setError(authErrorMessage(err, lang)) } finally { setSubmitting(false) }
  }

  const handleEmail = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const data = new FormData(event.currentTarget)
    try {
      if (creatingAccount) await createAccountWithEmail(data.get('email'), data.get('password'))
      else await signInWithEmail(data.get('email'), data.get('password'))
      finishLogin()
    } catch (err) { setError(authErrorMessage(err, lang)) } finally { setSubmitting(false) }
  }

  return (
    <main className="auth-page"><section className="auth-card">
      <Link className="back-link" to="/">← {t(lang, 'back')}</Link>
      <div className="auth-icon"><Icon name="user" size={24}/></div>
      <h2>{location.state?.from?.startsWith('/apply') ? t(lang, 'signInFinish') : t(lang, 'welcomeBack')}</h2>
      <p className="auth-sub">{location.state?.messageKey ? t(lang, location.state.messageKey) : (creatingAccount ? t(lang, 'createAccountContinue') : t(lang, 'continueProviders'))}</p>
      {!firebaseConfigured && <p className="auth-error">{t(lang, 'authSetupError')}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="social-login">
        <button type="button" className="google-btn" disabled={submitting} onClick={() => handleProvider(signInWithGoogle)}>G <span>{lang === 'hi' ? 'Google से जारी रखें' : 'Continue with Google'}</span></button>
        <button type="button" className="facebook-btn" disabled={submitting} onClick={() => handleProvider(signInWithFacebook)}>f <span>{lang === 'hi' ? 'Facebook से जारी रखें' : 'Continue with Facebook'}</span></button>
      </div>
      <div className="auth-divider"><span>{lang === 'hi' ? 'या ईमेल इस्तेमाल करें' : 'or use email'}</span></div>
      <form onSubmit={handleEmail}>
        <label>{t(lang, 'emailAddress')}<input name="email" required type="email" autoComplete="email" placeholder="you@example.com" /></label>
        <label>{t(lang, 'password')}<input name="password" required type="password" minLength="6" autoComplete={creatingAccount ? 'new-password' : 'current-password'} placeholder={t(lang, 'passwordPlaceholder')} /></label>
        <button className="primary full" type="submit" disabled={submitting}>{submitting ? t(lang, 'pleaseWait') : creatingAccount ? t(lang, 'createAccount') : t(lang, 'signIn')}<Icon name="arrow" size={18}/></button>
      </form>
      <p className="auth-switch">{creatingAccount ? t(lang, 'alreadyAccount') : t(lang, 'newHere')} <button type="button" onClick={() => { setCreatingAccount(!creatingAccount); setError('') }}>{creatingAccount ? t(lang, 'signIn') : t(lang, 'createAccount')}</button></p>
    </section></main>
  )
}
