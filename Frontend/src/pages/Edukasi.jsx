import React from 'react'
import { BookOpen } from 'lucide-react'

const Edukasi = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-6">
          <BookOpen size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Halaman Edukasi</h1>
        <p className="text-muted-foreground">
          Halaman ini sedang dalam pengembangan. Segera hadir konten edukasi seputar gizi dan pola hidup sehat.
        </p>
      </div>
    </div>
  )
}

export default Edukasi;