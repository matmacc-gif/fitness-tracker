import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handle = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else if (isSignUp) setMessage('Check your email to confirm your account.')
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '2rem', border: '0.5px solid #333', borderRadius: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Fitness Tracker</div>
      <div style={{ fontSize: 14, color: '#999', marginBottom: 24 }}>{isSignUp ? 'Create your account' : 'Sign in to your account'}</div>
      {error && <div style={{ fontSize: 13, color: '#e55', marginBottom: 10 }}>{error}</div>}
      {message && <div style={{ fontSize: 13, color: '#4c4', marginBottom: 10 }}>{message}</div>}
      <input style={{ width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 8, border: '0.5px solid #444', background: '#1a1a1a', color: '#f0f0f0', marginBottom: 10, boxSizing: 'border-box' }} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input style={{ width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 8, border: '0.5px solid #444', background: '#1a1a1a', color: '#f0f0f0', marginBottom: 10, boxSizing: 'border-box' }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} />
      <button style={{ width: '100%', padding: '10px', fontSize: 14, borderRadius: 8, border: 'none', background: '#f0f0f0', color: '#0f0f0f', cursor: 'pointer', fontWeight: 500, marginBottom: 10 }} onClick={handle} disabled={loading}>{loading ? '...' : isSignUp ? 'Create account' : 'Sign in'}</button>
      <button style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', width: '100%', marginTop: 4 }} onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}</button>
    </div>
  )
}