'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null)
  const [revistas, setRevistas] = useState([])
  const router = useRouter()

  useEffect(() => {
    const verificar = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/auth')
      } else {
        setUsuario(data.user)
        cargarRevistas()
      }
    }
    verificar()
  }, [])

  const cargarRevistas = async () => {
    const { data } = await supabase.from('revistas').select('*')
    setRevistas(data || [])
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Revistas</h1>
          <button onClick={cerrarSesion} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
            Cerrar sesion
          </button>
        </div>
        <p className="text-gray-400 mb-8">Bienvenido, {usuario?.email}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {revistas.map(revista => (
            <div key={revista.id} className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-2">{revista.titulo}</h2>
              <p className="text-gray-400 mb-4">{revista.descripcion}</p>
              <button onClick={() => router.push('/revista/' + revista.id)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                Leer revista
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}