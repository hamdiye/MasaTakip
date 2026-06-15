import { Plus, Minus, Trash2 } from 'lucide-react'
import useMasaStore from '../../store/useMasaStore'

/**
 * Single line item in the bill list with quantity controls.
 * @param {number} masaId - Table ID
 * @param {{ urunId, adi, adet, anlikFiyat }} detay - Bill line item
 */
export default function AdisyonDetayItem({ masaId, detay }) {
  const adetArtir  = useMasaStore((s) => s.adetArtir)
  const adetAzalt  = useMasaStore((s) => s.adetAzalt)
  const urunKaldir = useMasaStore((s) => s.urunKaldir)

  const satirToplam = detay.adet * detay.anlikFiyat

  return (
    <div className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
      {/* Ürün bilgisi */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{detay.adi}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          ₺{detay.anlikFiyat.toLocaleString('tr-TR')} / adet
        </p>
      </div>

      {/* Adet kontrolleri */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          id={`btn-azalt-${detay.urunId}`}
          onClick={() => adetAzalt(masaId, detay.urunId)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all active:scale-90"
        >
          <Minus size={13} />
        </button>

        <span className="w-7 text-center text-sm font-bold text-white">
          {detay.adet}
        </span>

        <button
          id={`btn-artir-${detay.urunId}`}
          onClick={() => adetArtir(masaId, detay.urunId)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all active:scale-90"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Satır tutarı */}
      <div className="w-20 text-right shrink-0">
        <span className="text-sm font-bold text-orange-400">
          ₺{satirToplam.toLocaleString('tr-TR')}
        </span>
      </div>

      {/* Sil butonu (hover'da görünür) */}
      <button
        id={`btn-sil-${detay.urunId}`}
        onClick={() => urunKaldir(masaId, detay.urunId)}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
