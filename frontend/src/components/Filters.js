export default function Filters({ filters, onChange }) {
  const skillOptions = ['React', 'Node.js', 'Python', 'JavaScript',
                        'TypeScript', 'MongoDB', 'AWS', 'Docker', 'SQL']

  const toggleSkill = (skill) => {
    const current = filters.skills || []
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill]
    onChange({ ...filters, skills: updated })
  }

  return (
    <div style={{ width: 240, padding: 16, borderRight: '1px solid #eee',
                  minHeight: '100vh', background: '#fafafa' }}>
      <h4 style={{ marginTop: 0, marginBottom: 16 }}>Filters</h4>

      <label style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Role / Title</label>
      <input placeholder="e.g. React Developer"
        value={filters.title}
        onChange={e => onChange({ ...filters, title: e.target.value })}
        style={{ width: '100%', padding: '6px 8px', marginBottom: 14,
                 border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} />

      <label style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Location</label>
      <input placeholder="e.g. Bangalore, Mumbai"
        value={filters.location || ''}
        onChange={e => onChange({ ...filters, location: e.target.value })}
        style={{ width: '100%', padding: '6px 8px', marginBottom: 14,
                 border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} />

      <label style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Skills</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {skillOptions.map(skill => (
          <span key={skill}
            onClick={() => toggleSkill(skill)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              background: (filters.skills || []).includes(skill) ? '#2563eb' : '#f0f0f0',
              color: (filters.skills || []).includes(skill) ? '#fff' : '#444',
              border: '1px solid',
              borderColor: (filters.skills || []).includes(skill) ? '#2563eb' : '#ddd'
            }}>
            {skill}
          </span>
        ))}
      </div>

      <label style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Job Type</label>
      <select value={filters.type}
        onChange={e => onChange({ ...filters, type: e.target.value })}
        style={{ width: '100%', padding: '6px 8px', marginBottom: 14,
                 border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
        <option value="">All Types</option>
        <option value="FULLTIME">Full-time</option>
        <option value="PARTTIME">Part-time</option>
        <option value="CONTRACT">Contract</option>
        <option value="INTERN">Internship</option>
      </select>

      <label style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Work Mode</label>
      <select value={filters.remote}
        onChange={e => onChange({ ...filters, remote: e.target.value })}
        style={{ width: '100%', padding: '6px 8px', marginBottom: 14,
                 border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
        <option value="">All Modes</option>
        <option value="true">Remote</option>
        <option value="false">On-site</option>
      </select>

      <label style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Min Match Score</label>
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

