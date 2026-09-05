import Image from "next/image";
import Link from "next/link";
import { HeroExperience } from "@/components/home/HeroExperience";
import { HomeContact } from "@/components/home/HomeContact";
import { StudioInView } from "@/components/studio/StudioInView";
import { Container } from "@/components/ui/Container";
import {
  IconArrowRight,
  IconBell,
  IconBolt,
  IconChart,
  IconCompass,
  IconDoc,
  IconGear,
  IconLayers,
  IconLink,
  IconMail,
  IconRefresh,
  IconSearch,
} from "@/components/studio/StudioIcons";
import { routes, sections } from "@/lib/routes";
import "./studio.css";

function Arrow() {
  return <span aria-hidden>↗</span>;
}

export function StudioPage() {
  return (
    <div className="studio-page">
      <Hero />
      <Overview />
      <WebDetail />
      <Software />
      <Growth />
      <HomeContact />
      <p className="studio-band">
        <Link href={sections.contact}>
          Bir sonraki projenizi birlikte tasarlayalım. <Arrow />
        </Link>
      </p>
    </div>
  );
}

function Hero() {
  return (
    <HeroExperience>
      <Container className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow inline-flex items-center gap-2 text-cyan">
            <span className="h-1.5 w-1.5 bg-cyan shadow-[0_0_12px_var(--c-cyan)]" />
            SALKAY — İstanbul dijital stüdyo
          </p>
          <h1 className="hero-title font-display font-bold text-fg">
            <span className="hero-title-segment">İyi tasarım.</span>{" "}
            <span className="hero-title-accent text-blue">Güçlü bir dijital gelecek.</span>
          </h1>
          <p className="hero-lead text-muted">Markanıza özel web siteleri ve işinizi kolaylaştıran yazılımlar.</p>
          <div className="hero-actions studio-hero-actions">
            <Link href={sections.contact} className="studio-btn studio-btn-primary hero-cta">
              Projenizi Konuşalım
            </Link>
            <Link href="#hizmetler" className="studio-hero-link">
              Hizmetleri keşfedin
              <span aria-hidden className="studio-hero-link-arrow">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </HeroExperience>
  );
}

