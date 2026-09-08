import type { RestaurantLeadPriority, RestaurantWebsiteStatus } from "@prisma/client";
import {
  applyRestaurantLeadStatusRules,
  normalizeLeadKey,
  sanitizeRestaurantLeadWrite,
  type RestaurantLeadWriteInput,
} from "../src/lib/admin/restaurant-leads";

export const AVRUPA_IMPORT_SOURCE = "Avrupa Yakası verified research 2026-09-03";
export const AVRUPA_DATE_CHECKED = "2026-09-03";

export const AVRUPA_DISTRICTS = [
  "Avcılar",
  "Bahçelievler",
  "Bakırköy",
  "Beylikdüzü",
  "Beyoğlu",
  "Beşiktaş",
  "Büyükçekmece",
  "Eyüpsultan",
  "Fatih",
  "Kağıthane",
  "Küçükçekmece",
  "Sarıyer",
  "Zeytinburnu",
  "Şişli",
] as const;

type ProblemSet = {
  problem1?: string;
  problem2?: string;
  problem3?: string;
  websiteAnalysis?: string;
};

type AvrupaSeed = {
  restaurantName: string;
  district: string;
  websiteStatus: RestaurantWebsiteStatus;
  websiteScore?: number;
  leadScore?: number;
  priority: RestaurantLeadPriority;
  website?: string;
  publicEmail?: string;
  outreachNotes?: string;
};

