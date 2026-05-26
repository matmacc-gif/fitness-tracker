import { useState } from 'react'
import { MACRO_TARGETS } from '../App'

const inp = { padding: '7px 8px', fontSize: 13, borderRadius: 8, border: '0.5px solid #444', background: '#1a1a1a', color: '#f0f0f0', width: '100%', boxSizing: 'border-box' }

const ProgressBar = ({ val, color }) => (
  <div style={{ height: 4, background: '#222', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
    <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 2, transition: 'width 0.3s' }} />
  </div>
)

export default function NutritionView({ todayKey, meals, saveMeals, macroTotals }) {
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' })
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [editingIdx, setEditingIdx] = useState(null)
  const [editForm, setEditForm] = useState({})
  const todayList = meals[todayKey] || []

  const estimateMacros = async () => {
    if (!aiInput.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [{ role: 'user', content: `Estimate the macros for: "${aiInput}". Reply ONLY with a JSON object, no markdown, no explanation. Format: {"name":"...(clean food name)","calories":0,"protein":0,"carbs":0,"fat":0}` }]
        })
      })
      const data = await res.json()
      const text = data.content?.find(b => b.type === 'text')?.text || ''
      const parsed = JSON.parse(text.trim())
      setForm({ name: parsed.name || aiInput, calories: String(parsed.calories || 0), protein: String(parsed.protein || 0), carbs: String(parsed.carbs || 0), fat: String(parsed.fat || 0) })
      setAiInput('')
    } catch { setAiError("Couldn't estimate — try being more specific.") }
    setAiLoading(false)
  }

  const addMeal = async () => {
    if (!form.name) return
    const meal = { name: form.name, calories: parseInt(form.calories) || 0, protein: parseInt(form.protein) || 0, carbs: parseInt(form.carbs) || 0, fat: parseInt(form.fat) || 0 }
    const next = { ...meals, [todayKey]: [...todayList, meal] }
    await saveMeals(next)
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '' })
    setSaveStatus('✓ Saved')
    setTimeout(() => setSaveStatus(''), 2000)
  }

  const removeMeal = async (i) => {
    const next = [...todayList]
    next.splice(i, 1)
    await saveMeals({ ...meals, [todayKey]: next })
  }

  const startEdit = (i) => { setEditingIdx(i); setEditForm({ ...todayList[i] }) }

  const saveEdit = async () => {
    const next = [...todayList]
    next[editingIdx] = { name: editForm.name, calories: parseInt(editForm.calories) || 0, protein: parseInt(editForm.protein) || 0, carbs: parseInt(editForm.carbs) || 0, fat: parseInt(editForm.fat) || 0 }
    await saveMeals({ ...meals, [todayKey]: next })
    setEditingIdx(null)
  }

  const pct = k => Math.min(100, Math.round((macroTotals[k] / MACRO_TARGETS[k]) * 100))

  return (
    <div>
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, textAlign: 'center' }}>
          {['calories', 'protein', 'carbs', 'fat'].map(k => (
            <div key={k}>
              <div style={{ fontSize: 11, color: '#999', textTransform: 'capitalize', marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 18, fontWeight: 500 }}>{macroTotals[k]}{k !== 'calories' ? 'g' : ''}</div>
              <div style={{ fontSize: 11, color: '#999' }}>/ {MACRO_TARGETS[k]}{k !== 'calories' ? 'g' : ''}</div>
              <ProgressBar val={pct(k)} color={k === 'calories' ? '#378add' : k === 'protein' ? '#1d9e75' : k === 'carbs' ? '#ba7517' : '#d4537e'} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Log a meal</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input placeholder='Describe food (e.g. "2 scrambled eggs")' value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && estimateMacros()} style={{ ...inp, flex: 1 }} />
          <button onClick={estimateMacros} disabled={aiLoading} style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '0.5px solid #444', background: 'none', cursor: 'pointer', color: '#f0f0f0', whiteSpace: 'nowrap' }}>{aiLoading ? '...' : 'Estimate'}</button>
        </div>
        {aiError && <div style={{ fontSize: 12, color: '#e55', marginBottom: 6 }}>{aiError}</div>}
        <input placeholder="Meal name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ ...inp, marginBottom: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 8 }}>
          {['calories', 'protein', 'carbs', 'fat'].map(k => (
            <input key={k} placeholder={k} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={inp} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={addMeal} style={{ flex: 1, padding: '9px', border: '0.5px solid #444', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 14, color: '#f0f0f0' }}>+ Add meal</button>
          {saveStatus && <span style={{ fontSize: 13, color: '#1d9e75' }}>{saveStatus}</span>}
        </div>
      </div>
      <div>
        {todayList.length === 0 && <div style={{ fontSize: 13, color: '#999', textAlign: 'center', padding: '1.5rem' }}>No meals logged yet</div>}
        {todayList.map((m, i) => (
          <div key={i} style={{ border: '0.5px solid #333', borderRadius: 8, marginBottom: 6, background: '#1a1a1a', overflow: 'hidden' }}>
            {editingIdx === i ? (
              <div style={{ padding: '10px 14px' }}>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} style={{ ...inp, marginBottom: 8 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 8 }}>
                  {['calories', 'protein', 'carbs', 'fat'].map(k => (
                    <input key={k} placeholder={k} value={editForm[k]} onChange={e => setEditForm(p => ({ ...p, [k]: e.target.value }))} style={inp} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={saveEdit} style={{ flex: 1, padding: '7px', fontSize: 13, borderRadius: 8, border: '0.5px solid #444', background: 'none', cursor: 'pointer', color: '#f0f0f0' }}>Save</button>
                  <button onClick={() => setEditingIdx(null)} style={{ padding: '7px 12px', fontSize: 13, borderRadius: 8, border: '0.5px solid #444', background: 'none', cursor: 'pointer', color: '#999' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{m.calories} kcal · P:{m.protein}g C:{m.carbs}g F:{m.fat}g</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 13 }}>✎</button>
                  <button onClick={() => removeMeal(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 16 }}>✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}