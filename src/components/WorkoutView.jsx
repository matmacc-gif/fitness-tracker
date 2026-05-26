import { useState } from 'react'
import { WORKOUTS } from '../App'

const inp = { padding: '7px 8px', fontSize: 13, borderRadius: 8, border: '0.5px solid #444', background: '#1a1a1a', color: '#f0f0f0', width: '100%', boxSizing: 'border-box' }

export default function WorkoutView({ dayName, todayKey, logs, saveLogs }) {
  const exercises = WORKOUTS[dayName] || []
  const [expanded, setExpanded] = useState(null)
  const [forms, setForms] = useState({})
  const [saveStatus, setSaveStatus] = useState({})
  const todayLog = logs[todayKey] || {}

  const getForm = name => forms[name] || { weight: '', reps: '', notes: '' }
  const setForm = (name, val) => setForms(p => ({ ...p, [name]: val }))

  const addSet = async (exName) => {
    const f = getForm(exName)
    const w = parseFloat(f.weight) || 0
    const r = parseInt(f.reps) || 0
    if (!w && !r) return
    const prev = todayLog[exName] || []
    const next = { ...logs, [todayKey]: { ...todayLog, [exName]: [...prev, { weight: w, reps: r, notes: f.notes }] } }
    await saveLogs(next)
    setForm(exName, { weight: '', reps: '', notes: '' })
    setSaveStatus(p => ({ ...p, [exName]: '✓ Saved' }))
    setTimeout(() => setSaveStatus(p => ({ ...p, [exName]: '' })), 2000)
  }

  const removeSet = async (exName, i) => {
    const prev = [...(todayLog[exName] || [])]
    prev.splice(i, 1)
    await saveLogs({ ...logs, [todayKey]: { ...todayLog, [exName]: prev } })
  }

  if (dayName === 'Rest') return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: '#f0f0f0' }}>Rest day</div>
      <div style={{ fontSize: 14, marginTop: 6 }}>Recovery is part of the program.</div>
    </div>
  )

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{dayName} — {exercises.length} exercises</div>
      {exercises.map(ex => {
        const sets = todayLog[ex.name] || []
        const isOpen = expanded === ex.name
        const f = getForm(ex.name)
        return (
          <div key={ex.name} style={{ border: '0.5px solid #333', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
            <div onClick={() => setExpanded(isOpen ? null : ex.name)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', background: '#1a1a1a' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{ex.sets} sets × {ex.reps} reps</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {sets.length > 0 && <span style={{ fontSize: 12, color: '#1d9e75' }}>{sets.length} logged</span>}
                <span style={{ fontSize: 12, color: '#999' }}>{isOpen ? '▲' : '▼'}</span>
              </div>
            </div>
            {isOpen && (
              <div style={{ padding: '10px 14px', borderTop: '0.5px solid #333', background: '#141414' }}>
                {sets.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: '#999', minWidth: 18 }}>#{i + 1}</span>
                    <span>{s.weight > 0 ? `${s.weight} lbs` : 'BW'}</span>
                    <span style={{ color: '#999' }}>×</span>
                    <span>{s.reps} reps</span>
                    {s.notes && <span style={{ color: '#999', fontStyle: 'italic', fontSize: 12 }}>{s.notes}</span>}
                    <button onClick={() => removeSet(ex.name, i)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#e55', fontSize: 13 }}>✕</button>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 70px 1fr', gap: 6, marginTop: 8 }}>
                  <input placeholder="lbs" value={f.weight} onChange={e => setForm(ex.name, { ...f, weight: e.target.value })} style={inp} />
                  <input placeholder="reps" value={f.reps} onChange={e => setForm(ex.name, { ...f, reps: e.target.value })} style={inp} />
                  <input placeholder="notes" value={f.notes} onChange={e => setForm(ex.name, { ...f, notes: e.target.value })} style={inp} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <button onClick={() => addSet(ex.name)} style={{ flex: 1, padding: '7px', fontSize: 13, borderRadius: 8, border: '0.5px solid #444', background: 'none', cursor: 'pointer', color: '#f0f0f0' }}>+ Add set</button>
                  {saveStatus[ex.name] && <span style={{ fontSize: 12, color: '#1d9e75' }}>{saveStatus[ex.name]}</span>}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}