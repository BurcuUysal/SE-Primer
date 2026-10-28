# SE Primer: Yazılım Mühendisliği, Oynanan Bir Kitap

Hastane bilgi işlemde yaşanan bir krizi konu alan, telefonda oynanan seçimli hikâye oyunu. Oyuncu bir mühendislik kararı verir, uygulama sonucunu ve nedenini gösterir. AI tutor takılan oyuncuya cevabı söylemez, soru sorar. YZM301 ödevi.

## Bağlantılar

- **Uygulama (AI Studio):** [LİNKİ BURAYA YAPIŞTIR]
- **Demo video (60 sn):** [LİNKİ BURAYA YAPIŞTIR]

## Repo içeriği

| Dosya | Açıklama |
|---|---|
| `spec.md` | Problem, kapsam dışı, 5 kabul örneği, akış şeması |
| `DESIGN.md` + `design/` | Tasarım sistemi ve Stitch ekranları |
| `index.html` | Çalışan uygulama |
| `eval/` | Tutor değerlendirmesi: 20 cevap, hata türleri, oran |
| `cypress/` | E2E testleri |

## Senaryo

"08:00, randevu sistemi çöktü. Nöbetçi sensin." Üç karar (mimari, test, KVKK), iki son. Kurgusal hastane, sentetik isimler, gerçek hasta verisi yok.

## Yapmadığım 3 özellik

1. **Kullanıcı hesabı ve giriş:** [Tek cümle neden, ör. "Oyun 5 dakikalık bir deneyim, hesap açtırmak oyuncuyu oyundan caydırırdı ve gereksiz kişisel veri toplamak anlamına gelirdi."]
2. **Ek senaryolar ve ikinci bölüm:** [Tek cümle neden, ör. "Önce tek senaryonun tutor'unu ölçülebilir şekilde doğru çalıştırmak, içeriği çoğaltmaktan daha değerliydi."]
3. **Puan tablosu ve oyuncu sıralaması:** [Tek cümle neden, ör. "Amaç yarışma değil, kararların sonucunu anlamak; sıralama oyuncuyu doğru cevabı tahmin etmeye iter."]

## Tutor değerlendirmesi (özet)

[Adım 4 bitince doldur: 20 cevap, cevabı ele verme oranı, en sık hata türü, prompt değişikliği ve yeni oran]

## Test

[Adım 5 bitince doldur: Cypress'in nasıl çalıştırılacağı]