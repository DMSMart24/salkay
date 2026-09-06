const paths = [
  { d: "M220 68 C340 68 392 128 500 140", dur: "7.2s" },
  { d: "M220 214 C340 214 392 164 500 140", dur: "8.4s" },
  { d: "M780 140 C668 140 608 140 500 140", dur: "6.6s" },
] as const;

export function AnimatedDataLine() {
  return (
    <svg className="ds-lines" viewBox="0 0 1000 280" preserveAspectRatio="none" aria-hidden>
      {paths.map((line) => (
        <path key={line.d} className="ds-path" d={line.d} />
      ))}
      {paths.map((line) => (
        <circle key={`${line.d}-dot`} className="ds-dot" r="3.2">
          <animateMotion dur={line.dur} repeatCount="indefinite" path={line.d} />
        </circle>
      ))}
    </svg>
  );
}
