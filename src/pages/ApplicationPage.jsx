import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import useAuth from '../context/useAuth'
import { db, storage } from '../lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'
import { t } from '../lib/i18n'

const draftKey = 'nexora-application-draft'
const maxResumeSize = 10 * 1024 * 1024

export default function ApplicationPage({ jobs, lang }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const draft = (() => {
    try { return JSON.parse(sessionStorage.getItem(draftKey) || '{}') } catch { return {} }
  })()
  const resumeStep = searchParams.get('step') === 'resume'

  const saveDetails = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const application = Object.fromEntries(['name', 'phone', 'role', 'experience', 'location', 'availability', 'introduction', 'email'].map((key) => [key, String(data.get(key) || '').trim()]))
    sessionStorage.setItem(draftKey, JSON.stringify(application))
    if (!user) {
      navigate('/login', { state: { from: '/apply?step=resume', messageKey: 'loginToUpload' } })
      return
    }
    navigate('/apply?step=resume')
  }

  const submitApplication = async (event) => {
    event.preventDefault()
    setError('')
    if (!user) {
      navigate('/login', { state: { from: '/apply?step=resume', messageKey: 'loginToUpload' } })
      return
    }
    if (!file) { setError(t(lang, 'chooseCvError')); return }
    if (file.size > maxResumeSize) { setError(t(lang, 'cvSizeError')); return }
    const extension = file.name.split('.').pop()?.toLowerCase()
    const resumeTypes = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    if (!resumeTypes[extension]) { setError(t(lang, 'cvTypeError')); return }
    if (!db) { setError(t(lang, 'firebaseUnavailable')); return }
    if (!storage) { setError(lang === 'hi' ? t(lang, 'storageSetupError') : 'Resume uploads need the Firebase Storage bucket. Add VITE_FIREBASE_STORAGE_BUCKET to .env.local and restart the site.'); return }
    setSubmitting(true)
    setUploadProgress(t(lang, 'uploadingCv'))
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `resumes/${user.uid}/${crypto.randomUUID()}_${safeName}`
      await uploadBytes(ref(storage, storagePath), file, { contentType: resumeTypes[extension] })
      setUploadProgress(t(lang, 'savingApplication'))
      await addDoc(collection(db, 'applications'), {
        ...draft,
        email: draft.email || user.email || '',
        userId: user.uid,
        resumePath: storagePath,
        resumeName: file.name,
        status: 'New',
        createdAt: serverTimestamp(),
      })
      sessionStorage.removeItem(draftKey)
      setSubmitted(true)
    } catch (err) {
      setError(lang === 'hi' ? t(lang, 'submitError') : (err.message || t(lang, 'submitError')))
    } finally {
      setSubmitting(false)
      setUploadProgress('')
    }
  }

  return (
    <main className="form-page">
      <aside className="form-sidebar"><div className="brand-mark small"><span>N</span></div><h3>{lang === 'hi' ? 'अच्छा काम, अच्छी शुरुआत।' : 'Good work starts here.'}</h3><p>{t(lang, 'twoQuickSteps')}</p><div className="trust-note">✓ <span>{t(lang, 'cvPrivate')}<br/>{t(lang, 'onlyYouAdmin')}</span></div></aside>
      <section className="application-card">
        <Link className="back-link" to="/">← {t(lang, 'backToJobs')}</Link>
        {submitted ? (
          <div className="success"><div>✓</div><h2>{t(lang, 'applicationReceived')}</h2><p>{t(lang, 'thanksApply')}</p><Link className="primary" to="/">{t(lang, 'moreJobs')}</Link></div>
        ) : resumeStep ? (
          <>
            <span className="overline">{t(lang, 'stepTwo')}</span><h2>{t(lang, 'uploadCv')}</h2>
            <p className="auth-sub">{t(lang, 'signedInAs')} {user?.email || user?.displayName || t(lang, 'myAccount')}. {t(lang, 'addCvToApply')} <b>{lang === 'hi' ? (jobs.find((job) => job.titleEn === draft.role)?.titleHi || draft.role) : draft.role}</b>.</p>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <form className="application-form" onSubmit={submitApplication}>
              <label className="resume-upload">{t(lang, 'chooseCv')} *<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required onChange={(event) => setFile(event.target.files?.[0] || null)} /><small>{t(lang, 'pdfWordLimit')}</small></label>
              {file && <p className="file-picked">{t(lang, 'selected')} {file.name}</p>}
              {uploadProgress && <p className="form-note" role="status">{uploadProgress}</p>}
              <button className="primary full" type="submit" disabled={submitting}>{submitting ? t(lang, 'pleaseWait') : t(lang, 'uploadAndSubmit')}<Icon name="arrow" size={18}/></button>
            </form>
          </>
        ) : (
          <>
            <span className="overline">{t(lang, 'stepOne')}</span><h2>{t(lang, 'aboutYou')}</h2>
            <p className="auth-sub">{t(lang, 'fillDetailsFirst')}</p>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <form className="application-form" onSubmit={saveDetails}>
              <div className="form-row"><label>{t(lang, 'fullName')} *<input name="name" required autoComplete="name" defaultValue={draft.name || ''} placeholder={lang === 'hi' ? 'अपना नाम लिखें' : 'Your name'} /></label><label>{t(lang, 'phone')} *<input name="phone" required type="tel" autoComplete="tel" defaultValue={draft.phone || ''} placeholder={lang === 'hi' ? 'आपका मोबाइल नंबर' : 'Your mobile number'} /></label></div>
              <div className="form-row"><label>{t(lang, 'jobWanted')} *<select name="role" required defaultValue={draft.role || searchParams.get('role') || ''}><option value="" disabled>{t(lang, 'chooseJob')}</option>{jobs.map((job) => <option key={job.id} value={job.titleEn}>{lang === 'hi' ? job.titleHi : job.titleEn}</option>)}</select></label><label>{t(lang, 'experience')}<select name="experience" defaultValue={draft.experience || 'No experience yet'}><option value="No experience yet">{t(lang, 'noExperience')}</option><option value="Less than 1 year">{t(lang, 'lessYear')}</option><option value="1–3 years">{t(lang, 'years13')}</option><option value="4–7 years">{t(lang, 'years47')}</option><option value="8+ years">{t(lang, 'years8')}</option></select></label></div>
              <div className="form-row"><label>{t(lang, 'areaCity')} *<input name="location" required autoComplete="address-level2" defaultValue={draft.location || ''} placeholder={lang === 'hi' ? 'जैसे: व्हाइटफ़ील्ड, बेंगलुरु' : 'e.g. Whitefield, Bengaluru'} /></label><label>{t(lang, 'startWhen')}<select name="availability" defaultValue={draft.availability || 'Immediately'}><option value="Immediately">{t(lang, 'immediately')}</option><option value="Within 2 weeks">{t(lang, 'withinTwoWeeks')}</option><option value="Within a month">{t(lang, 'withinMonth')}</option><option value="Need to discuss">{t(lang, 'discuss')}</option></select></label></div>
              <label>{t(lang, 'emailOptional')}<input name="email" type="email" autoComplete="email" defaultValue={draft.email || ''} placeholder={t(lang, 'emailPlaceholder')} /></label>
              <label>{t(lang, 'skillsOptional')}<textarea name="introduction" rows="3" defaultValue={draft.introduction || ''} placeholder={t(lang, 'skillsPlaceholder')}></textarea></label>
              <p className="form-note">{t(lang, 'nextSignIn')}</p>
              <button className="primary full" type="submit">{t(lang, 'continueSignIn')}<Icon name="arrow" size={18}/></button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}
