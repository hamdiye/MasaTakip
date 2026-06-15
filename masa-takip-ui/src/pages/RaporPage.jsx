import { BarChart2 } from 'lucide-react'

export default function RaporPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-slate-600">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
        <BarChart2 size={28} className="text-slate-500" />
      </div>
      <div className="text-center">
        <h1 className="text-lg font-bold text-white mb-1">Raporlar</h1>
        <p className="text-sm text-slate-500">Bu ekran yakında hazır olacak.</p>
      </div>
    </div>
  )
}
