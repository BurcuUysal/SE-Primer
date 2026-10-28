
Mobil öncelikli (390×844 ve responsive), koyu tema varsayılan (Gece / Gündüz mod destekli). Görsel dil; lacivert zemin, canlı açık sarı / amber vurgu, iki semantik durum rengi (başarı / hata) ve acil sağlık bilişim terminolojisinden beslenir.

---

## 1. Renk Paleti ve Tema Değişkenleri

Uygulama CSS değişkenleri (`:root` ve `body.theme-light`) ile iki yönlü tam tema desteğine sahiptir.

| Rol | Gece Modu (Varsayılan) | Gündüz Modu | Kullanım & Açıklama |
|---|---|---|---|
| Dış Zemin | `#071129` | `#F5E6A3` | Viewport dış çerçeve dolgusu |
| Uygulama Zemin | `#0B1B3F` | `#FFF8CC` | Mobil konteyner ana arka planı |
| Yüzey (Kart) | `#14285A` | `#FFF0A3` | Sahne kartı, brifing kutusu, soru panelleri |
| Yüzey Vurgulu | `#1E3574` | `#FFE77D` | Tutor mesaj balonu, hover alanları |
| Kenarlık | `#2A3F73` | `#E8D066` | 1 px hairline kart ve ayırıcı kenarlıklar |
| Ana Metin | `#FFFFFF` | `#0B1B3F` | Başlıklar, kritik açıklamalar, yüksek kontrast |
| Soluk Metin | `#A9B6D3` | `#43547A` | İkincil metin, zaman damgaları, etiketler |
| Vurgu (Sarı/Amber) | `#FFE600` | `#0B1B3F` | Ana aksiyon butonları, aktif seçimler, sayaç |
| Başarı (Mint) | `#4ADE9A` | `#4ADE9A` | Doğru karar, Son A ekranı, TP kazanımı |
| Hata (Mercan) | `#FF6B5B` | `#FF6B5B` | Riskli karar, Son B ekranı, süre dolumu, uyarılar |

> **Erişilebilirlik:** Metin/zemin kontrastı minimum WCAG AA (4.5:1) standardını karşılar. Durumlar yalnızca renkle değil; ikon (`check_circle`, `warning`, `verified`), ses efekti ve metinle de desteklenir.

---

## 2. Tipografi ve İkonografi

- **Font Ailesi:** Inter (`sans-serif`, Google Fonts), monospace için `font-mono tabular-nums`.
- **İkon Seti:** Google Material Symbols Outlined (`opsz 20..48, wght 400..700`).
- **Tipografik Hiyerarşi:**
  - **Hero / Ekran Başlığı:** 24–28 px / 900 font-black, sıkı harf aralığı (`tracking-tight`).
  - **Sahne / Soru Başlığı:** 15–16 px / 800 font-extrabold, satır yüksekliği 1.4.
  - **Gövde & Açıklama:** 12–13 px / 400–500, satır yüksekliği 1.5–1.6, soluk metin (`#A9B6D3`).
  - **Seçenek Başlığı:** 13 px / 700 font-bold; Alt detay: 11 px / 400.
  - **Kategori & Üst Etiket (Kicker):** 10–11 px / 900 font-black, büyük harf, `tracking-widest`.
  - **Sayaç & Rozetler:** 10–12 px / font-mono font-bold.

---

## 3. Boşluk, Izgara ve Bileşen Geometrisi

- **Konteyner:** Mobil odaklı maksimum genişlik `max-w-[420px]`, min-h-screen, safe-area uyumlu (`pt-safe`, `pb-safe`).
- **Izgara:** 4 px / 8 px tabanlı dikey ritim. Ekran kenar boşluğu 16 px, kart içi dolgular 12–16 px.
- **Köşe Yarıçapı (Border Radius):**
  - Kartlar ve paneller: `rounded-2xl` (16 px)
  - Butonlar ve seçenekler: `rounded-xl` (12–14 px)
  - Rozetler, sayaç ve etiketler: `rounded-full` (999 px)
