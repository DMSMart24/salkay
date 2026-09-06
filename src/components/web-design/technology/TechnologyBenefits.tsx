import { webDesignContent as copy } from "@/components/web-design/content";

const icons = {
  "01": "M12 3.5 5.4 6.1v5.2c0 4.1 2.8 7.8 6.6 9.1 3.8-1.3 6.6-5 6.6-9.1V6.1Z",
  "02": "M5 16.6 12 7.4l7 9.2M8.1 16.6h7.8",
  "03": "M7 7h10v10H7ZM10 4h4v3h-4ZM10 17h4v3h-4Z",
  "04": "M5.2 15.8c0-1.3 1-2.4 2.3-2.5.3-2 2.1-3.5 4.2-3.5 1.8 0 3.4 1.1 4.1 2.7 1.6.2 2.9 1.6 2.9 3.3 0 1.8-1.5 3.3-3.3 3.3H8.4c-1.8 0-3.2-1.4-3.2-3.3Z",
} as const;

export function TechnologyBenefits() {
  return (
    <ul className="ti-benefits">
      {copy.tech.capabilities.map((item) => (
        <li key={item.index}>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d={icons[item.index]} />
            </svg>
          </span>
          <b>{item.index}</b>
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
