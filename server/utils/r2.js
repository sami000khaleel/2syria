// Private Cloudflare R2 client (S3 API). The bucket does not need public access:
// the server reads photos with these keys and streams them to the browser.
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const REQUIRED = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];

let client = null;
function isConfigured() {
  return REQUIRED.every((name) => process.env[name]);
}
function getClient() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

// Returns { body (Node stream), contentType, contentLength, etag, lastModified }
// or { notModified: true } when the browser's cached copy (ETag) is still current.
// Throws an error with status 404 when the object does not exist.
async function getObject(key, ifNoneMatch) {
  try {
    const res = await getClient().send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        IfNoneMatch: ifNoneMatch || undefined,
      })
    );
    return {
      body: res.Body,
      contentType: res.ContentType,
      contentLength: res.ContentLength,
      etag: res.ETag,
      lastModified: res.LastModified,
    };
  } catch (err) {
    const status = err?.$metadata?.httpStatusCode;
    if (status === 304) return { notModified: true };
    if (status === 404 || err?.name === "NoSuchKey") {
      const e = new Error("image not found");
      e.status = 404;
      throw e;
    }
    throw err;
  }
}

module.exports = { isConfigured, getObject };
