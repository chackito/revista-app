'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import HTMLFlipBook from 'react-pageflip'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

function useBookSize() {
  const [size, setSize] = useState({ width: 550, height: 750 })

  useEffect(() => {
    const calcular = () => {
      const screenW = window.innerWidth
      if (screenW < 480) {
        const w = Math.floor(screenW * 0.92)
        setSize({ width: w, height: Math.floor(w * 1.4) })
      } else if (screenW < 768) {
        const w = Math.floor(screenW * 0.45)
        setSize({ width: w, height: Math.floor(w * 1.4) })
      } else {
        setSize({ width: 550, height: 750 })
      }
    }
    calcular()
    window.addEventListener('resize', calcular)
    return () => window.removeEventListener('resize', calcular)
  }, [])

  return size
}

export default function VisorRevista({ params }) {
  const [paginas, setPaginas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [zoom, setZoom] = useState(1)
  const { width, height } = useBookSize()
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

  const zoomIn = () => setZoom(z => Math.min(z + 0.25, 2.5))
  const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5))

  if (cargando) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Cargando revista...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <button onClick={() => router.push('/dashboard')} className="mb-4 text-gray-400 hover:text-white">
        ← Volver al dashboard
      </button>

      {/* Botones de zoom */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={zoomOut}
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 text-xl font-bold"
        >
          −
        </button>
        <span className="text-gray-400 text-sm">{Math.round(zoom * 100)}%</span>
        <button
          onClick={zoomIn}
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 text-xl font-bold"
        >
          +
        </button>
      </div>

      {/* Visor con zoom aplicado a las imágenes */}
      <div style={{ overflow: 'auto', maxWidth: '100%' }}>
        <HTMLFlipBook
          width={width}
          height={height}
          showCover={true}
          mobileScrollSupport={true}
          useMouseEvents={true}
        >
          {paginas.map((img, i) => (
            <div key={i} className="bg-white overflow-auto">
              <img
                src={img}
                style={{
                  width: `${zoom * 100}%`,
                  height: 'auto',
                  objectFit: 'cover',
                  transformOrigin: 'top left'
                }}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  )
}