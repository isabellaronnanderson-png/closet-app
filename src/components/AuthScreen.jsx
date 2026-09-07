import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmEmailFor, setConfirmEmailFor] = useState(null) // email string once signup succeeds

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Enter an email and password.'); return }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password })
        if (signUpError) { setError(signUpError.message); return }
        setConfirmEmailFor(email.trim())
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (signInError) { setError(signInError.message); return }
        // onAuthStateChange in App.jsx picks up the new session from here.
      }
    } finally {
      setLoading(false)
    }
  }

  if (confirmEmailFor) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-title">check your email</h1>
          <p className="auth-text">
            We sent a confirmation link to <strong>{confirmEmailFor}</strong>.
            Click it to activate your account, then come back here and sign in.
          </p>
          <button
            className="btn ghost"
            style={{ marginTop: 18 }}
            onClick={() => { setConfirmEmailFor(null); setMode('signin'); setPassword('') }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">closet organizer</h1>
        <p className="auth-text auth-sub">
          {mode === 'signin' ? 'Sign in to your closet.' : 'Create an account to get started.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn pink" type="submit" disabled={loading} style={{ width: '100%', marginTop: 6 }}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <button className="auth-link" onClick={() => { setMode('signup'); setError('') }}>Sign up</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button className="auth-link" onClick={() => { setMode('signin'); setError('') }}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
