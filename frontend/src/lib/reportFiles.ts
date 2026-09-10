import type { Customer } from '../types'
import { api } from './api'

export type ReportType = 'management' | 'risk' | 'customer'
type ImportRow = { customer_name:string; industry:string; address:string; contact_name:string; phone:string; owner:string; status:string; first_cooperation_date?:string; next_service_date?:string; health_score:number }
const headers=['客户名称','所属行业','客户地址','联系人','联系电话','客户负责人','客户状态','首次合作日期','下次维护日期','健康评分','设备数量','合同金额','合同状态','计划服务次数','已完成服务次数','已收款','风险等级']
const num=(value:unknown)=>Number(String(value??0).replace(/[,，¥￥]/g,''))||0
const hasValue=(value:unknown)=>String(value??'').trim()!==''
const validDate=(value:string)=>{if(!value)return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [year,month,day]=value.split('-').map(Number);const date=new Date(Date.UTC(year,month-1,day));return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day}
const equipment=(c:Customer)=>c.equipment?.reduce((sum,item)=>sum+num(item.quantity),0)||0
const contract=(c:Customer)=>c.contracts?.[0]||{}
const payment=(c:Customer)=>c.payments?.[0]||{}
const risk=(c:Customer)=>c.customer_risks?.[0]?.risk_level||'低'
const download=(blob:Blob,name:string)=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

