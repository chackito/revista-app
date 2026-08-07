'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null)
  const [seccion, setSeccion] = useState(null)
  const [audios, setAudios] = useState([])
  const [cargandoAudios, setCargandoAudios] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const verificar = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/auth')
      } else {
        setUsuario(data.user)
      }
    }
    verificar()
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const cargarAudios = async () => {
    setCargandoAudios(true)
    const { data, error } = await supabase
      .from('audios')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) {
      setAudios(data || [])
    }
    setCargandoAudios(false)
  }

  const irASeccion = (id) => {
    if (id === 'revistas') {
      router.push('/revistas')
    } else {
      setSeccion(id)
      if (id === 'audios') {
        cargarAudios()
      }
    }
  }

  const menuItems = [
    { id: 'revistas', label: 'Revistas', icono: '📖', color: 'from-blue-600 to-blue-800' },
    { id: 'audios', label: 'Audios', icono: '🎧', color: 'from-purple-600 to-purple-800' },
    { id: 'boletines', label: 'Boletines', icono: '📰', color: 'from-emerald-600 to-emerald-800' },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mi Contenido</h1>
          <button onClick={cerrarSesion} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
            Cerrar sesion
          </button>
        </div>
        <p className="text-gray-400 mb-10">Bienvenido, {usuario?.email}</p>

        {seccion === null && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => irASeccion(item.id)}
                className={`bg-gradient-to-br ${item.color} rounded-2xl p-10 flex flex-col items-center gap-4 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-white/10`}
              >
                <span className="text-6xl">{item.icono}</span>
                <span className="text-2xl font-bold">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {seccion !== null && (
          <button onClick={() => setSeccion(null)} className="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-1">
            ← Volver al menú
          </button>
        )}

        {seccion === 'audios' && (
          <div>
            {cargandoAudios && (
              <div className="text-center text-gray-400 py-10">Cargando audios...</div>
            )}

            {!cargandoAudios && audios.length === 0 && (
              <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-700">
                Todavía no hay audios disponibles.
              </div>
            )}

            {!cargandoAudios && audios.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {audios.map(audio => (
                  <div
                    key={audio.id}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col gap-3"
                  >
                    <div>
                      <h3 className="text-xl font-bold">{audio.titulo}</h3>
                      {audio.descripcion && (
                        <p className="text-gray-400 text-sm">{audio.descripcion}</p>
                      )}
                    </div>
                    <audio controls className="w-full" preload="none">
                      <source src={audio.audio_url} type="audio/mpeg" />
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {seccion === 'boletines' && (
          <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-700">
            Próximamente: contenido de boletines
          </div>
        )}
      </div>
    </div>
  )
}