function Overview() {
  return (
    <section id="hizmetler" className="studio-overview">
      <div className="studio-wrap">
        <div className="studio-overview-head">
          <h2>Dijitalde ihtiyacınız olan. Özenle tasarlandı.</h2>
          <p>Tasarım, yazılım ve büyüme. Aynı özenle.</p>
        </div>
        <div className="studio-overview-grid">
          <article className="studio-card studio-card-light">
            <p className="studio-kicker">01 / Web tasarım</p>
            <h3>İlk izlenimden son tıklamaya.</h3>
            <p className="studio-lead">
              Markanızı en iyi şekilde yansıtan, performans odaklı, modern web siteleri tasarlıyoruz.
            </p>
            <div className="studio-card-visual">
              <Image
                src="/studio/studio-lume-cut.png"
                alt="LUME web tasarım konseptinin tablet ve telefon görünümü"
                width={1027}
                height={605}
                quality={90}
                sizes="(max-width: 860px) 90vw, 520px"
              />
            </div>
            <Link href={routes.webDesign} className="studio-text-link">
              Web tasarım hizmeti →
            </Link>
          </article>
          <article className="studio-card studio-card-dark">
            <p className="studio-kicker">02 / Yazılım</p>
            <h3>İşinize göre çalışan teknoloji.</h3>
            <p className="studio-lead">
              Özel yazılım çözümleri ile iş süreçlerinizi kolaylaştırıyor, büyümenizi destekliyoruz.
            </p>
            <div className="studio-card-visual">
              <Image
                src="/studio/studio-glass-card.png"
                alt=""
                width={619}
                height={792}
                quality={90}
                sizes="(max-width: 860px) 90vw, 520px"
              />
            </div>
            <div className="studio-flow" aria-hidden>
              <span>
                <IconDoc />
                Seçim
              </span>
              →
              <span>
                <IconGear />
                Özelleştirme
              </span>
              →
              <span>
                <IconChart />
                Teklif
              </span>
            </div>
            <Link href={routes.solutions} className="studio-text-link">
              Yazılım hizmeti →
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

function WebDetail() {
  return (
    <section className="studio-web">
      <div className="studio-wrap">
        <div className="studio-split-head">
          <div>
            <p className="studio-kicker">Web tasarım / Detaylarda fark yaratırız</p>
            <h2>
              Güzel görünen.
              <br />
              <em>İyi çalışan.</em>
            </h2>
          </div>
          <p>Tasarım, geliştirme, performans ve SEO. Her ayrıntı aynı özenle.</p>
        </div>
        <div className="studio-web-grid">
          <article className="studio-mod studio-mod-design">
            <div>
              <p className="studio-kicker">01 / Tasarım</p>
              <h3>Markanıza özel bir tasarım dili.</h3>
              <p>Renk, tipografi ve arayüz. Birbiriyle uyum içinde.</p>
            </div>
            <StudioInView className="studio-mod-visual-wrap">
              <Image
                className="studio-mod-visual"
                src="/studio/studio-design-card.png"
                alt="Tipografi ve renk sistemi örneği"
                width={1206}
                height={664}
                quality={90}
                sizes="(max-width: 860px) 90vw, 420px"
              />
            </StudioInView>
          </article>
          <article className="studio-mod studio-mod-dark">
            <div>
              <p className="studio-kicker">02 / Geliştirme</p>
              <h3>Sağlam temeller. Akıcı deneyimler.</h3>
              <p>İşinize uyum sağlayan web altyapısı.</p>
            </div>
            <StudioInView className="studio-mod-visual-wrap">
              <Image
                className="studio-mod-visual"
                src="/studio/studio-glass-card.png"
                alt=""
                width={619}
                height={792}
                quality={90}
                sizes="(max-width: 860px) 90vw, 420px"
              />
              <span className="studio-code-mark" aria-hidden>
                {"{ }"}
              </span>
            </StudioInView>
            <div className="studio-mod-list">
              <span>Modüler</span>
              <span>Esnek</span>
              <span>Güvenli</span>
              <span>Uzun ömürlü</span>
            </div>
          </article>
          <article className="studio-mod studio-mod-perf">
            <div>
              <p className="studio-kicker">03 / Performans</p>
              <h3>Her etkileşimde akıcılık.</h3>
              <p>Hızlı açılan sayfalar, özenli geçişler.</p>
            </div>
            <StudioInView className="studio-mod-visual-wrap studio-gauge">
              <Image
                className="studio-mod-visual"
                src="/studio/studio-speedo-cut.png"
                alt=""
                width={1050}
                height={541}
                quality={90}
                sizes="(max-width: 860px) 90vw, 420px"
              />
            </StudioInView>
            <div className="studio-mod-list studio-mod-list-lines">
              <span>Daha hızlı</span>
              <span>Daha akıcı</span>
              <span>Daha iyi deneyim</span>
            </div>
          </article>
          <article className="studio-mod studio-mod-seo">
            <div>
              <p className="studio-kicker">04 / SEO</p>
              <h3>Keşfedilmeye hazır.</h3>
              <p>İçerik, yapı ve teknik SEO birlikte düşünülür.</p>
            </div>
            <StudioInView className="studio-search-demo">
              <div className="studio-search-bar" aria-hidden>
                <IconSearch />
                <span>Markanız</span>
                <i>
                  <IconArrowRight />
                </i>
              </div>
              <div className="studio-search-hits" aria-hidden>
                <span />
                <span />
              </div>
              <p className="studio-example">Görsel örnek</p>
            </StudioInView>
          </article>
        </div>
        <p className="studio-section-link">
          <Link href={sections.packages} className="studio-text-link">
            Web tasarım paketlerini incele <Arrow />
          </Link>
        </p>
      </div>
    </section>
  );
}

function Software() {
  return (
    <section id="yazilim" className="studio-software">
      <div className="studio-wrap">
        <div className="studio-split-head">
          <div>
            <p className="studio-kicker">02 / Yazılım & sistemler</p>
            <h2>
              İşinize özel yazılım.
              <br />
              <em>Birlikte çalışan sistemler.</em>
            </h2>
          </div>
          <p className="studio-lead">
            İş süreçlerinizi sadeleştiren, ekibinizi ve müşterilerinizi bir araya getiren dijital çözümler.
          </p>
        </div>
        <div className="studio-soft-grid">
          <article className="studio-soft-card studio-soft-main">
            <p className="studio-kicker">01 / Özel yazılım</p>
            <h3>İşinizin kontrolü, tek bir yerde.</h3>
            <p>Müşteri portalları, yönetim panelleri ve size özel iş uygulamaları.</p>
            <StudioInView className="studio-dashboard-wrap">
              <div className="studio-glass-stack" aria-hidden>
                <i />
                <i />
                <i />
              </div>
              <div className="studio-dashboard" aria-hidden>
                <div className="studio-dashboard-bar">
                  <b>SALKAY</b>
                  <span className="studio-dash-chip">Yeni talep</span>
                </div>
                <div className="studio-dashboard-body">
                  <div className="studio-dashboard-nav">
                    <span className="is-on">Genel bakış</span>
                    <span>Projeler</span>
                    <span>Talepler</span>
                    <span>Belgeler</span>
                  </div>
                  <div className="studio-dashboard-main">
                    <strong>Genel bakış</strong>
                    <div className="studio-dash-cards">
                      <span>Projeler</span>
                      <span>Talepler</span>
                      <span>Tamamlandı</span>
                    </div>
                    <p className="studio-dash-table-label">Son talepler</p>
                    <ul className="studio-dash-table">
                      <li>
                        Talep 01 <em className="is-done">Tamamlandı</em>
                      </li>
                      <li>
                        Talep 02 <em>İncelemede</em>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </StudioInView>
            <Link href={routes.solutions} className="studio-text-link">
              Yazılım çözümleri <Arrow />
            </Link>
            <p className="studio-example">Örnek arayüz</p>
          </article>
          <div className="studio-soft-side">
            <article className="studio-soft-card">
              <p className="studio-kicker">02 / Konfigüratörler</p>
              <h3>Seçin. Özelleştirin. Teklife dönüştürün.</h3>
              <p>Ürün seçeneklerini anlaşılır bir deneyime dönüştürün.</p>
              <div className="studio-config">
                <div className="studio-config-controls" aria-hidden>
                  <p className="studio-kicker">Renk</p>
                  <div className="studio-swatches">
                    <span style={{ background: "#f4f1ea" }} />
                    <span style={{ background: "#c4b49a" }} />
                    <span style={{ background: "#8b8f97" }} />
                    <span style={{ background: "#111318" }} />
                  </div>
                  <p className="studio-kicker studio-config-size-label">Ölçü (m)</p>
                  <div className="studio-sizes">
                    <span className="is-on">3 x 4</span>
                    <span>3 x 5</span>
                    <span>4 x 6</span>
                  </div>
                </div>
                <Image
                  src="/studio/studio-pergola-photo.png"
                  alt="Örnek pergola konfigürasyonu"
                  width={1280}
                  height={720}
                  quality={90}
                  sizes="(max-width: 860px) 90vw, 420px"
                />
              </div>
              <p className="studio-example">Örnek konfigürasyon</p>
            </article>
            <article className="studio-soft-card">
              <p className="studio-kicker">03 / AI & otomasyon</p>
              <h3>Tekrarlayan işler, akıllı akışlar.</h3>
              <p>Başvuruları, bildirimleri ve takip adımlarını birbirine bağlayın.</p>
              <StudioInView className="studio-auto">
                <div className="studio-auto-step">
                  <IconMail />
                  Talep
                </div>
                <span className="studio-auto-arrow" aria-hidden>
                  →
                </span>
                <div className="studio-auto-step">
                  <IconGear />
                  İşlem
                </div>
                <span className="studio-auto-arrow" aria-hidden>
                  →
                </span>
                <div className="studio-auto-step">
                  <IconBell />
                  Bildirim
                </div>
              </StudioInView>
            </article>
          </div>
        </div>
        <div className="studio-benefits">
          <p>
            <IconLayers />
            <strong>Tek merkez</strong>
            <span>İhtiyacınız olan tüm sistemler tek bir yapıda bir araya gelir.</span>
          </p>
          <p>
            <IconLink />
            <strong>Bağlantılı veriler</strong>
            <span>Sistemler arasında daha düzenli ve kesintisiz veri akışı sağlanır.</span>
          </p>
          <p>
            <IconBolt />
            <strong>Daha az manuel iş</strong>
            <span>Otomasyonlarla tekrarlayan süreçleri sadeleştirir, ekibinize zaman kazandırır.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Growth() {
  return (
    <section id="buyume" className="studio-growth">
      <div className="studio-wrap">
        <div className="studio-split-head">
          <div>
            <p className="studio-kicker">03 / Dijital büyüme</p>
            <h2>
              Doğru yerde görünün.
              <br />
              <em>Doğru kitleye ulaşın.</em>
            </h2>
          </div>
          <p>SEO, reklam ve içerik çalışmalarını ortak bir stratejide buluşturuyoruz.</p>
        </div>
        <div className="studio-growth-grid">
          <article className="studio-growth-card">
            <p className="studio-kicker">01 / Görünürlük</p>
            <h3>SEO</h3>
            <p>Teknik altyapı ve içerikle organik görünürlüğünüzü geliştirin.</p>
            <div className="studio-growth-visual">
              <Image
                src="/studio/studio-seo-card.png"
                alt=""
                width={1152}
                height={864}
                quality={90}
                sizes="(max-width: 860px) 90vw, 360px"
              />
            </div>
            <Link href={routes.services} className="studio-text-link">
              SEO çalışmalarını keşfedin <Arrow />
            </Link>
          </article>
          <article className="studio-growth-card is-dark">
            <p className="studio-kicker">02 / Reklam</p>
            <h3>Google Ads</h3>
            <p>Doğru aramaları, doğru reklamlarla karşılayın.</p>
            <StudioInView className="studio-growth-visual studio-ads-visual">
              <div className="studio-ad-demo" aria-hidden>
                <small>Örnek reklam</small>
                <strong>Markanız</strong>
                <span>İncele →</span>
              </div>
              <Image
                src="/studio/studio-ads-card.png"
                alt=""
                width={848}
                height={784}
                quality={90}
                sizes="(max-width: 860px) 90vw, 360px"
              />
            </StudioInView>
            <div className="studio-pills" aria-hidden>
              <span>Hedef kitle</span>
              <span>Kampanya</span>
              <span>Ölçüm</span>
            </div>
            <Link href={routes.services} className="studio-text-link">
              Reklam çözümlerini keşfedin <Arrow />
            </Link>
          </article>
          <article className="studio-growth-card">
            <p className="studio-kicker">03 / İçerik</p>
            <h3>Dijital pazarlama</h3>
            <p>İçerik ve kampanyalarla markanızın hikâyesini güçlendirin.</p>
            <div className="studio-growth-visual">
              <Image
                src="/studio/studio-content-card.png"
                alt=""
                width={989}
                height={793}
                quality={90}
                sizes="(max-width: 860px) 90vw, 360px"
              />
            </div>
            <Link href={routes.about} className="studio-text-link">
              Pazarlama yaklaşımımız <Arrow />
            </Link>
          </article>
        </div>
        <div className="studio-process">
          <p>
            <IconCompass />
            <strong>Strateji</strong>
            Hedefleri birlikte belirleriz.
          </p>
          <p>
            <IconGear />
            <strong>Uygulama</strong>
            Kanalları uyumla yönetiriz.
          </p>
          <p>
            <IconChart />
            <strong>Ölçüm</strong>
            Verileri anlaşılır raporlarız.
          </p>
          <p>
            <IconRefresh />
            <strong>İyileştirme</strong>
            Öğrendiklerimizle geliştiririz.
          </p>
          <Link href={sections.contact} className="studio-text-link">
            Büyüme hedeflerinizi konuşalım <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
