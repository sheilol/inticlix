import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'
import Icon from '../components/Icon'
import { db, storage } from '../lib/firebase'
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'
import { t } from '../lib/i18n'

const statuses = [['New', 'newStatus'], ['Contacted', 'contactedStatus'], ['Interview', 'interviewStatus'], ['Hired', 'hiredStatus'], ['Not selected', 'notSelectedStatus']]

export default function AdminPage({ jobs, lang }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(Boolean(db))
  const [error, setError] = useState(db ? '' : t(lang, 'firebaseConfigMissing'))
  const isJobsPage = location.pathname === '/admin/jobs'

  useEffect(() => {
    if (!db) return undefined
    return onSnapshot(query(collection(db, 'applications'), orderBy('createdAt', 'desc')), (snapshot) => {
      setApplications(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      setLoading(false)
      setError('')
    }, (err) => { setError(lang === 'hi' ? t(lang, 'firestoreDenied') : err.message); setLoading(false) })
  }, [lang])

  const handleLogout = async () => { await logout(); navigate('/') }
  const updateStatus = async (id, status) => {
    try { await updateDoc(doc(db, 'applications', id), { status }) }
    catch (err) { setError(lang === 'hi' ? t(lang, 'firestoreDenied') : err.message) }
  }
  const openResume = async (application) => {
    try {
      if (!storage) throw new Error('Storage bucket is not configured')
      const url = await getDownloadURL(ref(storage, application.resumePath))
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) { setError(lang === 'hi' ? t(lang, 'cvOpenError') : `Could not open CV: ${err.message}`) }
  }
  const jobTitle = (role) => lang === 'hi' ? (jobs.find((job) => job.titleEn === role)?.titleHi || role) : role
  const statusLabel = (value) => t(lang, statuses.find(([status]) => status === value)?.[1] || 'newStatus')
  const experienceLabel = (value) => lang === 'hi' ? ({ 'No experience yet': t(lang, 'noExperience'), 'Less than 1 year': t(lang, 'lessYear'), '1–3 years': t(lang, 'years13'), '4–7 years': t(lang, 'years47'), '8+ years': t(lang, 'years8') }[value] || value) : value

  return (
    <main className="admin-page">
      <aside className="admin-sidebar"><Link className="brand" to="/"><div className="brand-mark small"><span>N</span></div><strong>Nexora</strong></Link><nav><Link className={!isJobsPage ? 'selected' : ''} to="/admin/applications"><Icon name="user" size={18}/>{t(lang, 'applications')}</Link><Link className={isJobsPage ? 'selected' : ''} to="/admin/jobs"><Icon name="briefcase" size={18}/>{t(lang, 'jobOpenings')}</Link></nav><button className="logout" onClick={handleLogout}>{t(lang, 'logout')}</button></aside>
      <section className="admin-content">
        <div className="admin-heading"><div><span className="overline">{t(lang, 'recruitment')}</span><h2>{isJobsPage ? t(lang, 'jobOpenings') : t(lang, 'applications')}{!isJobsPage && <span className="admin-count">{applications.length}</span>}</h2></div><div className="admin-avatar" title={user?.email}>{user?.email?.slice(0, 2).toUpperCase() || 'AD'}</div></div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {isJobsPage ? <div className="job-admin-list"><p>{t(lang, 'currentJobs')}</p>{jobs.map((job) => <div key={job.id}><Icon name="briefcase" size={18}/><b>{jobTitle(job.titleEn)}</b><span>{t(lang, 'open')}</span></div>)}</div> : loading ? <p className="loading-note">{t(lang, 'loadingApplications')}</p> : <div className="table-wrap"><table><thead><tr><th>{t(lang, 'worker')}</th><th>{t(lang, 'appliedJob')}</th><th>{t(lang, 'phone')}</th><th>{t(lang, 'experienceShort')}</th><th>{t(lang, 'area')}</th><th>{t(lang, 'cv')}</th><th>{t(lang, 'appliedOn')}</th><th>{t(lang, 'status')}</th></tr></thead><tbody>{applications.length ? applications.map((application) => <tr key={application.id}><td><b>{application.name || t(lang, 'worker')}</b>{application.email && <small className="worker-email">{application.email}</small>}</td><td>{jobTitle(application.role)}</td><td><a href={`tel:${application.phone}`}>{application.phone}</a></td><td>{experienceLabel(application.experience)}</td><td>{application.location}</td><td><button className="cv-link" onClick={() => openResume(application)}>{application.resumeName || t(lang, 'openCv')}</button></td><td>{application.createdAt?.toDate ? application.createdAt.toDate().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN') : t(lang, 'applied')}</td><td><select className="status-select" aria-label={`${t(lang, 'status')} — ${application.name}`} value={application.status || 'New'} onChange={(event) => updateStatus(application.id, event.target.value)}>{statuses.map(([value]) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></td></tr>) : <tr><td colSpan="8" className="empty">{t(lang, 'noApplicationsYet')}</td></tr>}</tbody></table></div>}
      </section>
    </main>
  )
}
