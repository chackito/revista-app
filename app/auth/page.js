'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    setMensaje('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setMensaje(error.message)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Iniciar sesión
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4"
        />
        {mensaje && <p className="text-yellow-400 text-sm mb-4">{mensaje}</p>}
        <button
          onClick={handleAuth}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg mb-4"
        >
          Entrar
        </button>
      </div>
    </div>
  )
}
