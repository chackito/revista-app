'use client'
import { useState } from 'react'

const ADMIN_PASSWORD = 'admin123'

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false)
  const [clave, setClave] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [usuarios, setUsuarios] = useState([])

  const login = () => {
    if (clave === ADMIN_PASSWORD) {
      setAutenticado(true)
      cargarUsuarios()
    } else {
      setMensaje('Clave incorrecta')
    }
  }

  const cargarUsuarios = async () => {
    const res = await fetch('/api/admin/listar-usuarios')
    const data = await res.json()
    if (data.usuarios) setUsuarios(data.usuarios)
  }

  const crearUsuario = async () => {
    const res = await fetch('/api/admin/crear-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (data.error) {
      setMensaje('Error: ' + data.error)
    } else {
      setMensaje('✅ Usuario creado: ' + email)
      setEmail('')
      setPassword('')
      cargarUsuarios()
    }
  }

  const toggleUsuario = async (id, desactivar) => {
    const res = await fetch('/api/admin/toggle-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, desactivar })
    })
    const data = await res.json()
    if (!data.error) {
      setMensaje(desactivar ? '✅ Usuario desactivado' : '✅ Usuario activado')
      cargarUsuarios()
    }
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-xl w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6">Acceso Admin</h1>
          <input
            type="password"
            placeholder="Clave de administrador"
            value={clave}
            onChange={e => setClave(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded-lg mb-3"
          />
          <button onClick={login} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold">
            Entrar
          </button>
          {mensaje && <p className="mt-3 text-red-400">{mensaje}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administrador</h1>

      <div className="bg-gray-800 p-6 rounded-xl max-w-md mb-8">
        <h2 className="text-xl font-bold mb-4">Crear nuevo miembro</h2>
        <input
          type="email"
          placeholder="Email del miembro"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-700 p-3 rounded-lg mb-3"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-gray-700 p-3 rounded-lg mb-3"
        />
        <button onClick={crearUsuario} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold">
          Crear usuario
        </button>
        {mensaje && <p className="mt-3 text-yellow-400">{mensaje}</p>}
      </div>

      <div className="bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Miembros registrados</h2>
        {usuarios.map(u => (
          <div key={u.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg mb-2">
            <div>
              <p className="font-medium">{u.email}</p>
              <p className={`text-sm ${u.banned_until ? 'text-red-400' : 'text-green-400'}`}>
                {u.banned_until ? '🔴 Desactivado' : '🟢 Activo'}
              </p>
            </div>
            <button
              onClick={() => toggleUsuario(u.id, !u.banned_until)}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${u.banned_until ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {u.banned_until ? 'Activar' : 'Desactivar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}