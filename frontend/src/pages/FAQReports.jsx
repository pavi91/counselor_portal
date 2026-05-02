import { useEffect, useState } from 'react';
import { getFaqReportAPI, exportFaqCsvAPI } from '../api/faqApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}>
    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
    {children}
  </div>
);

const Stat = ({ label, value, color = 'text-slate-800 dark:text-white' }) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${color}`}>{value ?? '—'}</div>
    <div className="text-xs text-slate-500 mt-1">{label}</div>
  </div>
);

const FAQReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFaqReportAPI();
        setReport(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load FAQ report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await exportFaqCsvAPI();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'faq_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading FAQ reports...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!report) return null;

  const { overview, usageFrequency, usageByMonth, usageByCategory, usageDetails } = report;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">FAQ Reports</h1>
          <p className="text-slate-500">Analytics on frequently asked questions usage.</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition"
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Questions">
          <Stat label="All FAQs" value={overview?.total_questions} />
        </Card>
        <Card title="Active Questions">
          <Stat label="Visible" value={overview?.active_questions} color="text-green-600 dark:text-green-400" />
        </Card>
        <Card title="Total Usage">
          <Stat label="Times Asked" value={overview?.total_usage} color="text-blue-600 dark:text-blue-400" />
        </Card>
        <Card title="Unique Students">
          <Stat label="Who Asked" value={overview?.unique_students} color="text-purple-600 dark:text-purple-400" />
        </Card>
      </div>

      {/* Usage by Category - Pie Chart */}
      {usageByCategory.length > 0 && (
        <Card title="Usage by Category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usageByCategory}
                dataKey="usage_count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ category, usage_count }) => `${category} (${usage_count})`}
              >
                {usageByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Monthly Trend */}
      {usageByMonth.length > 0 && (
        <Card title="Monthly FAQ Usage Trend">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Top FAQs by Usage */}
      {usageFrequency.length > 0 && (
        <Card title="Most Frequently Asked Questions">
          <div className="space-y-3">
            {usageFrequency.slice(0, 15).map((faq, i) => (
              <div key={faq.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400 w-6 text-right">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-200 truncate max-w-[70%]">{faq.question}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">{faq.category}</span>
                      <span className="font-bold text-slate-800 dark:text-white">{faq.usage_count}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (faq.usage_count / (usageFrequency[0]?.usage_count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detailed Table */}
      {usageDetails.length > 0 && (
        <Card title="FAQ Details">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Question</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4 text-right">Usage</th>
                  <th className="pb-2">Last Used</th>
                </tr>
              </thead>
              <tbody>
                {usageDetails.map((faq) => (
                  <tr key={faq.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">#{faq.id}</td>
                    <td className="py-2 pr-4 text-slate-700 dark:text-slate-200 truncate max-w-[250px]">{faq.question}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {faq.category}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        faq.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {faq.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right font-bold text-slate-800 dark:text-white">{faq.usage_count}</td>
                    <td className="py-2 text-xs text-slate-500">
                      {faq.last_used_at ? new Date(faq.last_used_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FAQReports;
