import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileSpreadsheet, Presentation, Search, Upload, Users } from 'lucide-react'
import ErrorState from '../components/ErrorState'
import { ApiError, api } from '../lib/api'
import type { Customer } from '../types'
import { exportCustomersPptx, exportCustomersXlsx, importCustomersXlsx, type ReportType } from '../lib/reportFiles'

export default function Customers() {
  const [list, setList] = useState<Customer[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [reportType, setReportType] = useState<ReportType>('management')
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try { setList(await api<Customer[]>('/api/customers')) }
    catch (error) { setError(error instanceof ApiError ? error : new ApiError('客户数据加载失败，请重试。')) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  const showNotice=(text:string)=>{setNotice(text);window.setTimeout(()=>setNotice(''),3200)}
  async function exportPpt(){setExporting(true);try{await exportCustomersPptx(list,reportType);showNotice('PPT 报告已生成')}catch(e){showNotice(e instanceof Error?e.message:'PPT 生成失败')}finally{setExporting(false)}}
  async function importExcel(file?:File){if(!file)return;setExporting(true);try{const result=await importCustomersXlsx(file);await load();showNotice(result.failures.length?`成功 ${result.success} 条；失败：${result.failures.slice(0,2).join('；')}${result.failures.length>2?`；另有 ${result.failures.length-2} 条`:''}`:`已导入 ${result.success} 条客户数据`)}catch(e){showNotice(e instanceof Error?e.message:'Excel 导入失败')}finally{setExporting(false);if(fileRef.current)fileRef.current.value=''}}
  const keyword = q.trim().toLowerCase()
  const rows = list.filter(c => [c.customer_name, c.contact_name, c.owner].some(value => value?.toLowerCase().includes(keyword)))

  return <div className="page"><header className="page-head customers-head"><div><p className="page-kicker">客户资产中心</p><h1>每位客户的经营状态，一处看清</h1><p>统一管理客户、设备、合同与售后服务履约。</p></div><label className="search"><Search size={16}/><input placeholder="搜索客户、联系人或负责人" value={q} onChange={e=>setQ(e.target.value)}/></label></header><div className="data-toolbar"><label><span>报告模板</span><select value={reportType} onChange={e=>setReportType(e.target.value as ReportType)}><option value="management">经营分析</option><option value="risk">风险专题</option><option value="customer">客户全景</option></select></label><button className="tool-button primary-tool" onClick={exportPpt} disabled={exporting||loading||!list.length}><Presentation size={15}/>{exporting?'处理中…':'导出 PPT'}</button><button className="tool-button" onClick={()=>exportCustomersXlsx(list)} disabled={loading||!list.length}><FileSpreadsheet size={15}/>导出 Excel</button><button className="tool-button" onClick={()=>fileRef.current?.click()} disabled={exporting}><Upload size={15}/>导入 Excel</button><input ref={fileRef} className="hidden-file" type="file" accept=".xlsx,.xls" onChange={e=>importExcel(e.target.files?.[0])}/></div><section className="panel table-panel">{loading?<div className="table-skeleton">{[1,2,3,4,5].map(i=><div className="skeleton" key={i}/>)}</div>:error?<ErrorState title="客户数据无法加载" detail={error.message} onRetry={load} authExpired={error.status === 401}/>:rows.length===0?<div className="empty-state"><Users size={24}/><b>{list.length?'没有匹配的客户':'还没有客户资产'}</b><p>{list.length?'请调整搜索关键词。':'完成数据库初始化并添加客户后，数据会显示在这里。'}</p></div>:<table><thead><tr><th>客户名称</th><th>联系人</th><th>负责人</th><th>设备</th><th>合同状态</th><th>最近维护</th><th>下次维护</th><th>健康评分</th><th>风险</th><th/></tr></thead><tbody>{rows.map(c=>{const equipment=c.equipment?.reduce((sum:number,item:any)=>sum+(item.quantity||0),0)||0;const services=[...(c.service_records||[])].sort((a:any,b:any)=>b.service_date.localeCompare(a.service_date));const risk=c.customer_risks?.[0]?.risk_level||'低';return <tr key={c.id}><td><Link to={`/customers/${c.id}`}>{c.customer_name}</Link><small>{c.industry}</small></td><td>{c.contact_name||'-'}</td><td>{c.owner||'-'}</td><td>{equipment} 台</td><td>{c.contracts?.[0]?.renew_status||'暂无合同'}</td><td>{services[0]?.service_date||'暂无记录'}</td><td className="date-cell">{c.next_service_date||'待安排'}</td><td><span className="health-score">{c.health_score}</span></td><td><span className={`badge risk-${risk}`}>{risk}风险</span></td><td><Link className="row-link" to={`/customers/${c.id}`}><ArrowRight size={15}/></Link></td></tr>})}</tbody></table>}</section>{notice&&<div className="export-toast">{notice}</div>}</div>
}
