import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  FiChevronRight, FiShield, FiZap, FiMail, FiEdit3,
  FiBarChart2, FiSettings, FiBell, FiCloudOff, FiCheckCircle
} from 'react-icons/fi'
import logoDark from '../assets/SMTLogoBLCK.png'

export default function LandingPage() {
  const [typedText, setTypedText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const words = ['Reimagined.', 'Simplified.', 'Automated.', 'Transformed.']

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const currentWord = words[wordIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentWord.length) {
          setTypedText(currentWord.slice(0, typedText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(currentWord.slice(0, typedText.length - 1))
        } else {
          setIsDeleting(false)
          setWordIndex((wordIndex + 1) % words.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [typedText, isDeleting, wordIndex])
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 relative isolate">
      {/* Hero Section with Bubbles */}
      <div className="relative">
        {/* Background Bubbles - Only on Header and Navbar */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-[10%] w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bubble" style={{ animationDuration: '15s', animationDelay: '0s' }}></div>
          <div className="absolute top-0 left-[30%] w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bubble" style={{ animationDuration: '18s', animationDelay: '2s' }}></div>
          <div className="absolute top-0 left-[55%] w-56 h-56 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bubble" style={{ animationDuration: '20s', animationDelay: '4s' }}></div>
          <div className="absolute top-0 left-[75%] w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bubble" style={{ animationDuration: '22s', animationDelay: '1s' }}></div>
          <div className="absolute top-0 left-[90%] w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bubble" style={{ animationDuration: '16s', animationDelay: '6s' }}></div>

          <div className="absolute top-0 left-[20%] w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-bubble" style={{ animationDuration: '19s', animationDelay: '8s' }}></div>
          <div className="absolute top-0 left-[45%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-bubble" style={{ animationDuration: '25s', animationDelay: '10s' }}></div>
          <div className="absolute top-0 left-[65%] w-32 h-32 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-bubble" style={{ animationDuration: '14s', animationDelay: '12s' }}></div>
        </div>

        {/* Navigation */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-sm' : 'bg-transparent border-transparent'} animate-fade-in-down`}>
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoDark} alt="SmartMailTrack" className="h-12" />
            </div>
            <div className="flex items-center gap-3">
              <Link to="/memo-tracker" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all text-sm font-semibold">
                Track Memo
              </Link>
              <Link to="/login" className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-sm">
                <span className="text-sm font-semibold">Login</span>
                <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative pt-48 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-blue-700 text-xs font-bold mb-8 animate-fade-in">
              {/* <FiShield className="w-3 h-3" /> */}
              {/* <span>ZERO-TRUST READY ARCHITECTURE</span> */}
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight animate-slideInLeft">
              Enterprise Memo Management, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{typedText}<span className="inline-block w-1 h-16 lg:h-20 bg-gradient-to-r from-blue-600 to-cyan-500 ml-1 animate-blink"></span></span>
            </h1>
            <p className="mt-8 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-slideInLeft delay-100">
              Create, route, track and analyze memos with automation-grade workflows, a smart mailbox, and compliance-first controls. Built for teams that move fast.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 animate-scaleIn delay-200">
              <Link to="/login" className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                Get Started Now
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* 1. Features Grid Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <FiEdit3 />, title: 'Compose & Record', desc: 'Rich editor, templates, external intake.', detail: 'Attach files, set priorities, and archive with one click.' },
            { icon: <FiMail />, title: 'Smart Mailbox', desc: 'Inbox, Sent, Drafts, Archive with fast filters.', detail: 'Star, forward, and reply while maintaining context.' },
            { icon: <FiZap />, title: 'Automated Workflows', desc: 'Drag-and-drop steps, approvals, SLA.', detail: 'Assign steps to roles and enable auto-escalations.' },
            { icon: <FiBarChart2 />, title: 'Analytics & Reports', desc: 'Compliance, performance, user insights.', detail: 'Visualize throughput and bottlenecks across teams.' },
            { icon: <FiSettings />, title: 'Administration', desc: 'Roles, departments, categories.', detail: 'Fine-grained RBAC with department-level scopes.' },
            { icon: <FiBell />, title: 'Notifications', desc: 'Realtime alerts, toasts, email triggers.', detail: 'Stay informed with scheduled digests and triggers.' },
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group animate-scaleIn" style={{ animationDelay: `${(i + 1) * 100}ms` }}>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-slate-600 font-medium mb-2">{f.desc}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Offline Memos Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slideInLeft">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6">
              <FiCloudOff size={24} />
            </div>
            <h2 className="text-4xl font-extrabold mb-6">Manage offline memos</h2>
            <p className="text-lg text-slate-600 mb-6">Capture, compose, and archive memos even without connectivity. Offline-first flows ensure work continues during field operations or travel.</p>
            <div className="flex items-center gap-4 text-sm font-bold text-blue-600">
              <span className="px-3 py-1 bg-blue-100 rounded-full uppercase tracking-wider text-[10px]">Offline Capture</span>
              <span className="px-3 py-1 bg-blue-100 rounded-full uppercase tracking-wider text-[10px]">Auto-Sync</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm animate-float">
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-2 h-10 rounded-full ${i === 0 ? 'bg-red-400' : 'bg-cyan-400'}`} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                    <div className="h-2 w-1/3 bg-slate-100 rounded" />
                  </div>
                  <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded">OFFLINE</span>
                </div>
              ))}
              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-100">Sync Drafts</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Administration Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="lg:order-2 animate-slideInRight">
            <h2 className="text-4xl font-extrabold mb-6">Administration that scales</h2>
            <p className="text-lg text-slate-600 mb-6">Define departments, roles, and memo categories to reflect your organization. Every permission is explicit and every change is tracked.</p>
            <div className="grid grid-cols-2 gap-4">
              {['RBAC Control', 'Department Scopes', 'Audit Logs', 'Retention Rules'].map(item => (
                <div key={item} className="flex items-center gap-2 text-slate-700 font-semibold">
                  <FiCheckCircle className="text-emerald-500" /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:order-1 bg-slate-900 rounded-3xl p-10 shadow-2xl animate-float">
            <div className="grid grid-cols-3 gap-3 mb-8">
              {['Admin', 'Reviewer', 'Publisher', 'Compliance', 'HR', 'IT', 'Finance', 'Ops', 'Legal'].map((t) => (
                <span key={t} className="px-3 py-2 rounded-lg bg-white/10 text-white text-[11px] font-medium text-center">{t}</span>
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-2 w-full bg-white/5 rounded" />
              <div className="h-2 w-4/5 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Reports Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-white animate-slideInRight lg:order-2">
            <h2 className="text-4xl font-extrabold mb-6">Reports you can trust</h2>
            <p className="text-blue-100 text-lg mb-8">Generate compliance-ready reports that summarize memo lifecycle, approval timelines, and workflow efficiency.</p>
            <div className="flex gap-4">
              {['CSV', 'PDF', 'DOCX'].map(ext => (
                <div key={ext} className="px-4 py-2 bg-white/10 rounded-lg font-bold border border-white/20">{ext}</div>
              ))}
            </div>
          </div>
          <div className="animate-float lg:order-1">
            <img src="https://illustrations.popsy.co/amber/surr-chart.svg" alt="Analytics and Reports" className="w-full h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* 5. Workflows Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slideInLeft">
            <h2 className="text-4xl font-extrabold mb-6">Workflows that think for you</h2>
            <p className="text-lg text-slate-600 mb-4">Create multi-step routes with approvals, deadlines and roles. Preview and confirm with confidence before launch.</p>
            <p className="text-slate-500">Design templates for repeatable processes and enforce SLAs effortlessly.</p>
          </div>
          <div className="space-y-4 animate-float">
            {['Draft', 'Review', 'Approve', 'Notify', 'Archive'].map((s, i) => (
              <div key={s} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-slate-100">{i + 1}</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(i + 1) * 20}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-700 w-16">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Mailbox Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="lg:order-2 animate-slideInRight">
            <h2 className="text-4xl font-extrabold mb-6">A smarter inbox for memos</h2>
            <p className="text-lg text-slate-600 mb-6">Filter by status, star important items, and forward with context. Everything stays tracked and metadata is preserved.</p>
            <div className="flex flex-wrap gap-2">
              {['Inbox', 'Sent', 'Drafts', 'Starred', 'Archived'].map(tag => (
                <span key={tag} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500">{tag}</span>
              ))}
            </div>
          </div>
          <div className="lg:order-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-float">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-6 pb-4 border-b border-slate-100">
              <FiMail /> MAILBOX
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className={`w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-blue-500' : 'bg-cyan-400'}`} />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-3/4 bg-slate-200 rounded" />
                    <div className="h-2 w-1/2 bg-slate-100 rounded" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">OPEN</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Security Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slideInLeft">
            <h2 className="text-4xl font-extrabold mb-6">Security and administration</h2>
            <p className="text-lg text-slate-600 mb-6">Zero-trust posture with role-based permissions, mandatory reviews for sensitive changes, and immutable audit trails.</p>
            <div className="grid grid-cols-3 gap-3">
              {['2FA', 'RBAC', 'Audit Trails', 'TLS', 'Backups', 'SLA'].map((t) => (
                <div key={t} className="p-3 bg-slate-50 rounded-xl text-center text-xs font-bold text-slate-700 border border-slate-100">{t}</div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full animate-pulse-soft" />
            <div className="relative bg-white border-2 border-slate-900 rounded-3xl p-10 flex flex-col items-center animate-float">
              <FiShield size={80} className="text-slate-900 mb-4" />
              <div className="text-center">
                <div className="font-black text-2xl uppercase italic tracking-tighter">SecureGuard™</div>
                <div className="text-sm text-slate-400 font-medium">Enterprise Encryption Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Notifications Section */}
      <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-6 mb-24 animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slideInLeft">
            <h2 className="text-4xl font-extrabold mb-6">Notifications that keep everyone aligned</h2>
            <p className="text-slate-400 text-lg mb-8">Never miss assignments, approvals, or deadlines. Real-time in-app toasts, scheduled email digests, and configurable channels.</p>
            <div className="space-y-4">
              {['Real-time Assignments', 'Role-aware Routing', 'Scheduled Digests'].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><FiBell size={10} /></div>
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 animate-slideInRight">
            {[
              { label: 'Assigned', color: 'bg-emerald-400', text: 'text-emerald-400' },
              { label: 'Deadline', color: 'bg-amber-400', text: 'text-amber-400' },
              { label: 'Approved', color: 'bg-blue-400', text: 'text-blue-400' }
            ].map((n, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${n.color}`} />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-1/2 bg-white/20 rounded" />
                  <div className="h-2 w-1/3 bg-white/10 rounded" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${n.text}`}>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-100 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoDark} alt="SmartMailTrack" className="h-12" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enterprise Memo Management Platform</span>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <div className="opacity-80">
            <img src="https://tfnsolutions.us/logo.png" alt="TFN Solutions" className="h-8 mx-auto" />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} TFN Solutions • All rights reserved
          </div>
        </div>
      </footer>
    </div>
  )
}