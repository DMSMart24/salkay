import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/routes";

const aMark = "/brand/salkay-a-mark.png";

const capabilities = [
  {
    index: "01",
    title: "UI/UX Tasarım",
    body: "Kullanıcı odaklı, modern ve etkileyici arayüzler tasarlıyoruz.",
    id: undefined,
  },
  {
    index: "02",
    title: "Geliştirme",
    body: "Ölçeklenebilir ve sürdürülebilir kod yapısıyla projelerinizi hayata geçiriyoruz.",
    id: "web-development",
  },
  {
    index: "03",
    title: "Performans",
    body: "Hızlı yükleme süreleri ve performans odaklı geliştirme yaklaşımı.",
    id: undefined,
  },
  {
    index: "04",
    title: "SEO",
    body: "SEO uyumlu yapı ve teknik görünürlük altyapısı.",
    id: undefined,
  },
] as const;

type ShowcaseCapIndex = (typeof capabilities)[number]["index"];

type WebShowcaseProps = {
  eyebrow: string;
  index: string;
  label: string;
  body: string;
  cta: string;
};

export function WebShowcase({ eyebrow, index, label, body, cta }: WebShowcaseProps) {
  return (
    <div className="svc-showcase">
      <p className="svc-showcase-eye">
        <span aria-hidden />
        {eyebrow}
      </p>
      <div id="web-tasarim" className="svc-showcase-main">
        <div className="svc-showcase-copy">
          <p className="svc-showcase-label">
            {index} / {label}
          </p>
          <h3 className="svc-showcase-title font-display">
            <span>Markanızın dijital</span>
            <span>
              yüzünü <em>tasarlıyoruz.</em>
            </span>
          </h3>
          <p className="svc-showcase-body">{body}</p>
          <Button href={routes.webDesign} className="svc-showcase-cta">
            {cta}
            <span aria-hidden>→</span>
          </Button>
        </div>
        <ShowcaseStage />
      </div>
      <ul className="svc-showcase-caps">
        {capabilities.map((item) => (
          <li key={item.index} id={item.id}>
            <ShowcaseCapIcon index={item.index} />
            <b>{item.index}</b>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShowcaseStage() {
  return (
    <div className="svc-showcase-stage" aria-hidden>
      <article className="svc-showcase-browser">
        <header className="svc-showcase-chrome">
          <span className="svc-showcase-dots">
            <i />
            <i />
            <i />
          </span>
        </header>
        <div className="svc-showcase-site">
          <div className="svc-showcase-nav">
            <span className="svc-showcase-brand">
              <Image src={aMark} alt="" width={28} height={21} />
              <b>SALKAY</b>
            </span>
            <span className="svc-showcase-links">
              <i>Hizmetler</i>
              <i>Çözümler</i>
              <i>İletişim</i>
            </span>
            <span className="svc-showcase-nav-cta">İletişim</span>
          </div>
          <div className="svc-showcase-site-hero">
            <div>
              <em>Dijital Deneyim</em>
              <p>
                Geleceğin
                <span>
                  Web <b>Deneyimi.</b>
                </span>
              </p>
              <span className="svc-showcase-site-cta">Projenizi Konuşalım</span>
            </div>
            <span className="svc-showcase-facet">
              <Image
                src={aMark}
                alt=""
                width={220}
                height={166}
                sizes="(max-width: 767px) 42vw, 18vw"
              />
            </span>
          </div>
        </div>
      </article>
      <article className="svc-showcase-phone">
        <div className="svc-showcase-phone-screen">
          <span className="svc-showcase-brand">
            <Image src={aMark} alt="" width={22} height={16} />
            <b>SALKAY</b>
          </span>
          <p>
            Geleceğin
            <span>Web Deneyimi.</span>
          </p>
          <span className="svc-showcase-site-cta">Başlat</span>
          <Image src={aMark} alt="" width={120} height={90} className="svc-showcase-phone-a" />
        </div>
      </article>
    </div>
  );
}

function ShowcaseCapIcon({ index }: { index: ShowcaseCapIndex }) {
  switch (index) {
    case "01":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M5 18.5 15.2 8.3l3.5 3.5L8.5 22H5Z" />
          <path d="M13.8 6.9 16.2 4.5 19.5 7.8 17.1 10.2" />
        </svg>
      );
    case "02":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M9 7.2 5.4 12 9 16.8" />
          <path d="M15 7.2 18.6 12 15 16.8" />
        </svg>
      );
    case "03":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M5 16.6 12 7.4l7 9.2" />
          <path d="M8.1 16.6h7.8" />
          <circle cx="12" cy="13.6" r="1.1" />
        </svg>
      );
    case "04":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <circle cx="11" cy="11" r="6.2" />
          <path d="M15.6 15.6 20 20" />
        </svg>
      );
    default: {
      const _never: never = index;
      return _never;
    }
  }
}
