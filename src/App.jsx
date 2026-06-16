import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import TodayView from './components/TodayView'
import WorkoutView from './components/WorkoutView'
import NutritionView from './components/NutritionView'
import ProgressView from './components/ProgressView'

export const MACRO_TARGETS = { calories: 2400, protein: 200, carbs: 225, fat: 70 }
export const SPLIT = ['Push', 'Pull', 'Legs', 'Cardio', 'Full Body', 'Rest', 'Cardio']
export const WORKOUTS = {
  Push: [
    { name: 'Machine Chest Press', sets: 4, reps: '6-8' },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10' },
    { name: 'Overhead Press', sets: 3, reps: '8-10' },
    { name: 'Lateral Raises', sets: 3, reps: '12-15' },
    { name: 'Tricep Pushdowns', sets: 3, reps: '10-12' },
    { name: 'Overhead Tricep Extension', sets: 3, reps: '10-12' },
  ],
  Pull: [
    { name: 'Pull-Ups', sets: 4, reps: '6-10' },
    { name: 'Lat Pulldown', sets: 3, reps: '10-12' },
    { name: 'Chest-Supported Row', sets: 3, reps: '8-10' },
    { name: 'Barbell Row', sets: 3, reps: '8-10' },
    { name: 'Face Pulls', sets: 3, reps: '15-20' },
    { name: 'Hammer Curls', sets: 3, reps: '10-12' },
  ],
  Legs: [
    { name: 'Barbell Squat', sets: 4, reps: '6-8' },
    { name: 'Romanian Deadlift', sets: 3, reps: '8-10' },
    { name: 'Leg Press', sets: 3, reps: '10-12' },
    { name: 'Leg Curl', sets: 3, reps: '10-12' },
    { name: 'Leg Extension', sets: 3, reps: '12-15' },
    { name: 'Standing Calf Raise', sets: 4, reps: '15-20' },
  ],
  Cardio: [
    { name: 'Treadmill Incline Walk', sets: 1, reps: '30 min' },
    { name: 'Cable Crunches', sets: 3, reps: '15-20' },
    { name: 'Hanging Leg Raises', sets: 3, reps: '10-15' },
    { name: 'Plank', sets: 3, reps: '45-60 sec' },
  ],
  'Full Body': [
    { name: 'Front Squat', sets: 3, reps: '6-8' },
    { name: 'Pull-Ups', sets: 3, reps: '6-8' },
    { name: 'Dumbbell Bench Press', sets: 3, reps: '8-10' },
    { name: 'Romanian Deadlift', sets: 3, reps: '8-10' },
    { name: 'Seated Row', sets: 3, reps: '10-12' },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12' },
  ],
  Rest: [],
}

const START_DATE = '2025-05-25'

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const getDayIndex = () => {
  const d = new Date()
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const start = new Date(START_DATE)
  const diff = Math.floor((local - start) / 86400000)
  return (diff + 1) % 7
}

const TABS = ['Today', 'Workout', 'Nutrition', 'Progress']

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Today')
  const [logs, setLogs] = useState({})
  const [meals, setMeals] = useState({})
  const [manualDayIdx, setManualDayIdx] = useState(null)
  const [currentDate, setCurrentDate] = useState(today())
  const hasLoaded = useRef(false)

  const dayIdx = manualDayIdx !== null ? manualDayIdx : getDayIndex()
  const dayName = SPLIT[dayIdx]

  const loadData = async (sess) => {
    const { data: wData } = await supabase.from('workout_logs').select('*').eq('user_id', sess.user.id)
    if (wData) {
      const obj = {}
      wData.forEach(r => {
        if (!obj[r.date]) obj[r.date] = {}
        obj[r.date][r.exercise] = r.sets
      })
      setLogs(obj)
    }

    const todayKey = today()
    const { data: mData } = await supabase.from('meal_logs').select('*').eq('user_id', sess.user.id).eq('date', todayKey)
    if (mData?.[0]) setMeals({ [todayKey]: mData[0].meals })
    else setMeals({})
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session && !hasLoaded.current) {
        hasLoaded.current = true
        loadData(session)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess)
      if (event === 'SIGNED_IN' && !hasLoaded.current) {
        hasLoaded.current = true
        loadData(sess)
      }
      if (event === 'SIGNED_OUT') {
        hasLoaded.current = false
        setLogs({})
        setMeals({})
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Midnight reset using local time
  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = today()
      if (newDate !== currentDate) {
        setCurrentDate(newDate)
        setManualDayIdx(null)
        if (session) loadData(session)
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [currentDate, session])

  const saveLogs = async (next) => {
    setLogs(next)
    const todayKey = today()
    const todayLog = next[todayKey] || {}
    for (const [exercise, sets] of Object.entries(todayLog)) {
      await supabase.from('workout_logs').upsert(
        { user_id: session.user.id, date: todayKey, exercise, sets },
        { onConflict: 'user_id,date,exercise' }
      )
    }
  }

  const saveMeals = async (next) => {
    setMeals(next)
    const todayKey = today()
    await supabase.from('meal_logs').upsert(
      { user_id: session.user.id, date: todayKey, meals: next[todayKey] || [] },
      { onConflict: 'user_id,date' }
    )
  }

  if (loading) return <div style={{ padding: '2rem', color: '#999' }}>Loading...</div>
  if (!session) return <Auth />

  const todayKey = today()
  const todayLog = logs[todayKey] || {}
  const todayMeals = meals[todayKey] || []
  const macroTotals = todayMeals.reduce((a, m) => ({
    calories: a.calories + (m.calories || 0),
    protein: a.protein + (m.protein || 0),
    carbs: a.carbs + (m.carbs || 0),
    fat: a.fat + (m.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 4px' }}>Fitness Tracker</h2>
          <p style={{ fontSize: 13, color: '#999', margin: '0 0 0.75rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: '0.5px solid #444', borderRadius: 8, padding: '6px 12px', color: '#999', fontSize: 13, cursor: 'pointer' }}>Sign out</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: 4 }}>
        {SPLIT.map((day, i) => (
          <button key={i} onClick={() => setManualDayIdx(i)} style={{ background: 'none', border: `0.5px solid ${dayIdx === i ? '#f0f0f0' : '#444'}`, borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', color: dayIdx === i ? '#f0f0f0' : '#999' }}>{day}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', borderBottom: '0.5px solid #333', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: 14, fontWeight: tab === t ? 500 : 400, whiteSpace: 'nowrap', color: tab === t ? '#f0f0f0' : '#999', borderBottom: tab === t ? '2px solid #f0f0f0' : '2px solid transparent', marginBottom: -1 }}>{t}</button>
        ))}
      </div>

      {tab === 'Today' && <TodayView dayName={dayName} macroTotals={macroTotals} todayLog={todayLog} setTab={setTab} />}
      {tab === 'Workout' && <WorkoutView dayName={dayName} todayKey={todayKey} logs={logs} saveLogs={saveLogs} />}
      {tab === 'Nutrition' && <NutritionView todayKey={todayKey} meals={meals} saveMeals={saveMeals} macroTotals={macroTotals} />}
      {tab === 'Progress' && <ProgressView logs={logs} />}
    </div>
  )
}