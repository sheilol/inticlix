import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'
import Icon from '../components/Icon'
import { db } from '../lib/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { t } from '../lib/i18n'

const statusKeys = { New: 'newStatus', Contacted: 'contactedStatus', Interview: 'interviewStatus', Hired: 'hiredStatus', 'Not selected': 'notSelectedStatus' }

export default function DashboardPage({ lang, jobs }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  useEffect(() => {
    if (!db || !user) return undefined
    return onSnapshot(query(collection(db, 'applications'), where('userId', '==', user.uid)), (snapshot) => setApplications(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))))
  }, [user])
  const handleLogout = async () => { await logout(); navigate('/') }
  return <main className="auth-page dashboard-page"><section className="application-card dashboard-card"><div className="section-heading"><div><span className="overline">{t(lang, 'yourAccount')}</span><h2>{t(lang, 'yourApplications')}</h2></div><button className="secondary" onClick={handleLogout}>{t(lang, 'signOut')}</button></div>{applications.length ? <div className="table-wrap"><table><thead><tr><th>{t(lang, 'job')}</th><th>{t(lang, 'status')}</th></tr></thead><tbody>{applications.map((application) => <tr key={application.id}><td>{lang === 'hi' ? (jobs.find((job) => job.titleEn === application.role)?.titleHi || application.role) : application.role}</td><td><span className="status">{t(lang, statusKeys[application.status] || 'newStatus')}</span></td></tr>)}</tbody></table></div> : <div className="success"><div><Icon name="briefcase"/></div><h2>{t(lang, 'noApplications')}</h2><p>{t(lang, 'applyWithoutAccount')}</p><button className="primary" onClick={() => navigate('/apply')}>{t(lang, 'browseJobs')}</button></div>}</section></main>
}
