'use client'
import dynamic from 'next/dynamic'

const Board = dynamic(() => import('../components/Board'), {
  ssr: false,
  loading: () => (
    <div className="flex gap-4 overflow-auto pb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="min-w-[280px] bg-gray-200 rounded-lg animate-pulse h-64"></div>
      ))}
    </div>
  )
})

export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-2xl text-secondary font-bold mb-4">Board — Next.js 15 + Tailwind v4</h1>
      <Board />
    </main>
  )
}
