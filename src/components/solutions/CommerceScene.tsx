import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

const chipIcons = ["store", "variants", "pay", "account"] as const;
const productIcons = ["headphone", "watch", "speaker", "bag"] as const;
const trustIcons = ["store", "pay", "chart", "scale"] as const;
const sparkPaths = [
  "M1 13 L12 11 L20 14 L30 7 L40 9 L50 5 L63 7",
  "M1 12 L14 10 L24 13 L34 8 L46 6 L63 8",
  "M1 14 L10 12 L22 13 L32 8 L44 9 L54 5 L63 6",
  "M1 13 L16 11 L26 12 L38 7 L50 8 L63 5",
] as const;

type ShopIconName =
  | (typeof chipIcons)[number]
  | (typeof productIcons)[number]
  | (typeof trustIcons)[number]
  | "cart"
  | "bell"
  | "calendar"
  | "shield"
  | "star"
  | "chevron";

function ShopIcon({ name }: { name: ShopIconName }) {
  switch (name) {
    case "store":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3 6.2 L4.2 3.4 H11.8 L13 6.2 V13 H3 Z" />
          <path d="M3 6.2 H13" />
          <path d="M6.4 9.2 H9.6 V13" />
        </svg>
      );
    case "variants":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.8" y="3.2" width="5.2" height="5.2" rx="0.8" />
          <rect x="8" y="7.6" width="5.2" height="5.2" rx="0.8" />
        </svg>
      );
    case "pay":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.2" y="4" width="11.6" height="8" rx="1.1" />
          <path d="M2.2 6.6 H13.8" />
          <path d="M5 10 H8.2" />
        </svg>
      );
    case "account":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="5.6" r="2.1" />
          <path d="M3.6 13 C4 10.6 5.6 9.2 8 9.2 S12 10.6 12.4 13" />
        </svg>
      );
    case "cart":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M2.6 3.4 H4.2 L5.6 10.6 H12.4 L13.6 5.6 H5" />
          <circle cx="6.4" cy="12.8" r="0.9" />
          <circle cx="11.6" cy="12.8" r="0.9" />
        </svg>
      );
    case "bell":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4.4 7.2 C4.4 5.2 6 3.6 8 3.6 S11.6 5.2 11.6 7.2 V10 L13 11.6 H3 Z" />
          <path d="M6.6 11.8 C6.8 12.8 7.4 13.4 8 13.4 S9.2 12.8 9.4 11.8" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.6" y="3.4" width="10.8" height="10.2" rx="1.1" />
          <path d="M2.6 6.4 H13.4" />
          <path d="M5.2 2.6 V4.4" />
          <path d="M10.8 2.6 V4.4" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.2 12.6 V8.4" />
          <path d="M6.8 12.6 V5.4" />
          <path d="M10.4 12.6 V7.2" />
          <path d="M14 12.6 V3.8" />
        </svg>
      );
    case "scale":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M6.4 3.4 H3.4 V6.4" />
          <path d="M9.6 3.4 H12.6 V6.4" />
          <path d="M6.4 12.6 H3.4 V9.6" />
          <path d="M9.6 12.6 H12.6 V9.6" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M8 2.6 L13 4.4 V8.2 C13 11.2 10.6 13.2 8 13.6 C5.4 13.2 3 11.2 3 8.2 V4.4 Z" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M8 2.6 L9.6 6.2 H13.4 L10.4 8.6 L11.6 12.4 L8 10.2 L4.4 12.4 L5.6 8.6 L2.6 6.2 H6.4 Z" />
        </svg>
      );
    case "chevron":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4.8 6.2 L8 9.4 L11.2 6.2" />
        </svg>
      );
    case "headphone":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.6 9.2 V8 C3.6 5.4 5.6 3.4 8 3.4 S12.4 5.4 12.4 8 V9.2" />
          <rect x="2.4" y="8.4" width="2.6" height="4.2" rx="0.8" />
          <rect x="11" y="8.4" width="2.6" height="4.2" rx="0.8" />
        </svg>
      );
    case "watch":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="4.4" y="4.2" width="7.2" height="7.6" rx="1.6" />
          <path d="M6 4.2 V2.6 H10 V4.2" />
          <path d="M6 11.8 V13.4 H10 V11.8" />
          <path d="M8 6.4 V8.2 L9.4 9" />
        </svg>
      );
    case "speaker":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="4.4" y="2.6" width="7.2" height="10.8" rx="1.4" />
          <circle cx="8" cy="9" r="2.1" />
          <circle cx="8" cy="4.8" r="0.6" />
        </svg>
      );
    case "bag":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.4 5.6 H12.6 V13.2 H3.4 Z" />
          <path d="M6 5.6 V4.4 C6 3.4 6.8 2.6 8 2.6 S10 3.4 10 4.4 V5.6" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

