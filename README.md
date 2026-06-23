# Canlı Ortam (Production) Kurulum ve Güncelleme Kılavuzu

Sistem artık Masaüstü Uygulaması (Electron) olarak çalışmaktadır. Her yeni güncellemede aşağıdaki adımlar izlenerek Windows cihazlar için tek bir Kurulum Dosyası (Setup.exe) üretilir.

## 1. Kaynak Bilgisayarda Dağıtım Paketinin Hazırlanması

**1.1. Backend (.NET) Derlemesi (Publish)**
- Projenin kök dizininde şu komutu çalıştırın:
  ```bash
  dotnet publish MasaTakip.API/MasaTakip.API.csproj -c Release -r win-x64 --self-contained true -o ./MasaTakipCanli/Backend
  ```

**1.2. Frontend (React) Derlemesi ve Gömülmesi**
- Terminal üzerinden frontend klasörüne geçiş yapıp derleyin:
  ```bash
  cd masa-takip-ui
  npm run build
  ```
- Çıkan `dist` klasörünün içerisindeki tüm dosyaları alın.
- `MasaTakipCanli/Backend` klasörü içerisine `wwwroot` adında bir klasör oluşturup bu dosyaları içine yapıştırın (Varsa öncekileri silin).

**1.3. Masaüstü Uygulaması (Electron) Setup Dosyasının Üretilmesi**
- `Electron-app` klasörüne geçin ve Windows için paketlemeyi başlatın:
  ```bash
  cd ../Electron-app
  npm run pack:win
  ```
- İşlem tamamlandığında `Electron-app/dist/` klasöründe **`MasaTakip Setup 1.0.0.exe`** adında bir kurulum dosyası oluşacaktır.

---

## 2. Hedef Sunucuda (Windows Ana Bilgisayar) Canlıya Alma

**2.1. Güncelleme / Kurulum Adımları**
1. Üretilen **`MasaTakip Setup 1.0.0.exe`** dosyasını flash bellek ile Windows bilgisayara (Kasaya) taşıyın.
2. Bilgisayardaki mevcut MasaTakip uygulaması açıksa **sağ alt köşeden veya Görev Yöneticisinden tamamen kapatın**.
3. Kurulum dosyasına çift tıklayarak yükleyin. (Eski sürümün üzerine otomatik olarak saniyeler içinde kurulacaktır).
4. Masaüstüne gelen `MasaTakip` kısayoluna çift tıklayarak uygulamayı çalıştırın.

**2.2. Ağdaki Telefonlardan Bağlanma**
Electron uygulaması başlatıldığı an, arka planda API `http://*:5115` portundan yayına başlar.
Ana bilgisayarınızın yerel IP adresi `192.168.X.X` ise, aynı Wi-Fi ağına bağlı herhangi bir telefondan tarayıcıya:
`http://192.168.X.X:5115`
yazarak direkt olarak adisyon sistemine erişim sağlanabilir. 

*(İlk bağlantıda Windows Güvenlik Duvarı uyarı verirse, "Özel ve Ortak Ağlar" için izin ver demeyi unutmayın.)*

---

## 3. Otomasyon Scriptleri ve Yapılandırma Dosyaları

**3.1. Sunucu docker-compose.yml İçeriği (PostgreSQL Veritabanı İçin)**
Ana bilgisayarda veritabanı her zaman arka planda Docker üzerinden çalışmalıdır:
```yaml
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
```
