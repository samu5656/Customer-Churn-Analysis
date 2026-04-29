import { useCallback, useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Prediction() {
  const [formData, setFormData] = useState({
    tenure: 12,
    MonthlyCharges: 50.00,
    Contract: 'Month-to-month',
    PaymentMethod: 'Electronic check',
    gender: 'Male',
    InternetService: 'Fiber optic',
    Partner: 'No',
    Dependents: 'No',
    PhoneService: 'Yes',
    MultipleLines: 'No',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    PaperlessBilling: 'Yes',
    TotalCharges: 600.00
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchPrediction = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      setResult(data)
    } catch(e) {
      console.error(e)
    }
    setLoading(false)
  }, [formData])

  // Real-time update effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPrediction()
    }, 500) // debounce
    return () => clearTimeout(handler)
  }, [fetchPrediction])

  const handleChange = (e) => {
    const { name, value } = e.target
    const val = (name === 'tenure' || name === 'MonthlyCharges' || name === 'TotalCharges') ? Number(value) : value
    
    setFormData(prev => {
      const newState = { ...prev, [name]: val }
      // Auto-calculate TotalCharges if tenure or monthly charges change
      if (name === 'tenure' || name === 'MonthlyCharges') {
        newState.TotalCharges = Number((newState.tenure * newState.MonthlyCharges).toFixed(2))
      }
      return newState
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Predictive Engine</h1>
        <p className="text-gray-400 mt-1">What-If Analysis tool generating real-time Deep Learning risk inferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Form */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Customer Profile Parameters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Core Metrics Section */}
            <div className="md:col-span-2 mb-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 opacity-70">Core Metrics</h4>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Tenure (Months): {formData.tenure}</label>
              <input type="range" name="tenure" min="0" max="72" value={formData.tenure} onChange={handleChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"/>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Monthly Charges (₹): {formData.MonthlyCharges}</label>
              <input type="range" name="MonthlyCharges" min="15" max="120" step="0.5" value={formData.MonthlyCharges} onChange={handleChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"/>
            </div>

            {/* Demographics */}
            <div className="md:col-span-2 mt-4 mb-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 opacity-70">Demographics & Plan</h4>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input-field py-2">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="space-y-2 flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="Partner" checked={formData.Partner === 'Yes'} onChange={(e) => setFormData(p => ({...p, Partner: e.target.checked ? 'Yes' : 'No'}))} className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary focus:ring-primary"/>
                <span className="text-sm text-gray-300">Has Partner</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="Dependents" checked={formData.Dependents === 'Yes'} onChange={(e) => setFormData(p => ({...p, Dependents: e.target.checked ? 'Yes' : 'No'}))} className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary focus:ring-primary"/>
                <span className="text-sm text-gray-300">Has Dependents</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Contract Type</label>
              <select name="Contract" value={formData.Contract} onChange={handleChange} className="input-field py-2">
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Payment Method</label>
              <select name="PaymentMethod" value={formData.PaymentMethod} onChange={handleChange} className="input-field py-2">
                <option value="Electronic check">Electronic check</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                <option value="Credit card (automatic)">Credit card (automatic)</option>
              </select>
            </div>

            {/* Services */}
            <div className="md:col-span-2 mt-4 mb-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 opacity-70">Services & Add-ons</h4>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Internet Service</label>
              <select name="InternetService" value={formData.InternetService} onChange={handleChange} className="input-field py-2">
                <option value="DSL">DSL</option>
                <option value="Fiber optic">Fiber optic</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Online Security</label>
              <select name="OnlineSecurity" value={formData.OnlineSecurity} onChange={handleChange} className="input-field py-2">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Tech Support</label>
              <select name="TechSupport" value={formData.TechSupport} onChange={handleChange} className="input-field py-2">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Total Charges Tracker (₹)</label>
              <input type="number" name="TotalCharges" value={formData.TotalCharges} readOnly className="input-field py-2 opacity-60 bg-white/5 cursor-not-allowed"/>
              <p className="text-[10px] text-gray-500 italic">Auto-calculated: tenure × monthly</p>
            </div>
          </div>
        </div>


        {/* Output Display */}
        <div className="space-y-6 flex flex-col">
          <div className="glass-panel p-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            {loading && <div className="absolute top-4 right-4 animate-pulse text-xs font-semibold text-primary">Computing...</div>}
            
            <h3 className="text-sm font-semibold mb-2 text-gray-400 w-full text-center">Inference Result</h3>
            
            {!result ? (
               <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin my-8"></div>
            ) : (
              <>
                <div className="relative flex justify-center items-center my-6">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      className={`${result.risk_level === 'High' ? 'text-danger' : result.risk_level === 'Medium' ? 'text-warning' : 'text-success'} transition-all duration-1000`}
                      strokeDasharray="351.8" 
                      strokeDashoffset={351.8 - (351.8 * result.probability) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{result.probability}%</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Risk Band</p>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${result.risk_level === 'High' ? 'text-danger bg-danger/10 border-danger/20' : result.risk_level === 'Medium' ? 'text-warning bg-warning/10 border-warning/20' : 'text-success bg-success/10 border-success/20'}`}>
                    {result.risk_level} RISK
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Explanation Box */}
          <div className="glass-panel p-6 bg-gradient-to-t from-surface to-transparent">
            <h3 className="text-sm font-semibold mb-4 text-gray-400">Driver Matrix</h3>
            {result && result.reasons ? (
              <ul className="space-y-3">
                {result.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <AlertCircle size={16} className={`mt-0.5 shrink-0 ${result.risk_level === 'High' ? 'text-danger' : 'text-primary'}`} />
                    <span className="text-sm text-gray-300">{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Adjust variables above to see explanations.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
