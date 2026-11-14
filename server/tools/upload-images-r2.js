/*
 * Uploads the place photos to Cloudflare R2, keeping the folder structure.
 *
 *   data/images/<place_id>/<photo_reference>.jpg
 *     ->  <bucket>/places/<place_id>/<photo_reference>.jpg
 *
 * Usage (from the server folder):
 *   npm run upload-images            # uploads only what is missing in the bucket
 *   npm run upload-images -- --force # re-uploads everything
 *   npm run upload-images -- --dry   # shows what would be uploaded, uploads nothing
 *
 * Needs in .env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 * Optional:      IMAGES_DIR (default: data/images)
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");

const PREFIX = "places";
const CONCURRENCY = 8;
const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry");

const imagesDir = path.resolve(
  path.join(__dirname, ".."),
  process.env.IMAGES_DIR || path.join("data", "images")
);

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function requireEnv(names) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error(`Missing in .env: ${missing.join(", ")}`);
    process.exit(1);
  }
}

// every image file as { file, key }
function collectImages() {
  if (!fs.existsSync(imagesDir)) {
    console.error(`Images folder not found: ${imagesDir}`);
    process.exit(1);
  }
  const list = [];
  for (const placeFolder of fs.readdirSync(imagesDir)) {
    const folderPath = path.join(imagesDir, placeFolder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    for (const name of fs.readdirSync(folderPath)) {
      const ext = path.extname(name).toLowerCase();
      if (!CONTENT_TYPES[ext]) continue;
      list.push({
        file: path.join(folderPath, name),
        key: `${PREFIX}/${placeFolder}/${name}`,
        contentType: CONTENT_TYPES[ext],
      });
    }
  }
  return list;
}

// keys already in the bucket under places/
async function listExistingKeys(client, bucket) {
  const keys = new Set();
  let token;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `${PREFIX}/`,
        ContinuationToken: token,
      })
    );
    (res.Contents || []).forEach((o) => keys.add(o.Key));
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function main() {
  requireEnv(["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]);
  const bucket = process.env.R2_BUCKET;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const images = collectImages();
  console.log(`Found ${images.length} images in ${imagesDir}`);

  let todo = images;
  if (!force) {
    const existing = await listExistingKeys(client, bucket);
    todo = images.filter((img) => !existing.has(img.key));
    console.log(`${images.length - todo.length} already in "${bucket}", ${todo.length} to upload`);
  }
  if (dryRun) {
    todo.slice(0, 20).forEach((img) => console.log("  would upload", img.key));
    if (todo.length > 20) console.log(`  ...and ${todo.length - 20} more`);
    return;
  }
  if (!todo.length) return console.log("Nothing to upload. Done.");

  let done = 0;
  const failed = [];
  let next = 0;
  async function worker() {
    while (next < todo.length) {
      const img = todo[next++];
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: img.key,
            Body: fs.readFileSync(img.file),
            ContentType: img.contentType,
            // photos never change under the same name, so browsers may cache them for a year
            CacheControl: "public, max-age=31536000, immutable",
          })
        );
      } catch (err) {
        failed.push({ key: img.key, error: err.message });
      }
      done++;
      process.stdout.write(`\rUploaded ${done}/${todo.length}${failed.length ? ` (${failed.length} failed)` : ""}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");

  if (failed.length) {
    console.log(`${failed.length} uploads failed (run the command again to retry them):`);
    failed.slice(0, 10).forEach((f) => console.log(`  ${f.key}: ${f.error}`));
    process.exitCode = 1;
  } else {
    console.log("All images uploaded.");
  }
  console.log(`Check one through your server: /api/place/image?placeId=${(todo[0] || images[0]).key.split("/")[1]}&photoReference=${path.basename((todo[0] || images[0]).key, path.extname((todo[0] || images[0]).key))}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
