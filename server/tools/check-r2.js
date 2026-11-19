/*
 * Checks what is really in the R2 bucket.
 *
 *   npm run check-r2                         # summary of the bucket
 *   npm run check-r2 -- --place=ChIJxxxx     # list the photos of one place
 *
 * Shows: total files and size, the top-level folders, how many places have photos under
 * places/<place_id>/, and (if they exist on this computer) how the bucket compares with
 * server/data/images and server/scripts/places.json.
 *
 * Needs in .env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const ONE_PLACE = arg("place");
const mb = (b) => (b / 1024 / 1024).toFixed(1) + " MB";

(async () => {
  // 1. settings
  const needed = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
  const missing = needed.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error(`Missing in .env: ${missing.join(", ")}`);
    process.exit(1);
  }
  const bucket = process.env.R2_BUCKET;
  console.log(`Bucket: "${bucket}"  (account ${process.env.R2_ACCOUNT_ID.slice(0, 6)}…)\n`);

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });

  // 2. list everything in the bucket
  const all = [];
  let token;
  try {
    do {
      const res = await client.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }));
      (res.Contents || []).forEach((o) => all.push({ key: o.Key, size: o.Size || 0 }));
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
      process.stdout.write(`\rListing… ${all.length} files`);
    } while (token);
    process.stdout.write("\r" + " ".repeat(40) + "\r");
  } catch (err) {
    console.error(`\nCould not list the bucket: ${err.name || ""} ${err.message}`);
    if (/NoSuchBucket/i.test(err.name + err.message))
      console.error(`→ there is no bucket called "${bucket}" in this account (check R2_BUCKET, it's case-sensitive)`);
    else if (/AccessDenied|Forbidden|403/i.test(err.name + err.message))
      console.error("→ the API token can't read this bucket (R2 → Manage API Tokens: give it Object Read & Write on this bucket)");
    else if (/InvalidAccessKeyId|SignatureDoesNotMatch|Unauthorized|401/i.test(err.name + err.message))
      console.error("→ wrong R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY (or R2_ACCOUNT_ID)");
    else if (/ENOTFOUND|getaddrinfo/i.test(err.message))
      console.error("→ R2_ACCOUNT_ID looks wrong (it's the 32-character id in the R2 dashboard URL / overview)");
    process.exit(1);
  }

  const totalSize = all.reduce((s, o) => s + o.size, 0);
  console.log(`Files in bucket: ${all.length}  (${mb(totalSize)})`);
  if (!all.length) {
    console.log("\n✗ The bucket is EMPTY — run: npm run upload-images");
    return;
  }

  // 3. top-level folders (shows if images were uploaded somewhere other than places/)
  const top = new Map();
  for (const o of all) {
    const first = o.key.includes("/") ? o.key.split("/")[0] + "/" : "(root files)";
    top.set(first, (top.get(first) || 0) + 1);
  }
  console.log("\nTop-level folders:");
  [...top.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, n]) => console.log(`  ${k.padEnd(30)} ${n} files`));

  // 4. photos the app can use: places/<place_id>/<photo_reference>.jpg
  const byPlace = new Map();
  for (const o of all) {
    const m = /^places\/([^/]+)\/(.+)\.jpg$/i.exec(o.key);
    if (!m) continue;
    if (!byPlace.has(m[1])) byPlace.set(m[1], []);
    byPlace.get(m[1]).push({ ref: m[2], size: o.size });
  }
  const usable = [...byPlace.values()].reduce((s, a) => s + a.length, 0);
  console.log(`\nPhotos in the format the app reads (places/<place_id>/<photo>.jpg): ${usable} for ${byPlace.size} places`);
  if (!usable) {
    console.log("✗ None of the files are under places/ — the app won't find them.");
    console.log("  If they're in another folder above, re-run: npm run upload-images");
  }
  const empty = all.filter((o) => o.key.startsWith("places/") && o.size === 0).length;
  if (empty) console.log(`⚠ ${empty} files are 0 bytes (broken uploads) — re-run: npm run upload-images -- --force`);

  // examples
  [...byPlace.entries()].slice(0, 3).forEach(([id, photos]) =>
    console.log(`  e.g. ${id}: ${photos.length} photo(s), first = places/${id}/${photos[0].ref}.jpg`)
  );

  // 5. one place in detail
  if (ONE_PLACE) {
    const photos = byPlace.get(ONE_PLACE) || [];
    console.log(`\nPlace ${ONE_PLACE}: ${photos.length ? photos.length + " photo(s)" : "✗ no photos in the bucket"}`);
    photos.forEach((p) => console.log(`  places/${ONE_PLACE}/${p.ref}.jpg  (${(p.size / 1024).toFixed(0)} KB)`));
  }

  // 6. compare with the local images folder (if it's on this computer)
  const localDir = path.join(__dirname, "..", process.env.IMAGES_DIR || path.join("data", "images"));
  if (fs.existsSync(localDir)) {
    let local = 0, missingInR2 = [];
    for (const placeId of fs.readdirSync(localDir)) {
      const dir = path.join(localDir, placeId);
      if (!fs.statSync(dir).isDirectory()) continue;
      const inBucket = new Set((byPlace.get(placeId) || []).map((p) => p.ref + ".jpg"));
      for (const f of fs.readdirSync(dir)) {
        if (!/\.jpe?g$/i.test(f)) continue;
        local++;
        if (!inBucket.has(f)) missingInR2.push(`${placeId}/${f}`);
      }
    }
    console.log(`\nLocal folder ${localDir}: ${local} images`);
    if (missingInR2.length) {
      console.log(`✗ ${missingInR2.length} local images are NOT in R2, e.g. ${missingInR2.slice(0, 3).join(", ")}`);
      console.log("  → run: npm run upload-images");
    } else console.log("✓ every local image is in R2");
  }

  // 7. compare with places.json (if it's on this computer)
  const jsonFile = [path.join(__dirname, "..", "scripts", "places.json"), path.join(__dirname, "..", "data", "places.json")].find((f) => fs.existsSync(f));
  if (jsonFile) {
    const raw = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    const list = Array.isArray(raw) ? raw : raw.results || raw.places || [];
    const ids = new Set(list.map((p) => p.place_id).filter(Boolean));
    const withPhotos = [...ids].filter((id) => byPlace.has(id)).length;
    console.log(`\n${path.basename(jsonFile)}: ${ids.size} unique places, ${withPhotos} of them have photos in R2, ${ids.size - withPhotos} don't`);
    const unknown = [...byPlace.keys()].filter((id) => !ids.has(id)).length;
    if (unknown) console.log(`  (${unknown} place folders in R2 don't match any place in the JSON)`);
  }

  console.log(usable ? "\n✓ R2 has photos the app can use." : "\n✗ No usable photos found.");
})();