- **Dokunma Hedefleri:** Tüm interaktif butonlar minimum 46–52 px dokunma yüksekliğine sahiptir (`min-h-[46px]`, `min-h-[52px]`).
- **Derinlik & Vurgu:** Yüzey ayrımı 1 px hairline kenarlık (`#2A3F73`) ve odaklı parlama gölgeleri (`shadow-glow-yellow`, `shadow-glow-mint`, `shadow-glow-mercan`) ile sağlanır.

---

## 4. Bileşen Mimarisi

- **Üst Başlık (Header):**
  - Kriz durumu nabız ikonu ve "SE PRIMER · 08:00" kriz odası logosu.
  - Hızlı kontroller: Gece/Gündüz Modu butonu (`themeToggleBtn`), Ses Aç/Kapat butonu (`soundToggleBtn`) ve Gemini API durum butonu (`apiKeyToggleBtn`).
- **Hareketli Nabız Hattı (EKG SVG):** Giriş kartında `ekgPulse` CSS keyframe animasyonuyla akan sarı EKG çizgisi.
- **Profil Seçim Kartları:** 1 (Seviye), 2 (Rol), 3 (Hedef) seçimleri için dokunulduğunda sarı çerçeve ve `check_circle` ikonu alan radio butonları. Eksik bırakıldığında mercan çerçeve ve hata mesajı uyarısı.
- **Seçenek Kartları (A / B):**
  - Sol tarafta kare harf etiketi (`A` / `B`), başlık ve teknik alt açıklama.
  - Seçim yapıldığında doğru seçenek mint, yanlış seçenek mercan çerçeve alır; zıt seçenek opasiteyi %40'a düşürerek kilitlenir.
- **Sonuç Paneli ("Ne Oldu / Neden Oldu"):**
  - Seçim yapıldığı veya 60 sn süre dolduğu an açılır.
  - Sol tarafında renkli durum şeridi (mint/mercan), durum ikonu, +100 TP / 0 TP rozeti.
  - "Ne oldu?" ve "Neden oldu?" ayrılmış iki teknik gerekçe kutusu ve "Sonraki Karara Geç" butonu.
- **Zamanlayıcı (Timer):** "Deneyimliyim" seviyesinde sağ üstte 60 saniyelik dairesel SVG halka sayaç. Son 10 saniyede mercan rengine döner, yanıp söner ve sesli tik sesi üretir.
- **İpucu Butonu:** "Yeni başladım" seviyesinde sağ üstte ampul ikonu. Tıklandığında açılır-kapanır sarı çerçeveli mühendislik ipucu kutusu gösterir.
- **Sokratik AI Tutor Bölümü:**
  - Gemini API tabanlı akıllı kriz rehberi.
  - Canlı konuşma akışı (kullanıcı sarı baloncuk "Sen", tutor koyu baloncuk "AI Tutor").
  - Anlık hızlı soru önerisi çipleri (tek tıkla soru sorma).
  - Üç noktalı yanıp sönen "Düşünüyor..." yükleme göstergesi.
  - Tek satırlık soru giriş alanı ve gönder butonu.

---

## 5. Web Audio API Ses Motoru

Tarayıcı tabanlı sıfır-bağımlılıkla gerçek zamanlı sentezlenen ses efektleri:
- **Click:** 600 Hz üçgen dalga, 60 ms.
- **Correct (Doğru Karar):** 523 Hz -> 659 Hz -> 784 Hz yükselen majör arpej.
- **Wrong (Hata / Süre Dolumu):** 220 Hz -> 180 Hz alçalan testere dişi (sawtooth) ton.
- **Tick (Son 10 sn):** 880 Hz kısa sinüs tik sesi.
- **Fanfare (Son A Zaferi):** 4 notalı zafer akoru (C5, E5, G5, C6).

---

## 6. Ekran Akışları

