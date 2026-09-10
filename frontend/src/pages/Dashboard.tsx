import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, ListTodo, ScanSearch, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import { ApiError, api } from '../lib/api'

type Data = { customer_count:number; scanned_count:number; risk_customer_count:number; pending_count:number; high_risk_customers:Array<any> }

export default function Dashboard() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError(null)
    try { setData(await api<Data>('/api/dashboard')) }
    catch (error) { setError(error instanceof ApiError ? error : new ApiError('经营巡检加载失败，请重试。')) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  if (error) return <ErrorState title="经营巡检暂时无法加载" detail={error.message} onRetry={load} authExpired={error.status === 401}/>
  if (loading || !data) return <DashboardSkeleton/>

  const stats = [['客户总数', data.customer_count, '客户资产已纳入统一管理', Users, '/customers'], ['已扫描客户', data.scanned_count, '合同、服务、回款已检查', ScanSearch, '/customers'], ['风险客户', data.risk_customer_count, '需要人工判断和跟进', AlertTriangle, '/customers'], ['待处理事项', data.pending_count, '建议今天优先处理', ListTodo, '/assistant']]
  return <div className="page"><header className="page-head"><div><p className="page-kicker">今日经营巡检</p><h1>先处理最重要的客户问题</h1><p>Agent 已完成合同、服务和回款扫描，并整理出今天的行动顺序。</p></div><div className="agent-state"><span className="status-dot"/>Agent 运行正常</div></header><section className="stats">{stats.map(([label,value,meta,Icon,to]:any,index)=><Link className={`${index===2?'metric risk-metric':'metric'} metric-link`} to={to} key={label} aria-label={`${label}：${value}，查看详情`}><div className="metric-top"><span>{label}</span><Icon size={19}/></div><strong>{value}</strong><p>{meta}</p><span className="metric-action">查看详情 <ArrowRight size={12}/></span></Link>)}</section><section className="work-grid"><div className="panel risk-panel"><div className="panel-head"><div><h2>高风险客户</h2><p>按照影响和紧急程度排列</p></div><Link className="text-link" to="/customers">查看全部 <ArrowRight size={14}/></Link></div><div className="risk-list">{data.high_risk_customers.map((item,index)=><Link className="risk-row risk-row-link" to={`/customers/${item.customer_id}`} aria-label={`查看${item.customer_name}`} key={item.customer_id}><span className="risk-rank">{String(index+1).padStart(2,'0')}</span><div className="risk-copy"><div><b>{item.customer_name}</b><em>高风险</em></div><p>{item.reason.join('；')}</p><span><Sparkles size={13}/> {item.suggestion.join('；')}</span></div><ArrowRight size={16}/></Link>)}{!data.high_risk_customers.length&&<div className="empty-state"><Sparkles size={22}/><b>今天没有高风险客户</b><p>Agent 会继续检查合同、维护和回款变化。</p></div>}</div></div><aside className="panel action-panel"><div className="panel-head"><div><h2>Agent 建议</h2><p>根据今日巡检生成</p></div></div><div className="focus-number"><span>建议优先处理</span><strong>{data.pending_count}</strong><small>项经营任务</small></div><ol><li>先联系合同临期客户</li><li>安排逾期维护客户复查</li><li>确认欠款客户回款计划</li></ol><Link className="primary-button" to="/assistant">询问 AI Agent <ArrowRight size={15}/></Link></aside></section></div>
}

function DashboardSkeleton(){return <div className="page"><div className="skeleton heading-skeleton"/><div className="stats">{[1,2,3,4].map(i=><div className="skeleton metric-skeleton" key={i}/>)}</div><div className="skeleton content-skeleton"/></div>}
