import { FormEvent, useState } from 'react'
import { Bot, RotateCcw, Send, Sparkles } from 'lucide-react'
import { ApiError, api } from '../lib/api'

type Message = { role:'user'|'assistant'|'error'; content:string; retry?:string }

const money = (value: number) => `¥${Number(value || 0).toLocaleString()}`

function formatAnswer(result:any) {
  const answer = result.answer
  if (typeof answer === 'string') return answer

  if (result.intent === 'contract_expire') {
    if (!answer.length) return '未来 60 天没有需要续约的合同。'
    return `未来 60 天需要续约的合同：\n\n${answer.map((item:any,index:number) => `${index+1}. ${item.customer_name}\n合同：${item.start_date} 至 ${item.end_date}\n剩余：${item.remaining_days < 0 ? `已逾期 ${Math.abs(item.remaining_days)} 天` : `${item.remaining_days} 天`}｜金额：${money(item.amount)}\n历史服务：${item.service_count} 次｜负责人：${item.owner}｜${item.risk_level}风险\n建议：${item.suggestion}`).join('\n\n')}`
  }

  if (result.intent === 'maintenance_check') {
    if (!answer.length) return '当前没有维护逾期客户。'
    return `维护逾期客户：\n\n${answer.map((item:any,index:number) => `${index+1}. ${item.customer_name}\n设备：${item.devices.join('、') || '未记录'}\n上次维护：${item.last_service_date || '未记录'}｜计划维护：${item.due_date}\n逾期：${item.overdue_days} 天｜负责人：${item.owner}`).join('\n\n')}`
  }

  if (result.intent === 'payment_check') {
    if (!answer.length) return '当前没有欠款客户。'
    return `欠款客户：\n\n${answer.map((item:any,index:number) => `${index+1}. ${item.customer_name}\n合同金额：${money(item.total_amount)}｜已付款：${money(item.paid_amount)}｜未付款：${money(item.unpaid_amount)}\n付款方式：${item.payment_method}｜负责人：${item.owner}`).join('\n\n')}`
  }

  if (result.intent === 'customer_profile') {
    const contract = answer.contract
    return `${answer.customer_name}｜${answer.industry || '行业未记录'}\n联系人：${answer.contact_name || '-'}（${answer.phone || '-'}）｜负责人：${answer.owner || '-'}\n地址：${answer.address || '-'}\n设备：${answer.equipment_count} 台｜服务：${answer.service_count} 次｜最近服务：${answer.latest_service_date || '暂无'}\n合同：${contract ? `${contract.start_date} 至 ${contract.end_date}，${money(contract.amount)}` : '暂无'}\n回款：应收 ${money(answer.total_amount)}，已收 ${money(answer.paid_amount)}，欠款 ${money(answer.unpaid_amount)}\n风险：${answer.risk.risk_level}风险（${answer.risk.reason.join('；')}）\n建议：${answer.suggestion}`
  }

  if (result.intent === 'risk_analysis' && Array.isArray(answer)) {
    const risks = answer.filter((item:any) => item.risk_level !== '低')
    if (!risks.length) return '当前没有中高风险客户。'
    return risks.map((item:any) => `${item.customer_name}｜${item.risk_level}风险：${item.reason.join('；')}\n建议：${item.suggestion.join('；')}`).join('\n\n')
  }

  if (result.intent === 'business_report') {
    return `统计周期：${answer.period.start} 至 ${answer.period.end}\n客户：${answer.customer_count} 家｜服务：${answer.service_count} 次｜新增合同：${answer.contract_count} 份｜风险客户：${answer.risk_customer_count} 家\n合同金额：${money(answer.contract_amount)}｜回款：${money(answer.payment_amount)}\n建议：${answer.ai_suggestion}`
  }
  return '已收到结果，但暂时无法展示，请稍后重试。'
}

const prompts = ['哪些合同需要续约？','哪些客户维护逾期？','有哪些客户欠款？','演示客户 04 怎么样？','帮我生成经营报告']

export default function Assistant(){const[messages,setMessages]=useState<Message[]>([{role:'assistant',content:'我可以查询合同续约、维护逾期、客户欠款、客户画像、风险分析和经营报告。'}]);const[input,setInput]=useState('');const[busy,setBusy]=useState(false);async function send(text=input){const content=text.trim();if(!content||busy)return;setMessages(v=>[...v,{role:'user',content}]);setInput('');setBusy(true);try{const result=await api<any>('/api/assistant/chat',{method:'POST',body:JSON.stringify({message:content})});setMessages(v=>[...v,{role:'assistant',content:formatAnswer(result)}])}catch(e){const error=e instanceof ApiError?e:new ApiError('Agent 暂时无法回答，请重试。');setMessages(v=>[...v,{role:'error',content:error.message,retry:content}])}finally{setBusy(false)}}function submit(e:FormEvent){e.preventDefault();send()}return <div className="page"><header className="page-head"><div><p className="page-kicker">多意图经营 Agent</p><h1>把经营问题交给 Agent</h1><p>规则 Router 会识别业务意图，并把问题交给对应的数据 Agent。</p></div></header><div className="assistant-layout"><section className="chat panel"><div className="messages">{messages.map((m,i)=><div key={i} className={`message ${m.role}`}><b>{m.role==='assistant'?'AI Agent':m.role==='error'?'请求失败':'你'}</b><pre>{m.content}</pre>{m.retry&&<button className="message-retry" onClick={()=>send(m.retry)} disabled={busy}><RotateCcw size={13}/>重试</button>}</div>)}</div><form onSubmit={submit}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="询问合同、维护、欠款或客户情况" disabled={busy}/><button disabled={busy||!input.trim()} aria-label="发送"><Send size={16}/></button></form></section><aside className="prompts panel"><div className="ai-icon"><Sparkles size={18}/></div><h2>可以这样问</h2>{prompts.map(x=><button key={x} onClick={()=>send(x)} disabled={busy}>{x}</button>)}<p>同一登录会话会记住最近查询的客户，可继续追问合同、维护和欠款。</p></aside></div></div>}
