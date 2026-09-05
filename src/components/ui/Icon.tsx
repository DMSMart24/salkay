type IconName =
  | "search"
  | "megaphone"
  | "chart"
  | "devices"
  | "layout"
  | "message"
  | "flow"
  | "layers"
  | "portal"
  | "arrow"
  | "check";

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <IconPath name={name} />
    </svg>
  );
}

function IconPath({ name }: { name: IconName }) {
  switch (name) {
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="6.2" />
          <path d="M15.6 15.6 L20 20" />
        </>
      );
    case "megaphone":
      return (
        <>
          <path d="M5.2 9.4 H8.2 L14.8 5.6 V18.4 L8.2 14.6 H5.2 Z" />
          <path d="M17.2 9.6 C18.3 10.6 18.3 13.4 17.2 14.4" />
        </>
      );
    case "chart":
      return (
        <>
          <path d="M4.6 18.4 H19.4" />
          <path d="M7.4 14.2 V18.4" />
          <path d="M12 9.6 V18.4" />
          <path d="M16.6 6.4 V18.4" />
        </>
      );
    case "devices":
      return (
        <>
          <rect x="3.4" y="5" width="12.4" height="9.2" rx="1.4" />
          <path d="M7 17.6 H12.2" />
          <rect x="14.4" y="10.2" width="6.2" height="8.4" rx="1.2" />
        </>
      );
    case "layout":
      return (
        <>
          <rect x="3.6" y="5" width="16.8" height="14" rx="1.6" />
          <path d="M3.6 8.6 H20.4" />
          <path d="M9.4 8.6 V19" />
        </>
      );
    case "message":
      return (
        <>
          <path d="M5 7.2 H19 A1.4 1.4 0 0 1 20.4 8.6 V15.2 A1.4 1.4 0 0 1 19 16.6 H9.2 L5 19.2 V7.2 Z" />
        </>
      );
    case "flow":
      return (
        <>
          <circle cx="6.2" cy="7" r="2.1" />
          <circle cx="17.8" cy="12" r="2.1" />
          <circle cx="6.2" cy="17" r="2.1" />
          <path d="M8.3 7.8 C12 8.2 12 11.2 15.6 11.6" />
          <path d="M8.3 16.2 C12 15.8 12 12.8 15.6 12.4" />
        </>
      );
    case "layers":
      return (
        <>
          <path d="M4.8 9.2 L12 5.6 L19.2 9.2 L12 12.8 Z" />
          <path d="M4.8 13 L12 16.6 L19.2 13" />
        </>
      );
    case "portal":
      return (
        <>
          <rect x="4" y="5.2" width="16" height="13.6" rx="1.6" />
          <path d="M8 9.2 H16" />
          <path d="M8 12.2 H13.4" />
          <path d="M8 15.2 H11.2" />
        </>
      );
    case "arrow":
      return <path d="M5 12 H19 M13.4 6.6 L19 12 L13.4 17.4" />;
    case "check":
      return <path d="M5.4 12.2 L10 16.6 L18.6 7.6" />;
    default: {
      const _never: never = name;
      return _never;
    }
  }
}
