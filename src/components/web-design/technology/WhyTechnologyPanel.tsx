import { webDesignContent as copy } from "@/components/web-design/content";

const icons = {
  "01": "M12 4.5 19 8.4v7.2L12 19.5 5 15.6V8.4ZM12 4.5v15M5 8.4l7 3.9 7-3.9",
  "02": "M9 6.5H7v11h2M15 6.5h2v11h-2",
  "03": "M5 18.5h14M7 18.5V12h3v6.5M11.5 18.5V8h3v10.5M16 18.5V10h3v8.5",
} as const;

export function WhyTechnologyPanel() {
  return (
    <section className="ti-why" aria-labelledby="ti-why-title">
      <div>
        <h3 id="ti-why-title" className="font-display">
          {copy.tech.why.eyebrow}
        </h3>
        <p>{copy.tech.why.body}</p>
      </div>
      <ul>
        {copy.tech.why.principles.map((item) => (
          <li key={item.index}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d={icons[item.index]} />
            </svg>
            <b>{item.index}</b>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
