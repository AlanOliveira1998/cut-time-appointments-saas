import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pzxkvdsywbjkvjynpajq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6eGt2ZHN5d2Jqa3ZqeW5wYWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY3NTI5NDksImV4cCI6MjAwMjMyODk0OX0.YzE9HA5Sx9Rzws8F_4I4HJT8MhBgArqoxlSF5XMqtYg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) throw error
    
    console.log('Connection successful!')
    console.log('Data:', data)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

testConnection()