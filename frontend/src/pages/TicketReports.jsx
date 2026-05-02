import { useEffect, useState } from 'react';
import { getTicketReportAPI } from '../api/reportApi';
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

const TicketReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTicketReportAPI();
        setReport(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading ticket reports...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!report) return null;

  const { overview, byStatus, byMonth, perCounselor, messageStats, subjectFrequency, agingBuckets } = report;

  // Group perCounselor data by counselor for stacked bar
  const counselorMap = {};
  perCounselor.forEach(({ counselor_name, status, count }) => {
    if (!counselorMap[counselor_name]) counselorMap[counselor_name] = { name: counselor_name };
    counselorMap[counselor_name][status] = count;
  });
  const counselorData = Object.values(counselorMap);
  const allStatuses = [...new Set(perCounselor.map(r => r.status))];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ticket Reports</h1>
        <p className="text-slate-500">Analytics and insights on support tickets.</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Tickets"><Stat label="All Time" value={overview?.total} /></Card>
        <Card title="Open"><Stat label="Awaiting" value={overview?.open_count} color="text-yellow-600 dark:text-yellow-400" /></Card>
        <Card title="In Progress"><Stat label="Active" value={overview?.in_progress_count} color="text-blue-600 dark:text-blue-400" /></Card>
        <Card title="Resolved"><Stat label="Closed" value={overview?.resolved_count} color="text-green-600 dark:text-green-400" /></Card>
      </div>

      {/* Status Pie */}
      <Card title="Status Distribution">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${status} (${count})`}>
              {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly Trend */}
      {byMonth.length > 0 && (
        <Card title="Monthly Ticket Volume">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Counselor */}
        {counselorData.length > 0 && (
          <Card title="Tickets per Counselor">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={counselorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {allStatuses.map((status, i) => (
                  <Bar key={status} dataKey={status} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === allStatuses.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Aging Buckets */}
        {agingBuckets.length > 0 && (
          <Card title="Open Ticket Aging">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="age_bucket" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Subject Frequency */}
      {subjectFrequency.length > 0 && (
        <Card title="Top Ticket Subjects">
          <div className="space-y-2">
            {subjectFrequency.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-200 truncate max-w-[80%]">{s.subject}</span>
                    <span className="font-bold text-slate-800 dark:text-white">{s.count}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (s.count / (subjectFrequency[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Message Stats Table */}
      {messageStats.length > 0 && (
        <Card title="Ticket Message Activity">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Subject</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4 text-right">Messages</th>
                  <th className="pb-2 pr-4">First Message</th>
                  <th className="pb-2">Last Message</th>
                </tr>
              </thead>
              <tbody>
                {messageStats.slice(0, 20).map((t) => (
                  <tr key={t.ticket_id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">#{t.ticket_id}</td>
                    <td className="py-2 pr-4 text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{t.subject}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        t.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        t.status === 'open' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>{t.status}</span>
                    </td>
                    <td className="py-2 pr-4 text-right font-bold text-slate-800 dark:text-white">{t.message_count}</td>
                    <td className="py-2 pr-4 text-xs text-slate-500">{t.first_message_at || '—'}</td>
                    <td className="py-2 text-xs text-slate-500">{t.last_message_at || '—'}</td>
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

export default TicketReports;