1. **Giriş Ekranı (Giris):** Kriz başlığı, EKG nabzı, v2.4.0 etiketi, zorunlu 3 profil sorusu, validasyon kontrolü, "Kriz Odasına Giriş Yap" butonu.
2. **Kriz Brifingi Ekranı (Kriz):** P0 çöküş bandı, INC-9102 vaka kartı, seçilen role (Geliştirici/QA/Yönetici) göre kişiselleştirilmiş 08:00 senaryo metni, 300+ hasta kuyruk ve <15 dk SLA sayaçları, "Operasyonu Başlat" butonu.
3. **Karar Ekranları (Karar 1 / Karar 2 / Karar 3):**
   - **Karar 1 (08:05 · Mimari):** Rollback (A) vs Canlıda yama (B).
   - **Karar 2 (08:12 · Test):** 60 sn Smoke test (A) vs Hemen yayına alma (B).
   - **Karar 3 (08:18 · KVKK):** Logdaki kimlikleri maskeleme (A) vs Ham paylaşma (B).
   - Seçenek sonrası açılan Ne oldu / Neden oldu paneli ve entegre AI Tutor sohbeti.
4. **Son A Ekranı (3/3 Doğru - Kusursuz Operasyon):** 3/3 başarı rozeti, konfeti canvas patlaması, zafer fanfarı, uygulanan 3 kararın doğrulama kontrol listesi, temel mühendislik prensibi, "Simülasyonu Tekrar Oyna" butonu.
5. **Son B Ekranı (Riskli Karar / Süre Dolumu):** Hata sayısı rozeti, hata sesi, hatalı kararların teknik analiz dökümü, KVKK/kesinti post-mortem dersi, "Ders Al ve Tekrar Oyna" butonu.

---

## 7. Sistem Durumları (State Matrix)

| Durum | Tetikleyici | UI & Ses Davranışı |
|---|---|---|
| **Eksik Profil** | Giriş ekranında seçim yapmadan başlama | İlgili soru kutusu mercan çerçeve alır, hata metni açılır, hata sesi çalar. |
| **Seçim Yapıldı** | A veya B butonuna tıklama | Butonlar kilitlenir, seçilen kart renklenir, zıt kart soluklaşır, sonuç paneli animasyonla açılır, doğru/yanlış sesi çalar. |
| **Süre Dolumu** | 60 sn sayacın 0'a inmesi | Karar otomatik 'TIMEOUT' olarak işaretlenir, mercan uyarı ve hata sesi verilir, sonuç paneli açılır. |
| **Tutor Soru Sorma** | Sohbet formundan mesaj iletme | Kullanıcı mesajı sohbet akışına eklenir, "Düşünüyor..." animasyonu belirir, Gemini yanıtı gelince başarı sesiyle akışa eklenir ve alta kayar. |
| **Tema Değişimi** | Üst bardaki tema ikonuna tıklama | Gövdeye `.theme-light` sınıfı eklenir/kaldırılır, ikon `light_mode` <-> `dark_mode` değişir, renkler anında güncellenir. |
| **Ses Aç/Kapat** | Üst bardaki ses ikonuna tıklama | Ses motoru pasifize edilir/açılır, ikon opaklığı ve durumu güncellenir. |

---

## 8. Yapılmayacaklar (Non-Goals)

- Gerçek hasta kimlik verisi veya gerçek fotoğraf kullanılmaz (KVKK uyumu).
- Kullanıcı giriş/kayıt (auth) duvarı konulmaz; simülasyon doğrudan başlar.
- Harici kütüphane bağımlılığı olan ağır ses dosyaları (mp3/wav) indirilmez; Web Audio API sentezleyicisi kullanılır.
- Masaüstü çok sütunlu karmaşık düzen kullanılmaz; mobil odaklı dikey kriz terminali korunur.
- AI Tutor asla hangi seçeneğin doğru olduğunu ima etmez; yalnızca oyuncunun hangi bilgiyi ve metriği kontrol edeceğini soran en fazla 25 kelimelik Sokratik sorular yöneltir.
