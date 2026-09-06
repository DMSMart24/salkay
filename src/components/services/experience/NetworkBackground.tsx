export function NetworkBackground() {
  return (
    <div className="svc-net" aria-hidden>
      <span className="svc-net-orb is-a" />
      <span className="svc-net-orb is-b" />
      <svg className="svc-net-svg" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="svc-net-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0055ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#3d8bff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0055ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="svc-net-links">
          <line x1="980" y1="80" x2="1188" y2="210" />
          <line x1="1188" y1="210" x2="1330" y2="118" />
          <line x1="1188" y1="210" x2="1284" y2="368" />
          <line x1="1284" y1="368" x2="1128" y2="438" />
          <line x1="1128" y1="438" x2="972" y2="286" />
          <line x1="972" y1="286" x2="980" y2="80" />
          <line x1="972" y1="286" x2="848" y2="400" />
          <line x1="848" y1="400" x2="1024" y2="528" />
        </g>
        <g className="svc-net-mark">
          <path d="M1090 98 L1254 438 L926 438 Z" />
          <path d="M1090 178 L1188 388 L992 388 Z" />
        </g>
        <g className="svc-net-nodes">
          <circle className="is-a" cx="980" cy="80" r="3.2" />
          <circle className="is-b" cx="1188" cy="210" r="4.6" />
          <circle className="is-c" cx="1330" cy="118" r="2.8" />
          <circle className="is-d" cx="1284" cy="368" r="3.4" />
          <circle className="is-e" cx="1128" cy="438" r="3" />
          <circle className="is-f" cx="972" cy="286" r="3.2" />
          <circle className="is-g" cx="848" cy="400" r="2.6" />
          <circle className="is-h" cx="1024" cy="528" r="2.8" />
        </g>
      </svg>
    </div>
  );
}
