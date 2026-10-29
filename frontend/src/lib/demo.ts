import type { Customer } from '../types'

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

const customers: Customer[] = [
  {
    id: 'demo-01', customer_name: '演示客户 01 · 青岚酒店', industry: '精品酒店', address: '上海市徐汇区桂林路 88 号', contact_name: '林女士', phone: '138****1024', owner: '陈策', status: '重点跟进', first_cooperation_date: '2023-04-12', next_service_date: '2026-11-06', health_score: 92,
    equipment: [{ id: 'e-01-1', device_name: '香氛主机', device_model: 'Aroma X8', quantity: 6, install_date: '2023-04-18', status: '运行正常' }, { id: 'e-01-2', device_name: '大堂扩香机', device_model: 'Scent Mini', quantity: 3, install_date: '2024-01-10', status: '运行正常' }],
    contracts: [{ id: 'ct-01', start_date: '2026-01-01', end_date: '2026-12-31', amount: 128000, service_cycle: '每月 1 次', total_service_count: 12, completed_service_count: 10, renew_status: '洽谈中' }],
    service_records: [{ id: 's-01-1', service_date: '2026-10-08', service_type: '定期维保', service_person: '王工', service_content: '完成公共区域主机清洁、参数复核与精油补充。', oil_model: '青柚雪松', oil_quantity: 8 }, { id: 's-01-2', service_date: '2026-09-09', service_type: '气味优化', service_person: '刘工', service_content: '根据大堂客流曲线调整三个时段的扩香强度。', oil_model: '青柚雪松', oil_quantity: 6 }],
    payments: [{ id: 'p-01', total_amount: 128000, paid_amount: 128000, unpaid_amount: 0, payment_method: '对公转账' }], customer_risks: [{ risk_level: '低', risk_score: 12, reason: ['履约与回款正常'], suggestion: ['启动年度续约方案'] }],
  },
  {
    id: 'demo-02', customer_name: '演示客户 02 · 新岸办公', industry: '联合办公', address: '杭州市拱墅区运河路 16 号', contact_name: '赵先生', phone: '139****2871', owner: '孙渝', status: '风险关注', first_cooperation_date: '2022-08-20', next_service_date: '2026-10-18', health_score: 58,
    equipment: [{ id: 'e-02-1', device_model: 'Aroma M5', quantity: 8, install_date: '2022-08-24', status: '待保养' }], contracts: [{ id: 'ct-02', start_date: '2025-12-01', end_date: '2026-11-30', amount: 96000, service_cycle: '每月 1 次', total_service_count: 12, completed_service_count: 8, renew_status: '即将到期' }],
    service_records: [{ id: 's-02-1', service_date: '2026-09-12', service_type: '定期维保', service_person: '王工', service_content: '完成 6 台设备检查，2 台设备需预约深度保养。', oil_model: '白茶无花果', oil_quantity: 7 }], payments: [{ id: 'p-02', total_amount: 96000, paid_amount: 64000, unpaid_amount: 32000, payment_method: '分期付款' }], customer_risks: [{ risk_level: '高', risk_score: 86, reason: ['维护逾期 11 天', '尚有 ¥32,000 待回款', '合同 32 天后到期'], suggestion: ['今日确认保养时间', '同步续约与回款计划'] }],
  },
  {
    id: 'demo-03', customer_name: '演示客户 03 · 玲珑书店', industry: '文化零售', address: '苏州市工业园区苏州大道 200 号', contact_name: '沈女士', phone: '136****4519', owner: '陈策', status: '正常', first_cooperation_date: '2024-03-15', next_service_date: '2026-11-12', health_score: 84,
    equipment: [{ id: 'e-03-1', device_model: 'Scent Mini', quantity: 4, install_date: '2024-03-20', status: '运行正常' }], contracts: [{ id: 'ct-03', start_date: '2026-03-01', end_date: '2027-02-28', amount: 52000, service_cycle: '每 6 周 1 次', total_service_count: 9, completed_service_count: 5, renew_status: '履约中' }],
    service_records: [{ id: 's-03-1', service_date: '2026-10-01', service_type: '主题换香', service_person: '刘工', service_content: '秋季阅读主题换香，完成强度与营业时间配置。', oil_model: '墨香苔木', oil_quantity: 4 }], payments: [{ id: 'p-03', total_amount: 52000, paid_amount: 52000, unpaid_amount: 0, payment_method: '对公转账' }], customer_risks: [{ risk_level: '低', risk_score: 21, reason: ['合同与服务正常'], suggestion: ['按计划完成下次换香'] }],
  },
  {
    id: 'demo-04', customer_name: '演示客户 04 · 方舟康养', industry: '康养中心', address: '宁波市鄞州区湖滨路 9 号', contact_name: '周女士', phone: '137****9306', owner: '李宁', status: '重点跟进', first_cooperation_date: '2021-11-03', next_service_date: '2026-10-24', health_score: 66,
    equipment: [{ id: 'e-04-1', device_model: 'Aroma X8', quantity: 5, install_date: '2021-11-08', status: '待复查' }, { id: 'e-04-2', device_model: 'Scent Mini', quantity: 7, install_date: '2023-05-16', status: '运行正常' }], contracts: [{ id: 'ct-04', start_date: '2026-01-15', end_date: '2027-01-14', amount: 156000, service_cycle: '每月 1 次', total_service_count: 12, completed_service_count: 8, renew_status: '履约中' }],
    service_records: [{ id: 's-04-1', service_date: '2026-09-20', service_type: '故障复查', service_person: '刘工', service_content: '北楼两台设备雾化效率偏低，已更换耗材，建议二次复查。', oil_model: '薰衣草檀木', oil_quantity: 9 }], payments: [{ id: 'p-04', total_amount: 156000, paid_amount: 117000, unpaid_amount: 39000, payment_method: '按季付款' }], customer_risks: [{ risk_level: '高', risk_score: 78, reason: ['设备复查逾期 5 天', '待回款 ¥39,000'], suggestion: ['本周完成设备复查', '确认季度款到账时间'] }],
  },
  {
    id: 'demo-05', customer_name: '演示客户 05 · 云境商业', industry: '商业综合体', address: '南京市建邺区江东中路 268 号', contact_name: '黄先生', phone: '135****6218', owner: '孙渝', status: '正常', first_cooperation_date: '2023-09-08', next_service_date: '2026-11-03', health_score: 79,
    equipment: [{ id: 'e-05-1', device_model: 'Aroma Pro', quantity: 10, install_date: '2023-09-12', status: '运行正常' }], contracts: [{ id: 'ct-05', start_date: '2026-02-01', end_date: '2027-01-31', amount: 218000, service_cycle: '每月 2 次', total_service_count: 24, completed_service_count: 17, renew_status: '履约中' }], service_records: [{ id: 's-05-1', service_date: '2026-10-21', service_type: '定期维保', service_person: '王工', service_content: '完成 B1 至 L3 公共区域巡检及耗材更换。', oil_model: '白桃乌龙', oil_quantity: 12 }], payments: [{ id: 'p-05', total_amount: 218000, paid_amount: 163500, unpaid_amount: 54500, payment_method: '按季付款' }], customer_risks: [{ risk_level: '中', risk_score: 52, reason: ['当期款待确认'], suggestion: ['跟进本月发票与回款'] }],
  },
  {
    id: 'demo-06', customer_name: '演示客户 06 · 南湾度假', industry: '度假酒店', address: '厦门市思明区环岛南路 66 号', contact_name: '何女士', phone: '133****7042', owner: '李宁', status: '正常', first_cooperation_date: '2024-06-01', next_service_date: '2026-11-18', health_score: 88,
    equipment: [{ id: 'e-06-1', device_model: 'Aroma X8', quantity: 7, install_date: '2024-06-05', status: '运行正常' }], contracts: [{ id: 'ct-06', start_date: '2026-06-01', end_date: '2027-05-31', amount: 132000, service_cycle: '每月 1 次', total_service_count: 12, completed_service_count: 5, renew_status: '履约中' }], service_records: [{ id: 's-06-1', service_date: '2026-10-17', service_type: '定期维保', service_person: '刘工', service_content: '完成大堂、SPA 及行政酒廊设备保养。', oil_model: '海盐小苍兰', oil_quantity: 9 }], payments: [{ id: 'p-06', total_amount: 132000, paid_amount: 132000, unpaid_amount: 0, payment_method: '对公转账' }], customer_risks: [{ risk_level: '低', risk_score: 16, reason: ['服务及回款正常'], suggestion: ['持续收集宾客反馈'] }],
  },
]

