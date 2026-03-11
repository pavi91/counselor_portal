import { useEffect, useState } from 'react';
import { getApplicationReportAPI } from '../api/reportApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

const StatusBadge = ({ status, count }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}: {count}
    </span>
  );
};

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}>
    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
    {children}
  </div>
);

const Stat = ({ label, value }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-slate-800 dark:text-white">{value ?? '—'}</div>
    <div className="text-xs text-slate-500 mt-1">{label}</div>
  </div>
);

const ApplicationReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getApplicationReportAPI();
        setReport(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading application reports...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!report) return null;

  const { byStatus, byMonth, pointsStats, pointsByStatus, byGender, byDistrict, byFaculty, byIncomeRange, distanceStats, aidStats, byHostelPref } = report;

  const totalApps = byStatus.reduce((s, r) => s + r.count, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Application Reports</h1>
        <p className="text-slate-500">Analytics and insights on hostel applications.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Applications"><Stat label="Submitted" value={totalApps} /></Card>
        <Card title="Avg Points"><Stat label="Average" value={pointsStats?.avg_points} /></Card>
        <Card title="Avg Distance"><Stat label="km" value={distanceStats?.avg_distance} /></Card>
        <Card title="Mahapola Recipients"><Stat label="Students" value={aidStats?.mahapola_count} /></Card>
      </div>

      {/* Status Breakdown */}
      <Card title="Status Breakdown">
        <div className="flex flex-wrap gap-3 mb-4">
          {byStatus.map((s) => <StatusBadge key={s.status} status={s.status} count={s.count} />)}
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, count }) => `${status} (${count})`}>
              {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly Trend */}
      {byMonth.length > 0 && (
        <Card title="Monthly Submission Trend">
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
        {/* Points by Status */}
        <Card title="Average Points by Status">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pointsByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_points" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gender */}
        <Card title="By Gender">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byGender} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={90} label={({ gender, count }) => `${gender} (${count})`}>
                {byGender.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District */}
        {byDistrict.length > 0 && (
          <Card title="By District">
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {byDistrict.map((d) => (
                <div key={d.district} className="flex justify-between text-sm py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                  <span className="text-slate-700 dark:text-slate-200">{d.district}</span>
                  <span className="font-bold text-slate-800 dark:text-white">{d.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Faculty */}
        {byFaculty.length > 0 && (
          <Card title="By Faculty">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byFaculty} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="faculty" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Range */}
        {byIncomeRange.length > 0 && (
          <Card title="By Income Range">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byIncomeRange}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="income_range" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Hostel Preference */}
        {byHostelPref.length > 0 && (
          <Card title="Hostel Preference">
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {byHostelPref.map((h) => (
                <div key={h.hostel_pref} className="flex justify-between text-sm py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                  <span className="text-slate-700 dark:text-slate-200">{h.hostel_pref}</span>
                  <span className="font-bold text-slate-800 dark:text-white">{h.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Aid Stats */}
      <Card title="Financial Aid & Conduct">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Mahapola Recipients" value={aidStats?.mahapola_count} />
          <Stat label="Samurdhi Recipients" value={aidStats?.samurdhi_count} />
          <Stat label="Misconduct Flagged" value={aidStats?.misconduct_count} />
          <Stat label="Total Applications" value={aidStats?.total} />
        </div>
      </Card>

      {/* Distance Stats */}
      <Card title="Distance Statistics (km)">
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Average" value={distanceStats?.avg_distance} />
          <Stat label="Minimum" value={distanceStats?.min_distance} />
          <Stat label="Maximum" value={distanceStats?.max_distance} />
        </div>
      </Card>

      {/* Points Stats */}
      <Card title="Points Statistics">
        <div className="grid grid-cols-4 gap-4">
          <Stat label="Average" value={pointsStats?.avg_points} />
          <Stat label="Minimum" value={pointsStats?.min_points} />
          <Stat label="Maximum" value={pointsStats?.max_points} />
          <Stat label="Total Apps" value={pointsStats?.total} />
        </div>
      </Card>
    </div>
  );
};

export default ApplicationReports;
