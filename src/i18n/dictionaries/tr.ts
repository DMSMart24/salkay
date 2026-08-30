import { routes, sections } from "@/lib/routes";
import type { Dictionary } from "@/i18n/types";

export const tr: Dictionary = {
  locale: "tr",
  ready: true,
  meta: {
    title: "SALKAY — Web Tasarım, Yazılım ve Dijital Büyüme",
    titleTemplate: "%s · SALKAY",
    description:
      "SALKAY, işletmeler için kurumsal web siteleri, özel yazılım çözümleri ve ölçülebilir dijital büyüme altyapısı geliştirir. Tasarlar, kurar, görünür kılar.",
    keywords: [
      "web tasarım",
      "kurumsal web tasarım",
      "web geliştirme",
      "yazılım geliştirme",
      "SEO",
      "Google Ads",
      "e-ticaret",
    ],
    ogTitle: "SALKAY — Bu site, teklifimizin ta kendisi.",
    ogDescription:
      "Premium web tasarımı, yazılımı ve büyüme sistemlerini tek bir dijital ekip altında birleştiririz. Ne yapabildiğimizi anlatmıyoruz — gösteriyoruz.",
  },
  nav: {
    skip: "İçeriğe geç",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    primaryCta: "Görüşme Planlayın",
    items: [
      { href: sections.services, label: "Hizmetler" },
      { href: routes.solutions, label: "Çözümler" },
      { href: sections.process, label: "Yaklaşımımız" },
      { href: sections.kay, label: "KAY" },
      { href: sections.contact, label: "İletişim" },
    ],
  },
  footer: {
    tagline:
      "Web tasarımın ötesinde: yazılım, büyüme ve markanızı canlı tutan bir dijital ekip.",
    services: "Hizmetler",
    company: "Kurum",
    insights: "İçgörüler",
    contact: "İletişim",
    legal: "Yasal",
    legalNote: "Yasal metinler ve şirket bilgileri yayına hazır olduğunda eklenecek.",
    domains: "Alan adları",
    social: "Sosyal",
    socialPending: "Hesap bağlantıları yakında eklenecek.",
    rights: "Tüm hakları saklıdır.",
  },
  home: {
    hero: {
      eyebrow: "İstanbul · Dijital Stüdyo",
      title: "Fikirlerinizi dijital güce dönüştürüyoruz.",
      titleBefore: "Fikirlerinizi",
      titleAccent: "dijital güce",
      titleAfter: "dönüştürüyoruz.",
      lead: "Web tasarımı, özel yazılım, yapay zekâ ve dijital büyüme. SALKAY ile fikrinizi güçlü bir dijital ürüne dönüştürün.",
      primaryCta: "Projenizi Konuşalım",
      secondaryCta: "Hizmetleri Gör",
      metaItems: ["Web", "Yazılım", "Yapay zekâ", "Dijital büyüme"],
      scrollCue: "Aşağı kaydırın",
    },
    marquee: [
      "WEB TASARIM",
      "UI/UX",
      "ÖZEL YAZILIM",
      "SEO",
      "GOOGLE ADS",
      "ANALYTİCS",
      "AI & OTOMASYON",
      "VİDEO İÇERİK",
      "SÜREKLİ DESTEK",
    ],
    bento: {
      eyebrow: "Ne yapıyoruz",
      title: "Güçlü bir dijital varlık, iyi tasarımla başlar.",
      titleBefore: "Güçlü bir dijital varlık, ",
      titleAccent: "iyi tasarımla",
      titleAfter: " başlar.",
      lead: "Web tasarımından özel yazılıma, yapay zekâdan dijital büyümeye kadar ihtiyacınız olan sistemi tek çatı altında kuruyoruz.",
      coreTag: "Çekirdek",
      coreTitle: "Web Tasarım & UI/UX",
      coreBody:
        "Markanızı yansıtan, hızlı, etkileyici ve dönüşüm odaklı dijital deneyimler. Şablon değil, size özel tasarlanmış bir sistem.",
      coreCta: "Detayları Gör",
      items: [
        {
          tag: "Sistem",
          title: "Özel Yazılım & Konfigüratörler",
          body: "İş süreçlerinize özel portallar, ürün konfigüratörleri ve web tabanlı sistemler geliştiriyoruz.",
        },
        {
          tag: "Görünürlük",
          title: "SEO & Arama Görünürlüğü",
          body: "Google'da daha görünür, teknik olarak güçlü ve sürdürülebilir büyümeye hazır bir altyapı kuruyoruz.",
        },
        {
          tag: "Reklam",
          title: "Google Ads & Dijital Reklam",
          body: "Doğru hedef kitleye ulaşan, ölçülebilir ve performans odaklı reklam kampanyaları yönetiyoruz.",
        },
        {
          tag: "Veri",
          title: "Trafik & Dönüşüm Analitiği",
          body: "Ziyaretçilerinizin davranışlarını ölçüyor, veriyi daha iyi kararlar ve daha yüksek dönüşüm için kullanıyoruz.",
        },
        {
          tag: "Otomasyon",
          title: "AI & Otomasyon",
          body: "Tekrarlayan işleri otomatikleştiren, süreçleri hızlandıran ve ekibinizin verimliliğini artıran yapay zekâ çözümleri geliştiriyoruz.",
        },
      ],
      wideTag: "İçerik & Destek",
      wideTitle: "Video İçerik, Reels & Sürekli Dijital Destek",
      wideBody:
        "Markanızı sosyal medyada canlandıran içerikler; yayından sonra da güncelleme ve büyüme desteği.",
    },
    kayStory: {
      ariaLabel: "SALKAY",
      eyebrow: "Fikirden Dijitale.",
      line: "Web · Yazılım · Yapay Zekâ · Büyüme",
      team: "Tek ekip.",
      process: "Tek süreç.",
      goal: "Tek hedef.",
      support: "İşinizi dijitalde ileri taşımak.",
    },
    homeContact: {
      eyebrow: "İletişim",
      title: "Projenizi anlatın, gerisini biz tasarlayalım.",
      body: "Web tasarım, yazılım veya büyümeyle ilgili bir fikriniz mi var? 24 saat içinde dönüş yapıyoruz.",
      locationLabel: "Merkez — İstanbul, Türkiye",
      mailLabel: "Mail — merhaba@salkay.com",
    },
    intro: {
      eyebrow: "SALKAY",
      statement:
        "SALKAY, işletmenin dijitalde nasıl durduğunu ve nasıl büyüdüğünü aynı masada tutan bir dijital stüdyodur. Güçlü bir web deneyimi kurar; bu deneyimi bulunabilir, ölçülebilir ve sürekli gelişen bir yapıya dönüştürürüz.",
      aside:
        "Ne müşteri sayısı ne ödül listesi. İşin kendisi konuşsun diye, burada yalnızca ne yaptığımızı anlatıyoruz.",
    },
    capabilities: {
      eyebrow: "Çalışma modeli",
      title: "Tasarlarız. Kurarız. Büyütürüz.",
      items: [
        {
          index: "01",
          model: "CREATE",
          title: "Tasarım & içerik",
          body: "Markanın dijitalde nasıl duracağını belirleriz. Arayüz, anlatı ve içerik aynı dilde konuşur.",
          points: ["Web tasarım", "Kurumsal kimlik", "İçerik ve video"],
        },
        {
          index: "02",
          model: "BUILD",
          title: "Web & yazılım",
          body: "Güzel duran bir vitrin değil; çalışan, hızlı ve genişleyebilir bir sistem inşa ederiz.",
          points: ["Web geliştirme", "Özel yazılım", "Konfigüratör & AI"],
        },
        {
          index: "03",
          model: "GROW",
          title: "SEO & performans",
          body: "Yayınlandığında iş bitmez. Bulunmayı, trafiği ve dönüşümü düzenli olarak iyileştiririz.",
          points: ["SEO", "Google Ads", "Analitik & ölçüm"],
        },
      ],
    },
    webFocus: {
      eyebrow: "Web tasarım",
      title: "İyi bir site yalnızca hoş durmaz.",
      body: "Görsel karar, iş kararıdır. Strateji, kullanım, hız, mobil deneyim, arama görünürlüğü ve ölçüm — bunlar ayrı işler değil, aynı sitenin katmanlarıdır.",
      points: [
        {
          title: "Strateji",
          body: "Kimin geldiği, ne aradığı ve hangi eylemin değerli olduğu netleşmeden tasarım başlamaz.",
        },
        {
          title: "Kullanım",
          body: "Sayfa yapısı sade, gezinti anlaşılır, mobil deneyim ikinci bir versiyon değil asıl yüzeydir.",
        },
        {
          title: "Performans",
          body: "Ağır, yavaş veya savruk bir site; ne kadar iyi görünürse görünsün iş üretmez.",
        },
        {
          title: "Dönüşüm",
          body: "Her önemli sayfanın bir işi vardır: aramak, yazmak, satın almak veya randevu bırakmak.",
        },
        {
          title: "SEO",
          body: "Teknik temel, başlık yapısı ve içerik mimarisi yayın gününden önce kurulur.",
        },
        {
          title: "Ölçüm",
          body: "Trafik, davranış ve dönüşüm izlenmezse site hakkında yalnızca tahmin yürütülür.",
        },
      ],
      canvasLabel: "Stüdyo kompozisyonu",
      canvasTitle: "Kurumsal web deneyimi",
      canvasMeta: "Tasarım · UX · Performans · SEO",
    },
    services: {
      eyebrow: "Hizmetler",
      title: "Web merkeze, büyüme yanına.",
      lead: "SALKAY her işi rastgele yapan bir ajans değildir. Çekirdek işimiz web tasarım ve geliştirmedir. Diğer yetenekler, bu temelin iş üretmesi içindir.",
      featured: [
        {
          title: "Web Tasarım",
          body: "Kurumsal siteler, yenileme ve satış odaklı sayfalar. Markaya uygun, sakin ve ikna edici arayüzler.",
          href: routes.services,
        },
        {
          title: "Web Development",
          body: "Hızlı, bakımı mümkün, genişleyebilir web altyapısı. Şablonun bittiği yerde başlarız.",
          href: routes.services,
        },
      ],
      list: [
        {
          index: "03",
          title: "Özel Yazılım",
          body: "Portallar, paneller ve işletmeye özel sistemler.",
          href: routes.services,
        },
        {
          index: "04",
          title: "SEO",
          body: "Teknik temel, içerik mimarisi ve arama görünürlüğü.",
          href: routes.services,
        },
        {
          index: "05",
          title: "Google Ads",
          body: "Arama ve performans kampanyalarıyla doğru talebi çekmek.",
          href: routes.services,
        },
        {
          index: "06",
          title: "Analitik",
          body: "Trafik, davranış, dönüşüm ve kampanya ölçümü.",
          href: routes.services,
        },
        {
          index: "07",
          title: "AI & Otomasyon",
          body: "İş akışına bağlı, abartısız yapay zekâ entegrasyonları.",
          href: routes.services,
        },
        {
          index: "08",
          title: "Konfigüratörler",
          body: "Ürün ve teklif süreçlerini sadeleştiren özel araçlar.",
          href: routes.services,
        },
        {
          index: "09",
          title: "Video & Creative",
          body: "Reels, tanıtım ve kampanya için net görsel anlatı.",
          href: routes.services,
        },
      ],
    },
    process: {
      eyebrow: "Süreç",
      title: "Fikirden canlı siteye.",
      steps: [
        {
          index: "01",
          title: "Keşif & Strateji",
          body: "Markanızı, hedeflerinizi ve rakiplerinizi analiz ediyoruz.",
        },
        {
          index: "02",
          title: "Tasarım & Marka Dünyası",
          body: "Renk, tipografi ve arayüzü sizin hikayenize göre kuruyoruz.",
        },
        {
          index: "03",
          title: "Geliştirme & Etkileşim",
          body: "Hızlı, duyarlı ve KAY gibi canlı detaylarla zenginleştirilmiş bir site kuruyoruz.",
        },
        {
          index: "04",
          title: "Büyüme & Optimizasyon",
          body: "SEO, reklam ve analitiklerle yayından sonra da büyümeye devam ediyoruz.",
        },
      ],
    },
    projects: {
      eyebrow: "Projeler",
      title: "Seçilmiş işler burada duracak.",
      lead: "Gerçek vaka çalışmaları eklendiğinde her kayıt; ihtiyaç, çözüm, tasarım, geliştirme, hizmetler ve — varsa — sonuçlarla okunacak.",
      disclaimer: "Aşağıdakiler yer tutucu sunumlardır. Gerçek müşteri adı, yorum veya performans rakamı içermez.",
      cta: "Proje yaklaşımını görün",
      items: [
        {
          sector: "Mimarlık & inşaat",
          title: "Kurumsal web yenileme",
          summary:
            "Ciddi bir hizmet markasının dijital yüzünü sadeleştirmek; proje sunumu, güven ve teklif alma yolunu netleştirmek.",
          status: "Yer tutucu sunum",
        },
        {
          sector: "Üretim",
          title: "Ürün konfigüratörü",
          summary:
            "Karmaşık ürün seçimini satılabilir bir deneyime çevirmek; teklif sürecini kısaltan özel bir araç.",
          status: "Yer tutucu sunum",
        },
        {
          sector: "Perakende",
          title: "Satış odaklı vitrin",
          summary:
            "Katalog, hikâye ve dönüşümün aynı dilde konuştuğu bir e-ticaret deneyimi.",
          status: "Yer tutucu sunum",
        },
      ],
    },
    growth: {
      eyebrow: "SEO & büyüme",
      title: "Yayınlamak başlangıçtır.",
      body: "Birçok site, yayına alındığı gün bırakılır. SALKAY bu çizgide durmaz. Görünürlük, talep ve ölçüm; tasarımın devamıdır.",
      items: [
        {
          title: "SEO",
          body: "Teknik sağlık, içerik yapısı ve arama niyetine göre sürekli iyileştirme.",
        },
        {
          title: "Google Ads",
          body: "Doğru aramaya, doğru sayfayla çıkmak. Harcamayı görünür kılmak.",
        },
        {
          title: "Analitik",
          body: "Kaynak, davranış ve dönüşümü aynı çerçevede okumak.",
        },
        {
          title: "Dönüşüm",
          body: "Formlar, yollar ve içerik — hangisinin işe yaradığını görmek ve düzeltmek.",
        },
        {
          title: "Süreklilik",
          body: "Küçük, düzenli iyileştirmeler. Bir kez yapılan site, büyüyen site değildir.",
        },
      ],
    },
    analytics: {
      eyebrow: "Analitik",
      title: "Görmeden yönetilmez.",
      body: "Trafiğin nereden geldiği, ziyaretçinin nerede durduğu ve hangi eylemin gerçekleştiği ölçülmeden dijital iş yönetilemez.",
      disclaimer: "Örnek görselleştirme. Gerçek müşteri verisi değildir.",
      metrics: [
        { label: "Oturum", value: "—", hint: "Kaynaklara göre" },
        { label: "Dönüşüm", value: "—", hint: "Hedef eylemler" },
        { label: "Kampanya", value: "—", hint: "Reklam performansı" },
      ],
      sources: [
        { label: "Organik arama", share: "42" },
        { label: "Ücretli arama", share: "27" },
        { label: "Doğrudan", share: "18" },
        { label: "Yönlendirme", share: "13" },
      ],
      points: [
        "Trafik kaynakları",
        "Ziyaretçi davranışı",
        "Dönüşüm takibi",
        "Kampanya performansı",
        "Search Console",
        "Düzenli raporlama",
      ],
    },
    software: {
      eyebrow: "Yazılım",
      title: "Sitenin bittiği yerde sistem başlar.",
      body: "Bazı işletmelerin bir vitrine değil; çalışan bir araca ihtiyacı vardır. SALKAY, web deneyiminin ötesinde özel yazılım da kurar.",
      items: [
        {
          title: "Müşteri portalları",
          body: "Teklif, sipariş veya proje takibini müşterinin önüne taşıyan yüzeyler.",
        },
        {
          title: "Paneller",
          body: "İç ekiplerin günlük işini sadeleştiren yönetilebilir arayüzler.",
        },
        {
          title: "Konfigüratörler",
          body: "Ürün, malzeme veya paket seçimini hatasız ve satılabilir hale getiren araçlar.",
        },
        {
          title: "Otomasyon",
          body: "Tekrarlayan işleri, ölçülebilir ve denetlenebilir akışlara bağlamak.",
        },
        {
          title: "API ve entegrasyon",
          body: "Mevcut sistemlerle konuşan, kopuk tablo ve e-postaya mahkûm olmayan yapılar.",
        },
        {
          title: "Özel uygulamalar",
          body: "Hazır yazılımın yetmediği noktada, işinize göre şekillenen çözümler.",
        },
      ],
    },
    cta: {
      title: "Yeni projenizi birlikte kuralım.",
      body: "Kurumsal bir site, bir yenileme veya özel bir yazılım. İhtiyacınızı dinleyerek net bir yol öneririz.",
      primary: "Projenizi Anlatın",
      secondary: "Hizmetlere göz atın",
    },
  },
  servicesPage: {
    title: "Hizmetler",
    description:
      "SALKAY hizmetleri: web tasarım, web geliştirme, özel yazılım, SEO, Google Ads, dijital pazarlama, analitik, yapay zekâ ve kreatif.",
    hero: {
      eyebrow: "SALKAY · Hizmetler",
      titleLine: "Dijitalde ihtiyacınız olan",
      titleBefore: "her şey, ",
      titleAccent: "tek sistemde.",
      lead: "Web tasarımından özel yazılıma, SEO'dan yapay zekâ ve otomasyona kadar markanızı dijitalde büyütecek çözümleri tek çatı altında sunuyoruz.",
      primaryCta: "Projenizi Konuşalım",
      secondaryCta: "Tüm Hizmetleri Keşfet",
    },
    approach: {
      eyebrow: "Yaklaşımımız",
      titleLine: "Sadece hizmet değil,",
      titleAfter: "birbirine bağlı bir sistem.",
      lead: "Güçlü bir dijital varlık tek bir hizmetle kurulmaz. Tasarım, teknoloji, görünürlük, veri ve otomasyonu birlikte düşünerek markanız için sürdürülebilir bir dijital altyapı oluşturuyoruz.",
      disciplines: [
        "Tasarım",
        "Teknoloji",
        "Görünürlük",
        "Veri",
        "Otomasyon",
      ],
    },
    experience: {
      eyebrow: "Dijital Deneyim",
      featureIndex: "01",
      featureLabel: "Web Tasarım",
      featureTitle: "Markanızın dijital yüzünü tasarlıyoruz.",
      featureBody:
        "Kurumsal web siteleri, landing page'ler ve dijital deneyimleri markanıza özel tasarlıyor; hız, kullanılabilirlik ve dönüşümü birlikte ele alıyoruz.",
      supportIndex: "02",
      supportTitle: "Web Development",
      supportBody:
        "Hızlı, güvenilir, bakımı kolay ve büyümeye hazır web altyapıları geliştiriyoruz.",
    },
    systems: {
      eyebrow: "Yazılım & Sistemler",
      title: "İşinize göre çalışan teknoloji.",
      items: [
        {
          index: "03",
          label: "Sistem",
          title: "Özel Yazılım",
          body: "Portallar, yönetim panelleri ve işletmenizin süreçlerine özel web uygulamaları.",
        },
        {
          index: "09",
          label: "Araç",
          title: "Konfigüratörler",
          body: "Ürün seçimi, fiyatlandırma ve teklif süreçlerini kolaylaştıran interaktif sistemler.",
        },
        {
          index: "08",
          label: "Otomasyon",
          title: "AI & Otomasyon",
          body: "Tekrarlayan işleri otomatikleştiren ve ekiplerin daha verimli çalışmasını sağlayan yapay zekâ çözümleri.",
        },
      ],
    },
    statement: {
      lines: [
        "Tasarım tek başına yetmez.",
        "Teknoloji tek başına yetmez.",
        "Büyüme tek başına yetmez.",
      ],
      closeBefore: "SALKAY bunları ",
      closeAccent: "tek bir dijital sistemde",
      closeAfter: " birleştirir.",
    },
    growth: {
      eyebrow: "Büyüme",
      titleLine1: "Görünür olun.",
      titleLine2: "Doğru kitleye ulaşın.",
      titleAccent: "Büyüyün.",
      items: [
        {
          index: "04",
          label: "Görünürlük",
          title: "SEO",
          body: "Teknik altyapı, içerik mimarisi ve arama görünürlüğünü birlikte geliştiriyoruz.",
        },
        {
          index: "05",
          label: "Reklam",
          title: "Google Ads",
          body: "Arama ve performans odaklı, ölçülebilir reklam kampanyaları yönetiyoruz.",
        },
        {
          index: "06",
          label: "Talep",
          title: "Dijital Pazarlama",
          body: "İçerik, görünürlük ve talep yaratmayı tek bir büyüme stratejisinde birleştiriyoruz.",
        },
      ],
    },
    data: {
      eyebrow: "Veri & Creative",
      titleBefore: "Ölçün. Anlayın. ",
      titleAfter: "Daha iyi anlatın.",
      items: [
        {
          index: "07",
          label: "Veri",
          title: "Analitik",
          body: "Trafik, kullanıcı davranışı, dönüşüm ve kampanya performansını ölçerek kararlarınızı gerçek verilerle destekliyoruz.",
        },
        {
          index: "10",
          label: "Anlatı",
          title: "Video & Creative",
          body: "Markanızı sosyal medya, reklam ve dijital kampanyalarda güçlü şekilde anlatan video ve kreatif içerikler üretiyoruz.",
        },
      ],
    },
    finale: {
      eyebrow: "Bir fikriniz mi var?",
      titleLine: "Birlikte dijitale",
      titleAfter: "dönüştürelim.",
      lead: "İhtiyacınız ister yeni bir web sitesi, ister özel bir yazılım, ister komple bir dijital büyüme sistemi olsun — doğru çözümü birlikte planlayalım.",
      primaryCta: "Projenizi Konuşalım",
      secondaryCta: "İletişime Geçin",
    },
  },
  projectsPage: {
    title: "Projeler",
    description: "SALKAY proje ve vaka çalışmaları. Seçilmiş işler burada yayınlanacak.",
    lead: "Vaka arşivi hazırlanıyor. Her proje; ihtiyaç, çözüm, tasarım, geliştirme ve sonuç katmanlarıyla belgelenecek.",
    architecture: [
      "İhtiyaç",
      "Çözüm",
      "Tasarım",
      "Geliştirme",
      "Hizmetler",
      "Görseller",
      "Sonuçlar",
      "Teknolojiler",
    ],
  },
  aboutPage: {
    title: "Hakkımızda",
    description: "SALKAY, web deneyimleri tasarlayan, yazılım kuran ve dijital büyümeyi ölçen bir stüdyodur.",
    lead: "SALKAY, web’i bir vitrin değil; iş üreten bir altyapı olarak kurar.",
    body: [
      "Markanın adı SAL ve KAY’in birleşimidir. Tek bir stüdyo, tek bir sorumluluk alanı: dijital deneyimi kurmak ve o deneyimin işe yaramasını sağlamak.",
      "Öncelikli işimiz web tasarım ve web geliştirmedir. Bunun yanına özel yazılım, SEO, performans pazarlaması ve analitik gelir — çünkü yayınlanmış bir site, tek başına bir strateji değildir.",
      "Kurumsal işletmeler, yenilenmesi gereken köklü markalar ve ilk ciddi dijital yüzünü kuran ekipler için sakin, net ve ölçülebilir iş üretiriz.",
    ],
  },
  blogPage: {
    title: "İçgörüler",
    description: "SALKAY içgörüleri: web tasarım, SEO, analitik ve dijital büyüme üzerine yazılar.",
    emptyTitle: "Yazılar yakında.",
    emptyBody:
      "Arama, dönüşüm ve web performansı üzerine düzenli, abartısız yazılar yayımlayacağız. Bu sayfa, içerik mimarisi hazır olduğunda dolacak.",
  },
  solutionsPage: {
    title: "Dijital Çözümler, AI & Özel Yazılım | SalKay",
    description:
      "SalKay; özel web siteleri, dijital platformlar, AI sistemleri, otomasyon, e-ticaret, entegrasyonlar ve işletmenize özel yazılım çözümleri tasarlar ve geliştirir.",
    breadcrumb: "Çözümler",
    hero: {
      eyebrow: "SALKAY / DİJİTAL ÇÖZÜMLER",
      line1: "Dijitalde",
      line2: "ihtiyacınız olan",
      accent: "her şey.",
      support:
        "Web'den özel yazılıma, yapay zekâdan otomasyona — işletmeniz için birbirine bağlı dijital deneyimler tasarlıyoruz.",
      primaryCta: "Çözümleri Keşfet",
      secondaryCta: "Projenizi Anlatın",
    },
    intro: {
      eyebrow: "NE ÜRETİYORUZ",
      title1: "Bir web sitesinden",
      title2: "çok daha fazlası.",
      body: "Markanızın ihtiyaç duyduğu dijital parçaları tek bir deneyimde bir araya getiriyoruz.",
      count: "05",
      countLabel: "ÇÖZÜM ALANI",
    },
    web: {
      index: "01",
      label: "WEB & DESIGN",
      title1: "Markanızın dijital yüzünü",
      title2: "sıfırdan tasarlıyoruz.",
      features: ["Kurumsal Web", "UI/UX", "Landing Pages", "Responsive", "SEO Altyapısı"],
      outcome: "Güçlü marka. Net deneyim. Her ekranda tutarlı görünüm.",
      site: {
        brand: "ATÖLYE",
        nav: ["Çalışmalar", "Yaklaşım", "İletişim"],
        headline: "Sessiz güç.",
        meta: "TR · DE · EN",
      },
    },
    platform: {
      index: "02",
      label: "PLATFORMLAR & PORTALLAR",
      title1: "Web sitesinin ötesine",
      title2: "geçiyoruz.",
      body: "Kullanıcıların giriş yaptığı, veri yönettiği ve işletmenizle doğrudan etkileşime geçtiği sistemler geliştirebiliriz.",
      features: ["Portal", "Dashboard", "Hesap", "Rezervasyon"],
      nav: ["Genel Bakış", "Projeler", "Belgeler", "Mesajlar", "Faturalar", "Ayarlar"],
      welcome: "Hoş geldiniz",
      metrics: [
        { value: "3", label: "Aktif işlem" },
        { value: "1", label: "Yeni mesaj" },
        { value: "2", label: "Bekleyen belge" },
      ],
      activity: "Son hareketler",
      outcome: "Müşterilerinizin gerçekten kullandığı bir dijital platform.",
    },
    ai: {
      index: "03",
      label: "AI & AKILLI SİSTEMLER",
      title1: "AI'ı işletmenizin",
      title2: "bir parçası haline getirin.",
      body: "Yalnızca konuşan asistanlar değil; talebi, önceliği ve sonraki adımı anlayan akıllı çözümler geliştirebiliriz.",
      heading: "Talep analizi",
      fields: [
        { label: "Konu", value: "Yeni proje" },
        { label: "Talep analizi", value: "Devam ediyor" },
        { label: "Öncelik", value: "Yüksek" },
        { label: "Eksik bilgiler", value: "1 alan" },
        { label: "Önerilen aksiyon", value: "Talebi tamamla" },
      ],
      action: "Sonraki adıma hazır",
      outcome: "Sadece cevap veren değil, iş sürecine dahil olan AI.",
    },
    automation: {
      index: "04",
      label: "AUTOMATION",
      title1: "Tekrarlayan işleri",
      title2: "sistemlere bırakın.",
      body: "Web sitenizi ve kullandığınız araçları bağlayarak tekrarlayan süreçleri otomatik akışlara dönüştürüyoruz.",
      flow: ["Yeni Talep", "CRM", "E-posta", "Ekip", "Takip"],
      nodes: ["CRM", "WhatsApp", "Mail", "Takvim", "Ödeme", "API"],
      outcome: "Daha az manuel işlem. Daha düzenli süreç.",
    },
    commerce: {
      index: "05",
      label: "COMMERCE",
      title1: "Satış yapan dijital",
      title2: "deneyimler tasarlıyoruz.",
      features: ["Mağaza", "Varyantlar", "Ödeme", "Hesap"],
      product: "Studio Plan",
      plan: "Profesyonel",
      variants: ["Aylık", "Yıllık", "Ekip"],
      totalLabel: "Toplam",
      total: "₺ —",
      pay: "Ödemeye geç",
      outcome: "Daha kolay satın alma. Daha güçlü dijital satış.",
    },
    bridge: {
      title1: "Tek tek araçlar değil.",
      title2: "Birlikte çalışan sistemler.",
    },
    outcomes: {
      headline1: "Teknoloji araçtır.",
      headline2: "Önemli olan ne kazandırdığıdır.",
      items: [
        {
          index: "01",
          title: "Daha iyi müşteri deneyimi",
          body: "İnsanların aradığını daha kolay bulduğu ve işlemlerini daha rahat tamamladığı dijital deneyimler.",
        },
        {
          index: "02",
          title: "Daha az manuel iş",
          body: "Tekrarlayan süreçleri otomasyonlarla destekleyen daha düzenli iş akışları.",
        },
        {
          index: "03",
          title: "Daha güçlü dijital altyapı",
          body: "İhtiyaçlarınız büyüdükçe geliştirilebilen ve yeni sistemlerle bağlanabilen yapılar.",
        },
        {
          index: "04",
          title: "Daha profesyonel marka",
          body: "İşletmenizin kalitesini dijital dünyada da hissettiren modern ve tutarlı bir deneyim.",
        },
      ],
    },
    cta: {
      eyebrow: "SALKAY / POSSIBILITY",
      title1: "Bir fikriniz varsa,",
      title2: "birlikte hayata geçirebiliriz.",
      punch1: "Fikir sizden.",
      punch2: "Teknoloji bizden.",
      primary: "Projenizi Anlatın",
      secondary: "Görüşme Planlayın",
    },
  },
  contactPage: {
    title: "İletişim",
    description: "SALKAY ile projenizi konuşun. Web tasarım, yazılım veya dijital büyüme için bize yazın.",
    lead: "Kısaca anlatın. İhtiyacı, mevcut durumu ve zamanlamanızı duymak yeterli. Uzun bir brifing beklemiyoruz.",
    pendingChannels: "E-posta, telefon ve WhatsApp bilgileri doğrulanınca burada yer alacak.",
    form: {
      name: "Ad Soyad",
      company: "Şirket (opsiyonel)",
      email: "E-posta",
      phone: "Telefon",
      service: "Proje Türü",
      servicePlaceholder: "Seçin",
      message: "Mesaj",
      submit: "Mesajı Gönder",
      required: "Zorunlu alan",
      unwired:
        "Talep formu henüz iletime açık değil. Altyapı bağlandığında mesajınız doğrudan bize ulaşacak.",
      services: [
        "Web Tasarım",
        "UI/UX",
        "Özel Yazılım",
        "SEO & Reklam",
        "Diğer",
      ],
    },
  },
  kay: {
    name: "KAY",
    role: "SALKAY marka karakteri",
    placeholder: "KAY · üretim görseli bekleniyor",
    hint: "Şeffaf WebP veya AVIF varlığı bu alana yerleşecek.",
  },
  notFound: {
    title: "Bu sayfa yok.",
    body: "Bağlantı eski olabilir veya adres yazımı farklıdır.",
    cta: "Ana sayfaya dön",
  },
};