const highRiskCustomers = customers.filter((customer) => customer.customer_risks[0]?.risk_level === '高').map((customer) => ({ customer_id: customer.id, customer_name: customer.customer_name, reason: customer.customer_risks[0].reason || [], suggestion: customer.customer_risks[0].suggestion }))
const dashboard = { customer_count: customers.length, scanned_count: customers.length, risk_customer_count: customers.filter((customer) => customer.customer_risks[0]?.risk_level !== '低').length, pending_count: 5, high_risk_customers: highRiskCustomers }

function summary(customer: Customer) {
  const risk = customer.customer_risks[0]
  return { summary: `${customer.customer_name.replace(/^\u6f14\u793a\u5ba2\u6237 \d+ \u00b7 /, '')}当前健康评分 ${customer.health_score}，服务档案完整。`, risk: { reason: risk?.reason || ['暂无明显风险'] }, suggestion: Array.isArray(risk?.suggestion) ? risk.suggestion.join('；') : risk?.suggestion || '按计划跟进' }
}

function assistantResponse(message: string) {
  const text = message.toLowerCase()
  if (text.includes('续约') || text.includes('合同')) return { intent: 'contract_expire', answer: customers.filter((customer) => customer.contracts[0]?.renew_status === '即将到期').map((customer) => ({ customer_name: customer.customer_name, ...customer.contracts[0], remaining_days: 32, service_count: customer.service_records.length, owner: customer.owner, risk_level: customer.customer_risks[0]?.risk_level, suggestion: '同步确认续约范围、维保排期和待回款。' })) }
  if (text.includes('维护') || text.includes('维保') || text.includes('逾期')) return { intent: 'maintenance_check', answer: customers.filter((customer) => ['demo-02', 'demo-04'].includes(customer.id)).map((customer, index) => ({ customer_name: customer.customer_name, devices: customer.equipment.map((item) => String(item.device_model)), last_service_date: customer.service_records[0]?.service_date, due_date: customer.next_service_date, overdue_days: index ? 5 : 11, owner: customer.owner })) }
  if (text.includes('欠款') || text.includes('回款') || text.includes('付款')) return { intent: 'payment_check', answer: customers.filter((customer) => Number(customer.payments[0]?.unpaid_amount) > 0).map((customer) => ({ customer_name: customer.customer_name, ...customer.payments[0], owner: customer.owner })) }
  const requestedCustomer = customers.find((customer) => text.includes(customer.id.replace('demo-', '演示客户 ')) || text.includes(customer.customer_name.split(' · ')[1]?.toLowerCase()))
  if (requestedCustomer) return { intent: 'customer_profile', answer: { ...requestedCustomer, equipment_count: requestedCustomer.equipment.reduce((sum, item) => sum + Number(item.quantity || 0), 0), service_count: requestedCustomer.service_records.length, latest_service_date: requestedCustomer.service_records[0]?.service_date, contract: requestedCustomer.contracts[0], total_amount: requestedCustomer.payments[0]?.total_amount, paid_amount: requestedCustomer.payments[0]?.paid_amount, unpaid_amount: requestedCustomer.payments[0]?.unpaid_amount, risk: { risk_level: requestedCustomer.customer_risks[0]?.risk_level, reason: requestedCustomer.customer_risks[0]?.reason || [] }, suggestion: Array.isArray(requestedCustomer.customer_risks[0]?.suggestion) ? requestedCustomer.customer_risks[0]?.suggestion.join('；') : requestedCustomer.customer_risks[0]?.suggestion } }
  if (text.includes('报告') || text.includes('经营')) return { intent: 'business_report', answer: { period: { start: '2026-10-01', end: '2026-10-29' }, customer_count: customers.length, service_count: customers.reduce((sum, customer) => sum + customer.service_records.length, 0), contract_count: 1, risk_customer_count: dashboard.risk_customer_count, contract_amount: customers.reduce((sum, customer) => sum + Number(customer.contracts[0]?.amount || 0), 0), payment_amount: customers.reduce((sum, customer) => sum + Number(customer.payments[0]?.paid_amount || 0), 0), ai_suggestion: '先闭环两位高风险客户的维保和回款，再推进即将到期合同的续约。' } }
  return { intent: 'risk_analysis', answer: customers.filter((customer) => customer.customer_risks[0]?.risk_level !== '低').map((customer) => ({ customer_name: customer.customer_name, risk_level: customer.customer_risks[0]?.risk_level, reason: customer.customer_risks[0]?.reason || [], suggestion: customer.customer_risks[0]?.suggestion || [] })) }
}

export async function demoApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, 180))
  if (path === '/api/dashboard') return dashboard as T
  if (path === '/api/customers') return customers as T
  if (path === '/api/assistant/chat' && (options.method || 'GET').toUpperCase() === 'POST') {
    const body = JSON.parse(String(options.body || '{}')) as { message?: string }
    return assistantResponse(body.message || '') as T
  }
  const detailMatch = path.match(/^\/api\/customers\/([^/]+)\/full$/)
  if (detailMatch) {
    const customer = customers.find((item) => item.id === decodeURIComponent(detailMatch[1]))
    if (!customer) throw new Error('演示客户不存在。')
    return { customer, summary: summary(customer) } as T
  }
  throw new Error(`演示模式不支持该请求：${path}`)
}