export async function exportCustomersXlsx(customers:Customer[]){
  const XLSX=await import('xlsx')
  const rows=customers.map(c=>({客户名称:c.customer_name,所属行业:c.industry,客户地址:c.address,联系人:c.contact_name,联系电话:c.phone,客户负责人:c.owner,客户状态:c.status,首次合作日期:c.first_cooperation_date,下次维护日期:c.next_service_date,健康评分:c.health_score,设备数量:equipment(c),合同金额:num(contract(c).amount),合同状态:contract(c).renew_status||'',计划服务次数:num(contract(c).total_service_count),已完成服务次数:num(contract(c).completed_service_count),已收款:num(payment(c).paid_amount),风险等级:risk(c)}))
  const ws=XLSX.utils.json_to_sheet(rows,{header:headers});ws['!cols']=headers.map((h,i)=>({wch:[0,2].includes(i)?22:14}));ws['!autofilter']={ref:`A1:Q${rows.length+1}`}
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'客户数据')
  const bytes=XLSX.write(wb,{bookType:'xlsx',type:'array'});download(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`空香客户数据_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export async function importCustomersXlsx(file:File){
  const XLSX=await import('xlsx');const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});const rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(wb.Sheets[wb.SheetNames[0]],{defval:'',raw:false})
  if(!rows.length||!Object.prototype.hasOwnProperty.call(rows[0],'客户名称'))throw new Error('未找到“客户名称”列，请使用系统导出的 Excel 模板')
  const errors:string[]=[];const names=new Set<string>()
  const payloads:ImportRow[]=rows.filter(row=>hasValue(row['客户名称'])).flatMap((row,index)=>{const line=index+2;const customer_name=String(row['客户名称']).trim();const first_cooperation_date=String(row['首次合作日期']||'').trim();const next_service_date=String(row['下次维护日期']||'').trim();const scoreText=String(row['健康评分']??'').trim();if(names.has(customer_name))errors.push(`第 ${line} 行：客户名称重复（${customer_name}）`);names.add(customer_name);if(!validDate(first_cooperation_date))errors.push(`第 ${line} 行：首次合作日期应为 YYYY-MM-DD`);if(!validDate(next_service_date))errors.push(`第 ${line} 行：下次维护日期应为 YYYY-MM-DD`);const health_score=scoreText===''?100:Number(scoreText);if(!Number.isFinite(health_score)||health_score<0||health_score>100)errors.push(`第 ${line} 行：健康评分应为 0 到 100 的数字`);return [{customer_name,industry:String(row['所属行业']||''),address:String(row['客户地址']||''),contact_name:String(row['联系人']||''),phone:String(row['联系电话']||''),owner:String(row['客户负责人']||''),status:String(row['客户状态']||'normal'),first_cooperation_date:first_cooperation_date||undefined,next_service_date:next_service_date||undefined,health_score:Number.isFinite(health_score)?health_score:100}]})
  if(!payloads.length)throw new Error('未找到“客户名称”字段，请使用系统导出的 Excel 模板')
  if(errors.length)throw new Error(`导入前校验未通过：${errors.slice(0,3).join('；')}${errors.length>3?`；另有 ${errors.length-3} 项`:''}`)
  const result=await api<{success:number}>('/api/customers/import',{method:'POST',body:JSON.stringify({customers:payloads})})
  return {success:result.success,failures:[]}
}

const themes={management:{name:'经营分析',title:'客户资产经营分析',accent:'B99A4A',soft:'EEE3C4',focus:'经营规模、履约和回款'},risk:{name:'风险专题',title:'客户风险专题报告',accent:'B45B4B',soft:'EFE1D6',focus:'风险识别、优先级和处置'},customer:{name:'客户全景',title:'客户资产全景报告',accent:'4F7158',soft:'DFE7D7',focus:'客户结构、设备和服务覆盖'}}
const chunks=<T,>(items:T[],size:number)=>Array.from({length:Math.ceil(items.length/size)},(_,i)=>items.slice(i*size,(i+1)*size))

export async function exportCustomersPptx(customers:Customer[],type:ReportType='management',downloadFile=true){
  if(!customers.length)throw new Error('暂无客户数据，无法生成报告')
  const {default:PptxGenJS}=await import('pptxgenjs');const pptx=new PptxGenJS();const theme=themes[type];pptx.layout='LAYOUT_WIDE';pptx.author='空香';pptx.company='空香';pptx.title=theme.title;pptx.theme={headFontFace:'Microsoft YaHei',bodyFontFace:'Microsoft YaHei'}
  const totalDevices=customers.reduce((s,c)=>s+equipment(c),0),contractTotal=customers.reduce((s,c)=>s+num(contract(c).amount),0),paid=customers.reduce((s,c)=>s+num(payment(c).paid_amount),0),risks=customers.filter(c=>risk(c)!=='低'),high=customers.filter(c=>risk(c)==='高'),medium=customers.filter(c=>risk(c)==='中'),low=customers.filter(c=>risk(c)==='低')
  let page=1;const footer=(slide:any)=>{slide.addText('空香 AI 客户经营 Agent',{x:.65,y:7.08,w:4,h:.2,fontSize:7,color:'8A948C',margin:0});slide.addText(String(page++).padStart(2,'0'),{x:12,y:7.06,w:.65,h:.2,fontSize:8,bold:true,color:theme.accent,align:'right',margin:0})};const title=(slide:any,text:string,sub:string)=>{slide.background={color:'F6F3E9'};slide.addText(text,{x:.65,y:.55,w:11.8,h:.55,fontSize:26,bold:true,color:'17362E',margin:0});slide.addText(sub,{x:.65,y:1.18,w:11.8,h:.25,fontSize:10,color:'748076',margin:0});slide.addShape('line',{x:.65,y:1.55,w:12,h:0,line:{color:'D8D5C9',width:1}})}
  let slide=pptx.addSlide();slide.background={color:'F6F3E9'};slide.addShape(pptx.ShapeType.ellipse,{x:9.7,y:-1.3,w:4.8,h:4.8,fill:{color:theme.soft},line:{transparency:100}});slide.addText(theme.title,{x:.8,y:1.55,w:8,h:.9,fontSize:36,bold:true,color:'17362E',margin:0});slide.addText(theme.focus,{x:.82,y:2.8,w:7,h:.35,fontSize:15,color:'66746B',margin:0});slide.addText(`${new Date().toLocaleDateString('zh-CN')} · ${customers.length} 位客户 · ${totalDevices} 台设备`,{x:.82,y:3.45,w:8,h:.3,fontSize:11,color:'8A948C',margin:0});footer(slide)
  slide=pptx.addSlide();title(slide,'核心经营指标','来自当前登录账户的实时客户数据');[['客户数量',customers.length,'位'],['设备资产',totalDevices,'台'],['合同总额',Math.round(contractTotal/10000),'万元'],['回款进度',contractTotal?Math.round(paid/contractTotal*100):0,'%']].forEach(([label,value,unit],i)=>{const x=.65+i*3.08;slide.addShape(pptx.ShapeType.roundRect,{x,y:2,w:2.78,h:1.55,fill:{color:'FFFFFF'},line:{color:'E7E3D8'}});slide.addText(label as string,{x:x+.2,y:2.25,w:2.2,h:.25,fontSize:10,color:'748076',margin:0});slide.addText(`${value} ${unit}`,{x:x+.2,y:2.75,w:2.3,h:.4,fontSize:22,bold:true,color:'17362E',margin:0})});slide.addText(`${risks.length} 位客户需要关注`,{x:.7,y:4.55,w:5,h:.4,fontSize:21,bold:true,color:'17362E',margin:0});slide.addText(`高风险 ${high.length} 位 · 中风险 ${medium.length} 位 · 待回款 ¥${Math.max(contractTotal-paid,0).toLocaleString()}`,{x:.7,y:5.12,w:9,h:.3,fontSize:12,color:'657268',margin:0});footer(slide)
  slide=pptx.addSlide();title(slide,'客户风险结构','识别优先级，而不是只看客户总量');slide.addChart(pptx.ChartType.doughnut,[{name:'客户数',labels:['高风险','中风险','低风险'],values:[high.length,medium.length,low.length]}],{x:.75,y:1.9,w:5.4,h:4.6,holeSize:62,showLegend:true,legendPos:'b',showValue:true,chartColors:['B45B4B','B99A4A','6E8A72'],border:{color:'F6F3E9',pt:0}});slide.addText('Agent 建议',{x:6.7,y:2.05,w:3,h:.3,fontSize:12,bold:true,color:theme.accent,margin:0});const actions=type==='risk'?['先确认高风险客户责任人','核对合同到期和欠款原因','同步维护与续签计划']:type==='customer'?['完善客户与资产档案','按客户价值制定服务策略','建立季度客户回顾机制']:['优先推进续签与回款','复盘服务履约偏差','每月更新经营看板'];actions.forEach((text,i)=>slide.addText(`${String(i+1).padStart(2,'0')}  ${text}`,{x:6.7,y:2.65+i*.85,w:5.2,h:.48,fontSize:15,bold:true,color:'35473C',margin:0}));footer(slide)
  chunks(customers,9).forEach((items,index)=>{slide=pptx.addSlide();title(slide,'客户明细',`资产、合同、回款和风险 · ${index+1}/${Math.ceil(customers.length/9)}`);slide.addTable([['客户','行业','负责人','设备','合同金额','已收款','风险'],...items.map(c=>[c.customer_name,c.industry,c.owner,String(equipment(c)),`¥${num(contract(c).amount).toLocaleString()}`,`¥${num(payment(c).paid_amount).toLocaleString()}`,risk(c)])] as any,{x:.5,y:1.82,w:12.3,h:5,border:{type:'solid',color:'DEDACF',pt:.7},fill:{color:'FFFFFF'},color:'405046',fontSize:9,margin:.06,rowH:.4});footer(slide)})
  const blob=await pptx.write({outputType:'blob'}) as Blob;if(downloadFile)download(blob,`空香${theme.name}_${new Date().toISOString().slice(0,10)}.pptx`);return blob
}
