import { corsHeaders } from './cors.ts'

export const handleError = (error: any) => {
  console.error('Function error:', error)
  return new Response(
    JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}
