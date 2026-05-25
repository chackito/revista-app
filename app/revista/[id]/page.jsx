'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import HTMLFlipBook from 'react-pageflip'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

function useVisorMode() {
  const [mode, setMode] = useState('flipbook')
  const [bookSize, setBookSize] = useState({ width: 550, height: 750 })

  useEffect(() => {
    const calcular = () => {
      const screenW = window.innerWidth
      const estactil = window.matchMedia('(pointer: coarse)').matches

      if (estactil && screenW < 1024) {
        // Celular en cualquier orientación → scroll vertical
        setMode('scroll')
      } else {
        // Tablet grande o desktop → flipbook
        setMode('flipbook')
        if (screenW < 1024) {
          const w = Math.floor(screenW * 0.45)
          setBookSize({ width: w, height: Math.floor(w * 1.4) })
        } else {
          setBookSize({ width: 550, height: 750 })
        }
      }
    }
    calcular()
    window.addEventListener('resize', calcular)
    return () => window.removeEventListener('resize', calcular)
  }, [])

  return { mode, bookSize }
}

export default function VisorRevista({ params }) {
  const [paginas, setPaginas] = useState([])
  const [cargando, setCargando] = useState(true)
  const { mode, bookSize } = useVisorMode()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { router.push('/auth'); return }
      const resolvedParams = await params
      const { data: revista } = await supabase.from('revistas').select('*').eq('id', resolvedParams.id).single()
      if (revista) cargarPDF(revista.pdf_url)
    }
    init()
  }, [])

  const cargarPDF = async (url) => {
    const pdf = await pdfjsLib.getDocument(url).promise
    const imgs = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      imgs.push(canvas.toDataURL())
    }
    setPaginas(imgs)
    setCargando(false)
  }

  if (cargando) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Cargando revista...
    </div>
  )

  // CELULAR: scroll vertical con zoom nativo
  if (mode === 'scroll') return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4">
      <button onClick={() => router.push('/dashboard')} className="mb-4 text-gray-400 hover:text-white self-start">
        ← Volver al dashboard
      </button>
      <p className="text-gray-500 text-xs mb-4">Pellizca para hacer zoom</p>
      <div className="w-full flex flex-col gap-2">
        {paginas.map((img, i) => (
          <img
            key={i}
            src={img}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            className="rounded shadow-md"
          />
        ))}
      </div>
    </div>
  )

  // TABLET GRANDE Y DESKTOP: flipbook
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <button onClick={() => router.push('/dashboard')} className="mb-4 text-gray-400 hover:text-white">
        ← Volver al dashboard
      </button>
      <HTMLFlipBook
        width={bookSize.width}
        height={bookSize.height}
        showCover={true}
        mobileScrollSupport={true}
        useMouseEvents={true}
      >
        {paginas.map((img, i) => (
          <div key={i} className="bg-white">
            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  )
}