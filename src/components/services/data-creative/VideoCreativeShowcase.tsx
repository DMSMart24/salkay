import { CreativeVideoPlayer } from "@/components/services/data-creative/CreativeVideoPlayer";
import { ProductionSteps } from "@/components/services/data-creative/ProductionSteps";

export function VideoCreativeShowcase() {
  return (
    <article className="dcr-card is-video">
      <div className="dcr-copy">
        <b>02</b>
        <p>ANLATI</p>
        <h3 className="font-display">Video & Creative</h3>
        <span>
          Markanızı sosyal medya, reklam ve dijital kampanyalarda güçlü şekilde
          anlatan video ve kreatif içerikler üretiyoruz.
        </span>
      </div>
      <CreativeVideoPlayer />
      <ProductionSteps />
    </article>
  );
}