function HeadphoneArt() {
  return (
    <svg className="sl-commerce-art" viewBox="0 0 160 110" aria-hidden>
      <rect x="8" y="8" width="144" height="94" rx="16" fill="#111827" />
      <path
        d="M42 62 V54 C42 34 58 20 80 20 S118 34 118 54 V62"
        fill="none"
        stroke="#e8edf5"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="28" y="58" width="28" height="34" rx="10" fill="#1554F0" />
      <rect x="104" y="58" width="28" height="34" rx="10" fill="#1554F0" />
      <rect x="33" y="63" width="18" height="24" rx="7" fill="#0b1527" />
      <rect x="109" y="63" width="18" height="24" rx="7" fill="#0b1527" />
    </svg>
  );
}

function ChannelDonut() {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const parts = [0.62, 0.18, 0.12, 0.08];
  const colors = ["#1554F0", "#38BDF8", "#0B1E4D", "#EEF2FA"];
  let offset = 0;

  return (
    <svg className="sl-commerce-donut" viewBox="0 0 80 80" aria-hidden>
      {parts.map((part, index) => {
        const length = circumference * part;
        const current = offset;
        offset += length;
        return (
          <circle
            key={colors[index]}
            cx="40"
            cy="40"
            r={radius}
            stroke={colors[index]}
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-current}
          />
        );
      })}
    </svg>
  );
}

