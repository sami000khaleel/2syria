# Search-by-photo gallery

Paste the images you want users to pick from into this folder.

- Supported: .jpg .jpeg .png .webp .avif .gif
- They appear automatically in the "Search by photo" picker — no code changes needed.
- The file name becomes the label shown on the card, e.g.
  `umayyad-mosque.jpg` → "Umayyad Mosque", `citadel_of_aleppo.webp` → "Citadel Of Aleppo".
- Order is alphabetical, so prefix with numbers (`01-...`, `02-...`) to control it.
- Keep each image under ~500 KB so the picker opens fast (they are bundled with the app).

Restart `npm run dev` after adding the first images if they don't show up.
