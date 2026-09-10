import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Props = { title: string; detail: string; onRetry?: () => void; authExpired?: boolean }

export default function ErrorState({ title, detail, onRetry, authExpired = false }: Props) {
  return <div className="state-panel error-state" role="alert">
    <AlertTriangle size={24}/>
    <h2>{title}</h2>
    <p>{detail}</p>
    {authExpired
      ? <button className="primary-button" onClick={() => supabase.auth.signOut()}><LogOut size={15}/>重新登录</button>
      : onRetry && <button className="primary-button" onClick={onRetry}><RefreshCw size={15}/>重新尝试</button>}
  </div>
}
