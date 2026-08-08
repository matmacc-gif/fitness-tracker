import { useState } from 'react'
import { WORKOUTS } from '../App'

export default function ProgressView({ logs }) {
  const allExercises = [...new Set(Object.values(WORKOUTS).flat().map(e => e.name))]
  const [selectedExercise, setSelectedExercise] = useState('Machine Chest Press')

  const history = Object.entries(logs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayLog]) => {
      const sets = dayLog[selectedExercise] || []
      if (!sets.length) return null
      const maxWeight = Math.max(...sets.map(s => s.weight || 0))
      const totalReps = sets.reduce((a, s) => a + (s.reps || 0), 0)
      const avgReps = Math.round(totalReps / sets.length)
      return { date, maxWeight, avgReps, sets: sets.length, allSets: sets }
    }).filter(Boolean)

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 13, color: '#999', marginBottom: 6 }}>Select exercise</div>
        <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} style={{ width: '100%', padding: '8px 10px', fontSize: 14, borderRadius: 8, border: '0.5px solid #444', background: '#1a1a1a', color: '#f0f0f0' }}>
          {allExercises.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>
      {history.length === 0 ? (
        <div style={{ fontSize: 13, color: '#999', textAlign: 'center', padding: '2rem' }}>No data logged for this exercise yet</div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1.25rem' }}>
            {[['Sessions', history.length], ['Best weight', `${Math.max(...history.map(h => h.maxWeight))} lbs`], ['Last session', history[history.length - 1].date.slice(5)]].map(([label, value]) => (
              <div key={label} style={{ background: '#1a1a1a', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 17, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
          {history.slice(-10).reverse().map((h, i) => (
            <div key={i} style={{ border: '0.5px solid #333', borderRadius: 8, marginBottom: 8, background: '#1a1a1a', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', gap: 12 }}>
                <div style={{ fontSize: 12, color: '#999', minWidth: 42 }}>{h.date.slice(5)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.round((h.maxWeight / 300) * 100))}%`, background: '#378add', borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, minWidth: 60, textAlign: 'right' }}>{h.maxWeight} lbs</div>
                <div style={{ fontSize: 12, color: '#999', minWidth: 40, textAlign: 'right' }}>{h.sets} sets</div>
              </div>
              <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {h.allSets.map((s, j) => (
                  <div key={j} style={{ fontSize: 12, color: '#999', background: '#222', borderRadius: 6, padding: '3px 8px' }}>
                    {s.weight > 0 ? `${s.weight} lbs` : 'BW'} × {s.reps} reps
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}