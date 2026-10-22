import { productPictureSvg, pictureScene } from "@/lib/kozijnen/picture";
import type { Layout } from "@/lib/kozijnen/layouts";
import type { KozijnConfig } from "@/lib/kozijnen/model";
import { summaryLines } from "@/lib/kozijnen/text";

/** Vast productplaatje. De ingevoerde maat verandert de tekening, niet dit beeld. */
export function KozijnPicture({
  layout,
  config,
  prefix = "k",
}: {
  layout: Layout;
  config: KozijnConfig;
  prefix?: string;
}) {
  const scene = pictureScene(layout, config);
  const svg = productPictureSvg(layout, config, prefix);
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const alt = `${layout.title}, van buiten gezien`;
  return (
    <figure className="m-0">
      <img
        src={src}
        alt={alt}
        width={scene.width}
        height={scene.height}
        loading="lazy"
        decoding="async"
        className="mx-auto block h-auto w-full max-w-[320px]"
      />
      <figcaption className="mt-2 text-[13px] text-kg-text-2">Van buiten gezien. De verhouding van het plaatje is vast.</figcaption>
    </figure>
  );
}

export function KozijnOrderSummary({ config }: { config: KozijnConfig }) {
  const lines = summaryLines(config);
  return (
    <div className="mt-4 border-t border-kg-lijn pt-3">
      <p className="text-[14px] font-medium">Dit bestelt u</p>
      <dl className="mt-2 space-y-1 text-[14px]">
        {lines.map((line) => (
          <div key={line.label} className="grid grid-cols-[7.25rem_1fr] gap-2">
            <dt className="text-kg-text-2">{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
