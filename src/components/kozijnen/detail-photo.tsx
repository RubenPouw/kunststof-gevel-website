import type { DetailPhoto } from "@/lib/kozijnen/detail-photos";
import { cn } from "@/lib/utils";

export function DetailPhotoCard({
  photo,
  label,
  active = false,
  onPick,
}: {
  photo: DetailPhoto;
  label?: string;
  active?: boolean;
  onPick?: () => void;
}) {
  const title = label ?? photo.title;
  const body = (
    <>
      {photo.src ? (
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full bg-kg-kalk object-cover"
        />
      ) : (
        <span className="grid aspect-[4/3] place-items-center bg-kg-kalk px-3 text-center" role="img" aria-label={photo.alt}>
          <span className="text-[13px] text-kg-text-2">Foto volgt</span>
        </span>
      )}
      <span className="block px-3 py-2 text-left text-[14px]">{title}</span>
    </>
  );
  const className = cn("block w-full border bg-white text-left", active ? "border-kg-navy" : "border-kg-lijn");
  if (!onPick) {
    return <figure className={cn(className, "m-0")}>{body}</figure>;
  }
  return (
    <button type="button" className={className} aria-pressed={active} onClick={onPick}>
      {body}
    </button>
  );
}
