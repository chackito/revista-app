'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import HTMLFlipBook from 'react-pageflip'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

export default function VisorRevista({ params }) {
  const [paginas, setPaginas] = useState([])
  const [cargando, setCargando] = useState(true)
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <button onClick={() => router.push('/dashboard')} className="mb-4 text-gray-400 hover:text-white">
        Volver al dashboard
      </button>
      <HTMLFlipBook width={550} height={750} showCover={true}>
        {paginas.map((img, i) => (
          <div key={i} className="bg-white">
            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  )
}