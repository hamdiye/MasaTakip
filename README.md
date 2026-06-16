Canlı Ortam (Production) Kurulum ve Güncelleme Kılavuzu
1. Kaynak Bilgisayarda (Mac) Dağıtım Paketinin Hazırlanması
  1.1. Frontend API Adresinin Sabitlenmesi
    - VITE_API_URL tanımını dükkanın sabit IP adresi ve backend'in dinleyeceği 5115 portuna yönlendirin
      VITE_API_URL=http://192.168.1.50:5115/api
  1.2. Backend (.NET) Windows Dağıtım Çıktısı (Publish)
    - Projenin kök dizininde şu komutu çalıştırın:
      dotnet publish backend/MasaTakip.API/MasaTakip.API.csproj -c Release -r win-x64 --self-contained true -o ./MasaTakipCanli/Backend
  1.3. Frontend (React) Derlemesi ve Gömülmesi
    - Terminal üzerinden frontend klasörüne geçiş yapın ve statik üretim dosyalarını derleyin:
      cd masa-takip-ui && npm run build
    - Derleme tamamlandığında oluşan dist klasörünün içerisindeki tüm dosyaları kopyalayın.
    - Bir önceki adımda üretilen MasaTakipCanli/Backend klasörünün içine girin. Burada wwwroot adında yeni bir klasör oluşturun ve
      kopyaladığınız frontend dosyalarını bu klasörün içine yapıştırın.

2. Hedef Sunucuda (Windows) Canlıya Alma ve Güncelleme
   2.1. Dosya Aktarımı ve Dağıtım Yapısı
     - Üretilen güncel Backend klasörünü harici bir bellek veya ağ aktarımı vasıtasıyla Windows bilgisayardaki kalıcı dizinine
       (Örn: C:\MasaTakip\Backend) taşıyın.
   2.2. Güncelleme Döngüsü (Deploy Süreci)
       Mevcut çalışan sisteme yeni bir güncelleme geçileceği zaman sunucuda sırasıyla şu adımlar uygulanır:
        1. Windows üzerinde açık olan siyah backend terminal ekranı sağ üstteki çarpı (X) butonuna basılarak kapatılır.
        2. C:\HesapLokal\Backend klasörü sistemden tamamen silinir.
        3. Kaynak bilgisayardan getirilen yeni ve güncel Backend klasörü aynı dizine yapıştırılır.
        4. Masaüstünde yer alan Sistemi_Baslat.bat scripti çalıştırılarak güncel sistem ayağa kaldırılır.

3. Otomasyon Scriptleri ve Yapılandırma Dosyaları
   3.1. Sunucu docker-compose.yml İçeriği
      version: '3.8'
      services:
        db:
          image: postgres:15-alpine
          container_name: masatakip-db
          environment:
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: postgres
            POSTGRES_DB: MasaTakipDb
          ports:
            - "5432:5432"
          volumes:
            - pgdata:/var/lib/postgresql/data
          restart: always
      volumes:
        pgdata:
   3.2. Masaüstü Başlatma Scripti (Sistemi_Baslat.bat)
      @echo off
      :: Docker veritabanı servisini başlatır (çalışıyorsa atlar)
      docker compose -f C:\HesapLokal\docker-compose.yml up -d
      :: .NET uygulamasını ve gömülü web arayüzünü tetikler
      start C:\HesapLokal\Backend\MasaTakip.API.exe
   3.3. Sunucu appsettings.json Port Konfigürasyonu
      Uygulamanın istemci (Frontend) istekleriyle tam uyumlu çalışabilmesi için Backend/appsettings.json dosyasında Kestrel ayarı 
      sabitlenmelidir:
          {
            "ConnectionStrings": {
              "DefaultConnection": "Server=localhost;Port=5432;Database=HesapLokalDb;UserId=restoran_admin;
              Password=GucluSifre123!;Maximum Pool Size=30;"
            },
            "Kestrel": {
              "Endpoints": {
                "Http": {
                  "Url": "http://*:5115"
                }
              }
            }
          }
