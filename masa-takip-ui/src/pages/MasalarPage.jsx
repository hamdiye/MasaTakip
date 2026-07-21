import { useMemo, useState, useEffect } from 'react'
import { LayoutGrid, Users, CheckCircle2, AlertCircle } from 'lucide-react'
import MasaGrid from '../components/masalar/MasaGrid'
import MasaEkleModal from '../components/masalar/MasaEkleModal'
import useMasaStore from '../store/useMasaStore'
import useAuthStore from '../store/useAuthStore'
import Modal from '../components/common/Modal'

/**
 * Home / Dashboard page. Shows all tables and their status.
 */
export default function MasalarPage() {
  const masalar = useMasaStore((s) => s.masalar)
  const loadMasalar = useMasaStore((s) => s.loadMasalar)
  const deleteMasa = useMasaStore((s) => s.masaSilAdmin)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.rol === 'Admin'

  const [filtre, setFiltre] = useState('Tumu') // 'Tumu' | 'Dolu' | 'Bos'
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedMasa, setSelectedMasa] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeletePending, setIsDeletePending] = useState(false)

  useEffect(() => {
    loadMasalar()
  }, [loadMasalar])

  const handleDeleteClick = (masa) => {
    // Sadece aktif (Dolu) masalar engelleniyor; boş masalar geçmiş adisyon olsa bile silinebilir
    if (masa.durum === 'Dolu') return
    setSelectedMasa(masa)
    setDeleteError('')
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMasa) return
    setDeleteError('')
    setIsDeletePending(true)
    const res = await deleteMasa(selectedMasa.id)
    setIsDeletePending(false)
    if (res && res.success) {
      setIsDeleteOpen(false)
      setSelectedMasa(null)
    } else {
      setDeleteError(res?.message || 'Masa silinemedi.')
    }
  }

  const istatistik = useMemo(() => ({
    toplam: masalar.length,
    dolu:   masalar.filter((m) => m.durum === 'Dolu').length,
    bos:    masalar.filter((m) => m.durum === 'Bos').length,
  }), [masalar])

  const filtreliMasalar = useMemo(() => {
    if (filtre === 'Dolu') return masalar.filter((m) => m.durum === 'Dolu')
    if (filtre === 'Bos')  return masalar.filter((m) => m.durum === 'Bos')
    return masalar
  }, [masalar, filtre])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Masalar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {isAdmin && <MasaEkleModal />}
      </div>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-4">
        {/* Toplam */}
        <div
          className="glass rounded-2xl p-3 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 hover:bg-white/10"
          onClick={() => setFiltre('Tumu')}
          style={filtre === 'Tumu' ? { border: '1px solid rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.08)' } : {}}
        >
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
            <LayoutGrid size={15} className="text-slate-400" />
          </div>
          <span className="text-xl font-extrabold text-white">{istatistik.toplam}</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Toplam</span>
        </div>

        {/* Dolu */}
        <div
          className="rounded-2xl p-3 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200"
          onClick={() => setFiltre('Dolu')}
          style={{
            background: filtre === 'Dolu' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
            border: filtre === 'Dolu' ? '1px solid rgba(239,68,68,0.50)' : '1px solid rgba(239,68,68,0.20)',
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Users size={15} className="text-red-400" />
          </div>
          <span className="text-xl font-extrabold text-red-400">{istatistik.dolu}</span>
          <span className="text-[10px] font-semibold text-red-400/70 uppercase tracking-wider">Dolu</span>
        </div>

        {/* Boş */}
        <div
          className="rounded-2xl p-3 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200"
          onClick={() => setFiltre('Bos')}
          style={{
            background: filtre === 'Bos' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)',
            border: filtre === 'Bos' ? '1px solid rgba(34,197,94,0.50)' : '1px solid rgba(34,197,94,0.20)',
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold text-emerald-400">{istatistik.bos}</span>
          <span className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-wider">Boş</span>
        </div>
      </div>

      {/* ── Active filter indicator ───────────────────────────── */}
      {filtre !== 'Tumu' && (
        <div className="px-4 mb-2 flex items-center gap-2">
          <span className="text-xs text-slate-500">Filtre:</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-lg ${filtre === 'Dolu' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}
          >
            {filtre === 'Dolu' ? '🔴 Dolu masalar' : '🟢 Boş masalar'}
          </span>
          <button
            onClick={() => setFiltre('Tumu')}
            className="text-xs text-slate-600 hover:text-slate-400 underline ml-1"
          >
            Temizle
          </button>
        </div>
      )}

      {/* ── Table Grid ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <MasaGrid masalar={filtreliMasalar} onDeleteMasa={handleDeleteClick} />
      </div>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Masayı Sil"
      >
        <div className="flex flex-col gap-4">
          {deleteError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          {selectedMasa?.durum === 'Dolu' ? (
            <>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">{selectedMasa?.adi}</strong> masasında aktif sipariş bulunmakta.
                  Önce adisyonu kapatmanız veya iptal etmeniz gerekiyor.
                </span>
              </div>
              <div className="flex items-center justify-end pt-3 border-t border-white/5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="btn btn-ghost text-xs"
                >
                  Kapat
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-300">
                <strong className="text-white">{selectedMasa?.adi}</strong> isimli masayı silmek istediğinize emin misiniz?
              </p>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="btn btn-ghost text-xs"
                  disabled={isDeletePending}
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="btn bg-red-600 hover:bg-red-700 text-white min-w-[100px] text-xs"
                  disabled={isDeletePending}
                >
                  {isDeletePending ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

    </div>
  )
}
