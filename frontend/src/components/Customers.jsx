import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TableSkeleton } from './common/Skeleton'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Churn_Prob')
  const [sortDesc, setSortDesc] = useState(true)
  
  const limit = 15

  const fetchCustomers = useCallback(() => {
    setLoading(true)
    fetch(`http://127.0.0.1:8000/api/customers?skip=${page * limit}&limit=${limit}&risk=${filter}&sort_by=${sortBy}&sort_desc=${sortDesc}`)
      .then(r => r.ok ? r.json() : { data: [], total: 0 })
      .then(data => {
        setCustomers(data.data || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(() => {
        setCustomers([])
        setTotal(0)
        setLoading(false)
      })
  }, [filter, page, sortBy, sortDesc])

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 0)
    return () => clearTimeout(timer)
  }, [fetchCustomers])

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'High': return 'text-danger bg-danger/10 border-danger/20'
      case 'Medium': return 'text-warning bg-warning/10 border-warning/20'
      case 'Low': return 'text-success bg-success/10 border-success/20'
      default: return 'text-gray-400 bg-gray-800 border-gray-700'
    }
  }

  const exportCSV = () => {
    if (!customers || customers.length === 0) return;
    const headers = Object.keys(customers[0]).join(',');
    const rows = customers.map(c => Object.values(c).map(v => `"${v}"`).join(',')).join('\n');
    const csvContext = `${headers}\n${rows}`;
    const blob = new Blob([csvContext], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `customers_export_${filter}_risk.csv`;
    link.click();
  }

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(col);
      setSortDesc(true);
    }
  }

  const renderSortIcon = (col) => {
    if (sortBy !== col) return <span className="opacity-30 ml-1">↕</span>;
    return sortDesc ? <span className="text-primary ml-1">↓</span> : <span className="text-primary ml-1">↑</span>;
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Customer Database</h1>
          <p className="text-gray-400 mt-1">Identify at-risk customers instantly.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-surface rounded-xl p-1 border border-white/10 shadow-lg">
            {['All', 'High', 'Medium', 'Low'].map(r => (
              <button 
                key={r}
                onClick={() => { setFilter(r); setPage(0); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === r ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {r} {r !== 'All' && 'Risk'}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="btn-primary py-2 text-sm">
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[600px] flex flex-col">
        {loading ? (
          <TableSkeleton rows={10} />
        ) : (
          <div className="glass-panel flex-1 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 bg-black/20">
                    <th className="p-4 font-medium text-left">Customer ID</th>
                    <th className="p-4 font-medium cursor-pointer text-left" onClick={() => handleSort('gender')}>Gender {renderSortIcon('gender')}</th>
                    <th className="p-4 font-medium cursor-pointer text-left" onClick={() => handleSort('tenure')}>Tenure (M) {renderSortIcon('tenure')}</th>
                    <th className="p-4 font-medium cursor-pointer text-left" onClick={() => handleSort('PaymentMethod')}>Payment {renderSortIcon('PaymentMethod')}</th>
                    <th className="p-4 font-medium cursor-pointer text-left" onClick={() => handleSort('MonthlyCharges')}>Monthly ₹ {renderSortIcon('MonthlyCharges')}</th>
                    <th className="p-4 font-medium cursor-pointer text-left" onClick={() => handleSort('Churn_Prob')}>Churn Pred {renderSortIcon('Churn_Prob')}</th>
                    <th className="p-4 font-medium text-left">Risk Level</th>
                    <th className="p-4 font-medium text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map((c, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-white">{c.customerID}</td>
                      <td className="p-4 text-gray-300">{c.gender}</td>
                      <td className="p-4 text-gray-300">{c.tenure}</td>
                      <td className="p-4 text-gray-300">{c.PaymentMethod.replace(' (automatic)', '')}</td>
                      <td className="p-4 font-medium">₹{c.MonthlyCharges}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${c.Risk_Level === 'High' ? 'bg-danger' : c.Risk_Level === 'Medium' ? 'bg-warning' : 'bg-success'}`}
                              style={{width: `${c.Churn_Prob * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{(c.Churn_Prob * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getRiskColor(c.Risk_Level)}`}>
                          {c.Risk_Level}
                        </span>
                      </td>
                      <td className="p-4">
                        {c.Churn === 'Yes' 
                          ? <span className="text-danger flex items-center gap-1.5 text-sm font-medium"><span className="w-1.5 h-1.5 rounded-full bg-danger"></span> Churned</span>
                          : <span className="text-success flex items-center gap-1.5 text-sm font-medium"><span className="w-1.5 h-1.5 rounded-full bg-success"></span> Active</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="mt-auto p-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-400 bg-black/10">
              <div>
                Showing <span className="font-medium text-white">{page * limit + 1}</span> to <span className="font-medium text-white">{Math.min((page + 1) * limit, total)}</span> of <span className="font-medium text-white">{total}</span> customers
              </div>
              <div className="flex gap-2">
                <button 
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  disabled={(page + 1) * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
