import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Activity, TrendingUp, Brain } from 'lucide-react'

const shortName = (name = '') => (
  name
    .replace('Logistic Regression', 'Logistic')
    .replace('Decision Tree', 'Tree')
    .replace('Random Forest', 'Forest')
    .replace('Gradient Boosting', 'Gradient')
    .replace('Deep Learning (ANN)', 'ANN')
)

export default function ModelInsights() {
  const [confusionMatrix, setConfusionMatrix] = useState(null)
  const [ensembleMetrics, setEnsembleMetrics] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cmRes, eRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/confusion-matrix'),
          fetch('http://127.0.0.1:8000/api/ensemble-metrics')
        ])
        if (!cmRes.ok || !eRes.ok) throw new Error()
        setConfusionMatrix(await cmRes.json())
        setEnsembleMetrics(await eRes.json())
      } catch {
        setConfusionMatrix({ TN: 0, FP: 0, FN: 0, TP: 0 })
        setEnsembleMetrics([])
      }
    }
    fetchData()
  }, [])

  if (!confusionMatrix || !ensembleMetrics) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  )
  if (ensembleMetrics.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
       <Activity className="text-gray-600 mb-2" size={48} />
       <h3 className="text-xl font-bold text-white">No Metric Data Available</h3>
       <p className="text-gray-400">Run the ML Pipeline in the backend to generate performance analytics.</p>
    </div>
  )
  // Normalise model names for readability in charts
  const lineData = ensembleMetrics.map(m => ({
    name: shortName(m.Model),
    'Train Acc': +(m['Train Acc'] * 100).toFixed(2),
    'Test Acc':  +(m['Test Acc']  * 100).toFixed(2),
  }))

  const barData = ensembleMetrics.map(m => ({
    name: shortName(m.Model),
    'Train F1': +(m['Train F1'] * 100).toFixed(2),
    'Test F1':  +(m['Test F1']  * 100).toFixed(2),
  }))

  // Derived stats from confusion matrix
  const total   = confusionMatrix.TN + confusionMatrix.FP + confusionMatrix.FN + confusionMatrix.TP
  const accuracy = total > 0 ? (((confusionMatrix.TN + confusionMatrix.TP) / total) * 100).toFixed(1) : 0
  const precision = (confusionMatrix.TP + confusionMatrix.FP) > 0 ? ((confusionMatrix.TP / (confusionMatrix.TP + confusionMatrix.FP)) * 100).toFixed(1) : 0
  const recall    = (confusionMatrix.TP + confusionMatrix.FN) > 0 ? ((confusionMatrix.TP / (confusionMatrix.TP + confusionMatrix.FN)) * 100).toFixed(1) : 0

  const cmCells = [
    { label: 'True Negatives',  value: confusionMatrix.TN, desc: 'Correctly predicted Non-Churn', color: 'border-primary/40 bg-primary/10 text-primary' },
    { label: 'False Positives', value: confusionMatrix.FP, desc: 'Predicted Churn — Actually No',  color: 'border-warning/40 bg-warning/10 text-warning' },
    { label: 'False Negatives', value: confusionMatrix.FN, desc: 'Predicted No Churn — Actually Yes', color: 'border-danger/40 bg-danger/10 text-danger' },
    { label: 'True Positives',  value: confusionMatrix.TP, desc: 'Correctly predicted Churn',      color: 'border-success/40 bg-success/10 text-success' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Model Insights</h1>
        <p className="text-gray-400 mt-1">Deep dive into algorithm performance, overfitting, and ensemble comparisons</p>
      </div>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'DL Model Accuracy', value: `${accuracy}%`, color: '#3B82F6' },
          { label: 'DL Model Precision', value: `${precision}%`, color: '#10B981' },
          { label: 'DL Model Recall',    value: `${recall}%`,    color: '#F59E0B' },
        ].map((k, i) => (
          <div key={i} className="glass-panel p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{k.label}</p>
              <p className="text-2xl font-bold text-white">{k.value}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${k.color}20`, color: k.color }}>
              <Brain size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Confusion Matrix Heatmap */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Brain size={20} className="text-primary" />
            Confusion Matrix — Deep Learning Model
          </h3>
          <p className="text-sm text-gray-400 mb-6">4-cell breakdown of classification outcomes on the held-out test set.</p>

          {/* Header row */}
          <div className="grid grid-cols-3 gap-2 mb-2 text-center text-xs text-gray-500">
            <div></div>
            <div className="font-semibold uppercase tracking-wider">Pred: No Churn</div>
            <div className="font-semibold uppercase tracking-wider">Pred: Churn</div>
          </div>
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="flex items-center justify-end pr-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Actual: No</div>
            <div className={`border rounded-xl p-5 text-center ${cmCells[0].color}`}>
              <p className="text-xs mb-1">{cmCells[0].label}</p>
              <p className="text-3xl font-bold">{cmCells[0].value}</p>
              <p className="text-xs mt-1 opacity-70">{cmCells[0].desc}</p>
            </div>
            <div className={`border rounded-xl p-5 text-center ${cmCells[1].color}`}>
              <p className="text-xs mb-1">{cmCells[1].label}</p>
              <p className="text-3xl font-bold">{cmCells[1].value}</p>
              <p className="text-xs mt-1 opacity-70">{cmCells[1].desc}</p>
            </div>
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center justify-end pr-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Actual: Yes</div>
            <div className={`border rounded-xl p-5 text-center ${cmCells[2].color}`}>
              <p className="text-xs mb-1">{cmCells[2].label}</p>
              <p className="text-3xl font-bold">{cmCells[2].value}</p>
              <p className="text-xs mt-1 opacity-70">{cmCells[2].desc}</p>
            </div>
            <div className={`border rounded-xl p-5 text-center ${cmCells[3].color}`}>
              <p className="text-xs mb-1">{cmCells[3].label}</p>
              <p className="text-3xl font-bold">{cmCells[3].value}</p>
              <p className="text-xs mt-1 opacity-70">{cmCells[3].desc}</p>
            </div>
          </div>
        </div>

        {/* Overfitting Analysis Line Chart */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Activity size={20} className="text-warning" />
            Overfitting Analysis — Train vs Test Accuracy
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Large gaps between Train and Test accuracy reveal overfitting. Decision Tree shows extreme overfitting (Train 99% vs Test 72%).
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  interval={0} angle={-12} textAnchor="end"
                />
                <YAxis domain={[60, 105]} stroke="#94A3B8" tick={{ fill: '#94A3B8' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  formatter={(v) => [`${v}%`]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="Train Acc" stroke="#EF4444" strokeWidth={3} dot={{ r: 5, fill: '#EF4444' }} />
                <Line type="monotone" dataKey="Test Acc"  stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ensemble vs Baseline F1 Comparison */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <TrendingUp size={20} className="text-success" />
            Ensemble vs Baseline — F1 Score Comparison
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Ensemble methods (Random Forest, Gradient Boosting) reduce the Train/Test gap seen in the Decision Tree baseline, demonstrating better generalization.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis domain={[0, 110]} stroke="#94A3B8" tick={{ fill: '#94A3B8' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  cursor={{ fill: '#334155', opacity: 0.3 }}
                  formatter={(v) => [`${v}%`]}
                />
                <Legend wrapperStyle={{ paddingTop: '16px' }} />
                <Bar dataKey="Train F1" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Test F1"  fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-success/5 border border-success/20 text-sm text-gray-400">
            <span className="font-semibold text-success">Observation: </span>
            Decision Tree has a Train F1 of 99.7% vs Test F1 of 49.6% — a clear sign of severe overfitting. Gradient Boosting resolves this with balanced Train/Test F1 scores, making it the most generalizable baseline model.
          </div>
        </div>

      </div>
    </div>
  )
}
