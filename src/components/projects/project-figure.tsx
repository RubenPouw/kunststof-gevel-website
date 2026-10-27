import Image from "next/image";

import type { ProjectPhoto } from "@/data/projects";
import { cn } from "@/lib/utils";

export function ProjectFigure({
  photo,
  priority = false,
  sizes,
  className,
  imageClassName,
}: {
  photo: ProjectPhoto;
  priority?: boolean;
  sizes: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-kg-kalk bevel-16", className)}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imageClassName)}
        style={{ objectPosition: photo.position ?? "center" }}
      />
    </div>
  );
}
