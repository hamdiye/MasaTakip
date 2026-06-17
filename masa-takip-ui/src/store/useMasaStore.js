import { create } from 'zustand'
import { api } from '../utils/api'
import useAuthStore from './useAuthStore'

/**
 * Resolves the API base URL depending on the runtime environment.
 * - VITE_API_URL env var → used in Docker / explicit deployments
 * - Empty string        → Vite dev proxy forwards /api/* to the backend
 * - window.location.origin → Electron / self-hosted production build
 */
const BASE_URL = import.meta.env.VITE_API_URL
  ?? (import.meta.env.DEV ? '' : window.location.origin)

/**
 * Calculates the total price of a bill's line items.
 * @param {Array} detaylar - Array of adisyon detail items
 * @returns {number} Total amount
 */
const hesaplaToplamTutar = (detaylar) =>
  detaylar.reduce((sum, d) => sum + d.adet * d.anlikFiyat, 0)

const useMasaStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  masalar: [],
  adisyonlar: {}, // masaId -> adisyon detayları
  urunler: [],
  kategoriler: [{ id: 0, adi: 'Tümü' }],
  isLoading: false,
  raporData: null,
  kullanicilar: [],

  // ─── Getters (selector helpers) ─────────────────────────────────────────────
  /**
   * Returns the adisyon items for a specific table.
   * @param {number} masaId
   */
  getMasaAdisyonu: (masaId) => {
    return get().adisyonlar[masaId] ?? []
  },

  /**
   * Returns the total bill amount for a table. Fallbacks to table's loaded total if details are not yet loaded.
   * @param {number} masaId
   */
  getMasaToplamTutar: (masaId) => {
    const detaylar = get().adisyonlar[masaId]
    if (detaylar !== undefined) {
      return hesaplaToplamTutar(detaylar)
    }
    const masa = get().masalar.find((m) => m.id === masaId)
    return masa?.toplamTutar ?? 0
  },

  // ─── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetches all tables from the backend API.
   */
  loadMasalar: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/api/masalar')
      if (res.basarili) {
        const masalarMapped = res.data.map((m) => ({
          id: m.id,
          adi: m.adi,
          durum: m.durum, // 'Bos' | 'Dolu'
          toplamTutar: m.toplamTutar || 0,
        }))
        set({ masalar: masalarMapped, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (err) {
      console.error('loadMasalar error:', err)
      set({ isLoading: false })
    }
  },

  /**
   * Adds a new table (Admin only).
   */
  masaEkle: async (adi) => {
    try {
      const res = await api.post('/api/masalar', { adi })
      if (res.basarili) {
        await get().loadMasalar()
        return { success: true }
      }
      return { success: false, message: res.mesaj || 'Masa eklenemedi.' }
    } catch (err) {
      console.error('masaEkle error:', err)
      return { success: false, message: 'Bağlantı hatası oluştu.' }
    }
  },

  /**
   * Deletes a table (Admin only).
   */
  masaSilAdmin: async (id) => {
    try {
      const res = await api.delete(`/api/masalar/${id}`)
      if (res.basarili) {
        await get().loadMasalar()
        return { success: true }
      }
      return { success: false, message: res.mesaj || 'Masa silinemedi.' }
    } catch (err) {
      console.error('masaSilAdmin error:', err)
      return { success: false, message: 'Bağlantı hatası oluştu.' }
    }
  },

  /**
   * Fetches all products from the backend and updates local products/categories lists.
   */
  loadUrunler: async () => {
    try {
      const res = await api.get('/api/urunler')
      if (res.basarili) {
        const mappedUrunler = res.data.map((u) => ({
          id: u.id,
          kategoriId: u.kategoriId,
          kategoriAdi: u.kategoriAdi,
          adi: u.adi,
          fiyat: u.fiyat,
          emoji:
            u.kategoriAdi === 'Başlangıçlar' ? '🥗' :
            u.kategoriAdi === 'Ana Yemekler' ? '🥩' :
            u.kategoriAdi === 'İçecekler' ? '🥤' :
            u.kategoriAdi === 'Tatlılar' ? '🍮' : '🍽️',
          gorselUrl: u.gorselUrl,
        }))

        set({
          urunler: mappedUrunler,
        })
      }
    } catch (err) {
      console.error('loadUrunler error:', err)
    }
  },

  /**
   * Loads the active bill for the specified table.
   * @param {number} masaId
   */
  loadAktifAdisyon: async (masaId) => {
    try {
      const res = await api.get(`/api/adisyon/${masaId}`)
      if (res.basarili && res.data) {
        const detaylar = res.data.detaylar.map((d) => ({
          id: d.id,
          urunId: d.urunId,
          adi: d.urunAdi,
          adet: d.adet,
          anlikFiyat: d.anlikFiyat,
        }))
        set((state) => ({
          adisyonlar: { ...state.adisyonlar, [masaId]: detaylar },
        }))
      } else {
        set((state) => ({
          adisyonlar: { ...state.adisyonlar, [masaId]: [] },
        }))
      }
    } catch (err) {
      set((state) => ({
        adisyonlar: { ...state.adisyonlar, [masaId]: [] },
      }))
    }
  },

  /**
   * Adds a product to the table's bill. Increments quantity if already present.
   * @param {number} masaId
   * @param {{ id, adi, fiyat }} urun
   */
  urunEkle: async (masaId, urun) => {
    try {
      const res = await api.post('/api/adisyon/urun-ekle', {
        masaId,
        urunId: urun.id,
        adet: 1,
      })
      if (res.basarili && res.data) {
        const detaylar = res.data.detaylar.map((d) => ({
          id: d.id,
          urunId: d.urunId,
          adi: d.urunAdi,
          adet: d.adet,
          anlikFiyat: d.anlikFiyat,
        }))
        set((state) => ({
          adisyonlar: { ...state.adisyonlar, [masaId]: detaylar },
          masalar: state.masalar.map((m) =>
            m.id === masaId ? { ...m, durum: 'Dolu' } : m
          ),
        }))
      }
    } catch (err) {
      console.error('urunEkle error:', err)
    }
  },

  /**
   * Increases the quantity of a product in a table's bill by 1.
   * @param {number} masaId
   * @param {number} urunId
   */
  adetArtir: async (masaId, urunId) => {
    await get().urunEkle(masaId, { id: urunId })
  },

  /**
   * Decreases the quantity of a product. Removes it if quantity reaches 0.
   * @param {number} masaId
   * @param {number} urunId
   */
  adetAzalt: async (masaId, urunId) => {
    try {
      const res = await api.post('/api/adisyon/urun-sil', {
        masaId,
        urunId,
        adet: 1,
      })
      if (res.basarili && res.data) {
        const detaylar = res.data.detaylar.map((d) => ({
          id: d.id,
          urunId: d.urunId,
          adi: d.urunAdi,
          adet: d.adet,
          anlikFiyat: d.anlikFiyat,
        }))
        const yeniDurum = detaylar.length === 0 ? 'Bos' : 'Dolu'
        set((state) => ({
          adisyonlar: { ...state.adisyonlar, [masaId]: detaylar },
          masalar: state.masalar.map((m) =>
            m.id === masaId ? { ...m, durum: yeniDurum } : m
          ),
        }))
      }
    } catch (err) {
      console.error('adetAzalt error:', err)
    }
  },

  /**
   * Closes the bill for a table and marks it as empty.
   * @param {number} masaId
   * @param {string} odemeTipi - 'Nakit' | 'KrediKarti'
   */
  hesabiKapat: async (masaId, odemeTipi) => {
    try {
      const res = await api.post('/api/adisyon/kapat', {
        masaId,
        odemeTipi: odemeTipi === 'KrediKarti' ? 'KrediKarti' : 'Nakit',
      })
      if (res.basarili) {
        set((state) => {
          const { [masaId]: _removed, ...kalanAdisyonlar } = state.adisyonlar
          return {
            adisyonlar: kalanAdisyonlar,
            masalar: state.masalar.map((m) =>
              m.id === masaId ? { ...m, durum: 'Bos' } : m
            ),
          }
        })
        return true
      }
      return false
    } catch (err) {
      console.error('hesabiKapat error:', err)
      return false
    }
  },

  /**
   * Cancels the active bill for a table and marks it as empty.
   * @param {number} masaId
   */
  adisyonIptal: async (masaId) => {
    try {
      const res = await api.post('/api/adisyon/iptal', {
        masaId,
      })
      if (res.basarili) {
        set((state) => {
          const { [masaId]: _removed, ...kalanAdisyonlar } = state.adisyonlar
          return {
            adisyonlar: kalanAdisyonlar,
            masalar: state.masalar.map((m) =>
              m.id === masaId ? { ...m, durum: 'Bos' } : m
            ),
          }
        })
        return true
      }
      return false
    } catch (err) {
      console.error('adisyonIptal error:', err)
      return false
    }
  },

  /**
   * Removes a product line entirely from a table's bill.
   * @param {number} masaId
   * @param {number} urunId
   */
  urunKaldir: async (masaId, urunId) => {
    try {
      const res = await api.post('/api/adisyon/urun-sil', {
        masaId,
        urunId,
        adet: null, // completely removes the line
      })
      if (res.basarili && res.data) {
        const detaylar = res.data.detaylar.map((d) => ({
          id: d.id,
          urunId: d.urunId,
          adi: d.urunAdi,
          adet: d.adet,
          anlikFiyat: d.anlikFiyat,
        }))
        const yeniDurum = detaylar.length === 0 ? 'Bos' : 'Dolu'
        set((state) => ({
          adisyonlar: { ...state.adisyonlar, [masaId]: detaylar },
          masalar: state.masalar.map((m) =>
            m.id === masaId ? { ...m, durum: yeniDurum } : m
          ),
        }))
      }
    } catch (err) {
      console.error('urunKaldir error:', err)
    }
  },

  /**
   * Loads categories from the backend API.
   */
  loadKategoriler: async () => {
    try {
      const res = await api.get('/api/kategoriler')
      if (res.basarili && res.data) {
        const cats = [{ id: 0, adi: 'Tümü' }, ...res.data]
        set({ kategoriler: cats })
      }
    } catch (err) {
      console.error('loadKategoriler error:', err)
    }
  },

  /**
   * Adds a new category (Admin only).
   */
  kategoriEkleAdmin: async (adi) => {
    try {
      const res = await api.post('/api/kategoriler', { adi })
      if (res.basarili) {
        await get().loadKategoriler()
        return { success: true }
      }
      return { success: false, message: res.mesaj || 'Kategori eklenemedi.' }
    } catch (err) {
      console.error('kategoriEkleAdmin error:', err)
      return { success: false, message: 'Bağlantı hatası oluştu.' }
    }
  },

  /**
   * Creates a new product and optionally uploads its image (Admin only).
   */
  urunEkleAdmin: async (urunRequest, imageFile) => {
    try {
      const res = await api.post('/api/urunler', urunRequest)
      if (!res.basarili || !res.data) {
        return { success: false, message: res.mesaj || 'Ürün eklenemedi.' }
      }

      const createdUrun = res.data

      if (imageFile) {
        const formData = new FormData()
        formData.append('dosya', imageFile)

        const state = useAuthStore.getState()
        const token = state.user?.token
        const uploadRes = await fetch(`${BASE_URL}/api/urunler/${createdUrun.id}/gorsel`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        })

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}))
          return { success: true, warning: errData.mesaj || 'Ürün eklendi fakat görsel yüklenemedi.' }
        }
      }

      await get().loadUrunler()
      return { success: true }
    } catch (err) {
      console.error('urunEkleAdmin error:', err)
      return { success: false, message: 'Bağlantı hatası oluştu.' }
    }
  },

  /**
   * Updates an existing product and optionally replaces its image (Admin only).
   */
  urunGuncelleAdmin: async (id, urunRequest, imageFile) => {
    try {
      const res = await api.put(`/api/urunler/${id}`, urunRequest)
      if (!res.basarili) {
        return { success: false, message: res.mesaj || 'Ürün güncellenemedi.' }
      }

      if (imageFile) {
        const formData = new FormData()
        formData.append('dosya', imageFile)

        const state = useAuthStore.getState()
        const token = state.user?.token
        const uploadRes = await fetch(`${BASE_URL}/api/urunler/${id}/gorsel`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        })

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}))
          return { success: true, warning: errData.mesaj || 'Ürün bilgileri güncellendi fakat yeni görsel yüklenemedi.' }
        }
      }

      await get().loadUrunler()
      return { success: true }
    } catch (err) {
      console.error('urunGuncelleAdmin error:', err)
      return { success: false, message: 'Bağlantı hatası oluştu.' }
    }
  },

  /**
   * Deletes a product (Admin only).
   */
  urunSilAdmin: async (id) => {
    try {
      const res = await api.delete(`/api/urunler/${id}`)
      if (res.basarili) {
        await get().loadUrunler()
        return { success: true }
      }
      return { success: false, message: res.mesaj || 'Ürün silinemedi.' }
    } catch (err) {
      console.error('urunSilAdmin error:', err)
      return { success: false, message: 'Bağlantı hatası oluştu.' }
    }
  },

  /**
   * Loads reporting statistics (ciro, payment distribution, popular items, recent sales)
   */
  loadRaporlar: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/api/rapor/ozet')
      if (res.basarili && res.data) {
        set({ raporData: res.data, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (err) {
      console.error('loadRaporlar error:', err)
      set({ isLoading: false })
    }
  },

  /**
   * Loads all users (Admin only)
   */
  loadKullanicilar: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/api/kullanicilar')
      if (res.basarili && res.data) {
        set({ kullanicilar: res.data, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (err) {
      console.error('loadKullanicilar error:', err)
      set({ isLoading: false })
    }
  },

  /**
   * Adds a new user (Admin only)
   */
  kullaniciEkleAdmin: async (kullaniciRequest) => {
    try {
      const res = await api.post('/api/kullanicilar', kullaniciRequest)
      if (res.basarili) {
        await get().loadKullanicilar()
        return { success: true }
      }
      return { success: false, message: res.mesaj || 'Kullanıcı eklenemedi.' }
    } catch (err) {
      console.error('kullaniciEkleAdmin error:', err)
      return { success: false, message: 'Bağlantı hatası oluştu.' }
    }
  },

  /**
   * Updates an existing user (Admin only)
   */
  kullaniciGuncelleAdmin: async (id, kullaniciRequest) => {
    try {
      const res = await api.put(`/api/kullanicilar/${id}`, kullaniciRequest)
      if (res.basarili) {
        await get().loadKullanicilar()
        return { success: true }
      }
      return { success: false, message: res.mesaj || 'Kullanıcı güncellenemedi.' }
    } catch (err) {
      console.error('kullaniciGuncelleAdmin error:', err)
      return { success: false, message: 'Bağlantı hatası oluştu.' }
    }
  },

  /**
   * Deletes a user (Admin only)
   */
  kullaniciSilAdmin: async (id) => {
    try {
      const res = await api.delete(`/api/kullanicilar/${id}`)
      if (res.basarili) {
        await get().loadKullanicilar()
        return { success: true, message: res.mesaj }
      }
      return { success: false, message: res.mesaj || 'Kullanıcı silinemedi.' }
    } catch (err) {
      console.error('kullaniciSilAdmin error:', err)
      return { success: false, message: 'Bağlantı hatası oluştu.' }
    }
  },
}))

export default useMasaStore
