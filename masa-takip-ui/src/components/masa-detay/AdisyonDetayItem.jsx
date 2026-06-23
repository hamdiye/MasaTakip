import { Plus, Minus, Trash2 } from 'lucide-react'
import useMasaStore from '../../store/useMasaStore'

/**
 * Single line item in the bill list with quantity controls.
 * When removing this item would empty the bill entirely, the action is
 * delegated to the parent via `onSonUrunSilTalebi` so a confirmation
 * dialog can be shown before proceeding.
 *
 * @param {number}   masaId               - Table ID
 * @param {{ urunId, adi, adet, anlikFiyat }} detay - Bill line item
 * @param {number}   toplamKalemSayisi    - Total distinct line items in the bill
 * @param {(islem: () => Promise<void>) => void} onSonUrunSilTalebi
 *   Called when the action would empty the bill; receives the store action to run after confirmation.
 */
export default function AdisyonDetayItem({ masaId, detay, toplamKalemSayisi, onSonUrunSilTalebi }) {
  const adetAzalt  = useMasaStore((s) => s.adetAzalt)
  const urunKaldir = useMasaStore((s) => s.urunKaldir)

  const satirToplam = detay.adet * detay.anlikFiyat

  /**
   * Returns true if running this action would leave the bill empty.
   * @param {'azalt' | 'kaldir'} tip
   */
  const sonUrunMu = (tip) => {
    if (toplamKalemSayisi > 1) return false        // başka kalem var
    if (tip === 'azalt' && detay.adet > 1) return false  // adet > 1, sadece azalır
    return true
  }

  const handleAzalt = () => {
    if (sonUrunMu('azalt')) {
      onSonUrunSilTalebi(() => adetAzalt(masaId, detay.urunId))
    } else {
      adetAzalt(masaId, detay.urunId)
    }
  }

  const handleKaldir = () => {
    if (sonUrunMu('kaldir')) {
      onSonUrunSilTalebi(() => urunKaldir(masaId, detay.urunId))
    } else {
      urunKaldir(masaId, detay.urunId)
    }
  }

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
          onClick={handleAzalt}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all active:scale-90"
        >
          <Minus size={13} />
        </button>

        <span className="w-7 text-center text-sm font-bold text-white">
          {detay.adet}
        </span>

        <button
          id={`btn-artir-${detay.urunId}`}
          onClick={() => useMasaStore.getState().adetArtir(masaId, detay.urunId)}
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
        onClick={handleKaldir}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
