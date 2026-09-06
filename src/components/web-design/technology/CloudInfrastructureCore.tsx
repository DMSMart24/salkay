import { AnimatedDataParticles } from "@/components/web-design/technology/AnimatedDataParticles";

export function CloudInfrastructureCore() {
  return (
    <div className="ti-core">
      <div className="ti-cloud">
        <span className="ti-orbit" aria-hidden />
        <span className="ti-orbit is-2" aria-hidden />
        <span className="ti-orbit is-3" aria-hidden />
        <AnimatedDataParticles />
        <svg className="ti-cloud-shape" viewBox="0 0 220 140" aria-hidden>
          <path d="M56 108c-18 0-32-14-32-31 0-16 12-29 28-31 5-18 22-31 42-31 16 0 30 8 38 20 6-3 13-4 20-4 24 0 44 18 46 41 16 2 28 15 28 31 0 18-15 32-34 32H56Z" />
        </svg>
        <div className="ti-cube" aria-hidden>
          <svg viewBox="0 0 64 64">
            <path d="M32 8 54 20v24L32 56 10 44V20Z" />
            <path d="M32 8v48M10 20l22 12 22-12" />
          </svg>
        </div>
        <p>
          <span>MODERN CLOUD</span>
          <span>INFRASTRUCTURE</span>
        </p>
      </div>
    </div>
  );
}
