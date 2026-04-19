const fs = require("fs/promises");
const path = require("path");

const sanitizeFileName = (fileName = "") =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

/**
 * Resolve stored file reference for API responses.
 * - Full HTTPS URLs (Vercel Blob, etc.) are returned unchanged.
 * - Local paths (/uploads/...) are returned as-is (frontend prepends API origin).
 * - Legacy supabase:// rows are not resolved.
 */
const resolveStorageUrl = async ({
  storagePath,
  isPrivate: _isPrivate,
  signedUrlExpiresIn: _signedUrlExpiresIn,
}) => {
  if (!storagePath) {
    return "";
  }
  if (/^https?:\/\//i.test(String(storagePath).trim())) {
    return String(storagePath).trim();
  }
  if (storagePath.startsWith("supabase://")) {
    console.warn(
      "[storage] local-only mode: cannot resolve legacy supabase:// path (re-upload or migrate row):",
      storagePath.slice(0, 80)
    );
    return "";
  }
  return storagePath;
};

const saveFileToLocalFallback = async ({ file, folder, publicPrefix }) => {
  if (!file) {
    return null;
  }
  if (!file.buffer || file.buffer.length === 0) {
    console.error("[storage] Local save rejected: empty file buffer", {
      folder,
      originalname: file.originalname,
    });
    return null;
  }

  const ext = path.extname(file.originalname);
  const baseName = sanitizeFileName(path.basename(file.originalname, ext));
  const filename = `${Date.now()}_${baseName}${ext}`;
  const dir = path.resolve(__dirname, "../../uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), file.buffer);

  return {
    provider: "local",
    storagePath: `${publicPrefix}/${filename}`,
    url: `${publicPrefix}/${filename}`,
  };
};

module.exports = {
  resolveStorageUrl,
  saveFileToLocalFallback,
};
