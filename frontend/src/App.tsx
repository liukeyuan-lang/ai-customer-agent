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
import { DEMO_MODE } from './lib/demo'

function Shell() {
  return <div className="shell">
    <button className="skip-link" onClick={() => { const main = document.getElementById('main-content'); main?.setAttribute('tabindex', '-1'); main?.focus() }}>跳至主要内容</button>
    <aside className="app-nav"><div className="nav-orbit" aria-hidden="true"/><div className="brand"><div className="brand-mark">空</div><div><b>空香 <i>AI</i></b><span>客户经营 Agent</span></div></div><p className="nav-kicker">经营中枢 / workspace</p><nav><NavLink to="/dashboard"><LayoutDashboard size={18}/>Agent 工作台</NavLink><NavLink to="/customers"><Users size={18}/>客户资产中心</NavLink><NavLink to="/assistant"><Bot size={18}/>AI Agent 对话</NavLink></nav><div className="nav-footer"><span className="status-dot"/>{DEMO_MODE ? '演示数据已就绪' : '数据连接正常'}<br/><small>{DEMO_MODE ? '全部为虚构样例 · 本地运行' : 'Supabase · 实时同步'}</small></div>{!DEMO_MODE&&<button className="logout" onClick={() => supabase.auth.signOut()}><LogOut size={16}/>退出登录</button>}</aside>
    <main className="app-main" id="main-content">{DEMO_MODE&&<div className="demo-banner"><b>作品集演示</b><span>所有客户、联系方式与经营数据均为虚构样例，不会发送到任何服务器。</span></div>}<Routes><Route path="/dashboard" element={<Dashboard/>}/><Route path="/customers" element={<Customers/>}/><Route path="/customers/:id" element={<CustomerDetail/>}/><Route path="/assistant" element={<Assistant/>}/><Route path="*" element={<Navigate to="/dashboard"/>}/></Routes></main>
  </div>
}

export default function App() { const [session, setSession] = useState<Session | null | undefined>(DEMO_MODE ? null : undefined); useEffect(() => { if (DEMO_MODE) return; supabase.auth.getSession().then(({ data, error }) => setSession(error ? null : data.session)).catch(() => setSession(null)); const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)); return () => data.subscription.unsubscribe() }, []); if (DEMO_MODE) return <Shell/>; if (session === undefined) return <div className="loading-page">正在连接工作台</div>; return session ? <Shell/> : <Login/> }
