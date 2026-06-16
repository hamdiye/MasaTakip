import { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  X,
  Lock,
  User,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import useMasaStore from '../store/useMasaStore'
import useAuthStore from '../store/useAuthStore'
import Modal from '../components/common/Modal'
import clsx from 'clsx'

export default function KullaniciYonetimPage() {
  const {
    kullanicilar,
    loadKullanicilar,
    kullaniciEkleAdmin,
    kullaniciGuncelleAdmin,
    kullaniciSilAdmin,
    isLoading
  } = useMasaStore()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.rol === 'Admin'

  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [selectedKullanici, setSelectedKullanici] = useState(null)
  const [form, setForm] = useState({
    isim: '',
    pinCode: '',
    rol: 'Garson', // Default role
    aktifMi: true
  })

  const [formError, setFormError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isSubmitPending, setIsSubmitPending] = useState(false)

  // Fetch users on mount if admin
  useEffect(() => {
    if (isAdmin) {
      loadKullanicilar()
    }
  }, [loadKullanicilar, isAdmin])

  // Access Denied View
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 animate-scale-in">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white mb-1">Erişim Engellendi</h1>
          <p className="text-sm text-slate-500 max-w-sm">
            Kullanıcı yönetimi paneline erişmek için yönetici yetkilerine sahip olmanız gerekmektedir.
          </p>
        </div>
      </div>
    )
  }

  // Open modal handler
  const handleOpenModal = () => {
    setModalMode('add')
    setSelectedKullanici(null)
    setForm({
      isim: '',
      pinCode: '',
      rol: 'Garson',
      aktifMi: true
    })
    setFormError('')
    setIsOpen(true)
  }

  // Edit click handler
  const handleEditClick = (k) => {
    setModalMode('edit')
    setSelectedKullanici(k)
    setForm({
      isim: k.isim,
      pinCode: '', // Keep empty unless updating PIN
      rol: k.rol,
      aktifMi: k.aktifMi
    })
    setFormError('')
    setIsOpen(true)
  }

  // Delete click handler
  const handleDeleteClick = (k) => {
    setSelectedKullanici(k)
    setDeleteError('')
    setIsDeleteOpen(true)
  }

  // Delete confirm handler
  const handleDeleteConfirm = async () => {
    if (!selectedKullanici) return
    setDeleteError('')
    setIsSubmitPending(true)
    const result = await kullaniciSilAdmin(selectedKullanici.id)
    setIsSubmitPending(false)
    if (result.success) {
      setIsDeleteOpen(false)
      setSelectedKullanici(null)
    } else {
      setDeleteError(result.message)
    }
  }

  // Input PIN constraint (only numbers, max 4 chars)
  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '') // remove non-digits
    if (val.length <= 4) {
      setForm({ ...form, pinCode: val })
    }
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.isim.trim()) {
      setFormError('Lütfen kullanıcının ismini giriniz.')
      return
    }

    if (modalMode === 'add' && form.pinCode.length !== 4) {
      setFormError('PIN kodu tam olarak 4 haneli bir sayı olmalıdır.')
      return
    }

    if (modalMode === 'edit' && form.pinCode && form.pinCode.length !== 4) {
      setFormError('Yeni PIN kodu tam olarak 4 haneli bir sayı olmalıdır.')
      return
    }

    setIsSubmitPending(true)

    let result
    if (modalMode === 'add') {
      const requestData = {
        isim: form.isim.trim(),
        pinCode: form.pinCode,
        rol: form.rol
      }
      result = await kullaniciEkleAdmin(requestData)
    } else {
      const requestData = {
        isim: form.isim.trim(),
        pinCode: form.pinCode || null,
        rol: form.rol,
        aktifMi: form.aktifMi
      }
      result = await kullaniciGuncelleAdmin(selectedKullanici.id, requestData)
    }
    setIsSubmitPending(false)

    if (result.success) {
      setIsOpen(false)
    } else {
      setFormError(result.message)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Users className="text-orange-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Kullanıcı Yönetimi</h1>
            <p className="text-xs text-slate-400">Sistem personellerini ve erişim PIN'lerini yönetin</p>
          </div>
        </div>

        <button onClick={handleOpenModal} className="btn btn-primary text-xs md:text-sm">
          <Plus size={16} />
          Yeni Kullanıcı Ekle
        </button>
      </div>

      {/* Loading list state */}
      {isLoading && kullanicilar.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 h-24" />
          ))}
        </div>
      ) : kullanicilar.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center animate-fade-in min-h-[300px]">
          <Users className="text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-white mb-1">Kullanıcı Bulunamadı</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Sistemde kayıtlı kullanıcı bulunmamaktadır veya API bağlantısında bir sorun oluştu.
          </p>
        </div>
      ) : (
        /* Users Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {kullanicilar.map((k) => {
            const isUserAdmin = k.rol === 'Admin'
            const initials = k.isim
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)

            return (
              <div
                key={k.id}
                className="glass rounded-2xl p-5 flex items-center justify-between border border-white/5 hover:border-white/10 transition-all duration-200 group"
              >
                {/* User Info Details */}
                <div className="flex items-center gap-4">
                  {/* Circular Avatar */}
                  <div
                    className={clsx(
                      'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm text-white select-none',
                      isUserAdmin
                        ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-md shadow-red-500/10'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/10'
                    )}
                  >
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{k.isim}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {/* Role Badge */}
                      <span
                        className={clsx(
                          'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
                          isUserAdmin
                            ? 'bg-red-500/10 border-red-500/15 text-red-400'
                            : 'bg-blue-500/10 border-blue-500/15 text-blue-400'
                        )}
                      >
                        {k.rol}
                      </span>
                      {/* Active Status */}
                      {k.aktifMi ? (
                        <span className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">
                          <CheckCircle2 size={8} />
                          AKTİF
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 font-bold">
                          PASİF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {(k.id !== 1 || user?.id === 1) && (
                    <button
                      onClick={() => handleEditClick(k)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/20 transition-all bg-white/5"
                      title="Düzenle"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {k.id !== 1 && k.id !== user?.id && (
                    <button
                      onClick={() => handleDeleteClick(k)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all bg-white/5"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── MODAL: Add/Edit User ───────────────────────────── */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={modalMode === 'add' ? 'Yeni Personel Ekle' : 'Personel Bilgilerini Düzenle'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* User Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">İsim Soyisim</label>
            <input
              type="text"
              placeholder="Örn: Ahmet Yılmaz"
              value={form.isim}
              onChange={(e) => setForm({ ...form, isim: e.target.value })}
              className="input"
              disabled={isSubmitPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* PIN Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                {modalMode === 'add' ? 'PIN Kodu (4 Hane)' : 'Yeni PIN Kodu'}
                <HelpCircle size={12} className="text-slate-500" title={modalMode === 'add' ? "Girişte kullanılacak 4 haneli PIN" : "Değiştirmek istemiyorsanız boş bırakın"} />
              </label>
              <div className="relative">
                <input
                  type="password"
                  pattern="\d*"
                  maxLength={4}
                  placeholder={modalMode === 'add' ? '••••' : 'Değiştirme'}
                  value={form.pinCode}
                  onChange={handlePinChange}
                  className="input pl-10 tracking-[0.25em] font-mono text-center text-sm"
                  disabled={isSubmitPending}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              </div>
            </div>

            {/* User Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Yetki / Rol</label>
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="input"
                disabled={isSubmitPending}
              >
                <option value="Garson" className="bg-slate-900 text-white">
                  Garson
                </option>
                <option value="Admin" className="bg-slate-900 text-white">
                  Yönetici (Admin)
                </option>
              </select>
            </div>
          </div>

          {/* Active Status (Only in Edit mode) */}
          {modalMode === 'edit' && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mt-1 select-none">
              <input
                type="checkbox"
                id="aktifMi"
                checked={form.aktifMi}
                onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500/20 w-4 h-4 cursor-pointer focus:ring-offset-0 focus:ring-2"
                disabled={isSubmitPending}
              />
              <div className="flex flex-col">
                <label htmlFor="aktifMi" className="text-xs font-bold text-slate-200 cursor-pointer">
                  Kullanıcı Aktif
                </label>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Pasif kullanıcılar sisteme giriş yapamaz ve sipariş ekranlarına erişemez.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5 mt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost text-xs"
              disabled={isSubmitPending}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary min-w-[100px] text-xs"
              disabled={isSubmitPending}
            >
              {isSubmitPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: Delete Confirmation ──────────────────────── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Personel Silme Onayı"
      >
        <div className="flex flex-col gap-4">
          {deleteError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="flex gap-3 items-start p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold">Önemli Bilgilendirme:</span>
              <span>
                Eğer bu personelin geçmiş satış/adisyon kaydı varsa, veri tabanı bütünlüğünü korumak adına sistem personeli silmek yerine otomatik olarak <strong>Pasif</strong> duruma getirecektir. Satış geçmişi olmayan personeller ise kalıcı olarak silinir.
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300">
            <strong className="text-white">{selectedKullanici?.isim}</strong> isimli personeli sistemden silmek istediğinize emin misiniz?
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5 mt-2">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="btn btn-ghost text-xs"
              disabled={isSubmitPending}
            >
              Vazgeç
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="btn bg-red-600 hover:bg-red-700 text-white min-w-[100px] text-xs border border-red-500/10"
              disabled={isSubmitPending}
            >
              {isSubmitPending ? 'Siliniyor...' : 'Evet, Sil'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
