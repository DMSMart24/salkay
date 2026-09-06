import type { CSSProperties } from "react";

const channels = [
  { name: "Organik Arama", value: "38%", width: "38%" },
  { name: "Reklam", value: "24%", width: "24%" },
  { name: "Sosyal Medya", value: "18%", width: "18%" },
  { name: "Yönlendirme", value: "12%", width: "12%" },
  { name: "Doğrudan", value: "8%", width: "8%" },
] as const;

export function ChannelDistribution() {
  return (
    <div className="dcr-chan">
      <strong>Kanal dağılımı</strong>
      <ul>
        {channels.map((item) => (
          <li key={item.name}>
            <span>{item.name}</span>
            <b>{item.value}</b>
            <i style={{ "--dcr-bar": item.width } as CSSProperties} />
          </li>
        ))}
      </ul>
    </div>
  );
}
