import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { Bot, LayoutDashboard, LogOut, Users } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Assistant from './pages/Assistant'

function Shell() {
  return <div className="shell">
    <a className="skip-link" href="#main-content">跳至主要内容</a>
    <aside className="app-nav"><div className="nav-orbit" aria-hidden="true"/><div className="brand"><div className="brand-mark">空</div><div><b>空香 <i>AI</i></b><span>客户经营 Agent</span></div></div><p className="nav-kicker">经营中枢 / workspace</p><nav><NavLink to="/dashboard"><LayoutDashboard size={18}/>Agent 工作台</NavLink><NavLink to="/customers"><Users size={18}/>客户资产中心</NavLink><NavLink to="/assistant"><Bot size={18}/>AI Agent 对话</NavLink></nav><div className="nav-footer"><span className="status-dot"/>数据连接正常<br/><small>Supabase · 实时同步</small></div><button className="logout" onClick={() => supabase.auth.signOut()}><LogOut size={16}/>退出登录</button></aside>
    <main className="app-main" id="main-content"><Routes><Route path="/dashboard" element={<Dashboard/>}/><Route path="/customers" element={<Customers/>}/><Route path="/customers/:id" element={<CustomerDetail/>}/><Route path="/assistant" element={<Assistant/>}/><Route path="*" element={<Navigate to="/dashboard"/>}/></Routes></main>
  </div>
}

export default function App() { const [session, setSession] = useState<Session | null | undefined>(undefined); useEffect(() => { supabase.auth.getSession().then(({ data, error }) => setSession(error ? null : data.session)).catch(() => setSession(null)); const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)); return () => data.subscription.unsubscribe() }, []); if (session === undefined) return <div className="loading-page">正在连接工作台</div>; return session ? <Shell/> : <Login/> }
