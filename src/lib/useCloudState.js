import { useEffect, useRef, useState } from 'react'
import { loadList, saveList } from './storage.js'
import { supabase, isSupabaseConfigured, TABLE } from './supabaseClient.js'

/**
 * Works like useState, but:
 *  - initializes from the local cache immediately (fast, works offline)
 *  - the first time a session appears, reconciles with Supabase:
 *      - if a cloud row already exists for this key, cloud wins (it's the
 *        source of truth across devices)
 *      - if no cloud row exists yet but there's local data, that local data
 *        is pushed up rather than silently discarded
 *  - every update after that is written to both the local cache and Supabase
 *
 * `session` should be the Supabase auth session (or null/undefined when
 * signed out) - pass the same session object used to gate the rest of the app.
 */
export function useCloudState(key, fallback, session) {
  const [value, setValueState] = useState(() => loadList(key, fallback))
  const reconciledForUser = useRef(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !session) {
      reconciledForUser.current = null
      return
    }
    const uid = session.user.id
    if (reconciledForUser.current === uid) return
    reconciledForUser.current = uid

    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from(TABLE)
          .select('value')
          .eq('user_id', uid)
          .eq('key', key)
          .maybeSingle()

        if (cancelled) return

        if (error) {
          console.error(`Cloud fetch failed for "${key}":`, error.message)
          return
        }

        if (data) {
          setValueState(data.value)
          saveList(key, data.value)
        } else {
          const local = loadList(key, fallback)
          const { error: upsertError } = await supabase.from(TABLE).upsert({
            user_id: uid,
            key,
            value: local,
            updated_at: new Date().toISOString(),
          })
          if (upsertError) console.error(`Initial cloud push failed for "${key}":`, upsertError.message)
        }
      } catch (e) {
        console.error(`Cloud sync error for "${key}":`, e)
      }
    })()

    return () => { cancelled = true }
  }, [session, key]) // eslint-disable-line react-hooks/exhaustive-deps

  function setValue(updater) {
    setValueState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveList(key, next)
      if (isSupabaseConfigured && session) {
        supabase
          .from(TABLE)
          .upsert({ user_id: session.user.id, key, value: next, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error(`Cloud save failed for "${key}":`, error.message) })
      }
      return next
    })
  }

  return [value, setValue]
}
