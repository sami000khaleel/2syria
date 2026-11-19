/*
 * Cleans the places directly in the database the app uses (Atlas when MONGO_CLUSTER is set).
 *
 *   npm run clean-places -- --dry          # show what would change, change nothing
 *   npm run clean-places                   # remove reviews from users that no longer exist
 *   npm run clean-places -- --all          # remove EVERY review (old, demo and new users)
 *   npm run clean-places -- --check-r2     # also drop photo references whose file isn't in R2
 *
 * What it does, for every place:
 *  - removes reviews whose user no longer exists in the users collection (the old users),
 *    or all reviews with --all, and recalculates avgRating from the reviews that are left
 *  - keeps photos as photo_reference: that's the file name of the photo in R2
 *    (places/<place_id>/<photo_reference>.jpg) — the server streams it from the bucket
 *  - with --check-r2: drops photo references whose file is NOT in the bucket (no broken images)
 * Nothing else is touched. Users are not changed.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { getMongoUrl, safeMongoUrl } = require("../utils/mongoUrl");

const DRY = process.argv.includes("--dry");
const ALL = process.argv.includes("--all");
const CHECK_R2 = process.argv.includes("--check-r2");

async function r2Photos() {
  const needed = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
  const missing = needed.filter((n) => !process.env[n]);
  if (missing.length) throw new Error(`--check-r2 needs these in .env: ${missing.join(", ")}`);
  const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });
  const keys = new Set();
  let token;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET, Prefix: "places/", ContinuationToken: token })
    );
    (res.Contents || []).forEach((o) => o.Size > 0 && keys.add(o.Key)); // ignore broken 0-byte uploads
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  console.log(`R2 bucket "${process.env.R2_BUCKET}": ${keys.size} photos under places/`);
  if (!keys.size) throw new Error("the bucket has no photos under places/ — upload them first (npm run upload-images), or run without --check-r2");
  return keys;
}

const average = (reviews) => {
  const rated = reviews.filter((r) => typeof r.rating === "number");
  return rated.length ? Math.round((rated.reduce((s, r) => s + r.rating, 0) / rated.length) * 100) / 100 : 0;
};

(async () => {
  const url = getMongoUrl();
  try {
    await mongoose.connect(url, { family: 4, serverSelectionTimeoutMS: 15000 });
    const db = mongoose.connection.db;
    console.log(`Connected: ${safeMongoUrl(url)} -> db "${mongoose.connection.name}"${DRY ? "  (dry run)" : ""}`);

    const placesCol = db.collection("places");
    const users = await db.collection("users").find({}, { projection: { _id: 1 } }).toArray();
    const existingUsers = new Set(users.map((u) => String(u._id)));
    console.log(`Users in the database: ${existingUsers.size}`);

    const inR2 = CHECK_R2 ? await r2Photos() : null;

    const places = await placesCol.find({}, { projection: { place_id: 1, name: 1, reviews: 1, photos: 1, avgRating: 1 } }).toArray();
    console.log(`Places: ${places.length}`);
    if (!places.length) {
      console.log(`No places in db "${mongoose.connection.name}" — check MONGO_INITDB_DATABASE / MONGO_DB in .env`);
      return;
    }

    let removedReviews = 0, keptReviews = 0, droppedPhotos = 0, changed = 0;
    const ops = [];
    for (const p of places) {
      const reviews = p.reviews || [];
      const kept = ALL ? [] : reviews.filter((r) => r.userId && existingUsers.has(String(r.userId)));
      removedReviews += reviews.length - kept.length;
      keptReviews += kept.length;

      const set = {};
      if (kept.length !== reviews.length) {
        set.reviews = kept;
        set.avgRating = average(kept);
      } else if ((p.avgRating || 0) !== average(kept)) {
        set.avgRating = average(kept); // fix ratings that don't match the reviews
      }

      if (inR2) {
        const photos = (p.photos || []).filter((ph) => ph && ph.photo_reference);
        const okPhotos = photos.filter((ph) => inR2.has(`places/${p.place_id}/${ph.photo_reference}.jpg`));
        if (okPhotos.length !== (p.photos || []).length) {
          droppedPhotos += (p.photos || []).length - okPhotos.length;
          set.photos = okPhotos;
        }
      }

      if (Object.keys(set).length) {
        changed++;
        ops.push({ updateOne: { filter: { _id: p._id }, update: { $set: set } } });
      }
    }

    console.log(`Reviews to remove: ${removedReviews}${ALL ? " (all of them)" : " (from users that no longer exist)"}, kept: ${keptReviews}`);
    if (inR2) console.log(`Photo references not in R2 (to remove): ${droppedPhotos}`);
    console.log(`Places that change: ${changed}`);

    if (DRY) return console.log("(dry run — nothing changed)");
    for (let i = 0; i < ops.length; i += 500) {
      await placesCol.bulkWrite(ops.slice(i, i + 500), { ordered: false });
      process.stdout.write(`\rUpdated ${Math.min(i + 500, ops.length)}/${ops.length}`);
    }
    if (ops.length) process.stdout.write("\n");
    console.log("Done. Next: npm run seed  (adds fresh demo users and reviews)");
  } catch (err) {
    console.error("Failed:", err.message);
    if (/bad auth|authentication failed/i.test(err.message)) console.error("→ username/password don't match (Atlas → Database Access)");
    else if (/ENOTFOUND|querySrv|hostname/i.test(err.message)) console.error("→ check MONGO_CLUSTER in .env");
    else if (/timed out|Server selection/i.test(err.message)) console.error("→ your IP isn't allowed (Atlas → Network Access)");
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();