const particles = [
  { left: "28%", delay: "0s", duration: "7.2s" },
  { left: "41%", delay: "1.1s", duration: "6.4s" },
  { left: "52%", delay: "2.4s", duration: "8s" },
  { left: "63%", delay: "0.6s", duration: "6.8s" },
  { left: "74%", delay: "1.8s", duration: "7.6s" },
] as const;

export function AnimatedDataParticles() {
  return (
    <span className="ti-particles" aria-hidden>
      {particles.map((item) => (
        <i
          key={item.left}
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        />
      ))}
    </span>
  );
}
