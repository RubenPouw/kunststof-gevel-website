import { colorById } from "@/lib/kozijnen/config";
import type { Layout } from "@/lib/kozijnen/layouts";
import type { KozijnConfig } from "@/lib/kozijnen/model";

/** Extruded frame. Technical, not a room render. */
export function KozijnView3D({ layout, config }: { layout: Layout; config: KozijnConfig }) {
  const frame = colorById(config.frameOut).hex;
  const ratio = config.width / Math.max(config.height, 1);
  const height = 220;
  const width = Math.max(96, Math.min(280, height * ratio));
  const depth = 28;

  return (
    <figure className="m-0">
      <div className="grid min-h-[280px] place-items-center" style={{ perspective: "900px" }}>
        <div
          className="relative"
          style={{
            width,
            height,
            transform: "rotateX(16deg) rotateY(-32deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="absolute inset-0 border-[14px]" style={{ borderColor: frame, background: "#D7DEE4" }} />
          <div
            className="absolute top-0 right-0"
            style={{
              width: depth,
              height,
              background: frame,
              transform: `translateX(${depth}px) rotateY(90deg)`,
              transformOrigin: "left center",
            }}
          />
          <div
            className="absolute bottom-0 left-0"
            style={{
              width,
              height: depth,
              background: frame,
              transform: `translateY(${depth}px) rotateX(-90deg)`,
              transformOrigin: "center top",
            }}
          />
        </div>
      </div>
      <figcaption className="mt-2 font-mono text-[12px] text-kg-text-2">
        3D · {layout.title} · {config.width} × {config.height} mm · van buiten
      </figcaption>
    </figure>
  );
}
