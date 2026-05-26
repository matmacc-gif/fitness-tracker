import { MACRO_TARGETS, WORKOUTS } from '../App'

const ProgressBar = ({ val, color }) => (
  <div style={{ height: 4, background: '#222', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
    <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 2, transition: 'width 0.3s' }} />
  </div>
)

const Card = ({ children }) => (
  <div style={{ background: '#1a1a1a', border: '0.5px solid #333', borderRadius: 12, padding: '12px 14px' }}>{children}</div>
)

export default function TodayView({ dayName, macroTotals, todayLog, setTab }) {
  const exercises = WORKOUTS[dayName] || []
  const completed = exercises.filter(e => todayLog[e.name]?.length > 0).length
  const pct = k => Math.min(100, Math.round((macroTotals[k] / MACRO_TARGETS[k]) * 100))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.25rem' }}>
        <Card>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Today's workout</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{dayName}</div>
          {dayName !== 'Rest' && <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{completed}/{exercises.length} logged</div>}
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Calories</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{macroTotals.calories} <span style={{ fontSize: 13, fontWeight: 400, color: '#999' }}>/ {MACRO_TARGETS.calories}</span></div>
          <ProgressBar val={pct('calories')} color="#378add" />
        </Card>
      </div>
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Macros today</div>
        {['protein', 'carbs', 'fat'].map(k => (
          <div key={k} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: '#999', textTransform: 'capitalize' }}>{k}</span>
              <span>{macroTotals[k]}g / {MACRO_TARGETS[k]}g</span>
            </div>
            <ProgressBar val={pct(k)} color={k === 'protein' ? '#1d9e75' : k === 'carbs' ? '#ba7517' : '#d4537e'} />
          </div>
        ))}
      </div>
      {dayName !== 'Rest' && (
        <button onClick={() => setTab('Workout')} style={{ width: '100%', padding: '10px', border: '0.5px solid #444', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 14, color: '#f0f0f0' }}>
          Log workout →
        </button>
      )}
    </div>
  )
}