const PROBLEMS: Record<string, ProblemSet> = {
  "Kebapçı Bedri Usta|Beyoğlu": {
    problem1: "Site maintenance mode",
    problem2: "Kullanılabilir restoran sitesi yok",
    websiteAnalysis: "kebapcibedriusta.com açılıyor; bakım/maintenance sayfası. Kullanılabilir restoran sitesi yok.",
  },
  "Shishly Cafe & Bistro|Şişli": {
    problem1: '"deneme" placeholder',
    problem2: "Tekrarlanan Restaurant template içerikleri",
    problem3: "Eski ©2022 sunumu",
    websiteAnalysis: "bistroshishly.com üzerinde deneme placeholder, tekrarlayan template blokları ve eski 2022 sunumu görünüyor.",
  },
  "Meygüsar Ocakbaşı|Bakırköy": {
    problem1: "Generic/template içerik",
    problem2: '"Bir dünya dolusu olanak" gibi işletmeye özgü olmayan metin',
    websiteAnalysis: "meygusar.com generic/template metin kullanıyor; işletmeye özgü olmayan sloganlar görünüyor.",
  },
  "Filika Sarıyer|Sarıyer": {
    problem1: '"subtitle text" placeholder',
    problem2: "Service 1–9 placeholder içerikleri",
    problem3: 'Rezervasyon formunda "To * / End time here"',
    websiteAnalysis: "filikasariyer.com placeholder alt başlık, Service 1–9 ve yarım rezervasyon formu gösteriyor.",
  },
  "Albatros Restaurant|Büyükçekmece": {
    problem1: "Domain hosting/default page gösteriyor",
    problem2: "Gerçek restoran sitesi kullanılamıyor",
    websiteAnalysis: "albatrosrestaurant.net hosting/default sayfa; gerçek restoran sitesi kullanılamıyor.",
  },
  "Mihmandar 1505|Eyüpsultan": {
    problem1: "siteadi.com template kalıntısı",
    problem2: "Restoranla ilgisiz aydınlatma sistemi metni",
    problem3: "Kuruluş/tecrübe anlatısında tutarsızlık",
    websiteAnalysis: "mihmandar1505.com.tr template kalıntısı (siteadi.com), restoranla ilgisiz aydınlatma metni ve tutarsız kuruluş anlatısı içeriyor.",
  },
  "Basri Baba İstanbul|Zeytinburnu": {
    problem1: "Eski .php ve yeni sayfalar birlikte",
    problem2: "John Doe / Julia Smith / Alex Ross template testimonials",
    problem3: "Eski rezervasyon/template kalıntıları",
    websiteAnalysis: "basribaba.com.tr eski .php ile yeni sayfaları birlikte sunuyor; John Doe/Julia Smith/Alex Ross template yorumları duruyor.",
  },
  "Fülane Restaurant|Fatih": {
    problem1: "Görünür İngilizce yazım hataları",
    problem2: '"Deliciously Expeience"',
    problem3: '"michalin stars chief"',
    websiteAnalysis: "fulanerestaurant.com görünür İngilizce yazım hataları içeriyor (Deliciously Expeience, michalin stars chief).",
  },
  "Babel Ocakbaşı Nevizade|Beyoğlu": {
    problem1: "Generic testimonial içerikleri",
    problem2: '"Photo 1" galeri kalıntıları',
    problem3: '"İstanbull" yazım hatası',
    websiteAnalysis: "babelocakbasi.com generic testimonial, Photo 1 galeri kalıntısı ve İstanbull yazım hatası içeriyor.",
  },
  "Urfam Sur Ocakbaşı|Şişli": {
    problem1: '"YENİLENİYORUZ" / coming-soon mesajı',
    problem2: "Eski içerik aynı anda yayında",
    problem3: "Görünür dil/yazım hataları",
    websiteAnalysis: "urfamsur.com.tr coming-soon/yenileniyoruz mesajı ile eski içeriği aynı anda gösteriyor; yazım hataları görünür.",
  },
  "Hasan Ustam Ocakbaşı|Beyoğlu": {
    problem1: "Görünür yazım hataları",
    problem2: "Restoran ölçeğiyle uyuşmayan sayaçlar",
    problem3: "Zayıf kalite kontrol",
    websiteAnalysis: "hasanustamocakbasi.com yazım hataları ve restoran ölçeğiyle uyuşmayan sayaçlar içeriyor.",
  },
  "Taksim Akcanlar Ocakbaşı 1975|Şişli": {
    problem1: "İsviçre template adresi",
    problem2: "0₺ menü ürünleri",
    problem3: "Template/QA eksiklikleri",
    websiteAnalysis: "akcanlarocakbasi1975.com İsviçre template adresi, 0₺ menü ürünleri ve template QA eksikleri içeriyor.",
  },
  "Ortaklar Kebap Restaurant|Fatih": {
    problem1: "Restoranla ilgisiz web-programlama template metni",
    problem2: "Hizmet içeriklerinin yanlış/tekrarlı olması",
    problem3: "Çok güçlü işletmeye göre düşük web QA",
    websiteAnalysis: "ortaklarkebaprestaurant.com restoranla ilgisiz web-programlama template metni ve tekrarlı/yanlış hizmet içerikleri gösteriyor.",
  },
  "Rakofoli Restaurant|Beyoğlu": {
    problem1: "\"Danny's\" template kalıntısı",
    problem2: "00 40 555 1234 placeholder telefon",
    problem3: "Dolar fiyatlı/Lorem ipsum yabancı template menü",
    websiteAnalysis: "rakofoli.com Danny's template kalıntısı, placeholder telefon ve dolar/Lorem ipsum menü içeriyor.",
  },
  "Hayri Usta Ocakbaşı Beyoğlu|Beyoğlu": {
    problem1: 'Domain yalnızca "coming soon"',
    problem2: "Kullanılabilir restoran sitesi yok",
    websiteAnalysis: "hayriusta.com yalnızca coming soon; kullanılabilir restoran sitesi yok.",
  },
};

