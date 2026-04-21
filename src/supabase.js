import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

export async function fetchGlobalBest() {
  const { data } = await supabase
    .from('best_scores')
    .select('score_ms, username')
    .order('score_ms', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data
}

export async function saveGlobalBest(username, scoreMs) {
  await supabase.from('best_scores').insert({ username, score_ms: scoreMs })
}
