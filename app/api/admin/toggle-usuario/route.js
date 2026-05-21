import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const { id, desactivar } = await request.json()

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: desactivar ? '87600h' : 'none'
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ success: true })
}