export const serviceIndex = [
  {
    title: "Web Tasarım",
    href: sections.webDesign,
    body: "Kurumsal siteler, yenileme, landing page ve markaya uygun arayüz.",
  },
  {
    title: "Web Development",
    href: sections.services,
    body: "Hızlı, bakımı mümkün ve genişleyebilir web altyapısı.",
  },
  {
    title: "Özel Yazılım",
    href: sections.software,
    body: "Portallar, paneller ve işletmeye özel uygulamalar.",
  },
  {
    title: "SEO",
    href: sections.growth,
    body: "Teknik temel, içerik mimarisi ve arama görünürlüğü.",
  },
  {
    title: "Google Ads",
    href: sections.growth,
    body: "Arama ve performans odaklı kampanya yönetimi.",
  },
  {
    title: "Dijital Pazarlama",
    href: sections.growth,
    body: "Görünürlük, içerik ve talep yaratmayı aynı hatta tutmak.",
  },
  {
    title: "Analitik",
    href: sections.analytics,
    body: "Trafik, davranış, dönüşüm ve raporlama.",
  },
  {
    title: "AI & Otomasyon",
    href: sections.software,
    body: "İş akışına bağlı, abartısız entegrasyonlar.",
  },
  {
    title: "Konfigüratörler",
    href: sections.software,
    body: "Ürün ve teklif süreçlerini sadeleştiren özel araçlar.",
  },
  {
    title: "Video & Creative",
    href: routes.services,
    body: "Tanıtım, reels ve kampanya için net görsel anlatı.",
  },
];
