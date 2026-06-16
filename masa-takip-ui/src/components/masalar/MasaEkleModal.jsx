import { useState } from 'react'
import { Plus } from 'lucide-react'
import Modal from '../common/Modal'
import useMasaStore from '../../store/useMasaStore'

/**
 * Button + Modal for adding a new table to the system.
 */
export default function MasaEkleModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [masaAdi, setMasaAdi] = useState('')
  const [error, setError]     = useState('')
  const masaEkle = useMasaStore((s) => s.masaEkle)

  const handleClose = () => {
    setIsOpen(false)
    setMasaAdi('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = masaAdi.trim()
    if (!trimmed) {
      setError('Masa adı boş olamaz.')
      return
    }
    const res = await masaEkle(trimmed)
    if (res && res.success) {
      handleClose()
    } else {
      setError(res?.message || 'Masa eklenemedi.')
    }
  }

  return (
    <>
      <button
        id="btn-masa-ekle"
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
      >
        <Plus size={16} />
        Masa Ekle
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Yeni Masa Ekle">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Masa Adı
            </label>
            <input
              id="input-masa-adi"
              type="text"
              className="input"
              placeholder="Örn: Teras 3, VIP 2..."
              value={masaAdi}
              onChange={(e) => {
                setMasaAdi(e.target.value)
                setError('')
              }}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-400 mt-0.5">{error}</p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost flex-1"
            >
              İptal
            </button>
            <button
              type="submit"
              id="btn-masa-kaydet"
              className="btn btn-primary flex-1"
            >
              <Plus size={15} />
              Masa Ekle
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
