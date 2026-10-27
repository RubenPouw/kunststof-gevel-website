import type { DetailPhoto } from "@/lib/kozijnen/detail-photos";
import { cn } from "@/lib/utils";

export function DetailPhotoCard({
  photo,
  label,
  note,
  active = false,
  onPick,
}: {
  photo: DetailPhoto;
  label?: string;
  note?: string;
  active?: boolean;
  onPick?: () => void;
}) {
  const title = label ?? photo.title;
  const frame = "aspect-[4/3] w-full overflow-hidden bg-kg-kalk bevel-16";
  const body = (
    <>
      {photo.src ? (
        <span className={`relative block ${frame}`}>
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </span>
      ) : (
        <span className={`grid place-items-center px-4 text-center ${frame}`} role="img" aria-label={photo.alt}>
          <span className="text-[14px] text-kg-text-2">Foto volgt</span>
        </span>
      )}
      <span className="block px-4 pt-4 text-left text-[16px] leading-snug font-medium">{title}</span>
      {note ? <span className="block px-4 pt-1 text-left text-[14px] leading-snug text-kg-text-2">{note}</span> : null}
      {onPick ? <span className="block px-4 pt-3 pb-4 font-mono text-[12px]">{active ? "Gekozen" : "Kies"}</span> : <span className="block h-4" />}
    </>
  );
  const className = cn("block w-full border-2 bg-white text-left", active ? "border-kg-navy bg-kg-kalk" : "border-kg-lijn");
  if (!onPick) {
    return <figure className={cn(className, "m-0")}>{body}</figure>;
  }
  return (
    <button type="button" className={className} aria-pressed={active} onClick={onPick}>
      {body}
    </button>
  );
}