const SEEDS: AvrupaSeed[] = [
  { restaurantName: "Kebapçı Bedri Usta", district: "Beyoğlu", websiteStatus: "VERY_WEAK", websiteScore: 1.7, leadScore: 9.1, priority: "HIGH", website: "kebapcibedriusta.com" },
  { restaurantName: "Tarihi Cumhuriyet Meyhanesi", district: "Beyoğlu", websiteStatus: "WEAK", websiteScore: 3.7, leadScore: 8.5, priority: "HIGH", website: "tarihicumhuriyetmeyhanesi.com.tr" },
  { restaurantName: "Semt Ocakbaşı", district: "Beşiktaş", websiteStatus: "NO_WEBSITE", leadScore: 8.8, priority: "HIGH" },
  { restaurantName: "Çarşı Balık Restoran", district: "Beşiktaş", websiteStatus: "NO_WEBSITE", leadScore: 8.5, priority: "HIGH" },
  { restaurantName: "Shishly Cafe & Bistro", district: "Şişli", websiteStatus: "WEAK", websiteScore: 3.0, leadScore: 8.7, priority: "HIGH", website: "bistroshishly.com", publicEmail: "info@bistroshishly.com" },
  { restaurantName: "Restohan Kebap Bomonti", district: "Şişli", websiteStatus: "WEAK", websiteScore: 4.2, leadScore: 8.1, priority: "HIGH", website: "restohankebap.com" },
  { restaurantName: "Resto Lordom Bomonti", district: "Şişli", websiteStatus: "IMPROVABLE", websiteScore: 5.0, leadScore: 7.5, priority: "MEDIUM", website: "restolordom.com", publicEmail: "lordomrestaurant@gmail.com" },
  { restaurantName: "PEPO Restaurant and Bar", district: "Beyoğlu", websiteStatus: "VERY_WEAK", websiteScore: 2.0, leadScore: 8.8, priority: "HIGH", website: "peporestaurant.com" },
  { restaurantName: "Emek Saray Restaurant", district: "Fatih", websiteStatus: "NO_WEBSITE", leadScore: 9.0, priority: "HIGH" },
  { restaurantName: "Galata Kitchen", district: "Beyoğlu", websiteStatus: "NO_WEBSITE", leadScore: 8.9, priority: "HIGH" },
  { restaurantName: "Meygüsar Ocakbaşı", district: "Bakırköy", websiteStatus: "WEAK", websiteScore: 3.4, leadScore: 8.6, priority: "HIGH", website: "meygusar.com", publicEmail: "meygusarocakbasi@gmail.com" },
  { restaurantName: "Bakırköy Aile Ocakbaşı", district: "Bakırköy", websiteStatus: "NO_WEBSITE", leadScore: 8.7, priority: "HIGH" },
  { restaurantName: "Yeşilköy Balıkçısı", district: "Bakırköy", websiteStatus: "WEAK", websiteScore: 3.7, leadScore: 8.4, priority: "HIGH", website: "yesilkoybalikcisi.com.tr", publicEmail: "info@yesilkoybalikcisi.com.tr" },
  { restaurantName: "Nihat Balık Restoran", district: "Bakırköy", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Eskiev Balık Lokantası", district: "Bakırköy", websiteStatus: "NO_WEBSITE", leadScore: 8.5, priority: "HIGH" },
  { restaurantName: "Bakırköy Balık Evi", district: "Bakırköy", websiteStatus: "NO_WEBSITE", leadScore: 8.3, priority: "HIGH" },
  { restaurantName: "Gaziantep Ocakbaşı", district: "Sarıyer", websiteStatus: "NO_WEBSITE", leadScore: 8.9, priority: "HIGH" },
  { restaurantName: "Urfam / Öz Urfam Ocakbaşı Rumelihisarı", district: "Sarıyer", websiteStatus: "NO_WEBSITE", leadScore: 8.4, priority: "HIGH" },
  { restaurantName: "Beyoğlu Ocakbaşı", district: "Beyoğlu", websiteStatus: "NO_WEBSITE", leadScore: 9.3, priority: "HIGH" },
  { restaurantName: "Kevok Ocakbaşı", district: "Beyoğlu", websiteStatus: "NO_WEBSITE", leadScore: 9.0, priority: "HIGH" },
  { restaurantName: "Adana Ocakbaşı Nişantaşı", district: "Şişli", websiteStatus: "GOOD", websiteScore: 7.0, priority: "QUALIFIED_OUT", website: "adanaocakbasi.com.tr" },
  { restaurantName: "Sur Ocakbaşı", district: "Fatih", websiteStatus: "IMPROVABLE", websiteScore: 5.0, leadScore: 7.5, priority: "MEDIUM", website: "surocakbasi.com" },
  { restaurantName: "Meyhane Istanbul", district: "Beyoğlu", websiteStatus: "WEAK", websiteScore: 3.8, leadScore: 8.2, priority: "HIGH", website: "meyhaneistanbul.com", publicEmail: "info@meyhaneistanbul.com" },
  { restaurantName: "Beşiktaş Olta Balık", district: "Beşiktaş", websiteStatus: "NO_WEBSITE", leadScore: 8.5, priority: "HIGH" },
  { restaurantName: "Mahal Meze & Meyhane", district: "Beşiktaş", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Bakar Ocakbaşı", district: "Sarıyer", websiteStatus: "NO_WEBSITE", leadScore: 8.6, priority: "HIGH" },
  { restaurantName: "Filika Sarıyer", district: "Sarıyer", websiteStatus: "WEAK", websiteScore: 3.8, leadScore: 8.3, priority: "HIGH", website: "filikasariyer.com", publicEmail: "info@filikasariyer.com" },
  { restaurantName: "By Balıkçı Büyükdere", district: "Sarıyer", websiteStatus: "NO_WEBSITE", leadScore: 8.7, priority: "HIGH" },
  { restaurantName: "Mayna Balık Restoran", district: "Sarıyer", websiteStatus: "GOOD", websiteScore: 7.5, priority: "QUALIFIED_OUT", website: "maynabalik.com", publicEmail: "bilgi@maynabalik.com" },
  { restaurantName: "Lezzet Diyarı", district: "Kağıthane", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Park Ocakbaşı", district: "Kağıthane", websiteStatus: "NO_WEBSITE", leadScore: 8.1, priority: "HIGH" },
  { restaurantName: "URFAM KEBAP OCAKBAŞI Seyrantepe", district: "Kağıthane", websiteStatus: "NOT_VERIFIED", priority: "PENDING", outreachNotes: "WRONG_BRANCH_DOMAIN_RISK" },
  { restaurantName: "Erzincanlı Coşkun Balık", district: "Küçükçekmece", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Köyüm Ocakbaşı Restaurant", district: "Küçükçekmece", websiteStatus: "NO_WEBSITE", leadScore: 8.0, priority: "HIGH" },
  { restaurantName: "Karadeniz Balık Evi – Reyhan Cd. 106", district: "Küçükçekmece", websiteStatus: "NOT_VERIFIED", priority: "PENDING", outreachNotes: "BRANCH_IDENTITY_CONFLICT" },
  { restaurantName: "Suruç Ocakbaşı Kanarya", district: "Küçükçekmece", websiteStatus: "NO_WEBSITE", leadScore: 7.6, priority: "MEDIUM" },
  { restaurantName: "İllaki Yeni Nesil Meyhane", district: "Beylikdüzü", websiteStatus: "IMPROVABLE", websiteScore: 5.2, leadScore: 7.6, priority: "MEDIUM", website: "illakimeyhane.com", publicEmail: "info@illakimeyhane.com" },
  { restaurantName: "Bi Dünya Meyhane", district: "Beylikdüzü", websiteStatus: "NOT_VERIFIED", priority: "PENDING", outreachNotes: "CONFLICTING_WEBSITE_DOMAINS" },
  { restaurantName: "Biçare Meyhane", district: "Beylikdüzü", websiteStatus: "NO_WEBSITE", leadScore: 8.6, priority: "HIGH" },
  { restaurantName: "Beybaba Ocakbaşı", district: "Beylikdüzü", websiteStatus: "NO_WEBSITE", leadScore: 8.4, priority: "HIGH" },
  { restaurantName: "İskele Restaurant", district: "Büyükçekmece", websiteStatus: "IMPROVABLE", websiteScore: 5.2, leadScore: 7.5, priority: "MEDIUM", website: "iskelerestaurant.com.tr", publicEmail: "info@iskelerestaurant.com.tr" },
  { restaurantName: "Albatros Restaurant", district: "Büyükçekmece", websiteStatus: "VERY_WEAK", websiteScore: 1.5, leadScore: 9.1, priority: "HIGH", website: "albatrosrestaurant.net" },
  { restaurantName: "Balık Osman", district: "Büyükçekmece", websiteStatus: "GOOD", websiteScore: 7.0, priority: "QUALIFIED_OUT", website: "balikosman.com.tr" },
  { restaurantName: "Kalikratya Balık Mimarsinan", district: "Büyükçekmece", websiteStatus: "NO_WEBSITE", leadScore: 8.9, priority: "HIGH" },
  { restaurantName: "Mastika Balık Restaurant", district: "Büyükçekmece", websiteStatus: "NO_WEBSITE", leadScore: 9.0, priority: "HIGH" },
  { restaurantName: "Lokanta Safderun Feshane", district: "Eyüpsultan", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Tarihi Meşhur Eyüp Sultan Güveççisi", district: "Eyüpsultan", websiteStatus: "WEAK", websiteScore: 3.9, leadScore: 8.3, priority: "HIGH", website: "tarihiguvecci.com" },
  { restaurantName: "Mihmandar 1505", district: "Eyüpsultan", websiteStatus: "WEAK", websiteScore: 3.2, leadScore: 8.8, priority: "HIGH", website: "mihmandar1505.com.tr", publicEmail: "info@mihmandar1505.com.tr" },
  { restaurantName: "Tarihi Tokat Pidecisi & Tokat Kebabı", district: "Eyüpsultan", websiteStatus: "NO_WEBSITE", leadScore: 8.9, priority: "HIGH" },
  { restaurantName: "Ziyade Balık", district: "Avcılar", websiteStatus: "NO_WEBSITE", leadScore: 9.0, priority: "HIGH" },
  { restaurantName: "Avni Baba Meyhanesi", district: "Avcılar", websiteStatus: "IMPROVABLE", websiteScore: 5.3, leadScore: 7.4, priority: "MEDIUM", website: "avnibabaninyeri.com" },
  { restaurantName: "Öz Suruç Memoli Kebap", district: "Bahçelievler", websiteStatus: "VERY_WEAK", websiteScore: 2.4, leadScore: 8.9, priority: "HIGH", website: "ozsurucmemolikebap.com" },
  { restaurantName: "01 Baran Ocakbaşı", district: "Bahçelievler", websiteStatus: "VERY_WEAK", websiteScore: 2.6, leadScore: 8.2, priority: "HIGH", website: "01baranocakbasi.pro" },
  { restaurantName: "Dergah Kebap", district: "Zeytinburnu", websiteStatus: "NO_WEBSITE", leadScore: 8.6, priority: "HIGH" },
  { restaurantName: "KEBBABİ KEBAP", district: "Zeytinburnu", websiteStatus: "IMPROVABLE", websiteScore: 5.3, leadScore: 6.9, priority: "MEDIUM", website: "kebbabi.com.tr", publicEmail: "info@kebbabi.com.tr" },
  { restaurantName: "Dürümcü Engin Usta", district: "Zeytinburnu", websiteStatus: "NO_WEBSITE", leadScore: 9.0, priority: "HIGH" },
  { restaurantName: "Tanrıverdi Kebap", district: "Zeytinburnu", websiteStatus: "NO_WEBSITE", leadScore: 8.3, priority: "HIGH" },
  { restaurantName: "Lider Suruç Ocakbaşı", district: "Bahçelievler", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Basri Baba İstanbul", district: "Zeytinburnu", websiteStatus: "WEAK", websiteScore: 3.3, leadScore: 8.9, priority: "HIGH", website: "basribaba.com.tr", publicEmail: "admin@basribaba.com.tr" },
  { restaurantName: "Ali Haydar Usta Bahçelievler", district: "Bahçelievler", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Sini Et Balık", district: "Küçükçekmece", websiteStatus: "WEAK", websiteScore: 3.4, leadScore: 8.2, priority: "HIGH", website: "sinietbalik.com", publicEmail: "info@sinietbalik.com" },
  { restaurantName: "Mangalbaşı Restaurant", district: "Büyükçekmece", websiteStatus: "NO_WEBSITE", leadScore: 8.7, priority: "HIGH" },
  { restaurantName: "İstanbul Balık 34", district: "Büyükçekmece", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Alaçatı Et & Balık", district: "Büyükçekmece", websiteStatus: "GOOD", websiteScore: 7.2, priority: "QUALIFIED_OUT", website: "alacatietbalik.com" },
  { restaurantName: "Evita Mangalbaşı", district: "Avcılar", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Cumbalım Meyhane", district: "Beylikdüzü", websiteStatus: "NO_WEBSITE", leadScore: 8.7, priority: "HIGH" },
  { restaurantName: "Muhabbet Ocakbaşı", district: "Beylikdüzü", websiteStatus: "IMPROVABLE", websiteScore: 5.0, leadScore: 7.8, priority: "HIGH", website: "muhabbetocakbasi.com.tr", outreachNotes: "PHONE_DATA_CONFLICT" },
  { restaurantName: "Pargalı Rum Meyhanesi", district: "Beylikdüzü", websiteStatus: "NO_WEBSITE", leadScore: 8.6, priority: "HIGH" },
  { restaurantName: "Meraki (Meze - Rakı) Restoran", district: "Beylikdüzü", websiteStatus: "NO_WEBSITE", leadScore: 8.2, priority: "HIGH" },
  { restaurantName: "Saklı Deniz Restaurant", district: "Beylikdüzü", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Fülane Restaurant", district: "Fatih", websiteStatus: "WEAK", websiteScore: 3.3, leadScore: 8.8, priority: "HIGH", website: "fulanerestaurant.com" },
  { restaurantName: "Seher Restaurant", district: "Fatih", websiteStatus: "IMPROVABLE", websiteScore: 5.7, leadScore: 6.6, priority: "MEDIUM", website: "seherrestaurant.com", publicEmail: "info@seherrestaurant.com" },
  { restaurantName: "Babel Ocakbaşı Nevizade", district: "Beyoğlu", websiteStatus: "WEAK", websiteScore: 3.5, leadScore: 8.4, priority: "HIGH", website: "babelocakbasi.com" },
  { restaurantName: "Bilice Kebap", district: "Beyoğlu", websiteStatus: "NO_WEBSITE", leadScore: 9.2, priority: "HIGH" },
  { restaurantName: "Fıccın Restoran", district: "Beyoğlu", websiteStatus: "IMPROVABLE", websiteScore: 5.8, leadScore: 6.8, priority: "MEDIUM", website: "ficcin.com", publicEmail: "fccn@ficcin.com" },
  { restaurantName: "Mivan Restaurant Cafe", district: "Fatih", websiteStatus: "NO_WEBSITE", leadScore: 9.4, priority: "HIGH" },
  { restaurantName: "Urfam Sur Ocakbaşı", district: "Şişli", websiteStatus: "VERY_WEAK", websiteScore: 2.4, leadScore: 8.8, priority: "HIGH", website: "urfamsur.com.tr", publicEmail: "info@urfamsur.com.tr" },
  { restaurantName: "Gaziantep Kardeşler Kebap Lahmacun", district: "Şişli", websiteStatus: "NO_WEBSITE", leadScore: 8.6, priority: "HIGH" },
  { restaurantName: "Şişli Kebap Restaurant", district: "Şişli", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Ocakbaşı Zervan Restaurant", district: "Şişli", websiteStatus: "IMPROVABLE", websiteScore: 5.1, leadScore: 7.4, priority: "MEDIUM", website: "zervanocakbasi.com" },
  { restaurantName: "ASTEK Restaurant / Ocakbaşı", district: "Şişli", websiteStatus: "NO_WEBSITE", leadScore: 8.4, priority: "HIGH" },
  { restaurantName: "ASTEK Restaurant & Meyhane", district: "Şişli", websiteStatus: "VERY_WEAK", websiteScore: 2.0, leadScore: 8.8, priority: "HIGH", website: "astekmeyhane.com" },
  { restaurantName: "Hasan Ustam Ocakbaşı", district: "Beyoğlu", websiteStatus: "WEAK", websiteScore: 3.4, leadScore: 8.5, priority: "HIGH", website: "hasanustamocakbasi.com", publicEmail: "info@hasanustamocakbasi.com" },
  { restaurantName: "Tarsus Ocakbaşı", district: "Şişli", websiteStatus: "IMPROVABLE", websiteScore: 5.2, leadScore: 7.2, priority: "MEDIUM", website: "tarsusocakbasi.com" },
  { restaurantName: "Kenan Usta Ocakbaşı", district: "Beyoğlu", websiteStatus: "IMPROVABLE", websiteScore: 5.7, leadScore: 6.7, priority: "MEDIUM", website: "kenanusta.com.tr", publicEmail: "rezervasyon@kenanusta.com.tr" },
  { restaurantName: "Mahir Lokantası", district: "Şişli", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Zarifçe Ocakbaşı", district: "Şişli", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Adana Ocakbaşı Şişli", district: "Şişli", websiteStatus: "NO_WEBSITE", leadScore: 9.1, priority: "HIGH" },
  { restaurantName: "Güler Ocakbaşı Restaurant", district: "Şişli", websiteStatus: "IMPROVABLE", websiteScore: 5.8, leadScore: 6.8, priority: "MEDIUM", website: "gulerocakbasi.com", publicEmail: "info@gulerocakbasi.com" },
  { restaurantName: "Çift Şiş Ocakbaşı", district: "Şişli", websiteStatus: "NO_WEBSITE", leadScore: 8.4, priority: "HIGH" },
  { restaurantName: "Taksim Akcanlar Ocakbaşı 1975", district: "Şişli", websiteStatus: "WEAK", websiteScore: 3.6, leadScore: 8.5, priority: "HIGH", website: "akcanlarocakbasi1975.com" },
  { restaurantName: "ADANA FATİH KEBAP", district: "Fatih", websiteStatus: "NO_WEBSITE", leadScore: 8.8, priority: "HIGH" },
  { restaurantName: "Palukçu", district: "Fatih", websiteStatus: "IMPROVABLE", websiteScore: 5.1, leadScore: 7.4, priority: "MEDIUM", website: "palukcubalik.com" },
  { restaurantName: "Ortaklar Kebap Restaurant", district: "Fatih", websiteStatus: "WEAK", websiteScore: 3.3, leadScore: 9.0, priority: "HIGH", website: "ortaklarkebaprestaurant.com", publicEmail: "ortaklaryt1997@gmail.com" },
  { restaurantName: "Old Balat Cafe & Kitchen", district: "Fatih", websiteStatus: "NO_WEBSITE", leadScore: 9.3, priority: "HIGH" },
  { restaurantName: "Pala Ocakbaşı", district: "Beyoğlu", websiteStatus: "NOT_VERIFIED", priority: "PENDING" },
  { restaurantName: "Sohbet Ocakbaşı", district: "Beyoğlu", websiteStatus: "NOT_VERIFIED", priority: "PENDING", outreachNotes: "DOMAIN_IDENTITY_CONFLICT" },
  { restaurantName: "Rakofoli Restaurant", district: "Beyoğlu", websiteStatus: "WEAK", websiteScore: 3.1, leadScore: 8.9, priority: "HIGH", website: "rakofoli.com", publicEmail: "info@rakofoli.com" },
  { restaurantName: "Hayri Usta Ocakbaşı Beyoğlu", district: "Beyoğlu", websiteStatus: "VERY_WEAK", websiteScore: 1.8, leadScore: 9.2, priority: "HIGH", website: "hayriusta.com" },
  { restaurantName: "Ziya Baba Türk Mutfağı", district: "Fatih", websiteStatus: "NO_WEBSITE", leadScore: 9.1, priority: "HIGH" },
];

export function avrupaLeadWriteInput(seed: AvrupaSeed): RestaurantLeadWriteInput {
  const problems = PROBLEMS[`${seed.restaurantName}|${seed.district}`] ?? {};
  return {
    restaurantName: seed.restaurantName,
    district: seed.district,
    region: "AVRUPA",
    websiteStatus: seed.websiteStatus,
    websiteScore: seed.websiteScore ?? null,
    leadScore: seed.leadScore ?? null,
    priority: seed.priority,
    website: seed.website ?? null,
    publicEmail: seed.publicEmail ?? null,
    problem1: problems.problem1 ?? null,
    problem2: problems.problem2 ?? null,
    problem3: problems.problem3 ?? null,
    websiteAnalysis: problems.websiteAnalysis ?? null,
    outreachNotes: seed.outreachNotes ?? null,
    source: AVRUPA_IMPORT_SOURCE,
    dateChecked: AVRUPA_DATE_CHECKED,
    contactStatus: "NOT_CONTACTED",
  };
}

export function avrupaSanitizedLeads() {
  return SEEDS.map((seed) => sanitizeRestaurantLeadWrite(avrupaLeadWriteInput(seed)));
}

export function assertAvrupaDataset(leads = avrupaSanitizedLeads()) {
  const errors: string[] = [];
  if (leads.length !== 100) errors.push(`Expected 100 leads, got ${leads.length}`);

  const seen = new Set<string>();
  const avrupaDistricts = new Set(AVRUPA_DISTRICTS.map((item) => normalizeLeadKey(item)));
  const allowedEmails = new Set(
    SEEDS.map((seed) => seed.publicEmail?.trim().toLowerCase()).filter((item): item is string => Boolean(item)),
  );

  for (const lead of leads) {
    const key = `${lead.nameNorm}|${lead.districtNorm}`;
    if (seen.has(key)) errors.push(`Duplicate identity: ${lead.restaurantName} / ${lead.district}`);
    seen.add(key);
    if (lead.region !== "AVRUPA") errors.push(`${lead.restaurantName}: region must be AVRUPA`);
    if (!avrupaDistricts.has(lead.districtNorm)) {
      errors.push(`${lead.restaurantName}: district ${lead.district} is not Avrupa Yakası`);
    }
    if (lead.phone || lead.whatsapp || lead.instagram || lead.googleMapsUrl) {
      errors.push(`${lead.restaurantName}: fabricated contact field present`);
    }
    if (lead.publicEmail && !allowedEmails.has(lead.publicEmail)) {
      errors.push(`${lead.restaurantName}: email not in verified list`);
    }
    const rules = applyRestaurantLeadStatusRules(lead);
    if (rules.websiteScore !== lead.websiteScore || rules.leadScore !== lead.leadScore || rules.priority !== lead.priority) {
      errors.push(`${lead.restaurantName}: status rules not applied`);
    }
    if (lead.websiteStatus === "NOT_VERIFIED" && (lead.websiteScore != null || lead.leadScore != null || lead.priority !== "PENDING")) {
      errors.push(`${lead.restaurantName}: NOT_VERIFIED rule broken`);
    }
    if (lead.websiteStatus === "NO_WEBSITE" && lead.websiteScore != null) {
      errors.push(`${lead.restaurantName}: NO_WEBSITE websiteScore must be null`);
    }
    if ((lead.websiteStatus === "GOOD" || lead.websiteStatus === "VERY_GOOD") && lead.priority !== "QUALIFIED_OUT") {
      errors.push(`${lead.restaurantName}: GOOD/VERY_GOOD must be QUALIFIED_OUT`);
    }
  }

  const names = leads.map((lead) => lead.restaurantName);
  for (const required of [
    "Adana Ocakbaşı Nişantaşı",
    "Adana Ocakbaşı Şişli",
    "ASTEK Restaurant / Ocakbaşı",
    "ASTEK Restaurant & Meyhane",
    "Urfam / Öz Urfam Ocakbaşı Rumelihisarı",
    "URFAM KEBAP OCAKBAŞI Seyrantepe",
    "Urfam Sur Ocakbaşı",
    "Karadeniz Balık Evi – Reyhan Cd. 106",
    "Nihat Balık Restoran",
    "Ziyade Balık",
    "Evita Mangalbaşı",
  ]) {
    if (!names.includes(required)) errors.push(`Missing protected identity: ${required}`);
  }

  if (errors.length) {
    throw new Error(`Avrupa dataset invalid:\n${errors.join("\n")}`);
  }

  return leads;
}

export const AVRUPA_100_SEEDS = SEEDS;
