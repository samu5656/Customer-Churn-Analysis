import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { ListTree, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Fallback data if backend unreachable
const FALLBACK_FEATURES = [
  { Feature: 'TotalCharges',    Importance: 0.163 },
  { Feature: 'AvgCharges',      Importance: 0.143 },
  { Feature: 'MonthlyCharges',  Importance: 0.140 },
  { Feature: 'tenure',          Importance: 0.135 },
  { Feature: 'Contract',        Importance: 0.072 },
  { Feature: 'PaymentMethod',   Importance: 0.044 },
  { Feature: 'TechSupport',     Importance: 0.042 },
  { Feature: 'OnlineSecurity',  Importance: 0.039 },
  { Feature: 'OnlineBackup',    Importance: 0.024 },
  { Feature: 'gender',          Importance: 0.023 },
]

// Color gradient from high → low importance
const BAR_COLORS = [
  '#8B5CF6', '#7C3AED', '#6D28D9', '#9333EA', '#A855F7',
  '#6366F1', '#818CF8', '#60A5FA', '#34D399', '#F59E0B',
]

const INSIGHTS = [
  {
    title: 'Financial Charges Dominate',
    icon: <TrendingUp size={16} />,
    color: 'text-danger',
    bg: 'bg-danger/10 border-danger/20',
    text: 'TotalCharges, AvgCharges, and MonthlyCharges together account for ~44% of predictive weight. High billing consistently signals impending churn.',
  },
  {
    title: 'Tenure is a Loyalty Signal',
    icon: <TrendingDown size={16} />,
    color: 'text-success',
    bg: 'bg-success/10 border-success/20',
    text: 'Tenure (time with the company) is the 4th most influential feature. Every month of retention significantly lowers churn probability — critical for early engagement programs.',
  },
  {
    title: 'Contract Type is Pivotal',
    icon: <Minus size={16} />,
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20',
    text: 'Month-to-month contracts drive 7.2% of prediction weight. Customers on 1- or 2-year contracts have dramatically lower churn rates.',
  },
  {
    title: 'Support Services Retain',
    icon: <TrendingDown size={16} />,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
    text: 'TechSupport and OnlineSecurity services together contribute ~8% predictive weight. Adding these services correlates with lower churn probability.',
  },
]

export default function FeatureInsights() {
  const [features, setFeatures] = useState(null)
  const [selectionMetrics, setSelectionMetrics] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/feature-importance')
      .then(r => r.ok ? r.json() : [])
      .then(data => setFeatures(Array.isArray(data) && data.length > 0 ? data.slice(0, 10) : FALLBACK_FEATURES))
      .catch(() => { setError(true); setFeatures(FALLBACK_FEATURES) })

    fetch('http://127.0.0.1:8000/api/feature-selection-metrics')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSelectionMetrics(data))
      .catch(() => setSelectionMetrics([]))
  }, [])

  if (!features) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  )

  const topFeature = features[0]
  const totalImportance = features.reduce((s, f) => s + f.Importance, 0)

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Feature Insights</h1>
          <p className="text-gray-400 mt-1">Discover what factors drive customer churn — ranked by model importance</p>
        </div>
        {error && (
          <span className="text-xs px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20">
            Using offline data
          </span>
        )}
      </div>

      {/* Top feature highlight */}
      <div className="glass-panel p-5 flex items-center gap-6 border-l-4 border-l-purple-500">
        <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400">
          <ListTree size={28} />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Most Influential Feature</p>
          <h2 className="text-2xl font-bold text-white">{topFeature.Feature}</h2>
          <p className="text-sm text-purple-400 mt-1">
            Accounts for <span className="font-semibold">{(topFeature.Importance * 100).toFixed(1)}%</span> of the model's decision weight
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Feature Importance Horizontal Bar Chart */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <ListTree size={20} className="text-primary" />
            Top 10 Influential Features
          </h3>
          <p className="text-sm text-gray-400 mb-6">Ranked by Random Forest feature importance from your trained ML pipeline.</p>

          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={features}
                layout="vertical"
                margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                />
                <YAxis
                  dataKey="Feature"
                  type="category"
                  stroke="#94A3B8"
                  tick={{ fill: '#CBD5E1', fontSize: 13 }}
                  width={130}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  cursor={{ fill: '#334155', opacity: 0.3 }}
                  formatter={(v) => [`${(v * 100).toFixed(2)}%`, 'Importance']}
                />
                <Bar dataKey="Importance" radius={[0, 6, 6, 0]} barSize={24}>
                  {features.map((_, idx) => (
                    <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {features.slice(0, 6).map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: BAR_COLORS[i] }}></div>
                <span className="text-xs text-gray-400 truncate">{f.Feature}</span>
                <span className="text-xs font-semibold text-white ml-auto">{(f.Importance * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Cards */}
        <div className="space-y-4">
          <div className="glass-panel p-4 flex items-center gap-3">
            <Info size={18} className="text-purple-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Top 4 Features</p>
              <p className="text-lg font-bold text-white">{((features.slice(0,4).reduce((s,f)=>s+f.Importance,0)/totalImportance)*100).toFixed(0)}%</p>
              <p className="text-xs text-gray-500">of total model weight</p>
            </div>
          </div>

          {INSIGHTS.map((ins, i) => (
            <div key={i} className={`p-4 rounded-xl border ${ins.bg}`}>
              <div className={`flex items-center gap-2 mb-2 font-semibold text-sm ${ins.color}`}>
                {ins.icon}
                {ins.title}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{ins.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Selection Comparison Table */}
      {selectionMetrics && selectionMetrics.length > 0 && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-white">
            <TrendingUp size={20} className="text-emerald-400" />
            Feature Selection Efficiency
          </h3>
          <p className="text-sm text-gray-400 mb-6">Impact of pruning low-importance features (Importance {'<'} 0.02) on model performance.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-white/5 bg-black/20 rounded-xl overflow-hidden text-sm">
              <thead className="bg-surface/50 text-xs uppercase tracking-wider text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium">Model</th>
                  <th className="p-4 font-medium text-center">Before Selection (Accuracy)</th>
                  <th className="p-4 font-medium text-center">After Selection (Accuracy)</th>
                  <th className="p-4 font-medium text-center">Performance Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {selectionMetrics.map((m, i) => {
                  const delta = ((m['After Accuracy'] - m['Before Accuracy']) * 100).toFixed(2);
                  const isPositive = Number(delta) >= 0;
                  return (
                    <tr key={i} className="hover:bg-white/5 text-gray-300 transition-colors">
                      <td className="p-4 font-medium">{m.Model}</td>
                      <td className="p-4 text-center">{(m['Before Accuracy'] * 100).toFixed(2)}%</td>
                      <td className="p-4 text-center">{(m['After Accuracy'] * 100).toFixed(2)}%</td>
                      <td className={`p-4 text-center font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {isPositive ? '+' : ''}{delta}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
