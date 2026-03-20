export default function Filters({ filters, onChange }) {
  return (
    <div style={{ width: 220, padding: 16, borderRight: '1px solid #eee',
                  minHeight: '100vh', background: '#fafafa' }}>
      <h4 style={{ marginTop: 0 }}>Filters</h4>

      <label style={{ fontSize: 13, color: '#555' }}>Role / Title</label>
      <input placeholder="e.g. React Developer"
        value={filters.title}
        onChange={e => onChange({ ...filters, title: e.target.value })}
        style={{ width: '100%', padding: '6px 8px', marginBottom: 12,
                 border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} />

      <label style={{ fontSize: 13, color: '#555' }}>Job Type</label>
      <select value={filters.type}
        onChange={e => onChange({ ...filters, type: e.target.value })}
        style={{ width: '100%', padding: '6px 8px', marginBottom: 12,
                 border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
        <option value="">All Types</option>
        <option value="FULLTIME">Full-time</option>
        <option value="PARTTIME">Part-time</option>
        <option value="CONTRACT">Contract</option>
        <option value="INTERN">Internship</option>
      </select>

      <label style={{ fontSize: 13, color: '#555' }}>Work Mode</label>
      <select value={filters.remote}
        onChange={e => onChange({ ...filters, remote: e.target.value })}
        style={{ width: '100%', padding: '6px 8px', marginBottom: 12,
                 border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
        <option value="">All Modes</option>
        <option value="true">Remote</option>
        <option value="false">On-site</option>
      </select>

      <label style={{ fontSize: 13, color: '#555' }}>Min Match Score</label>
      <select value={filters.matchScore}
        onChange={e => onChange({ ...filters, matchScore: e.target.value })}
        style={{ width: '100%', padding: '6px 8px', marginBottom: 16,
                 border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
        <option value="">All</option>
        <option value="70">High (70%+)</option>
        <option value="40">Medium (40%+)</option>
      </select>
    </div>
  )
}
