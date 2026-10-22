import { frameFaceMm, drawingBox, workingDrawingSvg } from "@/lib/kozijnen/drawing";
import type { Layout } from "@/lib/kozijnen/layouts";
import type { KozijnConfig } from "@/lib/kozijnen/model";

export function KozijnDrawing({
  layout,
  config,
  caption = true,
  prefix,
}: {
  layout: Layout;
  config: KozijnConfig;
  caption?: boolean;
  prefix?: string;
}) {
  const box = drawingBox(config);
  const svg = workingDrawingSvg(layout, config, prefix ?? layout.slug);
  const face = frameFaceMm(layout.slug);
  return (
    <figure className="m-0 bg-white">
      <div
        className="w-full"
        style={{ aspectRatio: `${Math.round(box.width)} / ${Math.round(box.height)}` }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption ? (
        <figcaption className="mt-3 text-[14px] leading-snug text-kg-navy">
          U configureert dit kozijn vanaf het buitenaanzicht.
          <span className="mt-1 block font-mono text-[12px] text-kg-text-2">
            {face == null ? "Maten in mm." : `Maten in mm. Het kader is ${face} mm in het aanzicht.`}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
