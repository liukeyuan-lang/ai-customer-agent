import { FormEvent, useState } from 'react'
import { ArrowRight, Bot } from 'lucide-react'
import { supabase } from '../lib/supabase'

function authMessage(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('error sending magic link')) return '验证码邮件发送失败，请检查 Supabase SMTP 配置后重试。'
  if (normalized.includes('rate limit')) return '发送次数过多，请稍后再试。'
  if (normalized.includes('expired') || normalized.includes('invalid')) return '验证码无效或已过期，请重新发送。'
  return message || '操作失败，请稍后重试。'
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendCode() {
    setMessage('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { display_name: email.split('@')[0] },
      },
    })
    setLoading(false)
    if (error) {
      setMessage(authMessage(error.message))
      return
    }
    setStep('code')
    setCode('')
    setMessage('6 位验证码已发送，请检查邮箱。')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (step === 'email') {
      await sendCode()
      return
    }
    setMessage('')
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    setLoading(false)
    if (error) setMessage(authMessage(error.message))
  }

  function changeEmail() {
    setStep('email')
    setCode('')
    setMessage('')
  }

  return <div className="auth-page">
    <div className="auth-brand">
      <div className="brand-mark">空</div>
      <p className="page-kicker">AI 客户经营 Agent</p>
      <h1>从客户问题开始，<br/><em>找到下一步。</em></h1>
      <p>让合同、设备、服务和回款数据汇聚成每天可执行的售后判断。</p>
    </div>
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-card-head"><Bot size={18}/><span>{step === 'email' ? '邮箱验证码登录' : '输入验证码'}</span></div>
      <label>邮箱
        <input type="email" value={email} onChange={event => setEmail(event.target.value)} readOnly={step === 'code'} autoComplete="email" required/>
      </label>
      {step === 'code' && <label>6 位验证码
        <input className="code-input" type="text" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="请输入邮件中的验证码" autoFocus required/>
      </label>}
      {message && <div className={message.includes('已发送') ? 'notice success' : 'notice'}>{message}</div>}
      <button className="primary-button" type="submit" disabled={loading || (step === 'code' && code.length !== 6)}>
        {loading ? '请稍候…' : step === 'email' ? '发送验证码' : '验证并进入'} {!loading && <ArrowRight size={15}/>} 
      </button>
      {step === 'code' && <>
        <button type="button" className="link-button" onClick={sendCode} disabled={loading}>重新发送验证码</button>
        <button type="button" className="link-button secondary-link" onClick={changeEmail} disabled={loading}>更换邮箱</button>
      </>}
    </form>
  </div>
}
