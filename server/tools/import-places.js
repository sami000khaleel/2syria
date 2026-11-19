/*
 * Imports the places into the database the app uses (Atlas when MONGO_CLUSTER is set).
 *
 *   npm run import-places                                   # reads scripts/places.json (or data/places.json)
 *   npm run import-places -- --file=C:/path/to/places.json  # a specific file
 *   npm run import-places -- --from-mongo=mongodb://127.0.0.1:27017/2syria   # copy from your old local DB
 *   npm run import-places -- --dry                          # show what would happen, change nothing
 *
 * Photos: the R2 bucket is the source of truth. Each place gets exactly the photos that exist in R2
 * at places/<place_id>/<photo_reference>.jpg (needs the R2_* variables in .env). Places without
 * any photo in R2 are still imported — the app shows the fallback image for them.
 *
 * Safe to run again: places are matched by place_id and updated, never duplicated, and existing
 * reviews / ratings (e.g. from "npm run seed") are kept.
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Place = require("../models/placeModel");
const { getMongoUrl, safeMongoUrl } = require("../utils/mongoUrl");

// ---------------- options ----------------
const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const DRY = process.argv.includes("--dry");
const FILE = arg("file");
const FROM_MONGO = arg("from-mongo");

// ---------------- read the source places ----------------
function findJsonFile() {
  const candidates = [
    FILE,
    path.join(__dirname, "..", "scripts", "places.json"),
    path.join(__dirname, "..", "data", "places.json"),
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p));
}

async function readFromMongo(url) {
  const conn = await mongoose.createConnection(url, { family: 4, serverSelectionTimeoutMS: 15000 }).asPromise();
  console.log(`Reading places from ${safeMongoUrl(url)} (db "${conn.name}")`);
  const docs = await conn.db.collection("places").find({}).toArray();
  await conn.close();
  return docs;
}

async function readSource() {
  if (FROM_MONGO) return { places: await readFromMongo(FROM_MONGO), from: "old database" };
  const file = findJsonFile();
  if (!file) {
    console.error(
      "No places source found.\n" +
      "  - put places.json in server/scripts/ or server/data/, or pass --file=<path>\n" +
      "  - or copy from your old local DB: --from-mongo=mongodb://127.0.0.1:27017/2syria"
    );
    process.exit(1);
  }
  console.log(`Reading places from ${file}`);
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  return { places: Array.isArray(raw) ? raw : raw.results || raw.places || [], from: path.basename(file) };
}

// Google Places result OR an existing Place document -> fields of our Place model
function normalize(p) {
  const loc = p.location || p.geometry?.location || {};
  const lat = Number(loc.lat), lng = Number(loc.lng);
  if (!p.place_id || !p.name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    place_id: String(p.place_id),
    name: String(p.name).trim(),
    location: { lat, lng },
    type: p.type ? String(p.type) : "historical",
    city: p.city ? String(p.city) : undefined,
    description: p.description || "",
    photos: (p.photos || [])
      .filter((ph) => ph && ph.photo_reference)
      .map((ph) => ({ photo_reference: ph.photo_reference, width: ph.width, height: ph.height })),
  };
}

// ---------------- R2: which photos really exist ----------------
async function listR2Photos() {
  const needed = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
  if (!needed.every((n) => process.env[n])) {
    console.log("R2 variables not set — keeping the photo list from the source as-is (some may be missing in R2).");
    return null;
  }
  const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });
  const byPlace = new Map(); // place_id -> Set(photo_reference)
  let token, total = 0;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET, Prefix: "places/", ContinuationToken: token })
    );
    for (const { Key } of res.Contents || []) {
      const m = /^places\/([^/]+)\/(.+)\.jpg$/i.exec(Key);
      if (!m) continue;
      if (!byPlace.has(m[1])) byPlace.set(m[1], new Set());
      byPlace.get(m[1]).add(m[2]);
      total++;
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  console.log(`R2 bucket "${process.env.R2_BUCKET}": ${total} photos for ${byPlace.size} places`);
  return byPlace;
}

// ---------------- main ----------------
(async () => {
  const url = getMongoUrl();
  try {
    const { places: rawPlaces, from } = await readSource();

    // normalize + remove duplicates (the same place shows up in several Google searches)
    const byId = new Map();
    let skipped = 0;
    for (const raw of rawPlaces) {
      const p = normalize(raw);
      if (!p) { skipped++; continue; }
      if (!byId.has(p.place_id)) byId.set(p.place_id, p);
    }
    const places = [...byId.values()];
    console.log(`${from}: ${rawPlaces.length} entries -> ${places.length} unique places${skipped ? ` (${skipped} skipped: missing id/name/location)` : ""}`);

    // photos from R2
    const r2 = await listR2Photos();
    let withPhotos = 0, photoCount = 0;
    for (const p of places) {
      if (r2) {
        const inBucket = r2.get(p.place_id) || new Set();
        const known = p.photos.filter((ph) => inBucket.has(ph.photo_reference));
        const knownRefs = new Set(known.map((ph) => ph.photo_reference));
        // photos that are in R2 but not in the source list are added too
        const extra = [...inBucket].filter((ref) => !knownRefs.has(ref)).map((ref) => ({ photo_reference: ref }));
        p.photos = [...known, ...extra];
      }
      if (p.photos.length) withPhotos++;
      photoCount += p.photos.length;
    }
    console.log(`Photos: ${photoCount} total, ${withPhotos} places with photos, ${places.length - withPhotos} without (they show the fallback image)`);

    // connect to the target DB
    await mongoose.connect(url, { family: 4, serverSelectionTimeoutMS: 15000 });
    const dbName = mongoose.connection.name;
    console.log(`Target: ${safeMongoUrl(url)} -> db "${dbName}"`);
    if (["mongodb", "test", "admin"].includes(dbName))
      console.log(`⚠ the database is called "${dbName}" — you probably want MONGO_DB=2syria in .env`);

    const existing = new Set((await Place.find({}, { place_id: 1 }).lean()).map((d) => d.place_id));
    const newOnes = places.filter((p) => !existing.has(p.place_id)).length;
    console.log(`In the database: ${existing.size} places. Will add ${newOnes} and update ${places.length - newOnes}.`);

    if (DRY) {
      places.slice(0, 3).forEach((p) => console.log(`  example: ${p.name} | ${p.city || "-"} | ${p.type} | ${p.photos.length} photos`));
      console.log("(dry run — nothing changed)");
      return;
    }

    const ops = places.map((p) => {
      const set = { name: p.name, location: p.location, type: p.type, photos: p.photos };
      if (p.city) set.city = p.city;
      return {
        updateOne: {
          filter: { place_id: p.place_id },
          update: {
            $set: set,
            // only for new places — existing reviews and ratings are kept
            $setOnInsert: { place_id: p.place_id, description: p.description, avgRating: 0, reviews: [], suitableForBadWeather: true },
          },
          upsert: true,
        },
      };
    });
    let added = 0, updated = 0;
    for (let i = 0; i < ops.length; i += 500) {
      const res = await Place.bulkWrite(ops.slice(i, i + 500), { ordered: false });
      added += res.upsertedCount || 0;
      updated += res.modifiedCount || 0;
      process.stdout.write(`\rSaved ${Math.min(i + 500, ops.length)}/${ops.length}`);
    }
    process.stdout.write("\n");
    console.log(`Done: ${added} added, ${updated} updated. Now run "npm run seed" to add users and reviews.`);
  } catch (err) {
    console.error("Import failed:", err.message);
    if (/bad auth|authentication failed/i.test(err.message))
      console.error("→ username/password don't match (Atlas → Database Access)");
    else if (/ENOTFOUND|querySrv/i.test(err.message))
      console.error("→ hostname is wrong (check MONGO_CLUSTER, or the --from-mongo URL)");
    else if (/ECONNREFUSED/i.test(err.message))
      console.error("→ the old local MongoDB isn't running (start it, or use --file=places.json)");
    else if (/timed out|Server selection/i.test(err.message))
      console.error("→ your IP isn't allowed (Atlas → Network Access)");
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();