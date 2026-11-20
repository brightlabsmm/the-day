"use client";

/*
 * Photo album: each photo is a print mounted on the page with gold photo
 * corners, at its original proportions. Tapping a print opens a full-screen
 * viewer (native <dialog>: focus trap, Esc to close) with swipe and arrow keys.
 */
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { albumRows, type AlbumPhoto } from "@/lib/album";
import { formatNumber, type Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";

export function Gallery({ photos, locale }: { photos: AlbumPhoto[]; locale: Locale }) {
  const [index, setIndex] = useState<number | null>(null);
  const rows = albumRows(photos);
  const order = rows.flatMap((r) => r.photos);

  return (
    <>
      <div className="mt-6 flex flex-col gap-[clamp(1rem,6cqi,1.5rem)]">
        {rows.map((row) => (
          <div key={row.photos[0].id} className="flex items-start gap-[clamp(0.6rem,4cqi,1rem)]">
            {row.photos.map((photo) => (
              <Print
                key={photo.id}
                photo={photo}
                locale={locale}
                // Paired prints share a row height: each grows by its aspect ratio.
                grow={row.type === "pair" ? photo.width / photo.height : 1}
                sizes={row.type === "pair" ? "(max-width: 440px) 40vw, 170px" : "(max-width: 440px) 80vw, 350px"}
                onOpen={() => setIndex(order.indexOf(photo))}
              />
            ))}
          </div>
        ))}
      </div>

      {index !== null && (
        <Viewer photos={order} index={index} locale={locale} onChange={setIndex} onClose={() => setIndex(null)} />
      )}
    </>
  );
}

function Print({
  photo,
  locale,
  grow,
  sizes,
  onOpen,
}: {
  photo: AlbumPhoto;
  locale: Locale;
  grow: number;
  sizes: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="album-print group min-w-0"
      style={{ flex: `${grow} 1 0%` }}
      aria-label={`${s("viewPhoto", locale)}: ${photo.alt}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        quality={85}
        className="block h-auto w-full transition-[filter] duration-300 group-hover:brightness-[1.03]"
      />
      <span aria-hidden className="album-corner album-corner-tl" />
      <span aria-hidden className="album-corner album-corner-tr" />
      <span aria-hidden className="album-corner album-corner-bl" />
      <span aria-hidden className="album-corner album-corner-br" />
    </button>
  );
}

function Viewer({
  photos,
  index,
  locale,
  onChange,
  onClose,
}: {
  photos: AlbumPhoto[];
  index: number;
  locale: Locale;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<number | null>(null);
  const photo = photos[index];
  const go = useCallback(
    (step: number) => onChange((index + step + photos.length) % photos.length),
    [index, onChange, photos.length],
  );

  // Open as a modal (traps focus, Esc closes) and stop the page behind from scrolling.
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
      el?.close();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <dialog
      ref={dialog}
      aria-label={s("photoViewer", locale)}
      lang={locale}
      // Closing goes through Esc (cancel), the close button or the backdrop. The native
      // `close` event is not used: effect cleanup also closes the dialog (e.g. React's
      // dev double-mount), and that must not unmount the viewer.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Tapping the dark backdrop (not the photo or controls) closes the viewer.
        if (e.target === e.currentTarget) onClose();
      }}
      onPointerDown={(e) => (swipeStart.current = e.clientX)}
      onPointerUp={(e) => {
        if (swipeStart.current === null) return;
        const dx = e.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      className="photo-viewer"
    >
      <div className="pointer-events-none flex h-full w-full items-center justify-center p-3 pt-14 pb-16">
        <Image
          key={photo.id}
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="100vw"
          quality={85}
          className="pointer-events-auto h-auto max-h-full w-auto max-w-full object-contain shadow-2xl select-none"
          draggable={false}
        />
      </div>

      <button type="button" onClick={onClose} aria-label={s("close", locale)} className="viewer-button absolute top-3 right-3">
        <X className="size-5" />
      </button>

      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-6">
          <button type="button" onClick={() => go(-1)} aria-label={s("previous", locale)} className="viewer-button">
            <ChevronLeft className="size-5" />
          </button>
          <p className="viewer-count" aria-live="polite">
            {formatNumber(index + 1, locale)} / {formatNumber(photos.length, locale)}
          </p>
          <button type="button" onClick={() => go(1)} aria-label={s("next", locale)} className="viewer-button">
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </dialog>
  );
}
