const { env } = require("../config/env");
const { resolveStorageUrl, saveFileToLocalFallback } = require("../lib/storage");
const { uploadBufferToBlob } = require("../lib/blobStorage");

const useBlob = () => Boolean(env.blobReadWriteToken);

/**
 * Production: Vercel Blob only. Development: Blob if token set, else local ./uploads.
 */
async function tryBlobThenMaybeLocal({
  file,
  prefix,
  folder,
  publicPrefix,
  patientId,
  label,
}) {
  if (!file) {
    return null;
  }
  if (!file.buffer || file.buffer.length === 0) {
    console.error(`[storage] ${label}: empty file buffer`, {
      originalname: file.originalname,
    });
    return null;
  }

  if (useBlob()) {
    try {
      const uploaded = await uploadBufferToBlob({
        buffer: file.buffer,
        contentType: file.mimetype || "application/octet-stream",
        prefix,
        patientId,
        originalname: file.originalname,
        token: env.blobReadWriteToken,
      });
      console.info(`[storage] Vercel Blob ok (${label})`, {
        pathname: uploaded.pathname,
      });
      return uploaded;
    } catch (err) {
      console.error(
        `[storage] Vercel Blob upload failed (${label}):`,
        err?.message || err,
        err?.cause || ""
      );
      if (env.nodeEnv === "production") {
        return null;
      }
      console.warn(
        `[storage] ${label}: falling back to local disk (development only)`
      );
    }
  } else if (env.nodeEnv === "production") {
    console.error(
      "[storage] BLOB_READ_WRITE_TOKEN is not set; file uploads are disabled in production."
    );
    return null;
  }

  console.info(
    `[storage] local disk (${label}, patient ${patientId}): ${file.originalname || "file"}`
  );
  try {
    return await saveFileToLocalFallback({
      file,
      folder,
      publicPrefix,
    });
  } catch (err) {
    console.error(`[storage] Local save failed (${label}):`, err?.message || err);
    return null;
  }
}

const uploadProfilePhoto = async ({ file, patientId = "new" }) =>
  tryBlobThenMaybeLocal({
    file,
    prefix: "profilephotos",
    folder: "profilephotos",
    publicPrefix: "/uploads/profilephotos",
    patientId,
    label: "profile photo",
  });

const uploadClinicalDocument = async ({ file, patientId }) =>
  tryBlobThenMaybeLocal({
    file,
    prefix: "clinicaldocs",
    folder: "clinicaldocs",
    publicPrefix: "/uploads/clinicaldocs",
    patientId,
    label: "clinical document",
  });

const resolveProfilePhotoUrl = async (storedPath) =>
  resolveStorageUrl({
    storagePath: storedPath,
    isPrivate: false,
    signedUrlExpiresIn: 3600,
  });

const resolveClinicalDocumentUrl = async (storedPath) =>
  resolveStorageUrl({
    storagePath: storedPath,
    isPrivate: false,
    signedUrlExpiresIn: 3600,
  });

module.exports = {
  uploadProfilePhoto,
  uploadClinicalDocument,
  resolveProfilePhotoUrl,
  resolveClinicalDocumentUrl,
};
