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

  const inputStyle = {
    width: '100%', padding: '9px 12px', marginBottom: 14,
    background: '#fff', border: '1px solid rgba(10,10,15,0.1)',
    borderRadius: 10, fontSize: 13, color: '#0a0a0f',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'DM Sans, sans-serif'
  }

  const labelStyle = {
    fontSize: 11, fontWeight: 500, color: '#7a7870',
    display: 'block', marginBottom: 6, letterSpacing: '0.5px'
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700,
        fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
        color: '#7a7870', marginBottom: 20
      }}>
        Filters
      </div>

      <label style={labelStyle}>Role / Title</label>
      <input style={inputStyle} placeholder="e.g. React Developer"
        value={filters.title}
        onChange={e => onChange({ ...filters, title: e.target.value })} />

      <label style={labelStyle}>Location</label>
      <input style={inputStyle} placeholder="e.g. Bangalore"
        value={filters.location || ''}
        onChange={e => onChange({ ...filters, location: e.target.value })} />

      <label style={labelStyle}>Skills</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {skillOptions.map(skill => {
          const active = (filters.skills || []).includes(skill)
          return (
            <span key={skill} onClick={() => toggleSkill(skill)}
              style={{
                padding: '5px 11px', borderRadius: 100, fontSize: 11,
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: active ? '#0a0a0f' : '#fff',
                color: active ? '#fff' : '#7a7870',
                border: `1px solid ${active ? '#0a0a0f' : 'rgba(10,10,15,0.1)'}`
              }}>
              {skill}
            </span>
          )
        })}
      </div>

      <label style={labelStyle}>Job Type</label>
      <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        value={filters.type}
        onChange={e => onChange({ ...filters, type: e.target.value })}>
        <option value="">All Types</option>
        <option value="FULLTIME">Full-time</option>
        <option value="PARTTIME">Part-time</option>
        <option value="CONTRACT">Contract</option>
        <option value="INTERN">Internship</option>
      </select>

      <label style={labelStyle}>Work Mode</label>
      <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        value={filters.remote}
        onChange={e => onChange({ ...filters, remote: e.target.value })}>
        <option value="">All Modes</option>
        <option value="true">Remote</option>
        <option value="false">On-site</option>
      </select>

      <label style={labelStyle}>Min Match Score</label>
      <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        value={filters.matchScore}
        onChange={e => onChange({ ...filters, matchScore: e.target.value })}>
        <option value="">All</option>
        <option value="70">High (70%+)</option>
        <option value="40">Medium (40%+)</option>
      </select>

      <button
        onClick={() => onChange({ title:'', type:'', remote:'', matchScore:'', location:'', skills:[] })}
        style={{
          width: '100%', padding: 10, background: 'transparent',
          border: '1px solid rgba(10,10,15,0.1)', borderRadius: 10,
          fontSize: 12, color: '#7a7870', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s'
        }}
        onMouseEnter={e => { e.target.style.background = '#fff'; e.target.style.color = '#0a0a0f' }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#7a7870' }}>
        Clear All Filters
      </button>
    </div>
  )
}

