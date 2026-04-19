const path = require("path");
const { put } = require("@vercel/blob");

const sanitizeFileName = (fileName = "") =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

/**
 * Upload bytes to Vercel Blob (public). Returns HTTPS URL suitable for storing in DB.
 * @param {object} opts
 * @param {Buffer} opts.buffer
 * @param {string} opts.contentType
 * @param {"profilephotos"|"clinicaldocs"} opts.prefix
 * @param {string|number} opts.patientId
 * @param {string} opts.originalname
 * @param {string} opts.token - BLOB_READ_WRITE_TOKEN
 */
async function uploadBufferToBlob({
  buffer,
  contentType,
  prefix,
  patientId,
  originalname,
  token,
}) {
  if (!token || typeof token !== "string") {
    throw new Error("Blob token missing");
  }
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty file buffer");
  }

  const ext = path.extname(originalname || "");
  const base = sanitizeFileName(
    path.basename(originalname || "file", ext) || "file"
  );
  const safePatient = String(patientId ?? "unknown").replace(
    /[^a-zA-Z0-9-_]/g,
    ""
  );
  const pathname = `${prefix}/${safePatient}/${Date.now()}_${base}${ext}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    token,
    contentType: contentType || "application/octet-stream",
    addRandomSuffix: false,
  });

  return {
    provider: "vercel-blob",
    storagePath: blob.url,
    url: blob.url,
    pathname: blob.pathname,
  };
}

module.exports = { uploadBufferToBlob };
