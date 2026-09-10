import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Bot, Building2, FileText, Radio, Wallet, Wrench } from 'lucide-react'
import ErrorState from '../components/ErrorState'
import { ApiError, api } from '../lib/api'
import type { Customer } from '../types'

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!id) { setError(new ApiError('客户编号无效。', 400)); setLoading(false); return }
    setLoading(true); setError(null)
    try {
      const result = await api<{ customer: Customer; summary: any }>(`/api/customers/${id}/full`)
      setCustomer(result.customer); setSummary(result.summary)
    } catch (error) {
      setError(error instanceof ApiError ? error : new ApiError('客户详情加载失败，请重试。'))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])
  if (error) return <ErrorState title="客户详情无法加载" detail={error.message} onRetry={load} authExpired={error.status === 401}/>
  if (loading || !customer) return <div className="page"><div className="skeleton heading-skeleton"/><div className="skeleton content-skeleton"/></div>

  const contract = customer.contracts?.[0]
  const payment = customer.payments?.[0]
  const remaining = contract ? (contract.total_service_count || 0) - (contract.completed_service_count || 0) : 0
  const services = [...(customer.service_records || [])].sort((a:any,b:any) => b.service_date.localeCompare(a.service_date))

  return <div className="page"><Link className="back" to="/customers"><ArrowLeft size={15}/>返回客户资产中心</Link><header className="customer-hero"><div><p className="page-kicker">客户 360 / {customer.industry}</p><h1>{customer.customer_name}</h1><p>{customer.address}</p></div><div className="customer-hero-stats"><div><span>健康评分</span><b>{customer.health_score}</b></div><div><span>设备资产</span><b>{customer.equipment?.reduce((sum:number,item:any)=>sum+(item.quantity||0),0)||0}</b></div><div><span>下次维护</span><b>{customer.next_service_date||'待安排'}</b></div></div></header>{summary&&<section className="ai-summary"><div className="ai-icon"><Bot size={19}/></div><div><p className="card-kicker">AI 客户总结</p><b>{summary.summary}</b><p>当前风险：{summary.risk.reason.join('；')}。建议：{summary.suggestion}</p></div></section>}<div className="detail-grid"><Card title="基础信息" icon={Building2}><div className="fields"><Field label="联系人" value={customer.contact_name}/><Field label="电话" value={customer.phone}/><Field label="负责人" value={customer.owner}/><Field label="首次合作" value={customer.first_cooperation_date}/><Field label="客户状态" value={customer.status}/><Field label="地址" value={customer.address}/></div></Card><Card title="设备资产" icon={Radio}><div className="asset-list">{customer.equipment?.map((item:any)=><div key={item.id}><span>{item.device_model||item.device_name}</span><b>{item.quantity} 台</b><small>{item.install_date||'未记录'} · {item.status}</small></div>)}</div>{!customer.equipment?.length&&<div className="empty-state">暂无设备记录</div>}</Card><Card title="合同信息" icon={FileText}><div className="fields"><Field label="合同周期" value={contract?.service_cycle}/><Field label="合同金额" value={contract?`¥${Number(contract.amount).toLocaleString()}`:'-'}/><Field label="合同开始" value={contract?.start_date}/><Field label="合同结束" value={contract?.end_date}/><Field label="维保次数" value={contract?.total_service_count}/><Field label="完成 / 剩余" value={`${contract?.completed_service_count||0} / ${remaining}`}/><Field label="续约状态" value={contract?.renew_status}/></div></Card><Card title="收付款" icon={Wallet}><div className="payment"><div><span>合同金额</span><b>¥{Number(payment?.total_amount||0).toLocaleString()}</b></div><div><span>已收</span><b className="green">¥{Number(payment?.paid_amount||0).toLocaleString()}</b></div><div><span>欠款</span><b className="orange">¥{Number(payment?.unpaid_amount||0).toLocaleString()}</b></div></div><p className="muted">付款方式：{payment?.payment_method||'暂无记录'}</p></Card><Card title="服务历史" icon={Wrench} wide><div className="timeline">{services.map((item:any)=><div key={item.id}><time>{item.service_date}</time><section><b>{item.service_type} · {item.service_person}</b><p>{item.service_content}</p><span>精油：{item.oil_model||'未记录'}，添加 {item.oil_quantity||0} 瓶</span></section></div>)}</div>{!services.length&&<div className="empty-state">暂无服务记录</div>}</Card></div></div>
}

function Card({ title, icon: Icon, children, wide = false }: any) { return <section className={`detail-card ${wide?'wide':''}`}><h2><Icon size={17}/>{title}</h2>{children}</section> }
function Field({ label, value }: any) { return <div><span>{label}</span><b>{value||'-'}</b></div> }
