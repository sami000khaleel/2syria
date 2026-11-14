import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, ImagePlus, Upload, X } from "lucide-react";

// Every image dropped into src/assets/search-images shows up in the picker automatically.
// The file name becomes the label: "umayyad-mosque.jpg" -> "umayyad mosque".
const imageModules = import.meta.glob(
  "../../assets/search-images/*.{png,jpg,jpeg,webp,avif,gif,PNG,JPG,JPEG,WEBP}",
  { eager: true, as: "url" }
);
const presetImages = Object.entries(imageModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, url]) => {
    const file = path.split("/").pop();
    const name = file
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim();
    return { url, file, name };
  });

const ImageSearch = ({ handleImageUpload }) => {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(null);

  // close with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // a file chosen (or dropped) from the device goes straight to the existing upload handler
  function handleDeviceFile(e) {
    if (!e.target.files || !e.target.files.length) return;
    handleImageUpload(e);
    setOpen(false);
  }

  // a gallery image is turned into a File and sent through the same handler
  async function handlePickPreset(preset) {
    try {
      setPicking(preset.url);
      const res = await fetch(preset.url);
      const blob = await res.blob();
      const file = new File([blob], preset.file, {
        type: blob.type || "image/jpeg",
      });
      setOpen(false);
      handleImageUpload({
        preventDefault() {},
        stopPropagation() {},
        target: { files: [file] },
      });
    } catch (err) {
      console.log(err);
    } finally {
      setPicking(null);
    }
  }

  return (
    <>
      <button
        type="button"
        id="image search"
        title="search by photo"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="upload-fab relative mt-1 flex h-16 cursor-pointer items-center gap-3 rounded-full py-2 pl-2 pr-6 text-left text-white"
      >
        <span className="upload-fab__pulse" aria-hidden />
        <span className="upload-fab__shine" aria-hidden />
        <span className="fab-icon pointer-events-none relative grid h-12 w-12 place-content-center rounded-full bg-white text-brand-600 shadow-inner">
          <Camera size={24} strokeWidth={2.25} />
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-star-500">
            <span className="absolute inset-0 animate-ping rounded-full bg-star-500/70" />
          </span>
        </span>
        <span className="pointer-events-none relative flex flex-col items-start leading-tight">
          <span className="text-[15px] font-bold">search by photo</span>
          <span className="text-xs font-medium text-white/75">find a place from an image</span>
        </span>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="search by photo"
            className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          >
            <div
              aria-hidden
              onClick={() => setOpen(false)}
              className="absolute inset-0 animate-[fade-in_250ms_ease-out] bg-ink-950/50 backdrop-blur-sm"
            />

            <div className="relative flex max-h-[88dvh] w-full max-w-2xl animate-sheet-up flex-col overflow-hidden rounded-t-3xl border border-sand-200 bg-white text-ink-900 shadow-2xl dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50 sm:animate-scale-in sm:rounded-3xl">
              {/* grab handle on phones */}
              <span aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink-200 dark:bg-ink-700 sm:hidden" />

              <header className="flex items-start gap-4 px-5 pb-4 pt-4 sm:px-7 sm:pt-6">
                <span className="grid h-12 w-12 shrink-0 place-content-center rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 text-white shadow-lg shadow-brand-500/30">
                  <Camera size={24} strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">search by photo</h2>
                  <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-300">
                    upload your own photo or pick one below — we'll find the place.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="close"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-content-center rounded-full text-ink-400 transition hover:rotate-90 hover:bg-ink-900/5 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="nice-scroll overflow-y-auto px-5 pb-6 sm:px-7 sm:pb-7">
                {/* upload from device (click or drop a file on it) */}
                <div className="group relative flex items-center gap-4 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/70 p-5 transition hover:border-brand-500 hover:bg-brand-50 focus-within:border-brand-500 dark:border-brand-700 dark:bg-brand-900/20 dark:hover:border-brand-400 dark:hover:bg-brand-900/30">
                  <span className="grid h-14 w-14 shrink-0 place-content-center rounded-2xl bg-white text-brand-600 shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg dark:bg-ink-850 dark:text-brand-300">
                    <Upload size={26} strokeWidth={2.25} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-base font-bold">upload from device</span>
                    <span className="text-sm text-ink-500 dark:text-ink-300">click to browse, or drop an image here</span>
                  </span>
                  <span className="ml-auto hidden rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition group-hover:bg-brand-600 dark:bg-brand-400 dark:text-ink-950 sm:inline-flex">
                    browse
                  </span>
                  <input
                    onChange={handleDeviceFile}
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer rounded-2xl opacity-0"
                    name="image"
                    id="image"
                    accept="image/*"
                  />
                </div>

                {presetImages.length ? (
                  <>
                    <div className="mb-3 mt-6 flex items-center gap-3">
                      <span className="section-label">or pick one of these</span>
                      <span className="h-px flex-1 bg-sand-200 dark:bg-ink-700" />
                      <span className="text-xs font-semibold text-ink-400">{presetImages.length}</span>
                    </div>
                    <ul className="stagger-fast grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {presetImages.map((preset) => (
                        <li key={preset.url}>
                          <button
                            type="button"
                            disabled={!!picking}
                            onClick={() => handlePickPreset(preset)}
                            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink-100 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/20 hover:ring-2 hover:ring-brand-400 focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-wait dark:bg-ink-800 dark:ring-white/10"
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-110"
                            />
                            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3 pb-2.5 pt-8 text-left text-sm font-semibold text-white">
                              {preset.name}
                            </span>
                            <span className="pointer-events-none absolute right-2 top-2 grid h-8 w-8 scale-75 place-content-center rounded-full bg-white/90 text-brand-600 opacity-0 shadow transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                              <ImagePlus size={16} strokeWidth={2.25} />
                            </span>
                            {picking === preset.url ? (
                              <span className="absolute inset-0 grid place-content-center bg-black/40 text-white backdrop-blur-[1px]">
                                <span className="spinner-sm" />
                              </span>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : import.meta.env.DEV ? (
                  <p className="mt-6 rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-ink-500 dark:border-ink-700 dark:bg-ink-850 dark:text-ink-300">
                    (dev only) add images to <code style={{ textTransform: "none" }}>src/assets/search-images</code> and they'll appear here.
                  </p>
                ) : null}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ImageSearch;
