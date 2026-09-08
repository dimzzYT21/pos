import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mhokhuetflpzvvqrxqfw.supabase.co/rest/v1/'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2todWV0ZmxwenZ2cXJ4cWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NTI5ODYsImV4cCI6MjEwNDQyODk4Nn0.CB2pFZtVqmU6c-v02g1bUdC2Ft6D6EnxDlM7PROC5dM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
