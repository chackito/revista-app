'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Revistas() {
  const [revistas, setRevistas] = useState([])
  const [cargando, setCargando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    cargarRevistas()
  }, [])

  const cargarRevistas = async () => {
    const { data } = await supabase.from('revistas').select('*')
    const ordenadas = (data || []).sort((a, b) => {
      const numA = parseInt(a.titulo.replace(/\D/g, ''))
      const numB = parseInt(b.titulo.replace(/\D/g, ''))
      return numA - numB
    })
    setRevistas(ordenadas)
    setCargando(false)
  }

  if (cargando) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Cargando revistas...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <button onClick={() => router.push('/dashboard')} className="mb-6 text-gray-400 hover:text-white">
        ← Volver al menú
      </button>

      <h1 className="text-3xl font-bold mb-8">Revistas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {revistas.map((r) => (
          <div
            key={r.id}
            onClick={() => router.push(`/revista/${r.id}`)}
            className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition flex flex-col items-center"
          >
            <div className="w-full aspect-video bg-gray-700 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-sm overflow-hidden">
              {r.portada_url ? (
                <img src={r.portada_url} alt={r.titulo} className="w-full h-full object-contain" />
              ) : (
                r.titulo
              )}
            </div>
            <p className="text-center text-sm mb-3">{r.titulo}</p>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/revista/${r.id}`) }}
              className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-bold"
            >
              Leer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}