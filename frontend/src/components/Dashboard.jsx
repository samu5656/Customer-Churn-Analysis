import { useState, useEffect } from 'react'
import { Users, IndianRupee, Activity, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

// Fallback data for when backend is starting up
const FALLBACK_METRICS = { total_customers: 7043, churn_rate: 26.54, total_revenue: 456156, revenue_lost: 139130, expected_loss: 61245 }
const FALLBACK_CHARTS = {
  churn_distribution: { Yes: 1869, No: 5174 },
  active_risk_distribution: { High: 891, Medium: 1623, Low: 2660 },
  revenue_loss_by_payment: { 'Electronic check': 55322, 'Mailed check': 23910, 'Bank transfer': 32104, 'Credit card': 27794 }
}
const FALLBACK_MODEL_METRICS = [
  { Model: 'Logistic Regression', Accuracy: 0.8155, Precision: 0.6771, Recall: 0.5791, 'F1-score': 0.6243 },
  { Model: 'Decision Tree',       Accuracy: 0.7260, Precision: 0.4835, Recall: 0.5094, 'F1-score': 0.4961 },
  { Model: 'Random Forest',       Accuracy: 0.8062, Precision: 0.6761, Recall: 0.5147, 'F1-score': 0.5845 },
  { Model: 'KNN',                 Accuracy: 0.7580, Precision: 0.5465, Recall: 0.5040, 'F1-score': 0.5244 },
]

import { CardSkeleton, ChartSkeleton, TableSkeleton } from './common/Skeleton'

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [charts, setCharts] = useState(null)
  const [modelMetrics, setModelMetrics] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, cRes, mmRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/dashboard/metrics'),
          fetch('http://127.0.0.1:8000/api/dashboard/charts'),
          fetch('http://127.0.0.1:8000/api/metrics')
        ])
        
        if (!mRes.ok || !cRes.ok || !mmRes.ok) throw new Error('Failed to fetch data')
        
        setMetrics(await mRes.json())
        setCharts(await cRes.json())
        setModelMetrics(await mmRes.json())
      } catch (err) {
        console.error(err)
        setError(true)
      }
    }
    fetchData()
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-danger/10 text-danger">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white">System Data Offline</h2>
        <p className="text-gray-400 max-w-md">The predictive services are currently unavailable or the data pipeline is inactive. Please ensure the backend is running and the ML pipeline has been executed.</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">Retry Connection</button>
      </div>
    )
  }

  if (!metrics || !charts || !modelMetrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <TableSkeleton rows={4} />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  const KPICard = ({ title, value, icon, color, subtext }) => (
    <div className="glass-panel p-6 flex items-start justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 blur-2xl transition-all group-hover:blur-xl`}></div>
      <div>
        <p className="text-gray-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl`} style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
    </div>
  )

  // Format data for Recharts
  const churnData = Object.keys(charts.churn_distribution).map(key => ({
    name: key === 'Yes' ? 'Churned' : 'Active',
    value: charts.churn_distribution[key]
  }))

  const riskData = Object.keys(charts.active_risk_distribution).map(key => ({
    name: key + ' Risk',
    value: charts.active_risk_distribution[key]
  }))

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981']

  const paymentData = Object.keys(charts.revenue_loss_by_payment).map(key => ({
    name: key.replace(' (automatic)', ''),
    Loss: charts.revenue_loss_by_payment[key]
  })).sort((a, b) => b.Loss - a.Loss)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Executive Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time churn metrics and revenue analysis</p>
      </div>

      {/* Business Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface/30 border border-info/20 p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-info/10 text-blue-400 rounded-lg shrink-0 mt-0.5"><Activity size={16} /></div>
          <div>
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-1">Top Driver</h4>
            <p className="text-sm text-gray-400">Month-to-month contracts exhibit the highest churn probability. Consider targeting these users.</p>
          </div>
        </div>
        <div className="bg-surface/30 border border-danger/20 p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-danger/10 text-danger rounded-lg shrink-0 mt-0.5"><AlertTriangle size={16} /></div>
          <div>
             <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-1">Immediate Risk</h4>
            <p className="text-sm text-gray-400">Customers with low tenure are abandoning the product primarily due to high charges.</p>
          </div>
        </div>
        <div className="bg-surface/30 border border-warning/20 p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-warning/10 text-warning rounded-lg shrink-0 mt-0.5"><Users size={16} /></div>
          <div>
             <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-1">Billing Pattern</h4>
            <p className="text-sm text-gray-400">Electronic check users show a statistically significant increase in churn likelihood.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Customers" 
          value={metrics.total_customers.toLocaleString()} 
          icon={<Users size={24} />} 
          color="#3B82F6" 
        />
        <KPICard 
          title="Global Churn Rate" 
          value={`${metrics.churn_rate}%`} 
          icon={<Activity size={24} />} 
          color="#10B981" 
        />
        <KPICard 
          title="Total Revenue Lost" 
          value={`₹${metrics.revenue_lost.toLocaleString()}`} 
          icon={<IndianRupee size={24} />} 
          color="#EF4444" 
          subtext="From existing churned customers"
        />
        <KPICard 
          title="Expected Risk Loss" 
          value={`₹${metrics.expected_loss.toLocaleString()}`} 
          icon={<AlertTriangle size={24} />} 
          color="#F59E0B"
          subtext="Based on current active high-risk users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 h-96">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Customer Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={churnData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {churnData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }} itemStyle={{color: '#fff'}} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6 h-96">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning"></span>
            Risk Profile (Active Users)
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={riskData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.name.includes('High') ? '#EF4444' : entry.name.includes('Medium') ? '#F59E0B' : '#10B981'
                  } />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6 lg:col-span-2 h-96">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger"></span>
            Revenue Loss by Payment Method
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" tick={{fill: '#94A3B8'}} />
              <YAxis stroke="#94A3B8" tick={{fill: '#94A3B8'}} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} cursor={{fill: '#334155', opacity: 0.4}}/>
              <Bar dataKey="Loss" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Model Evaluation Summary Block */}
        {modelMetrics && modelMetrics.length > 0 && (
          <>
            <div className="glass-panel p-6 lg:col-span-2">
              <div className="flex justify-between items-end mb-6">
                 <div>
                   <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                     <span className="w-2 h-2 rounded-full bg-primary"></span>
                     Algorithm Validation Table
                   </h3>
                   <p className="text-sm text-gray-400 mt-1">Cross-validated performance comparison across standard KPIs.</p>
                 </div>
                 
                 <div className="bg-success/10 border border-success/30 px-4 py-2 rounded-xl text-right">
                    <span className="block text-xs text-success font-semibold tracking-widest uppercase mb-1">Production Model</span>
                    <span className="text-sm font-bold text-white">
                      {modelMetrics.some(m => m.Model === 'Deep Learning (ANN)') ? 'Deep Learning (ANN)' : 'Random Forest'}
                    </span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-white/5 bg-black/20 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 bg-surface/50">
                      <th className="p-3 font-medium">Model</th>
                      <th className="p-3 font-medium text-center">Accuracy</th>
                      <th className="p-3 font-medium text-center">Precision</th>
                      <th className="p-3 font-medium text-center">Recall</th>
                      <th className="p-3 font-medium text-center">F1-score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...modelMetrics].sort((a, b) => (b['F1-score'] || 0) - (a['F1-score'] || 0)).map((m, i) => {
                       const isAnn = m.Model === 'Deep Learning (ANN)'
                       const isBest = i === 0;
                       return (
                      <tr key={i} className={`transition-colors ${isAnn ? 'bg-primary/10 text-primary font-bold' : isBest ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                        <td className="p-3 flex items-center gap-2">
                          {isAnn ? <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div> : isBest && <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>}
                          {m.Model}
                        </td>
                        <td className="p-3 text-center">{(m.Accuracy * 100).toFixed(2)}%</td>
                        <td className="p-3 text-center">{(m.Precision * 100).toFixed(2)}%</td>
                        <td className="p-3 text-center">{(m.Recall * 100).toFixed(2)}%</td>
                        <td className="p-3 text-center font-semibold">{(m['F1-score'] * 100).toFixed(2)}%</td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-500 mt-4 italic">* Table sorted by F1-Score density. ANN is the primary production candidate.</p>
            </div>

            <div className="glass-panel p-6 lg:col-span-2 h-[450px]">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Algorithm Comparison Network
              </h3>
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="Model" stroke="#94A3B8" tick={{fill: '#94A3B8', fontSize: 12}} />
                  <YAxis stroke="#94A3B8" tick={{fill: '#94A3B8'}} domain={[0.6, 1]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} cursor={{fill: '#334155', opacity: 0.1}}/>
                  <Legend wrapperStyle={{paddingTop: '20px'}}/>
                  <Bar dataKey="Accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Precision" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Recall" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="F1-score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