export function CommerceScene() {
  const { commerce } = getDictionary().solutionsPage;
  const ui = commerce.dashboard;

  return (
    <section id="ticaret" className="sl-shop" aria-labelledby="sl-shop-title">
      <div className="sl-shell sl-shop-grid">
        <Reveal className="sl-commerce-copy">
          <p className="sl-kicker sl-commerce-kicker">
            <span>{commerce.index}</span>
            {commerce.label}
          </p>
          <h2 id="sl-shop-title" className="font-display sl-commerce-title">
            {commerce.title1}
            <br />
            {commerce.title2}
            <br />
            <em>{commerce.titleAccent}</em>
          </h2>
          <ul className="sl-commerce-chips">
            {commerce.features.map((item, index) => (
              <li key={item}>
                <ShopIcon name={chipIcons[index] ?? "store"} />
                {item}
              </li>
            ))}
          </ul>
          <p className="sl-commerce-outcome">
            {commerce.outcome}
            <em>{commerce.outcomeAccent}</em>
          </p>
          <span className="sl-commerce-guides" aria-hidden />
        </Reveal>

        <div className="sl-commerce-stage">
          <svg className="sl-commerce-curves" viewBox="0 0 720 220" preserveAspectRatio="none" aria-hidden>
            <path d="M10 160 C 140 110, 220 190, 340 140 S 540 90, 710 150" />
            <path d="M30 190 C 180 150, 280 210, 430 170 S 600 140, 720 180" />
          </svg>

          <Reveal delay={80} className="sl-commerce-board">
            <article className="sl-commerce-frame" aria-hidden="true">
              <header className="sl-commerce-topbar">
                <strong>
                  <ShopIcon name="cart" />
                  {ui.brand}
                </strong>
                <nav>
                  {ui.nav.map((item, index) => (
                    <span key={item} className={index === 0 ? "is-on" : undefined}>
                      {item}
                    </span>
                  ))}
                </nav>
                <div className="sl-commerce-tools">
                  <b>
                    <ShopIcon name="bell" />
                  </b>
                  <em>SK</em>
                </div>
              </header>

              <div className="sl-commerce-head">
                <div>
                  <h3>{ui.overview}</h3>
                  <p>{ui.overviewSupport}</p>
                </div>
                <span className="sl-commerce-date">
                  <ShopIcon name="calendar" />
                  {ui.dateRange}
                  <ShopIcon name="chevron" />
                </span>
              </div>

              <ul className="sl-commerce-kpis">
                {ui.kpis.map((kpi, index) => (
                  <li key={kpi.label}>
                    <small>{kpi.label}</small>
                    <strong>{kpi.value}</strong>
                    <em>{kpi.trend}</em>
                    <svg className="sl-commerce-spark" viewBox="0 0 64 18">
                      <path d={sparkPaths[index] ?? sparkPaths[0]} />
                    </svg>
                  </li>
                ))}
              </ul>

              <div className="sl-commerce-panels">
                <div className="sl-commerce-products">
                  <div className="sl-commerce-panel-head">
                    <p>{ui.productsTitle}</p>
                    <span>{ui.productsLink}</span>
                  </div>
                  <ol>
                    {ui.products.map((product, index) => (
                      <li key={product.name}>
                        <em>{index + 1}</em>
                        <b>
                          <ShopIcon name={productIcons[index] ?? "headphone"} />
                        </b>
                        <span>
                          {product.name}
                          <small>{product.qty}</small>
                        </span>
                        <strong>{product.value}</strong>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="sl-commerce-channels">
                  <p>{ui.channelsTitle}</p>
                  <div className="sl-commerce-donut-wrap">
                    <ChannelDonut />
                    <span>
                      <strong>{ui.channelsTotal}</strong>
                      {ui.channelsTotalLabel}
                    </span>
                  </div>
                  <ul>
                    {ui.channels.map((channel) => (
                      <li key={channel.label}>
                        <i />
                        {channel.label}
                        <b>{channel.value}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="sl-commerce-insight">
                <b>
                  <ShopIcon name="shield" />
                </b>
                <div>
                  <strong>{ui.insightTitle}</strong>
                  <span>{ui.insightBody}</span>
                </div>
                <em>{ui.insightLink}</em>
              </div>
            </article>

            <aside className="sl-commerce-floats" aria-hidden="true">
              <article className="sl-commerce-product">
                <HeadphoneArt />
                <h4>{ui.productName}</h4>
                <strong>{ui.productPrice}</strong>
                <p className="sl-commerce-stars">
                  {Array.from({ length: 5 }, (_, index) => (
                    <ShopIcon key={index} name="star" />
                  ))}
                  <small>{ui.productReviews}</small>
                </p>
                <span className="sl-commerce-variant">
                  {ui.productVariant}
                  <ShopIcon name="chevron" />
                </span>
                <em>{ui.productCta}</em>
                <small>
                  <ShopIcon name="shield" />
                  {ui.productTrust}
                </small>
              </article>
              <article className="sl-commerce-order">
                <p>{ui.orderTitle}</p>
                <dl>
                  <div>
                    <dt>{ui.orderSubtotalLabel}</dt>
                    <dd>{ui.orderSubtotal}</dd>
                  </div>
                  <div>
                    <dt>{ui.orderShippingLabel}</dt>
                    <dd>{ui.orderShipping}</dd>
                  </div>
                  <div className="is-total">
                    <dt>{ui.orderTotalLabel}</dt>
                    <dd>{ui.orderTotal}</dd>
                  </div>
                </dl>
                <em>{ui.orderCta}</em>
              </article>
            </aside>
          </Reveal>
        </div>

        <ul className="sl-commerce-trust">
          {ui.trust.map((item, index) => (
            <li key={item.title}>
              <ShopIcon name={trustIcons[index] ?? "store"} />
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
