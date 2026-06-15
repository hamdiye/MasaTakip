// ─── Mock Kategoriler ─────────────────────────────────────────────────────────
export const kategoriler = [
  { id: 1, adi: 'Tümü' },
  { id: 2, adi: 'Çorbalar' },
  { id: 3, adi: 'Başlangıçlar' },
  { id: 4, adi: 'Ana Yemekler' },
  { id: 5, adi: 'Tatlılar' },
  { id: 6, adi: 'İçecekler' },
  { id: 7, adi: 'Pizza' },
]

// ─── Mock Ürünler ─────────────────────────────────────────────────────────────
export const urunler = [
  // Çorbalar
  { id: 1, kategoriId: 2, adi: 'Mercimek Çorbası',   fiyat: 65,  gorselUrl: null, emoji: '🍲' },
  { id: 2, kategoriId: 2, adi: 'Domates Çorbası',    fiyat: 60,  gorselUrl: null, emoji: '🍅' },
  { id: 3, kategoriId: 2, adi: 'Ezogelin Çorbası',   fiyat: 65,  gorselUrl: null, emoji: '🥣' },
  // Başlangıçlar
  { id: 4, kategoriId: 3, adi: 'Çoban Salatası',     fiyat: 85,  gorselUrl: null, emoji: '🥗' },
  { id: 5, kategoriId: 3, adi: 'Falafel Tabağı',     fiyat: 110, gorselUrl: null, emoji: '🧆' },
  { id: 6, kategoriId: 3, adi: 'Humus',              fiyat: 95,  gorselUrl: null, emoji: '🥙' },
  // Ana Yemekler
  { id: 7,  kategoriId: 4, adi: 'Adana Kebap',       fiyat: 320, gorselUrl: null, emoji: '🍖' },
  { id: 8,  kategoriId: 4, adi: 'Izgara Tavuk',      fiyat: 265, gorselUrl: null, emoji: '🍗' },
  { id: 9,  kategoriId: 4, adi: 'Balık Tava',        fiyat: 380, gorselUrl: null, emoji: '🐟' },
  { id: 10, kategoriId: 4, adi: 'Karnıyarık',        fiyat: 195, gorselUrl: null, emoji: '🍆' },
  { id: 11, kategoriId: 4, adi: 'Köfte',             fiyat: 230, gorselUrl: null, emoji: '🥩' },
  // Tatlılar
  { id: 12, kategoriId: 5, adi: 'Künefe',            fiyat: 145, gorselUrl: null, emoji: '🍯' },
  { id: 13, kategoriId: 5, adi: 'Baklava',           fiyat: 120, gorselUrl: null, emoji: '🥮' },
  { id: 14, kategoriId: 5, adi: 'Sütlaç',            fiyat: 90,  gorselUrl: null, emoji: '🍮' },
  // İçecekler
  { id: 15, kategoriId: 6, adi: 'Ayran',             fiyat: 35,  gorselUrl: null, emoji: '🥛' },
  { id: 16, kategoriId: 6, adi: 'Türk Çayı',         fiyat: 25,  gorselUrl: null, emoji: '🍵' },
  { id: 17, kategoriId: 6, adi: 'Kola (330ml)',       fiyat: 55,  gorselUrl: null, emoji: '🥤' },
  { id: 18, kategoriId: 6, adi: 'Su',                fiyat: 20,  gorselUrl: null, emoji: '💧' },
  // Pizza
  { id: 19, kategoriId: 7, adi: 'Margherita',        fiyat: 220, gorselUrl: null, emoji: '🍕' },
  { id: 20, kategoriId: 7, adi: 'Karışık Pizza',     fiyat: 260, gorselUrl: null, emoji: '🍕' },
  { id: 21, kategoriId: 7, adi: 'Vejeteryan Pizza',  fiyat: 240, gorselUrl: null, emoji: '🍕' },
]

// ─── Mock Masalar ─────────────────────────────────────────────────────────────
export const initialMasalar = [
  { id: 1,  adi: 'Masa 1',    durum: 'Dolu' },
  { id: 2,  adi: 'Masa 2',    durum: 'Bos'  },
  { id: 3,  adi: 'Masa 3',    durum: 'Dolu' },
  { id: 4,  adi: 'Masa 4',    durum: 'Bos'  },
  { id: 5,  adi: 'Masa 5',    durum: 'Dolu' },
  { id: 6,  adi: 'Masa 6',    durum: 'Bos'  },
  { id: 7,  adi: 'Teras 1',   durum: 'Dolu' },
  { id: 8,  adi: 'Teras 2',   durum: 'Bos'  },
  { id: 9,  adi: 'VIP 1',     durum: 'Bos'  },
  { id: 10, adi: 'Bar',       durum: 'Dolu' },
]

// ─── Mock Adisyonlar (başlangıç adisyon detayları) ───────────────────────────
// masaId -> adisyon detay kalemleri
export const initialAdisyonlar = {
  1: [
    { urunId: 7,  adi: 'Adana Kebap',    adet: 2, anlikFiyat: 320 },
    { urunId: 16, adi: 'Türk Çayı',      adet: 4, anlikFiyat: 25  },
    { urunId: 4,  adi: 'Çoban Salatası', adet: 1, anlikFiyat: 85  },
  ],
  3: [
    { urunId: 19, adi: 'Margherita',     adet: 2, anlikFiyat: 220 },
    { urunId: 17, adi: 'Kola (330ml)',   adet: 3, anlikFiyat: 55  },
  ],
  5: [
    { urunId: 8,  adi: 'Izgara Tavuk',   adet: 3, anlikFiyat: 265 },
    { urunId: 1,  adi: 'Mercimek Çorbası', adet: 3, anlikFiyat: 65 },
    { urunId: 12, adi: 'Künefe',         adet: 2, anlikFiyat: 145 },
    { urunId: 15, adi: 'Ayran',          adet: 3, anlikFiyat: 35  },
  ],
  7: [
    { urunId: 9,  adi: 'Balık Tava',     adet: 2, anlikFiyat: 380 },
    { urunId: 13, adi: 'Baklava',        adet: 4, anlikFiyat: 120 },
  ],
  10: [
    { urunId: 16, adi: 'Türk Çayı',     adet: 6, anlikFiyat: 25  },
    { urunId: 14, adi: 'Sütlaç',        adet: 2, anlikFiyat: 90  },
  ],
}
